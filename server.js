const http = require("http");

const PORT = process.env.PORT || 3000;
const STREAM_URL = "https://server.laradio.online:58381/live";

const server = http.createServer(async (req, res) => {
  // Allow the HTML player to request this relay from another origin.
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, HEAD, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Range, Content-Type");
  res.setHeader("Access-Control-Expose-Headers", "Content-Type, Content-Length, Accept-Ranges");
  res.setHeader("Cache-Control", "no-store");

  if (req.method === "OPTIONS") {
    res.writeHead(204);
    return res.end();
  }

  if (req.url === "/health") {
    res.writeHead(200, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Cadena SER proxy OK");
  }

  if (req.url !== "/stream" || !["GET", "HEAD"].includes(req.method)) {
    res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("Use /stream or /health");
  }

  let upstream;
  try {
    upstream = await fetch(STREAM_URL, {
      method: req.method,
      headers: { "User-Agent": "CadenaSER-AudioRelay/1.0" },
      redirect: "follow"
    });
  } catch (err) {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end("No se pudo conectar con la transmisión de origen.");
  }

  if (!upstream.ok && upstream.status !== 200 && upstream.status !== 206) {
    res.writeHead(502, { "Content-Type": "text/plain; charset=utf-8" });
    return res.end(`La radio de origen respondió HTTP ${upstream.status}.`);
  }

  const headers = { "Access-Control-Allow-Origin": "*" };
  const contentType = upstream.headers.get("content-type");
  if (contentType) headers["Content-Type"] = contentType;
  const contentLength = upstream.headers.get("content-length");
  if (contentLength) headers["Content-Length"] = contentLength;
  const acceptRanges = upstream.headers.get("accept-ranges");
  if (acceptRanges) headers["Accept-Ranges"] = acceptRanges;

  res.writeHead(upstream.status, headers);
  if (req.method === "HEAD" || !upstream.body) return res.end();

  // Stream bytes continuously; do not buffer the whole broadcast.
  const reader = upstream.body.getReader();
res.on("close", () => {
  if (!res.writableEnded) {
    try { reader.cancel(); } catch (_) {}
  }
});

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      if (!res.write(Buffer.from(value))) {
        await new Promise(resolve => res.once("drain", resolve));
      }
    }
    res.end();
  } catch (_) {
    if (!res.destroyed) res.end();
  }
});

server.listen(PORT, "0.0.0.0", () => {
  console.log(`Cadena SER relay listening on ${PORT}`);
});
