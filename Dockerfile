FROM node:18-slim

WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy tsconfig and source code
COPY tsconfig.json ./
COPY src ./src
COPY start.sh ./

# Build TypeScript files
RUN npm run build

# Make start script executable
RUN chmod +x start.sh

# Expose port
EXPOSE 3000

# Start the application
CMD ["./start.sh"] 