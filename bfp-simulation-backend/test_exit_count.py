import numpy as np
from simulation import EvacuationEnv

# Create grid that will generate exactly 40 exits (10 per side)
grid_size = 64
grid = np.zeros((grid_size, grid_size), dtype=int)

# Create walls with exactly 10 gaps per side = 40 total exits
# The exits are at positions near the edges (row/col 1 and 62)

# Top edge (row 1): add 10 free spaces
top_exit_positions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
for i in range(grid_size):
    grid[1, i] = 0 if i in top_exit_positions else 1

# Bottom edge (row 62)
grid[62, :] = grid[1, :]

# Left edge (col 1)
left_exit_positions = [5, 10, 15, 20, 25, 30, 35, 40, 45, 50]
for i in range(grid_size):
    grid[i, 1] = 0 if i in left_exit_positions else 1

# Right edge (col 62)
grid[:, 62] = grid[:, 1]

# Add outer walls (row 0, 63 and col 0, 63)
grid[0, :] = 1
grid[63, :] = 1
grid[:, 0] = 1
grid[:, 63] = 1

print("Testing exit generation...")
env = EvacuationEnv(
    grid=grid,
    num_agents=5,
    max_steps=500,
    agent_start_positions=[(10, 10), (20, 20), (15, 15), (25, 25), (30, 10)],
    fire_start_position=(32, 32),
    exits=None
)

print(f"Generated {len(env.exits)} exits")
print(f"Action space: {env.action_space.n}")
print(f"First 5 exits: {env.exits[:5]}")

if len(env.exits) == 40:
    print(" Perfect! 40 exits generated")
else:
    print(f" Need to adjust - got {len(env.exits)} instead of 40")
