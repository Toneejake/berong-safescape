# Test script to verify backend setup
import sys
import os

print("=" * 60)
print("BACKEND SETUP VERIFICATION")
print("=" * 60)

# Check Python version
print(f"\nPython Version: {sys.version}")

# Check if all required files exist
files_to_check = [
    "main.py",
    "unet.py",
    "inference.py",
    "simulation.py",
    "requirements.txt",
    "models/unet_floorplan_model.pth",
    "models/ppo_commander_v1.5.zip"
]

print("\nFile Check:")
all_present = True
for file in files_to_check:
    exists = os.path.exists(file)
    status = "" if exists else ""
    print(f"  {status} {file}")
    if not exists:
        all_present = False

if all_present:
    print("\n All required files are present!")
else:
    print("\n Some files are missing!")

print("\n" + "=" * 60)
print("Next Steps:")
print("1. Activate venv: .\\venv\\Scripts\\Activate")
print("2. Install deps: pip install -r requirements.txt")
print("3. Start server: python main.py")
print("=" * 60)

