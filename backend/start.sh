#!/bin/sh

# Wait for DB
until npx prisma db push; do
  echo "Prisma db push failed, retrying in 2 seconds..."
  sleep 2
done

# Start the application
npm run dev
