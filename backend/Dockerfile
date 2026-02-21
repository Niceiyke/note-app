FROM node:18-slim

# Install openssl for Prisma
RUN apt-get update && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npx prisma generate

EXPOSE 8000

# We use a shell script or a complex command to ensure DB is ready if needed, 
# but for now let's just use npm run dev
CMD ["/app/start.sh"]
