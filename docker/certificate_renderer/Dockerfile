FROM node:18-alpine

WORKDIR /app

COPY backend/services/certificate_renderer/package.json .
RUN npm install --production

COPY backend/services/certificate_renderer/index.js .

EXPOSE 8006

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD wget -qO- http://localhost:8006/health || exit 1

CMD ["node", "index.js"]
