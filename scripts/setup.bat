@echo off
REM Blockchain File Manager Setup Script for Windows

echo 🚀 Setting up Blockchain File Manager...

REM Check Node.js
node --version >nul 2>&1
if errorlevel 1 (
    echo ❌ Node.js is not installed. Please install Node.js 18+ first.
    exit /b 1
)

echo ✅ Node.js found

REM Install dependencies
echo 📦 Installing dependencies...
call npm run install:all

REM Set up environment files
echo ⚙️ Setting up environment files...

if not exist "backend\.env" (
    copy "backend\.env.example" "backend\.env"
    echo ✅ Created backend/.env from example
    echo ⚠️  Please edit backend/.env with your database credentials
) else (
    echo ✅ backend/.env already exists
)

if not exist "frontend\.env" (
    copy "frontend\.env.example" "frontend\.env"
    echo ✅ Created frontend/.env from example
) else (
    echo ✅ frontend/.env already exists
)

REM Create uploads directory
echo 📁 Creating uploads directory...
if not exist "backend\uploads\encrypted" mkdir "backend\uploads\encrypted"
if not exist "backend\uploads\temp" mkdir "backend\uploads\temp"

echo ✅ Setup complete!
echo.
echo 🚀 To start the development servers:
echo    npm run dev
echo.
echo 🌐 Access the application:
echo    Frontend: http://localhost:5173
echo    Backend:  http://localhost:3001
echo.
echo 📝 Don't forget to:
echo    1. Edit backend/.env with your database credentials
echo    2. Set a secure JWT_SECRET in backend/.env
echo    3. Set up PostgreSQL database and run migrations
echo.