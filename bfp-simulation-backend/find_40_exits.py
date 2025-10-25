# Test creating a 64x64 grid that generates 40 exits automatically
import numpy as np
from simulation import EvacuationEnv

grid_size = 64
grid = np.zeros((grid_size, grid_size), dtype=int)

# To get 40 exits, we need 10 openings on each of the 4 sides
# Exits are detected on rows/cols 1 and 62 (second from edge)

# Keep row 1 and row 62 mostly free (10 free spaces each)
# Keep col 1 and col 62 mostly free (10 free spaces each)

# Generate opening positions for exits
import random
random.seed(42)

# First, fill everything with walls
grid[:, :] = 1

# Then create a clear interior (not walls)
grid[2:62, 2:62] = 0

# Now add walls along the edge rows/cols but leave gaps for exits
# We need to strategically place walls at row 1, 62 and col 1, 62

# For testing, let's try to generate EXACTLY 40 exits
# 10 on top (row 1), 10 on bottom (row 62), 10 on left (col 1), 10 on right (col 62)

# Clear the second-to-edge rows/cols first
grid[1, :] = 0
grid[62, :] = 0
grid[:, 1] = 0
grid[:, 62] = 0

# Now add some interior walls to prevent too many exits
# Block corners
grid[1, :10] = 1
grid[1, 54:] = 1
grid[62, :10] = 1
grid[62, 54:] = 1
grid[:10, 1] = 1
grid[54:, 1] = 1
grid[:10, 62] = 1
grid[54:, 62] = 1

env = EvacuationEnv(
    grid=grid,
    num_agents=5,
    max_steps=500,
    agent_start_positions=[(10, 10), (20, 20), (15, 15), (25, 25), (30, 10)],
    fire_start_position=(32, 32),
    exits=None
)

print(f"Generated {len(env.exits)} exits")
print(f"Target: 40 exits")

if len(env.exits) < 40:
    print(f"Need {40 - len(env.exits)} more exits")
elif len(env.exits) > 40:
    print(f"Have {len(env.exits) - 40} too many exits")
else:
    print(" Perfect match!")

# Show first few exits
print(f"\nFirst 10 exits: {env.exits[:10]}")
