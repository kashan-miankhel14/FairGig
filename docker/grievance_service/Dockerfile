FROM node:18-alpine

WORKDIR /app

# Install dependencies
COPY backend/services/grievance_service/package.json .
RUN npm install --production

# Copy service code
COPY backend/services/grievance_service/server.js .

EXPOSE 8004

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8004/health || exit 1

CMD ["node", "server.js"]
