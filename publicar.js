// PUBLICA seinp.github.io. GitHub Pages sirve la rama main tal cual, asi que publicar es
// confirmar los cambios y empujarlos:
//
//   node publicar.js                 confirma todo, fusiona lo del remoto y empuja a origin/main
//   node publicar.js "mensaje"       con un mensaje propio
//
// OJO: esto REEMPLAZA la pagina que ve todo el mundo. La version vieja sigue viva en /antes/.
const { execFileSync } = require("child_process");

const AQUI = __dirname;
const git = (...args) => execFileSync("git", args, { cwd: AQUI, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();

const cambios = git("status", "--porcelain");
const fecha = new Date().toISOString().slice(0, 16).replace("T", " ");
const mensaje = process.argv[2] || `Portafolio ${fecha}`;

if (cambios) {
  console.log(">>> [1/4] Confirmando cambios");
  git("add", "-A");
  git("commit", "-m", mensaje);
} else {
  console.log(">>> [1/4] Sin cambios nuevos; se empuja lo ya confirmado");
}
// Otra sesion (la de la nube) tambien publica a este repo: se trae lo suyo y se fusiona antes de empujar.
console.log(">>> [2/4] Trayendo lo que haya en origin/main");
git("fetch", "origin");
if (git("rev-list", "--count", "HEAD..origin/main") !== "0") {
  try { git("merge", "--no-edit", "origin/main"); console.log("    fusionado con lo de la otra sesion"); }
  catch (e) { git("merge", "--abort"); console.error("!!! Conflicto con lo que publico la otra sesion: fusionar a mano (git merge origin/main) y volver a publicar."); process.exit(1); }
}
console.log(">>> [3/4] Empujando a origin/main");
git("push", "origin", "main");
console.log(">>> [4/4] Listo. GitHub Pages tarda un minuto: https://seinp.github.io/");
