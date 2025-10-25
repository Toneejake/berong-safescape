import requests
import json
import time

# Test simulation endpoint
url_sim = "http://localhost:8000/api/run-simulation"
url_status = "http://localhost:8000/api/status/{}"

# Create a test grid (must be 64x64 based on the model)
grid_size = 64
test_grid = [[0]*grid_size for _ in range(grid_size)]

# Add boundary walls
for i in range(grid_size):
    test_grid[i][0] = 1  # Left wall
    test_grid[i][grid_size-1] = 1  # Right wall
    test_grid[0][i] = 1  # Top wall
    test_grid[grid_size-1][i] = 1  # Bottom wall

# Add some internal walls for realism
for i in range(10, 50):
    test_grid[30][i] = 1  # Horizontal wall

# Model expects exactly 5 agents
config = {
    "grid": test_grid,
    "exits": [[1, 1], [1, 62], [62, 1], [62, 62]],
    "fire_position": [32, 32],
    "agent_positions": [[10, 10], [20, 20], [15, 15], [25, 25], [30, 10]]
}

print("Submitting simulation request with 64x64 grid and 5 agents...")
response = requests.post(url_sim, json=config)
print(f"Status: {response.status_code}")

if response.status_code == 200:
    result = response.json()
    job_id = result['job_id']
    print(f"Job ID: {job_id}")
    
    # Poll for status
    print("\nPolling for completion...")
    for i in range(60):  # Max 60 seconds
        time.sleep(1)
        status_response = requests.get(url_status.format(job_id))
        status_data = status_response.json()
        status = status_data['status']
        
        if i % 5 == 0:  # Print every 5 seconds
            print(f"[{i+1}s] Status: {status}")
        
        if status == 'complete':
            print("\n===  SIMULATION COMPLETE ===")
            result = status_data['result']
            print(f"Total steps: {result['total_steps']}")
            print(f"People escaped: {result['people_escaped']}")
            print(f"People burned: {result['people_burned']}")
            print(f"History frames: {len(result['history'])}")
            if result['history']:
                print(f"\nFirst frame:")
                print(f"  Fire coordinates: {len(result['history'][0]['fire_map'])} cells on fire")
                print(f"  Number of agents: {len(result['history'][0]['agents'])}")
                print(f"  First agent: {result['history'][0]['agents'][0]}")
                print(f"\nLast frame:")
                print(f"  Fire coordinates: {len(result['history'][-1]['fire_map'])} cells on fire")
                print(f"  Agents: {result['history'][-1]['agents']}")
            print("\n ALL SIMULATION TESTS PASSED!")
            break
        elif status == 'failed':
            print(f"\n SIMULATION FAILED: {status_data.get('error', 'Unknown error')}")
            break
    else:
        print("\n Timeout waiting for simulation (took more than 60 seconds)")
else:
    print(f" HTTP Error {response.status_code}: {response.text}")
