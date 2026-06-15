# Stage 1: Build the application
FROM oven/bun:1 AS builder

WORKDIR /app

# Define build arguments for environment variables
ARG APP_API_URL
ARG APP_DEPLOYMENT_MODE=TRAQUE_CLOUD

# Set environment variables from build arguments
ENV APP_API_URL=$APP_API_URL
ENV APP_DEPLOYMENT_MODE=$APP_DEPLOYMENT_MODE

# Copy dependency definitions
COPY package.json bun.lock ./

# Install dependencies
RUN bun install --frozen-lockfile

# Copy source code
COPY . .

# Build the application
RUN bun run build

# Stage 2: Serve the application with Nginx
FROM nginx:alpine

# Copy custom Nginx configuration
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copy built assets from builder stage
COPY --from=builder /app/dist /usr/share/nginx/html

# Expose port 80
EXPOSE 80

# Start Nginx
CMD ["nginx", "-g", "daemon off;"]
