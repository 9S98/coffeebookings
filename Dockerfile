# Stage 1: Install dependencies and build the application
FROM node:20-slim AS base

# Install pnpm
ENV PNPM_HOME="/pnpm"
ENV PATH="$PNPM_HOME:$PATH"
RUN corepack enable

WORKDIR /app

# Copy package.json and pnpm-lock.yaml
COPY package.json pnpm-lock.yaml* ./

# Install dependencies using pnpm --frozen-lockfile
RUN pnpm install --frozen-lockfile

# Copy the rest of the application code
COPY . .

# Build the Next.js application
# NEXT_PUBLIC_ variables for client-side code need to be available at build time
# For server-side env vars, they'd be set in the Cloud Run environment directly.
RUN pnpm build

# Stage 2: Create the production image from the standalone output
FROM node:20-slim AS runner
WORKDIR /app

# Set NODE_ENV to production
ENV NODE_ENV production
# Optionally, uncomment the line below to disable Next.js telemetry
# ENV NEXT_TELEMETRY_DISABLED 1

# Copy the standalone output from the build stage
COPY --from=base /app/.next/standalone ./
# Copy the public directory
COPY --from=base /app/public ./public
# Copy the .next/static directory for static assets
COPY --from=base /app/.next/static ./.next/static

EXPOSE 3000

ENV PORT 3000
# HOSTNAME is needed for Next.js to bind to all network interfaces
ENV HOSTNAME "0.0.0.0"

# Start the Next.js application
# The standalone output uses server.js by default
CMD ["node", "server.js"]
