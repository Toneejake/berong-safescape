from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple, Dict, Any, Optional
import uuid
import torch
import numpy as np
import os
import tempfile
import sqlite3
import json
from datetime import datetime
from stable_baselines3 import PPO

from unet import UNet
from inference import create_grid_from_image
from simulation import EvacuationEnv

# Initialize FastAPI app
app = FastAPI(title="Fire Evacuation Simulation API", version="1.0.0")

# CORS Configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
unet_model = None
ppo_model = None
device = None
IMAGE_SIZE = 256

# Database setup
def init_db():
    conn = sqlite3.connect("jobs.db")
    cursor = conn.cursor()
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS jobs (
            job_id TEXT PRIMARY KEY,
            status TEXT NOT NULL,
            result TEXT,
            error TEXT,
            created_at TEXT NOT NULL
        )
    """)
    conn.commit()
    conn.close()

init_db()

# Pydantic Models
class SimulationConfig(BaseModel):
    grid: List[List[int]]
    exits: Optional[List[Tuple[int, int]]] = None  # Optional - will auto-detect if None
    fire_position: Tuple[int, int]
    agent_positions: List[Tuple[int, int]]

class JobResponse(BaseModel):
    job_id: str

class StatusResponse(BaseModel):
    status: str
    result: Optional[Dict[str, Any]] = None
    error: Optional[str] = None

# Database helper functions
def update_job_status(job_id: str, status: str, result: Dict = None, error: str = None):
    conn = sqlite3.connect("jobs.db")
    cursor = conn.cursor()
    cursor.execute(
        "INSERT OR REPLACE INTO jobs (job_id, status, result, error, created_at) VALUES (?, ?, ?, ?, ?)",
        (job_id, status, json.dumps(result) if result else None, error, datetime.now().isoformat())
    )
    conn.commit()
    conn.close()

def get_job_status(job_id: str) -> Dict:
    conn = sqlite3.connect("jobs.db")
    cursor = conn.cursor()
    cursor.execute("SELECT status, result, error FROM jobs WHERE job_id = ?", (job_id,))
    row = cursor.fetchone()
    conn.close()
    
    if not row:
        return None
    
    status, result, error = row
    return {
        "status": status,
        "result": json.loads(result) if result else None,
        "error": error
    }

# Startup event - Load models
@app.on_event("startup")
async def load_models():
    global unet_model, ppo_model, device
    
    print("Loading AI models...")
    device = torch.device("cpu")
    
    # Load U-Net model
    print("Loading U-Net model...")
    unet_model = UNet()
    unet_model.load_state_dict(torch.load("models/unet_floorplan_model.pth", map_location=device))
    unet_model.to(device)
    unet_model.eval()
    print("U-Net model loaded successfully")
    
    # Load PPO model
    print("Loading PPO Commander model...")
    ppo_model = PPO.load("models/ppo_commander_v1.5.zip", device=device)
    print("PPO Commander model loaded successfully")
    
    print("All models loaded and ready!")


# API Endpoints

@app.get("/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "unet_loaded": unet_model is not None,
        "ppo_loaded": ppo_model is not None
    }

@app.post("/api/process-image")
async def process_image(file: UploadFile = File(...)):
    """Process uploaded floor plan image and return grid"""
    try:
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Process image with U-Net model
        grid = create_grid_from_image(unet_model, temp_path, IMAGE_SIZE, device)
        
        # Clean up temp file
        os.unlink(temp_path)
        
        if grid is None:
            raise HTTPException(status_code=400, detail="Failed to process image")
        
        # Convert numpy array to list for JSON serialization
        grid_list = grid.tolist()
        
        return {"grid": grid_list}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


# Background simulation runner
def run_simulation_task(job_id: str, config: SimulationConfig):
    """Run simulation in background"""
    try:
        # Convert grid to numpy array
        grid = np.array(config.grid)
        
        # Create environment
        env = EvacuationEnv(
            grid=grid,
            num_agents=len(config.agent_positions),
            max_steps=500,
            agent_start_positions=config.agent_positions,
            fire_start_position=config.fire_position,
            exits=config.exits
        )
        
        # Run simulation
        obs, _ = env.reset()
        terminated, truncated = False, False
        history = []
        
        while not terminated and not truncated:
            action, _ = ppo_model.predict(obs, deterministic=True)
            obs, _, terminated, truncated, _ = env.step(int(action))
            
            # Store frame data
            fire_coords = np.argwhere(env.fire_sim.fire_map == 1).tolist()
            
            agents_data = []
            for agent in env.agents:
                agents_data.append({
                    "pos": agent.pos,
                    "status": agent.status,
                    "state": agent.state,
                    "tripped": agent.tripped_timer > 0
                })
            
            history.append({
                "fire_map": fire_coords,
                "agents": agents_data
            })
        
        # Calculate final statistics
        escaped = sum(1 for agent in env.agents if agent.status == "escaped")
        burned = sum(1 for agent in env.agents if agent.status == "burned")
        total_agents = len(env.agents)
        
        # Prepare result
        result = {
            "dashboard": {
                "total_agents": total_agents,
                "escaped": escaped,
                "burned": burned
            },
            "animation_data": {
                "history": history
            }
        }
        
        # Update job status to complete
        update_job_status(job_id, "complete", result=result)
        
    except Exception as e:
        # Update job status to failed
        update_job_status(job_id, "failed", error=str(e))

@app.post("/api/run-simulation", response_model=JobResponse)
async def run_simulation(config: SimulationConfig, background_tasks: BackgroundTasks):
    """Start simulation in background"""
    try:
        # Generate unique job ID
        job_id = str(uuid.uuid4())
        
        # Initialize job status
        update_job_status(job_id, "processing")
        
        # Add background task
        background_tasks.add_task(run_simulation_task, job_id, config)
        
        return {"job_id": job_id}
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting simulation: {str(e)}")

@app.get("/api/status/{job_id}", response_model=StatusResponse)
async def get_status(job_id: str):
    """Get simulation job status"""
    job = get_job_status(job_id)
    
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
    
    return job

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)

