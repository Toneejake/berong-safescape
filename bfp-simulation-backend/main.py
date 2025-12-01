from fastapi import FastAPI, UploadFile, File, BackgroundTasks, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Tuple, Dict, Any, Optional
from contextlib import asynccontextmanager
import uuid
import torch
import numpy as np
import os
import sys
import tempfile
import sqlite3
import json
import base64
import random
from datetime import datetime
from PIL import Image
from io import BytesIO
import pickle
import nltk
from nltk.stem import WordNetLemmatizer
import tensorflow as tf
from tensorflow.keras.models import load_model

from stable_baselines3 import PPO
from sb3_contrib import MaskablePPO

from unet import UNet
from inference import create_grid_from_image
from simulation import EvacuationEnv

# Configuration
PPO_MODEL_VERSION = "500k_steps"  # Options: "v1.5", "v2.0_lite", "500k_steps", "v2.0"
USE_MASKABLE_PPO = True  # Set to True for v2.0, False for v1.5

# Global variables for models
unet_model = None
ppo_model = None
device = None
IMAGE_SIZE = 256

# Chatbot global variables
chatbot_model = None
words = None
classes = None
intents = None
lemmatizer = None

# Lifespan event handler (replaces deprecated on_event)
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    global unet_model, ppo_model, device, chatbot_model, words, classes, intents, lemmatizer
    
    print("\n" + "=" * 60)
    print("FIRE EVACUATION SIMULATION BACKEND - STARTING UP")
    print("=" * 60)
    print(f"Working directory: {os.getcwd()}")
    print(f"Python version: {sys.version}")
    print("=" * 60)
    
    device = torch.device("cpu")
    print(f"\nUsing device: {device}")
    
    # Load U-Net model with error handling
    print("\n[1/3] Loading U-Net Floor Plan Segmentation Model...")
    try:
        model_path = "models/unet_floorplan_model.pth"
        abs_path = os.path.abspath(model_path)
        print(f"  Model path: {abs_path}")
        
        if not os.path.exists(model_path):
            print(f"  [FAIL] ERROR: Model file not found!")
            print(f"  Expected location: {abs_path}")
            print(f"  Please ensure the model file exists at this location.")
            unet_model = None
        else:
            file_size = os.path.getsize(model_path) / (1024 * 1024)  # MB
            print(f"  File size: {file_size:.2f} MB")
            print(f"  Loading model...")
            
            unet_model = UNet()
            unet_model.load_state_dict(torch.load(model_path, map_location=device))
            unet_model.to(device)
            unet_model.eval()
            print(f"  [OK] U-Net model loaded successfully")
    except Exception as e:
        print(f"  [FAIL] ERROR loading U-Net model:")
        print(f"  {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        unet_model = None
    
    # Load PPO model with error handling
    print(f"\n[2/3] Loading PPO Commander Model ({PPO_MODEL_VERSION})...")
    try:
        model_path = f"models/ppo_commander_{PPO_MODEL_VERSION}.zip"
        abs_path = os.path.abspath(model_path)
        print(f"  Model path: {abs_path}")
        print(f"  Using {'MaskablePPO' if USE_MASKABLE_PPO else 'Standard PPO'}")
        
        if not os.path.exists(model_path):
            print(f"  [FAIL] ERROR: Model file not found!")
            print(f"  Expected location: {abs_path}")
            ppo_model = None
        else:
            file_size = os.path.getsize(model_path) / (1024 * 1024)  # MB
            print(f"  File size: {file_size:.2f} MB")
            print(f"  Loading model...")
            
            if USE_MASKABLE_PPO:
                ppo_model = MaskablePPO.load(model_path, device=device)
            else:
                ppo_model = PPO.load(model_path, device=device)
            print(f"  [OK] PPO Commander {PPO_MODEL_VERSION} loaded successfully")
    except Exception as e:
        print(f"  [FAIL] ERROR loading PPO model:")
        print(f"  {type(e).__name__}: {str(e)}")
        import traceback
        traceback.print_exc()
        ppo_model = None
    
    # Load Chatbot model (optional)
    print("\n[3/3] Loading Fire Safety Chatbot Model...")
    try:
        # Download required NLTK data if not already present
        try:
            nltk.data.find('tokenizers/punkt')
        except LookupError:
            print("  Downloading NLTK punkt tokenizer...")
            nltk.download('punkt')

        try:
            nltk.data.find('corpora/wordnet')
        except LookupError:
            print("  Downloading NLTK wordnet...")
            nltk.download('wordnet')

        try:
            nltk.data.find('corpora/omw-1.4')
        except LookupError:
            print("  Downloading NLTK omw-1.4...")
            nltk.download('omw-1.4')

        # Initialize lemmatizer
        lemmatizer = WordNetLemmatizer()

        # Load the model and data files
        chatbot_model = load_model('Fire Safety Chatbot/chatbot_model.h5')
        words = pickle.load(open('Fire Safety Chatbot/words.pkl', 'rb'))
        classes = pickle.load(open('Fire Safety Chatbot/classes.pkl', 'rb'))
        intents = json.load(open('Fire Safety Chatbot/intents.json', 'rb'))
        print("  [OK] Chatbot model loaded successfully")
    except Exception as e:
        print(f"  [WARN] WARNING: Chatbot failed to load:")
        print(f"  {type(e).__name__}: {str(e)}")
        print(f"  Chatbot will not be available, but simulation will work.")
        chatbot_model = None
    
    # Print summary
    print("\n" + "=" * 60)
    print("STARTUP SUMMARY:")
    print("=" * 60)
    print(f"  U-Net Model:     {'[OK] Loaded' if unet_model else '[FAIL] FAILED'}")
    print(f"  PPO Model:       {'[OK] Loaded' if ppo_model else '[FAIL] FAILED'}")
    print(f"  Chatbot:         {'[OK] Loaded' if chatbot_model else '[WARN] Not Available'}")
    print("=" * 60)
    
    if not unet_model or not ppo_model:
        print("\n[WARN] CRITICAL WARNING: Essential models failed to load!")
        print("The simulation WILL NOT WORK without U-Net and PPO models.")
        print("Please check the errors above and ensure model files exist.")
        print("\nExpected model locations:")
        print(f"  - {os.path.abspath('models/unet_floorplan_model.pth')}")
        print(f"  - {os.path.abspath(f'models/ppo_commander_{PPO_MODEL_VERSION}.zip')}")
    else:
        print("\n[OK] All critical models loaded successfully!")
        print("Backend is ready to process fire evacuation simulations.")
    
    print("\nServer is now listening on http://0.0.0.0:8000")
    print("API documentation available at http://localhost:8000/docs")
    print("=" * 60 + "\n")
    
    yield  # Server runs here
    
    # Shutdown (cleanup if needed)
    print("\nShutting down backend...")

# Initialize FastAPI app with lifespan
app = FastAPI(title="Fire Evacuation Simulation API", version="1.0.0", lifespan=lifespan)

# CORS Configuration - use environment variable or defaults
cors_origins_env = os.environ.get("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
cors_origins = [origin.strip() for origin in cors_origins_env.split(",")]

app.add_middleware(
    CORSMiddleware,
    allow_origins=cors_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables for models
unet_model = None
ppo_model = None
device = None
IMAGE_SIZE = 256

# Chatbot global variables
chatbot_model = None
words = None
classes = None
intents = None
lemmatizer = None

# Pydantic model for chatbot requests
class ChatbotRequest(BaseModel):
    message: str

class ChatbotResponse(BaseModel):
    response: str

def clean_up_sentence(sentence):
    """Tokenize and lemmatize the sentence"""
    if lemmatizer is None:
        return nltk.word_tokenize(sentence)
    sentence_words = nltk.word_tokenize(sentence)
    sentence_words = [lemmatizer.lemmatize(word.lower()) for word in sentence_words]
    return sentence_words

def bow(sentence, show_details=True):
    """Create bag of words array from sentence"""
    sentence_words = clean_up_sentence(sentence)
    bag = [0] * len(words)
    for s in sentence_words:
        for i, w in enumerate(words):
            if w == s:
                bag[i] = 1
                if show_details:
                    print(f"Found in bag: {w}")
    return np.array(bag)

def predict_class(sentence):
    """Predict the class of the sentence"""
    p = bow(sentence, show_details=False)
    res = chatbot_model.predict(np.array([p]))[0]
    ERROR_THRESHOLD = 0.25
    results = [[i, r] for i, r in enumerate(res) if r > ERROR_THRESHOLD]
    
    results.sort(key=lambda x: x[1], reverse=True)
    return_list = []
    for r in results:
        return_list.append({"intent": classes[r[0]], "probability": str(r[1])})
    return return_list

def get_response(ints, intents_json):
    """Get response based on predicted intent"""
    if len(ints) > 0:
        tag = ints[0]['intent']
        if tag in intents_json:
            import random
            result = random.choice(intents_json[tag]['responses'])
        else:
            result = "I don't understand. Please ask me something related to fire safety."
        return result
    else:
        return "I don't understand. Please ask me something related to fire safety."

def chatbot_response(msg):
    """Main function to get chatbot response"""
    ints = predict_class(msg)
    res = get_response(ints, intents)
    return res

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
    exits: Optional[List[Tuple[int, int]]] = None  # User-placed exits (will be distributed to 248)
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
        return {
            "status": "not_found",
            "result": None,
            "error": "Job not found"
        }
    
    status, result, error = row
    return {
        "status": status,
        "result": json.loads(result) if result else None,
        "error": error
    }

def distribute_exits_to_model(user_exits: List[Tuple[int, int]], grid: np.ndarray, total_model_exits: int = 248) -> List[Tuple[int, int]]:
    """
    Distribute 248 model exits across user-defined exit points.
    
    Example:
    - 1 user exit -> all 248 model exits at that location (with small offsets)
    - 2 user exits -> 124 exits each
    - 3 user exits -> 83, 83, 82 exits
    
    Args:
        user_exits: List of (x, y) tuples where user clicked
        grid: The grid array (256x256) where 0=free, 1=wall
        total_model_exits: Total exits needed for model (default 248)
    
    Returns:
        List of 248 (x, y) exit coordinates distributed across user exits
    """
    if not user_exits:
        # Fallback: auto-detect exits from grid edges
        return auto_detect_exits(grid, total_model_exits)
    
    num_user_exits = len(user_exits)
    exits_per_location = total_model_exits // num_user_exits
    remainder = total_model_exits % num_user_exits
    
    distributed_exits = []
    
    for i, (user_x, user_y) in enumerate(user_exits):
        # Calculate how many exits for this location
        count = exits_per_location + (1 if i < remainder else 0)
        
        for j in range(count):
            # Add small random offset to prevent stacking (±2 pixels in a circle pattern)
            angle = (2 * np.pi * j) / count if count > 1 else 0
            radius = min(2, j % 3)  # Vary radius 0, 1, 2
            offset_x = int(radius * np.cos(angle))
            offset_y = int(radius * np.sin(angle))
            
            exit_x = user_x + offset_x
            exit_y = user_y + offset_y
            
            # Clamp to grid bounds
            exit_x = max(0, min(255, exit_x))
            exit_y = max(0, min(255, exit_y))
            
            # Validate it's on free space, if not use original position
            if grid[exit_y][exit_x] == 0:
                distributed_exits.append((exit_x, exit_y))
            else:
                # Fallback to original user position
                distributed_exits.append((user_x, user_y))
    
    # Ensure exactly total_model_exits
    while len(distributed_exits) < total_model_exits:
        distributed_exits.append(user_exits[0])  # Pad with first exit
    
    return distributed_exits[:total_model_exits]

def auto_detect_exits(grid: np.ndarray, max_exits: int = 248) -> List[Tuple[int, int]]:
    """Fallback: Auto-detect exits from grid boundaries"""
    exits = []
    height, width = grid.shape
    
    # Check edges for free spaces (potential exits)
    for x in range(width):
        if grid[0, x] == 0:  # Top edge
            exits.append((x, 0))
        if grid[height-1, x] == 0:  # Bottom edge
            exits.append((x, height-1))
    
    for y in range(height):
        if grid[y, 0] == 0:  # Left edge
            exits.append((0, y))
        if grid[y, width-1] == 0:  # Right edge
            exits.append((width-1, y))
    
    # Remove duplicates and limit
    exits = list(set(exits))[:max_exits]
    
    # If still not enough, pad with corner
    while len(exits) < max_exits:
        exits.append(exits[0] if exits else (0, 0))
    
    return exits[:max_exits]



# API Endpoints

@app.get("/api/health")
async def health_check():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "unet_loaded": unet_model is not None,
        "ppo_loaded": ppo_model is not None,
        "ppo_version": PPO_MODEL_VERSION,
        "maskable_ppo": USE_MASKABLE_PPO
    }

@app.post("/api/chatbot/ai-response", response_model=ChatbotResponse)
async def get_chatbot_response(request: ChatbotRequest):
    """Get AI response from the chatbot model"""
    try:
        # Check if chatbot model is loaded
        if chatbot_model is None:
            # Return a rule-based response if model is not available
            return ChatbotResponse(response="I'm sorry, the AI chatbot is currently unavailable. Please try again later.")
        
        # Get response from the chatbot
        response = chatbot_response(request.message)
        return ChatbotResponse(response=response)
    except Exception as e:
        print(f"Error in chatbot response: {str(e)}")
        return ChatbotResponse(response="I'm sorry, I encountered an error processing your request.")

@app.post("/api/process-image")
async def process_image(file: UploadFile = File(...)):
    """Process uploaded floor plan image and return grid with original image"""
    # Check if U-Net model is loaded
    if unet_model is None:
        raise HTTPException(
            status_code=503,
            detail="U-Net model not loaded. The backend started but model loading failed. Please check server logs and restart the backend."
        )
    
    try:
        # Save uploaded file to temporary location
        with tempfile.NamedTemporaryFile(delete=False, suffix=".png") as temp_file:
            content = await file.read()
            temp_file.write(content)
            temp_path = temp_file.name
        
        # Load original image for base64 encoding
        original_image = Image.open(temp_path)
        # Resize to match grid size for overlay alignment
        original_image = original_image.resize((IMAGE_SIZE, IMAGE_SIZE), Image.Resampling.LANCZOS)
        
        # Convert to base64
        buffered = BytesIO()
        original_image.save(buffered, format="PNG")
        img_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Process image with U-Net model
        grid = create_grid_from_image(unet_model, temp_path, IMAGE_SIZE, device)
        
        # Clean up temp file
        os.unlink(temp_path)
        
        if grid is None:
            raise HTTPException(status_code=400, detail="Failed to process image")
        
        # Convert numpy array to list for JSON serialization
        grid_list = grid.tolist()
        
        return {
            "grid": grid_list,
            "originalImage": f"data:image/png;base64,{img_base64}",
            "gridSize": {"width": IMAGE_SIZE, "height": IMAGE_SIZE}
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing image: {str(e)}")


# Background simulation runner
def run_simulation_task(job_id: str, config: SimulationConfig):
    """Run simulation in background"""
    try:
        # Convert grid to numpy array
        grid = np.array(config.grid)
        
        # Distribute user exits to 248 model exits
        if config.exits and len(config.exits) > 0:
            distributed_exits = distribute_exits_to_model(config.exits, grid, total_model_exits=248)
            print(f"[JOB {job_id[:8]}] Distributed {len(config.exits)} user exits -> 248 model exits", flush=True)
        else:
            distributed_exits = auto_detect_exits(grid, max_exits=248)
            print(f"[JOB {job_id[:8]}] Auto-detected {len(distributed_exits)} exits from grid boundaries", flush=True)
        
        # Create environment
        env = EvacuationEnv(
            grid=grid,
            num_agents=len(config.agent_positions),
            max_steps=500,
            agent_start_positions=config.agent_positions,
            fire_start_position=config.fire_position,
            exits=distributed_exits,  # Use distributed exits
            max_agents=10  # Zero-padding for 500k_steps model compatibility
        )
        
        # Run simulation
        obs, _ = env.reset()
        terminated, truncated = False, False
        history = []
        step_count = 0
        max_steps = 500
        
        print(f"[JOB {job_id[:8]}] Starting simulation: {len(config.agent_positions)} agents, {len(env.exits)} exits", flush=True)
        
        while not terminated and not truncated and step_count < max_steps:
            if USE_MASKABLE_PPO:
                # For MaskablePPO, action_mask must match training dimensions (248)
                num_exits = len(env.exits) if env.exits else 248
                action_mask = np.zeros((1, 248), dtype=np.int8)  # Shape: [1, 248] for batch size 1
                action_mask[0, :num_exits] = 1  # Only enable actual exits
                action, _ = ppo_model.predict(obs, action_masks=action_mask, deterministic=True)
            else:
                # For standard PPO v1.5
                action, _ = ppo_model.predict(obs, deterministic=True)
                # Apply modulo guard for v1.5 fixed action space
                action = int(action) % len(env.exits)
            
            obs, _, terminated, truncated, _ = env.step(int(action))
            step_count += 1
            
            # Log progress every 50 steps
            if step_count % 50 == 0:
                active = sum(1 for a in env.agents if a.status == 'active')
                escaped = sum(1 for a in env.agents if a.status == 'escaped')
                burned = sum(1 for a in env.agents if a.status == 'burned')
                print(f"[JOB {job_id[:8]}] Step {step_count}/{max_steps}: {active} active, {escaped} escaped, {burned} burned", flush=True)
            
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
        
        print(f"[JOB {job_id[:8]}] Simulation complete at step {step_count}: {escaped}/{total_agents} escaped, {burned} burned", flush=True)
        
        # Prepare agent results with detailed information
        agent_results = []
        for i, agent in enumerate(env.agents):
            agent_results.append({
                "agent_id": i,
                "status": agent.status,
                "exit_time": agent.escape_time if hasattr(agent, 'escape_time') and agent.status == "escaped" else None,
                "path_length": agent.steps_taken if hasattr(agent, 'steps_taken') else step_count
            })
        
        # Prepare result with correct structure for frontend
        result = {
            "total_agents": total_agents,
            "escaped_count": escaped,
            "burned_count": burned,
            "time_steps": step_count,
            "agent_results": agent_results,
            "commander_actions": history[:100] if history else [],  # Limit to first 100 actions
            "animation_data": {
                "history": history
            }
        }
        
        # Update job status to complete
        update_job_status(job_id, "complete", result=result)
        
    except Exception as e:
        # Update job status to failed
        print(f"[JOB {job_id[:8]}] FAILED with error: {str(e)}", flush=True)
        import traceback
        traceback.print_exc()
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
    uvicorn.run(
        app, 
        host="0.0.0.0", 
        port=8000,
        log_level="info",
        access_log=True
    )
