FROM oven/bun:1
WORKDIR /app
COPY . .
EXPOSE 8080
CMD ["bun", "run", "server.ts"]
