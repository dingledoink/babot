FROM node:18-bullseye

# Puppeteer dependencies
RUN apt-get update && apt-get install -y     libnss3     libatk1.0-0     libatk-bridge2.0-0     libcups2     libgbm1     libasound2     libpangocairo-1.0-0     libxss1     libgtk-3-0     libxshmfence1     libglu1     --no-install-recommends &&     apt-get clean && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Install dependencies first
COPY package*.json ./
RUN npm install --legacy-peer-deps

# Copy rest of app
COPY . .

# Healthcheck to avoid Railway "hangs"
HEALTHCHECK CMD curl --fail http://localhost:8080/ || exit 1

CMD ["npm", "start"]