# Backend Dockerfile
FROM oven/bun:1 as base
WORKDIR /app
COPY package.json bunfig.toml ./
RUN bun install
COPY . .
EXPOSE 8080
CMD ["bun", "run", "index.ts"]
