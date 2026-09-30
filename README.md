# seinp.github.io · Portafolio de José Esteban Da Rocha (SEINP)

**En vivo:** https://seinp.github.io/

Hoja de personaje + museo: una ficha fija con mis atributos y un desfile de proyectos en cartas
(FaenApp, Stab Your Friends, Monito Amarillo y ocho más), crónica 2018–2026, servicios freelance,
galería de arte y contacto. Español / English. Hecho a mano, sin frameworks ni build.

## Cómo está hecho

| Archivo | Qué es |
|---|---|
| `index.html` | La página (única fuente) |
| `estilo.css` | Todo el estilo: paleta "Luz de sala" + cobalto, cartas, diapositivas (PC), reel (teléfono) |
| `datos.js` | Todo el contenido: proyectos, atributos, crónica, servicios, arte |
| `textos.js` | Diccionario español → inglés (la clave es el texto en español) |
| `app.js` | Comportamiento: cartas que giran, carruseles, diapositivas con la rueda, reel con el dedo, animaciones de entrada |
| `servir.js` | Servidor local sin dependencias (`node servir.js` → http://localhost:4940) |
| `publicar.js` | Publica: confirma, trae lo del remoto y empuja a `main` (GitHub Pages) |
| `antes/` | La versión anterior del sitio, intacta |

## Correr en local

```bash
node servir.js
```

## Publicar

```bash
node publicar.js "mensaje"
```

Diseño y código: José Esteban Da Rocha · estebandarocha7@gmail.com
