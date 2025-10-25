import numpy as np
from simulation import EvacuationEnv
from stable_baselines3 import PPO

# Create grid
grid_size = 64
grid = np.zeros((grid_size, grid_size), dtype=int)
grid[:, 0] = 1
grid[:, grid_size-1] = 1
grid[0, :] = 1
grid[grid_size-1, :] = 1

# Configuration
exits = [(1, 1), (1, 62), (62, 1), (62, 62)]
fire_pos = (32, 32)
agent_positions = [(10, 10), (20, 20), (15, 15), (25, 25), (30, 10)]

print("Creating environment...")
env = EvacuationEnv(
    grid=grid,
    num_agents=len(agent_positions),
    max_steps=500,
    agent_start_positions=agent_positions,
    fire_start_position=fire_pos,
    exits=exits
)

print("Loading PPO model...")
model = PPO.load("models/ppo_commander_v1.5.zip")

print("Resetting environment...")
obs, info = env.reset()
print(f"Observation shape: {obs.shape}")

print("\nRunning 5 steps...")
for i in range(5):
    print(f"Step {i+1}...")
    action, _ = model.predict(obs, deterministic=True)
    print(f"  Action: {action} (type: {type(action)})")
    obs, reward, terminated, truncated, info = env.step(int(action))
    print(f"  Terminated: {terminated}, Truncated: {truncated}")
    
    if terminated or truncated:
        print("  Simulation ended!")
        break

print("\n Full simulation test passed!")
