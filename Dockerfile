# Use an official Node.js runtime as a parent image
# Using a specific version of Node.js (e.g., Node 20 LTS - Iron)
FROM node:20-slim AS base

# Set the working directory in the container
WORKDIR /app

# Install pnpm globally
RUN npm install -g pnpm

# --- Dependencies ---
FROM base AS deps
# Copy package.json and pnpm-lock.yaml (if you use pnpm)
# The trailing '*' on pnpm-lock.yaml makes it optional if the file doesn't exist,
# but it's highly recommended to commit this file to your repository.
COPY package.json pnpm-lock.yaml* ./
# Install app dependencies using pnpm
# --prod=false ensures devDependencies (needed for build) are installed
RUN pnpm install --frozen-lockfile --prod=false

# --- Builder ---
FROM base AS builder
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules /app/node_modules
# Copy the rest of the application code
COPY . .
# Build the Next.js application
# The standalone output mode is handled by next.config.js,
# so the standard build command is used.
RUN pnpm build

# --- Runner ---
FROM base AS runner
# Set the working directory
WORKDIR /app

# Set environment variables
# The PORT environment variable is used by Next.js to start the server on a specific port.
# Cloud Run automatically sets this to 8080, but it's good practice to have it.
ENV NODE_ENV=production
# PORT is automatically set by Cloud Run. If running locally with Docker, you'd map this.
# ENV PORT=3000 (Cloud Run will override this with 8080 by default)

# Copy the standalone Next.js output from the builder stage
# This includes the .next/standalone folder and the public and .next/static folders
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/public ./public
COPY --from=builder /app/.next/static ./.next/static

# Expose the port the app runs on (Next.js default is 3000, Cloud Run default is 8080)
# Cloud Run will use the PORT env var set by its environment.
EXPOSE 3000

# The command to run when the container starts
# This uses the server.js file from the standalone output.
CMD ["node", "server.js"]