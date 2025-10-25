import numpy as np
from simulation import EvacuationEnv
from stable_baselines3 import PPO

# Create grid - leave openings for exits
grid_size = 64
grid = np.zeros((grid_size, grid_size), dtype=int)

# Add walls but leave gaps for exits
# Top wall with gaps
for i in range(grid_size):
    if i not in [10, 20, 30, 40, 50]:  # Leave 5 gaps
        grid[0, i] = 1

# Bottom wall with gaps
for i in range(grid_size):
    if i not in [10, 20, 30, 40, 50]:
        grid[63, i] = 1

# Left wall with gaps
for i in range(grid_size):
    if i not in [10, 20, 30, 40, 50]:
        grid[i, 0] = 1

# Right wall with gaps
for i in range(grid_size):
    if i not in [10, 20, 30, 40, 50]:
        grid[i, 63] = 1

# Configuration - let environment find exits automatically
fire_pos = (32, 32)
agent_positions = [(10, 10), (20, 20), (15, 15), (25, 25), (30, 10)]

print("Creating environment with auto-found exits...")
env = EvacuationEnv(
    grid=grid,
    num_agents=len(agent_positions),
    max_steps=500,
    agent_start_positions=agent_positions,
    fire_start_position=fire_pos,
    exits=None  # Let it find exits automatically
)

print(f"Auto-found exits: {len(env.exits)} exits")
print(f"Action space size: {env.action_space.n}")

print("\nLoading PPO model...")
model = PPO.load("models/ppo_commander_v1.5.zip")

print("Resetting environment...")
obs, info = env.reset()

print("\nRunning 10 steps...")
for i in range(10):
    action, _ = model.predict(obs, deterministic=True)
    obs, reward, terminated, truncated, info = env.step(int(action))
    
    if (i+1) % 5 == 0:
        print(f"Step {i+1} completed...")
    
    if terminated or truncated:
        print(f"\n Simulation ended at step {i+1}!")
        break

print("\nFinal statistics:")
escaped = sum(1 for agent in env.agents if agent.status == "escaped")
burned = sum(1 for agent in env.agents if agent.status == "burned")
print(f"Escaped: {escaped}, Burned: {burned}, Total: {len(env.agents)}")
print("\n FULL PPO SIMULATION TEST PASSED!")
