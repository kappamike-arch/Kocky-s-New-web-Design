#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${GREEN}🚀 Setting up Kocky's Bar & Grill Full Stack Application${NC}"
echo ""

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Node.js is not installed. Please install Node.js 18+ first.${NC}"
    exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${YELLOW}⚠️  Docker is not installed. You'll need to set up PostgreSQL manually.${NC}"
    DOCKER_AVAILABLE=false
else
    DOCKER_AVAILABLE=true
fi

# Install root dependencies
echo -e "${GREEN}📦 Installing root dependencies...${NC}"
npm install

# Set up backend
echo -e "${GREEN}🔧 Setting up backend...${NC}"
cd backend

# Copy environment file if it doesn't exist
if [ ! -f .env ]; then
    echo -e "${YELLOW}Creating backend .env file...${NC}"
    cp env.example .env
    echo -e "${YELLOW}⚠️  Please edit backend/.env with your configuration${NC}"
fi

# Install backend dependencies
npm install

# Start Docker services if available
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "${GREEN}🐳 Starting Docker services...${NC}"
    cd ..
    docker-compose up -d postgres redis mailhog
    
    # Wait for PostgreSQL to be ready
    echo -e "${YELLOW}Waiting for PostgreSQL to be ready...${NC}"
    sleep 5
    
    # Update .env with Docker PostgreSQL connection
    cd backend
    sed -i.bak 's|DATABASE_URL=.*|DATABASE_URL="postgresql://kockys_user:kockys_password@localhost:5432/kockys_db?schema=public"|' .env
fi

# Generate Prisma client
echo -e "${GREEN}🗄️  Generating Prisma client...${NC}"
npx prisma generate

# Run database migrations
echo -e "${GREEN}🗄️  Running database migrations...${NC}"
npx prisma migrate dev --name init

# Seed the database
echo -e "${GREEN}🌱 Seeding database with initial data...${NC}"
npm run seed

cd ..

# Set up frontend
echo -e "${GREEN}🎨 Setting up frontend...${NC}"
cd frontend

# Copy environment file if it doesn't exist
if [ ! -f .env.local ]; then
    echo -e "${YELLOW}Creating frontend .env.local file...${NC}"
    cp env.local.example .env.local
    echo -e "${YELLOW}⚠️  Please edit frontend/.env.local with your configuration${NC}"
fi

# Install frontend dependencies
npm install

cd ..

echo ""
echo -e "${GREEN}✅ Setup complete!${NC}"
echo ""
echo -e "${GREEN}To start the development servers, run:${NC}"
echo -e "${YELLOW}  npm run dev${NC}"
echo ""
echo -e "${GREEN}The application will be available at:${NC}"
echo -e "  Frontend: ${YELLOW}http://localhost:3000${NC}"
echo -e "  Backend:  ${YELLOW}http://localhost:5000${NC}"
if [ "$DOCKER_AVAILABLE" = true ]; then
    echo -e "  MailHog:  ${YELLOW}http://localhost:8025${NC} (Email testing)"
fi
echo ""
echo -e "${GREEN}Default admin credentials:${NC}"
echo -e "  Email:    ${YELLOW}admin@kockysbar.com${NC}"
echo -e "  Password: ${YELLOW}AdminPassword123!${NC}"
echo ""
echo -e "${YELLOW}⚠️  Remember to update the .env files with your actual credentials!${NC}"
