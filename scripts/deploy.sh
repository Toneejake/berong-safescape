#!/bin/bash
# ===========================================
# BFP Berong - GCP Deployment Script
# ===========================================
# Run this script on your GCP VM to deploy the application
# Usage: chmod +x deploy.sh && ./deploy.sh

set -e  # Exit on any error

echo "================================================"
echo "   BFP Berong - Deployment Script"
echo "================================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Check if running as root
if [ "$EUID" -eq 0 ]; then 
    echo -e "${RED}Please don't run as root. Use a regular user with sudo access.${NC}"
    exit 1
fi

# ===========================================
# Step 1: Install Docker (if not installed)
# ===========================================
echo -e "${YELLOW}[1/6] Checking Docker installation...${NC}"
if ! command -v docker &> /dev/null; then
    echo "Installing Docker..."
    curl -fsSL https://get.docker.com -o get-docker.sh
    sudo sh get-docker.sh
    sudo usermod -aG docker $USER
    rm get-docker.sh
    echo -e "${GREEN}Docker installed. Please log out and log back in, then run this script again.${NC}"
    exit 0
else
    echo -e "${GREEN}Docker is already installed.${NC}"
fi

# ===========================================
# Step 2: Install Docker Compose (if not installed)
# ===========================================
echo -e "${YELLOW}[2/6] Checking Docker Compose...${NC}"
if ! command -v docker-compose &> /dev/null; then
    echo "Installing Docker Compose..."
    sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
    sudo chmod +x /usr/local/bin/docker-compose
    echo -e "${GREEN}Docker Compose installed.${NC}"
else
    echo -e "${GREEN}Docker Compose is already installed.${NC}"
fi

# ===========================================
# Step 3: Install Git LFS (for large model files)
# ===========================================
echo -e "${YELLOW}[3/6] Checking Git LFS...${NC}"
if ! command -v git-lfs &> /dev/null; then
    echo "Installing Git LFS..."
    sudo apt-get update
    sudo apt-get install -y git-lfs
    git lfs install
    echo -e "${GREEN}Git LFS installed.${NC}"
else
    echo -e "${GREEN}Git LFS is already installed.${NC}"
fi

# ===========================================
# Step 4: Clone or Update Repository
# ===========================================
echo -e "${YELLOW}[4/6] Setting up repository...${NC}"
REPO_URL="https://github.com/Toneejake/berong-dec1.git"
APP_DIR="$HOME/bfp-berong"

if [ -d "$APP_DIR" ]; then
    echo "Repository exists. Pulling latest changes..."
    cd "$APP_DIR"
    git pull origin main
    git lfs pull
else
    echo "Cloning repository..."
    git clone "$REPO_URL" "$APP_DIR"
    cd "$APP_DIR"
    git lfs pull
fi

echo -e "${GREEN}Repository ready.${NC}"

# ===========================================
# Step 5: Setup Environment File
# ===========================================
echo -e "${YELLOW}[5/6] Setting up environment...${NC}"
if [ ! -f "$APP_DIR/.env" ]; then
    echo "Creating .env file from template..."
    cp "$APP_DIR/.env.production.example" "$APP_DIR/.env"
    
    # Generate random password
    RANDOM_PASSWORD=$(openssl rand -base64 24 | tr -dc 'a-zA-Z0-9' | head -c 32)
    
    # Update password in .env
    sed -i "s/CHANGE_THIS_TO_A_STRONG_PASSWORD/$RANDOM_PASSWORD/" "$APP_DIR/.env"
    
    echo -e "${GREEN}.env file created with secure password.${NC}"
    echo -e "${YELLOW}Database password: $RANDOM_PASSWORD${NC}"
    echo -e "${YELLOW}(Save this password somewhere safe!)${NC}"
else
    echo -e "${GREEN}.env file already exists.${NC}"
fi

# ===========================================
# Step 6: Build and Start Containers
# ===========================================
echo -e "${YELLOW}[6/6] Building and starting containers...${NC}"
cd "$APP_DIR"

# Stop existing containers if running
docker-compose -f docker-compose.prod.yml down 2>/dev/null || true

# Build and start
docker-compose -f docker-compose.prod.yml up -d --build

echo ""
echo "================================================"
echo -e "${GREEN}   Deployment Complete!${NC}"
echo "================================================"
echo ""
echo "Your application is now running at:"
echo ""

# Get external IP
EXTERNAL_IP=$(curl -s http://checkip.amazonaws.com 2>/dev/null || echo "YOUR_SERVER_IP")
echo -e "   ${GREEN}http://$EXTERNAL_IP${NC}"
echo ""
echo "To check status:"
echo "   docker-compose -f docker-compose.prod.yml ps"
echo ""
echo "To view logs:"
echo "   docker-compose -f docker-compose.prod.yml logs -f"
echo ""
echo "To stop:"
echo "   docker-compose -f docker-compose.prod.yml down"
echo ""
echo "================================================"
