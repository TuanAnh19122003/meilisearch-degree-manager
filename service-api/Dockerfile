# Base image Node.js
FROM node:20-bullseye-slim

# Set working directory
WORKDIR /usr/src/app

# Cài các dependencies cần thiết cho Chromium
RUN apt-get update && apt-get install -y \
    chromium \
    fonts-noto \
    fonts-noto-cjk \
    fonts-noto-color-emoji \
    fonts-dejavu \
    fonts-liberation \
    libnss3 \
    libatk-bridge2.0-0 \
    libx11-xcb1 \
    libxcomposite1 \
    libxcursor1 \
    libxdamage1 \
    libxrandr2 \
    libasound2 \
    libpangocairo-1.0-0 \
    libatk1.0-0 \
    libgtk-3-0 \
    libgbm1 \
    libpango-1.0-0 \
    libxshmfence1 \
    curl \
    && rm -rf /var/lib/apt/lists/*


# Copy package.json + package-lock.json
COPY package*.json ./

# Cài dependencies
RUN npm install --production

# Copy toàn bộ source code
COPY . .

# Set Puppeteer executable path
ENV PUPPETEER_EXECUTABLE_PATH=/usr/bin/chromium

# Expose port
EXPOSE 5000

# Start server
CMD ["npm", "start"]
