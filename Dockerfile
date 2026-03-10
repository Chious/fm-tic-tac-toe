FROM node:22-alpine AS builder

WORKDIR /app

# Install dependencies
COPY package*.json ./
RUN npm install

# Copy source code and build
COPY . .
RUN npm run build

# Production stage
FROM node:22-alpine

WORKDIR /app

# Copy package files for production dependency installation
COPY package*.json ./
# Only install production dependencies to keep image small
RUN npm install --omit=dev

# Copy built application from builder stage
# The path depends on angular.json configuration, usually dist/<project-name>
COPY --from=builder /app/dist/fm-tic-tac-toe ./dist/fm-tic-tac-toe

# Expose the port the server listens on
EXPOSE 4000

# Start the SSR and API server
CMD ["npm", "run", "serve:ssr:fm-tic-tac-toe"]
