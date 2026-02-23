FROM node:22-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --omit=dev
COPY src ./src
COPY scripts ./scripts
COPY README.md ./README.md
EXPOSE 8787
CMD ["node", "src/server.js"]
