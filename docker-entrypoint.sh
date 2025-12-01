#!/bin/sh
set -e

echo "🔥 BFP Berong - Starting up..."

# Run database migrations
echo "📦 Running database migrations..."
npx prisma migrate deploy

# Seed the database if it's empty (first run)
echo "🌱 Checking if database needs seeding..."
npx prisma db seed || echo "Database already seeded or seed skipped"

echo "🚀 Starting Next.js server..."
exec "$@"
