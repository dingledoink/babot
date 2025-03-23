FROM node:18-slim

WORKDIR /app

COPY package.json ./
RUN npm install --legacy-peer-deps

COPY . .

RUN apt-get update && apt-get install -y --no-install-recommends   libnss3   libatk1.0-0   libatk-bridge2.0-0   libcups2   libgbm1   libasound2   libpangocairo-1.0-0   libxss1   libgtk-3-0   libxshmfence1   libglu1   && apt-get clean && rm -rf /var/lib/apt/lists/*

EXPOSE 8080

CMD ["npm", "start"]
