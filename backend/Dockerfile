# Stage 1: Bauild/Dependencies
FROM node:20-alpine AS builder

WORKDIR /app

# Copy package files first to leverage cache
COPY package*.json ./

# Install ONLY production dependencies (to keep image small)
# Using ci (clean install) is better for reproducibility than install
RUN npm ci --only=production

# Stage 2: Production Server
FROM node:20-alpine

WORKDIR /app

# Best Practice: Don't run as root
USER node

# Copy dependencies from builder
COPY --from=builder --chown=node:node /app/node_modules ./node_modules

# Copy application source code
COPY --chown=node:node . .

EXPOSE 4000

CMD ["npm", "start"]
