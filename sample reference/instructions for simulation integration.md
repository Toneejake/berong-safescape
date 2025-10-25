

**Project Goal:** To integrate a sophisticated, AI-powered fire evacuation simulation into our existing Next.js "BFP E-Learning Platform." The user will upload a floor plan, interactively set up a scenario, and then watch an animated simulation controlled by a pre-trained AI.

**Core Concept:** We have already developed and trained the AI models in a Python Jupyter Notebook (`.ipynb`). We are NOT training models in the web app. This project is about building the bridge between our Next.js frontend and a new, standalone Python backend that will run the simulation engine. The entire process must be asynchronous to handle long simulation times without freezing the user's browser.

Here is the detailed, step-by-step architectural plan.

---

### **Phase 1: Create the Standalone Python AI Backend**

This will be a new service, living in a `bfp-simulation-backend` folder at the root of our project. It will be a **FastAPI** server responsible for all heavy computation.

**1.1. Backend File Structure:**
Create the following folder and file structure inside the project root:
```
bfp-simulation-backend/
├── main.py               # FastAPI server code
├── simulation.py          # Ported simulation logic (EvacuationEnv, Person, etc.) from the notebook
├── unet.py                # Ported U-Net model class from the notebook
├── inference.py           # Ported `create_grid_from_image` function
├── models/               # Contains the two pre-trained model files
│   ├── unet_floorplan_model.pth
│   └── ppo_commander_v1.5.zip
└── requirements.txt       # Python library dependencies
```

**1.2. Backend Dependencies (`requirements.txt`):**
The backend needs the following Python libraries. Create a `requirements.txt` file with this content:
```txt
fastapi
uvicorn[standard]
python-multipart
torch
torchvision
stable-baselines3[extra]
gymnasium
opencv-python-headless
numpy
Pillow
```

**1.3. FastAPI Server Logic (`main.py`):**
Implement the FastAPI server with the following logic:
*   **On Startup:** Load the U-Net model and the PPO model into memory. This is critical for performance, as they should only be loaded once.
*   **CORS Middleware:** Configure CORS to allow requests from our Next.js frontend (`http://localhost:3000`).
*   **Asynchronous Job Management:** Create an in-memory dictionary named `jobs` to track the status of simulations.
*   **Endpoint 1: `POST /api/process-image`**
    *   **Input:** An uploaded image file (`.png`, `.jpg`).
    *   **Process:** Runs the `create_grid_from_image` function using the loaded U-Net model.
    *   **Output:** A JSON response containing the initial wall grid as a 2D array. Example: `{"grid": [[1, 1, 0, ...], ...]}`.
*   **Endpoint 2: `POST /api/run-simulation`**
    *   **Input:** A JSON object representing the user's complete simulation setup. This is the **"Simulation Configuration Object."**
    *   **Process:**
        1.  Generate a unique `job_id` (e.g., using `uuid`).
        2.  Store the initial job status: `jobs[job_id] = {"status": "processing"}`.
        3.  Start a **background task** that runs the full simulation using the provided configuration.
    *   **Output:** An immediate JSON response containing the `job_id`. Example: `{"job_id": "some-unique-id"}`.
*   **Endpoint 3: `GET /api/status/{job_id}`**
    *   **Input:** The `job_id` from the URL path.
    *   **Process:** Looks up the job status in the `jobs` dictionary.
    *   **Output:** A JSON response with the current status.
        *   While running: `{"status": "processing"}`.
        *   On failure: `{"status": "failed", "error": "Error message"}`.
        *   On success: `{"status": "complete", "result": {...}}`, where `result` is the **"Simulation Result Object."**

---

### **Phase 2: Frontend Integration in the Next.js App**

**2.1. New Route and Component Structure:**
1.  Create a new route at `app/adult/simulation/page.tsx`. This will be the main container for the simulation experience.
2.  Update the "Launch Simulator" button in `app/adult/page.tsx` to be a Next.js `<Link>` that navigates to `/adult/simulation`.
3.  Create a new component, `components/simulation-wizard.tsx`. This will be the primary interactive component that manages the entire user journey.

**2.2. The User Journey & State Management in `simulation-wizard.tsx`:**
This component will manage the user's progression through a series of states or "stages":
*   `Stage 1: "UPLOAD"`: The initial view. It contains a file input.
    *   **On file upload:** It sends the image to the `POST /api/process-image` backend endpoint.
    *   **On success:** It stores the returned `grid` in its state, stores the uploaded `File` object (to get its URL for the background), and transitions to the next stage.
*   `Stage 2: "SETUP"`: The main interactive "wizard" view.
    *   It displays an HTML canvas rendering the initial `grid`.
    *   It presents a step-by-step UI (e.g., using tabs or sequential views) for:
        1.  **Wall Correction:** Allows simple edits to the `grid` data.
        2.  **Marking Exits:** User clicks on the canvas; the component stores the `[x, y]` coordinates in a state array.
        3.  **Placing Fire Origin:** User clicks one location; the component stores the `[x, y]` coordinate.
        4.  **Placing Agents:** User clicks multiple locations; the component stores an array of `[x, y]` coordinates.
    *   When the user clicks "Run Simulation," it assembles the **"Simulation Configuration Object"** from its state and passes it to a function to start the backend process.
*   `Stage 3: "PROCESSING"`: A loading state.
    *   This stage is active after the simulation is started on the backend.
    *   It should display a loading spinner and an informative message.
    *   It will **poll** the `GET /api/status/{job_id}` endpoint every few seconds to check for completion.
*   `Stage 4: "COMPLETE"`: The results view.
    *   It displays the **"Simulation Result Object"** received from the backend.
    *   It will contain two sub-components:
        1.  `components/simulation-animation.tsx`: Renders the animation on a canvas.
        2.  `components/simulation-dashboard.tsx`: Displays the numerical results.

---

### **Phase 3: Data Structures (The "API Contract")**

These are the critical data structures that the frontend and backend will use to communicate.

**3.1. The Simulation Configuration Object (Frontend -> Backend):**
This is the JSON object sent to `POST /api/run-simulation`.
```typescript
interface SimulationConfig {
  grid: number[][];             // The final, user-corrected 2D grid array
  exits: [number, number][];      // Array of [x, y] coordinates for exits
  fire_position: [number, number]; // Single [x, y] coordinate for fire start
  agent_positions: [number, number][]; // Array of [x, y] coordinates for agent starts
}
```

**3.2. The Simulation Result Object (Backend -> Frontend):**
This is the JSON object inside the `result` key from the `GET /api/status/{job_id}` response.
```typescript
interface SimulationResult {
  dashboard: {
    total_agents: number;
    escaped: number;
    burned: number;
  };
  animation_data: {
    // We send only the burning cells at each step to save a massive amount of bandwidth
    history: {
      fire_map: [number, number][]; // Array of [y, x] coordinates of burning cells
      agents: {
        pos: [number, number];
        status: 'evacuating' | 'escaped' | 'burned';
        state: 'CALM' | 'ALERT' | 'PANICKED';
        tripped: boolean;
      }[];
    }[];
  };
}
```
