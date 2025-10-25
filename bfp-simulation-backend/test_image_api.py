import requests
import json

url = "http://localhost:8000/api/process-image"
file_path = r"d:\jake\bfp-berong-backup\public\uploads\upload_1760961982912.png"

with open(file_path, 'rb') as f:
    files = {'file': f}
    response = requests.post(url, files=files)
    
print(f"Status: {response.status_code}")
if response.status_code == 200:
    data = response.json()
    print(f"Response keys: {list(data.keys())}")
    print(f"Grid shape: {len(data['grid'])} x {len(data['grid'][0]) if data['grid'] else 0}")
    print("First row sample:", data['grid'][0][:10])
    # Count walls vs free space
    walls = sum(sum(row) for row in data['grid'])
    free = (len(data['grid']) * len(data['grid'][0])) - walls
    print(f"Walls: {walls}, Free space: {free}")
else:
    print(f"Error: {response.text}")
