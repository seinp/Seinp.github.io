// PUBLICA seinp.github.io. GitHub Pages sirve la rama main tal cual, asi que publicar es
// confirmar los cambios y empujarlos:
//
//   node publicar.js                 confirma todo y empuja a origin/main
//   node publicar.js "mensaje"       con un mensaje propio
//
// OJO: esto REEMPLAZA la pagina que ve todo el mundo. La version vieja sigue viva en /antes/.
const { execFileSync } = require("child_process");

const AQUI = __dirname;
const git = (...args) => execFileSync("git", args, { cwd: AQUI, stdio: ["ignore", "pipe", "inherit"] }).toString().trim();

const cambios = git("status", "--porcelain");
if (!cambios) { console.log("Nada que publicar: no hay cambios."); process.exit(0); }

const fecha = new Date().toISOString().slice(0, 16).replace("T", " ");
const mensaje = process.argv[2] || `Portafolio ${fecha}`;

console.log(">>> [1/3] Confirmando cambios");
git("add", "-A");
git("commit", "-m", mensaje);
console.log(">>> [2/3] Empujando a origin/main");
git("push", "origin", "main");
console.log(">>> [3/3] Listo. GitHub Pages tarda un minuto: https://seinp.github.io/");
