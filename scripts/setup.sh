#!/bin/bash

echo "🚀 Setting up Sweech Backend Thread Flow..."

# Check if Docker is running
if ! docker info >/dev/null 2>&1; then
    echo "❌ Docker is not running. Please start Docker and try again."
    exit 1
fi

# Check if docker compose is available
if ! command -v docker compose &> /dev/null; then
    echo "❌ docker compose is not installed. Please install it and try again."
    exit 1
fi

echo "📋 Creating environment file..."
if [ ! -f .env ]; then
    cp .env.example .env
    echo "✅ Environment file created from .env.example"
else
    echo "⚠️  Environment file already exists"
fi

echo "🐳 Starting Docker containers..."
docker-compose up -d

echo "⏳ Waiting for database to be ready..."
sleep 10

echo "🗄️  Running database migrations..."
docker compose exec app npx prisma migrate dev --name init

echo "🔧 Generating Prisma client..."
docker compose exec app npx prisma generate

echo "📦 Installing dependencies (if needed)..."
docker compose exec app npm ci

echo "🎉 Setup complete!"
echo ""
echo "🌐 Application URLs:"
echo "   • API: http://localhost:3001"
echo "   • API Docs: http://localhost:3001/api/docs"
echo "   • Database: PostgreSQL on localhost:5432"
echo ""
echo "📝 Useful commands:"
echo "   • Start development: docker-compose up"
echo "   • View logs: docker-compose logs -f app"
echo "   • Stop containers: docker-compose down"
echo "   • Open Prisma Studio: docker-compose exec app npx prisma studio"
echo "   • Run tests: docker-compose exec app npm test"
echo "   • Run e2e tests: docker-compose exec app npm run test:e2e"