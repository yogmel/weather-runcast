FROM oven/bun:latest

WORKDIR /app

# Copy package files
COPY package.json bun.lock ./

# Install dependencies
RUN bun install

# Copy project files
COPY . .

# Expose Vite's default dev port
EXPOSE 5173

# Start the dev server
CMD ["bun", "run", "dev", "--host"]
