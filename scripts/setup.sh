#!/bin/bash

# Blockchain File Manager Setup Script
set -e

echo "🚀 Setting up Blockchain File Manager..."

# Check prerequisites
echo "📋 Checking prerequisites..."

# Check Node.js
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js $(node -v) found"

# Check PostgreSQL
if ! command -v psql &> /dev/null; then
    echo "❌ PostgreSQL is not installed. Please install PostgreSQL 12+ first."
    exit 1
fi

echo "✅ PostgreSQL found"

# Install dependencies
echo "📦 Installing dependencies..."
npm run install:all

# Set up environment files
echo "⚙️ Setting up environment files..."

if [ ! -f "backend/.env" ]; then
    cp backend/.env.example backend/.env
    echo "✅ Created backend/.env from example"
    echo "⚠️  Please edit backend/.env with your database credentials"
else
    echo "✅ backend/.env already exists"
fi

if [ ! -f "frontend/.env" ]; then
    cp frontend/.env.example frontend/.env
    echo "✅ Created frontend/.env from example"
else
    echo "✅ frontend/.env already exists"
fi

# Create database
echo "🗄️ Setting up database..."
read -p "Enter PostgreSQL username (default: postgres): " DB_USER
DB_USER=${DB_USER:-postgres}

read -p "Enter database name (default: blockchain_file_manager): " DB_NAME
DB_NAME=${DB_NAME:-blockchain_file_manager}

echo "Creating database $DB_NAME..."
createdb -U "$DB_USER" "$DB_NAME" 2>/dev/null || echo "Database may already exist"

# Run migrations
echo "🔄 Running database migrations..."
cd backend && npm run migrate
cd ..

# Create uploads directory
echo "📁 Creating uploads directory..."
mkdir -p backend/uploads/encrypted
mkdir -p backend/uploads/temp

echo "✅ Setup complete!"
echo ""
echo "🚀 To start the development servers:"
echo "   npm run dev"
echo ""
echo "🌐 Access the application:"
echo "   Frontend: http://localhost:5173"
echo "   Backend:  http://localhost:3001"
echo ""
echo "📝 Don't forget to:"
echo "   1. Edit backend/.env with your database credentials"
echo "   2. Set a secure JWT_SECRET in backend/.env"
echo ""