# Dockerfile

# 1. Install dependencies
# Use Node.js 20 Alpine as a base image for smaller size
FROM node:20-alpine AS deps
WORKDIR /app

# Copy package.json and package-lock.json (if available)
COPY package.json package-lock.json* ./
# Install dependencies using npm ci for faster, more reliable builds
RUN npm ci

# 2. Build application
FROM node:20-alpine AS builder
WORKDIR /app
# Copy dependencies from the 'deps' stage
COPY --from=deps /app/node_modules ./node_modules
# Copy the rest of the application code
COPY . .

# Build the Next.js application
RUN npm run build

# 3. Production image
FROM node:20-alpine AS runner
WORKDIR /app

ENV NODE_ENV production
# Disable Next.js telemetry during runtime
ENV NEXT_TELEMETRY_DISABLED 1

# Create a non-root user for security
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone Next.js output
# This includes only the necessary files for running the app
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Set the user to the non-root user
USER nextjs

# Expose port 3000 (default for Next.js production server)
EXPOSE 3000

# Set the port environment variable (Next.js will pick this up)
ENV PORT 3000
# Set hostname to allow connections from outside the container
ENV HOSTNAME "0.0.0.0"

# Command to run the Next.js server
CMD ["node", "server.js"]
