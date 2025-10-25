import numpy as np
from simulation import EvacuationEnv

# Create a simple 64x64 grid
grid_size = 64
grid = np.zeros((grid_size, grid_size), dtype=int)

# Add boundary walls
grid[:, 0] = 1  # Left wall
grid[:, grid_size-1] = 1  # Right wall  
grid[0, :] = 1  # Top wall
grid[grid_size-1, :] = 1  # Bottom wall

# Test configuration
exits = [(1, 1), (1, 62), (62, 1), (62, 62)]
fire_pos = (32, 32)
agent_positions = [(10, 10), (20, 20), (15, 15), (25, 25), (30, 10)]

print(f"Grid shape: {grid.shape}")
print(f"Number of exits: {len(exits)}")
print(f"Number of agents: {len(agent_positions)}")
print(f"Fire position: {fire_pos}")

try:
    print("\nCreating environment...")
    env = EvacuationEnv(
        grid=grid,
        num_agents=len(agent_positions),
        max_steps=500,
        agent_start_positions=agent_positions,
        fire_start_position=fire_pos,
        exits=exits
    )
    print(" Environment created successfully!")
    print(f"Action space: {env.action_space}")
    print(f"Observation space: {env.observation_space}")
    
    print("\nResetting environment...")
    obs, info = env.reset()
    print(f" Environment reset successfully!")
    print(f"Observation shape: {obs.shape}")
    print(f"Number of agents: {len(env.agents)}")
    print(f"Number of exits: {len(env.exits)}")
    
except Exception as e:
    print(f" ERROR: {e}")
    import traceback
    traceback.print_exc()
