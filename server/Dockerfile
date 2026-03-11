# Stage 1: Build the TypeScript code
FROM node:22-alpine AS builder

WORKDIR /usr/src/app

# Copy package descriptors and install all dependencies (including dev)
COPY package*.json ./
RUN npm ci

# Copy the rest of the application source code
COPY . .

# Build the application
RUN npm run build

# Stage 2: Production environment
FROM node:22-alpine

WORKDIR /usr/src/app

# Copy package descriptors and install only production dependencies
COPY package*.json ./
RUN npm ci --omit=dev

# Copy the built files from the builder stage
COPY --from=builder /usr/src/app/build ./build

# Map the Colyseus default port
EXPOSE 2567

# Start the Node.js application
CMD ["node", "build/index.js"]
