const clients = new Set<import("bun").ServerWebSocket<unknown>>();
const port = Number(process.env.PORT) || 4321;

Bun.serve({
  port,
  async fetch(req, server) {
    const url = new URL(req.url);

    if (url.pathname === "/ws") {
      if (server.upgrade(req)) return;
      return new Response("Upgrade failed", { status: 400 });
    }

    const routes: Record<string, string> = {
      "/": "/real-page-mockup.html",
      "/station": "/station.html",
      "/order": "/real-page-mockup.html",
      "/scale": "/scale.html",
    };
    const path = routes[url.pathname] ?? url.pathname;
    const file = Bun.file(`${import.meta.dir}${path}`);
    if (await file.exists()) return new Response(file);

    return new Response("Not found", { status: 404 });
  },
  websocket: {
    open(ws) {
      clients.add(ws);
    },
    message(ws, message) {
      for (const client of clients) {
        if (client !== ws) client.send(message);
      }
    },
    close(ws) {
      clients.delete(ws);
    },
  },
});

console.log(`Сервер запущен на порту ${port}`);

if (!process.env.FLY_APP_NAME) {
  const localIp = await Bun.$`ipconfig getifaddr en0`.text().then(s => s.trim()).catch(() => null);
  console.log(`Макет заказа (открыть на компьютере): http://localhost:${port}/order`);
  if (localIp) console.log(`Виртуальные весы (открыть на телефоне, тот же Wi-Fi): http://${localIp}:${port}/scale`);
}
