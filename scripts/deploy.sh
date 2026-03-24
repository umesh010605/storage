#!/bin/bash

# Blockchain File Manager Deployment Script
set -e

echo "🚀 Deploying Blockchain File Manager..."

# Build applications
echo "🔨 Building applications..."
npm run build

# Check if Docker is available
if command -v docker &> /dev/null && command -v docker-compose &> /dev/null; then
    echo "🐳 Docker found, using containerized deployment..."
    
    # Stop existing containers
    echo "🛑 Stopping existing containers..."
    docker-compose down || true
    
    # Build and start containers
    echo "🔄 Building and starting containers..."
    docker-compose up -d --build
    
    # Wait for services to be ready
    echo "⏳ Waiting for services to be ready..."
    sleep 10
    
    # Check health
    echo "🏥 Checking service health..."
    
    # Check backend health
    if curl -f http://localhost:3001/api/health > /dev/null 2>&1; then
        echo "✅ Backend is healthy"
    else
        echo "❌ Backend health check failed"
        docker-compose logs backend
        exit 1
    fi
    
    # Check frontend
    if curl -f http://localhost:3000/health > /dev/null 2>&1; then
        echo "✅ Frontend is healthy"
    else
        echo "❌ Frontend health check failed"
        docker-compose logs frontend
        exit 1
    fi
    
    echo "✅ Deployment successful!"
    echo ""
    echo "🌐 Application URLs:"
    echo "   Frontend: http://localhost:3000"
    echo "   Backend:  http://localhost:3001"
    echo ""
    echo "📊 To view logs:"
    echo "   docker-compose logs -f"
    echo ""
    echo "🛑 To stop:"
    echo "   docker-compose down"
    
else
    echo "🔧 Docker not found, using manual deployment..."
    
    # Check if PM2 is available
    if command -v pm2 &> /dev/null; then
        echo "📦 Using PM2 for process management..."
        
        # Stop existing processes
        pm2 delete blockchain-file-manager-backend || true
        pm2 delete blockchain-file-manager-frontend || true
        
        # Start backend
        cd backend
        pm2 start dist/server.js --name blockchain-file-manager-backend
        cd ..
        
        # Start frontend (assuming nginx or similar is configured)
        echo "⚠️  Please configure your web server to serve frontend/dist"
        
        echo "✅ Deployment successful!"
        echo ""
        echo "📊 To view logs:"
        echo "   pm2 logs"
        echo ""
        echo "🛑 To stop:"
        echo "   pm2 stop all"
        
    else
        echo "⚠️  No process manager found. Please start services manually:"
        echo ""
        echo "Backend:"
        echo "   cd backend && npm start"
        echo ""
        echo "Frontend:"
        echo "   Serve frontend/dist with your web server"
    fi
fi