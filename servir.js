// Servidor local del portafolio (seinp.github.io): http://localhost:4940
// Sirve esta carpeta tal cual la publica GitHub Pages. Sin dependencias.
// Los datos vivos de STAB (version y ranking) se los pide a monitoamarillo.com y los reenvia,
// porque en local el navegador no puede leerlos de otro dominio.
const http = require("http");
const fs = require("fs");
const path = require("path");

const RAIZ = __dirname;
const PUERTO = Number(process.env.PUERTO) || 4940;
const TIPOS = { ".html": "text/html; charset=utf-8", ".css": "text/css; charset=utf-8", ".js": "text/javascript; charset=utf-8",
  ".json": "application/json", ".png": "image/png", ".jpg": "image/jpeg", ".jpeg": "image/jpeg", ".webp": "image/webp",
  ".svg": "image/svg+xml", ".ico": "image/x-icon", ".pdf": "application/pdf" };

http.createServer((req, res) => {
  let url = decodeURIComponent(req.url.split("?")[0]);
  if (url.endsWith("/")) url += "index.html";

  if (url === "/stab/version.php" || url === "/stab/web-ranking.php") {
    const consulta = req.url.includes("?") ? req.url.slice(req.url.indexOf("?")) : "";
    return fetch("https://monitoamarillo.com" + url + consulta, { signal: AbortSignal.timeout(8000) })
      .then((r) => r.text())
      .then((t) => { res.writeHead(200, { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" }); res.end(t); })
      .catch(() => { res.writeHead(502); res.end("{}"); });
  }

  const archivo = path.join(RAIZ, url);
  if (!archivo.startsWith(RAIZ)) { res.writeHead(403); return res.end(); }
  fs.readFile(archivo, (err, datos) => {
    if (err) { res.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" }); return res.end("No esta: " + url); }
    res.writeHead(200, { "Content-Type": TIPOS[path.extname(archivo).toLowerCase()] || "application/octet-stream", "Cache-Control": "no-store" });
    res.end(datos);
  });
}).listen(PUERTO, "0.0.0.0", () => console.log(`Portafolio SEINP -> http://localhost:${PUERTO}/   (la version vieja: /antes/)`));
