// seinp.github.io: dibuja la pagina desde datos.js, cambia de idioma con textos.js (la clave
// es el texto en espanol) y trae los datos vivos de STAB (version y ranking) del servidor real.
(function () {
  "use strict";
  const D = window.DATOS, T = window.TEXTOS || {};

  // Al recargar, la pagina arranca SIEMPRE en la portada: sin restaurar el scroll ni el hash.
  if ("scrollRestoration" in history) history.scrollRestoration = "manual";
  if (location.hash || (history.state && history.state.detalleP)) history.replaceState(null, "", location.pathname + location.search);
  scrollTo(0, 0);
  const $ = (s, r) => (r || document).querySelector(s);

  // ---------- INTRO: la hoja de personaje se carga ----------
  // Cortina a pantalla completa: el SEINP en trazo se rellena de cobalto de izquierda a derecha, una barra
  // segmentada (la de los atributos) carga con contador, el sello NV 8 se estampa y la cortina se va hacia
  // arriba con la linea de barrido de las diapositivas. Dura ~2 s; con "reducir movimiento" no se muestra.
  let introLista = false;
  const esperarIntro = () => new Promise((res) => (introLista ? res() : document.addEventListener("intro-lista", () => res(), { once: true })));
  (function armarIntro() {
    const fin = () => { introLista = true; document.documentElement.classList.remove("con-intro"); document.dispatchEvent(new CustomEvent("intro-lista")); };
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return fin();
    const el = document.createElement("div");
    el.id = "intro"; el.setAttribute("aria-hidden", "true");
    el.innerHTML = '<div class="intro-in"><div class="intro-marca">SEINP<span class="intro-nv">NV 8</span></div><div class="intro-barra"><i></i></div><div class="intro-texto"><span></span> · <b>0</b>%</div></div>';
    document.body.prepend(el);
    document.documentElement.classList.add("con-intro");
    const barra = el.querySelector(".intro-barra i"), num = el.querySelector(".intro-texto b");
    const DUR = 1350, t0 = performance.now();
    let listo = false;
    const terminar = () => {
      if (listo) return; listo = true;
      barra.style.width = "100%"; num.textContent = "100";
      el.classList.add("completa");
      setTimeout(() => { el.classList.add("fuera"); setTimeout(() => { el.remove(); fin(); }, 650); }, 420);
    };
    const paso = (t) => {
      const p = Math.min(1, (t - t0) / DUR), e = 1 - Math.pow(1 - p, 3);
      barra.style.width = (e * 100).toFixed(1) + "%"; num.textContent = Math.round(e * 100);
      if (p < 1) requestAnimationFrame(paso); else (document.fonts && document.fonts.ready ? document.fonts.ready : Promise.resolve()).then(terminar);
    };
    requestAnimationFrame(paso);
    setTimeout(terminar, 3200);   // red de seguridad: si el navegador frena los cuadros, la cortina se va igual
    // el texto se traduce cuando el diccionario ya esta cargado (t() se define mas abajo)
    setTimeout(() => { const s = el.querySelector(".intro-texto span"); if (s) s.textContent = t("Cargando hoja de personaje"); }, 0);
  })();

  // ---------- idioma ----------
  let idioma = "es";
  try { idioma = localStorage.getItem("seinp-idioma") || "es"; } catch {}
  const faltan = new Set();
  const t = (es) => {
    if (idioma !== "en" || !es) return es;
    if (es in T) return T[es];
    faltan.add(es);
    return es;
  };

  function traducirEstaticos() {
    document.querySelectorAll("[data-t]").forEach((el) => {
      if (!el.dataset.es) el.dataset.es = el.textContent;
      el.textContent = t(el.dataset.es);
    });
    document.querySelectorAll("[data-t-alt]").forEach((el) => {
      if (!el.dataset.esAlt) el.dataset.esAlt = el.getAttribute("alt");
      el.setAttribute("alt", t(el.dataset.esAlt));
    });
    document.documentElement.lang = idioma;
    document.querySelectorAll("#idioma span").forEach((s) => s.classList.toggle("on", s.dataset.idioma === idioma));
  }

  // ---------- rareza ----------
  const RAREZAS = { legendario: ["◆◆◆◆", "LEGENDARIO"], epico: ["◆◆◆◇", "ÉPICO"], raro: ["◆◆◇◇", "RARO"], comun: ["◆◇◇◇", "COMÚN"] };
  const rarezaDeValor = (v) => (v >= 90 ? "legendario" : v >= 80 ? "epico" : v >= 70 ? "raro" : "comun");
  const rareza = (k) => { const r = RAREZAS[k] || RAREZAS.comun; return `<i>${r[0]}</i>${t(r[1])}`; };

  const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
  // En las descripciones, **asi** marca una palabra clave: se pinta en negrita cobalto.
  const resaltar = (s) => esc(s).replace(/\*\*(.+?)\*\*/g, "<b>$1</b>");

  // ---------- ficha: atributos ----------
  function pintarAtributos() {
    $("#atributos").innerHTML = D.atributos.map((a) => `
      <li class="atr">
        <span class="nom">${esc(t(a.nombre))}</span>
        <span class="rar">${rareza(rarezaDeValor(a.valor))}</span>
        <span class="val">${a.valor}</span>
        <span class="bar"><i style="width:${a.valor}%"></i></span>
      </li>`).join("");
    $("#atr-grid").innerHTML = D.atributos.map((a, i) => `
      <div class="atr-card" style="--w:${a.valor}%; --d:${(i * .09).toFixed(2)}s">
        <div class="fila"><span class="nom">${esc(t(a.nombre))}</span><span class="rar">${rareza(rarezaDeValor(a.valor))}</span></div>
        <div class="val" data-val="${a.valor}">0</div>
        <div class="bar"><i></i></div>
        <p>${esc(t(a.prueba))}</p>
      </div>`).join("");
    $("#formacion").innerHTML = D.formacion.map((f) => `<div><b>${esc(t(f.titulo))}</b><p>${esc(t(f.texto))}</p></div>`).join("");
  }

  // ---------- portada: numeros ----------
  function pintarNumeros() {
    $("#numeros").innerHTML = D.numeros.map((n) => `<li><b${n.id ? ` id="${n.id}"` : ""}>${esc(n.valor)}</b><span>${esc(t(n.etiqueta))}</span></li>`).join("");
  }

  // ---------- la imagen de cada proyecto: video, carrusel, una imagen o el hueco ----------
  // Nunca se recorta: cada imagen se muestra entera, a su proporcion, sobre el fondo de la obra.
  function media(p) {
    const alt = esc(t(p.alt));
    const clases = (p.imgLogo ? " logo" : "") + (p.pixel ? " pixel" : "") + (p.vertical ? " vertical" : "");
    if (p.video) {
      return `<div class="imagen video"><video src="${esc(p.video)}" poster="${esc(p.poster || p.img || "")}" muted loop playsinline autoplay preload="metadata" aria-label="${alt}"></video></div>`;
    }
    const lista = p.imgs || (p.img ? [p.img] : []);
    if (!lista.length) {
      return `<div class="imagen vacia" role="img" aria-label="${alt}"><span class="etq">${esc(t("captura pendiente"))} · ${esc(p.nombre)}</span></div>`;
    }
    if (lista.length === 1) {
      return `<div class="imagen${clases}"><img src="${esc(lista[0])}" alt="${alt}" loading="lazy"></div>`;
    }
    // Dupla: dos imagenes lado a lado, fijas (los retratos de los fundadores de Monito).
    if (p.dupla && lista.length === 2) {
      return `<div class="imagen dupla${clases}">${lista.map((s, j) => `<img src="${esc(s)}" alt="${alt} ${j + 1}" loading="lazy">`).join("")}</div>`;
    }
    // Las capturas verticales (telefono) van de a dos por diapositiva: asi no queda aire a los lados.
    const porSlide = p.vertical ? 2 : 1;
    const slides = [];
    for (let i = 0; i < lista.length; i += porSlide) slides.push(lista.slice(i, i + porSlide));
    const riel = slides.map((g, k) => `<div class="slide">${g.map((s, j) => `<img src="${esc(s)}" alt="${alt} ${k * porSlide + j + 1}" loading="lazy">`).join("")}</div>`).join("");
    return `<div class="imagen carrusel${clases}">
      <div class="riel">${riel}</div>
      <div class="barra">
        <div class="puntos" aria-hidden="true">${slides.map((_, i) => `<i${i === 0 ? ' class="on"' : ""}></i>`).join("")}</div>
        <span class="cuenta"><b>1</b><i>/</i>${slides.length}</span>
        <div class="flechas"><button type="button" class="ant" aria-label="${esc(t("Anterior"))}">‹</button><button type="button" class="sig" aria-label="${esc(t("Siguiente"))}">›</button></div>
      </div>
    </div>`;
  }

  // La caja de la imagen guarda su propia imagen en --fondo: en telefono se pinta desenfocada detras
  // (la imagen entera, sin recortar, y el hueco que sobra se llena con su propio color).
  // El "desenfoque" no usa filter (en telefono hacia laguear el giro): se dibuja una miniatura de 24 px de la
  // imagen y el navegador la agranda suave, que es lo mismo que un blur pero gratis.
  const MINIS = new Map();
  function miniatura(src, cb) {
    if (MINIS.has(src)) return cb(MINIS.get(src));
    const im = new Image();
    im.onload = () => {
      try {
        const c = document.createElement("canvas"); c.width = 24; c.height = 24;
        c.getContext("2d").drawImage(im, 0, 0, 24, 24);
        const u = c.toDataURL("image/png"); MINIS.set(src, u); cb(u);
      } catch { cb(null); }
    };
    im.onerror = () => cb(null);
    im.src = src;
  }
  function armarAmbiente() {
    document.querySelectorAll(".carta-p .frente .imagen:not(.logo), .tesela .tes-img:not(.logo)").forEach((caja) => {
      const img = caja.querySelector("img"), video = caja.querySelector("video");
      const src = img ? img.getAttribute("src") : video && video.getAttribute("poster");
      if (!src) return;
      caja.style.setProperty("--fondo", `url("${src}")`);
      miniatura(src, (u) => { if (u) { caja.style.setProperty("--fondo", `url("${u}")`); caja.classList.add("ambiente-mini"); } });
    });
  }

  // ---------- las cartas: flotan (B2), se inclinan con el mouse y giran al clic (A3) ----------
  // La carta grande sola (Monito Amarillo) no gira: solo flota y se inclina (menos, porque es ancha).
  const R = (ang, y, s) => `rotateY(${ang}deg) translateY(${y}px) scale(${s})`;
  const GIRO_A3 = [
    { transform: R(0, 0, 1), easing: "cubic-bezier(.5,0,.75,.3)" },
    { transform: R(80, -40, .9), offset: .36, easing: "cubic-bezier(.1,.7,.2,1)" },
    { transform: R(180, 9, 1.02), offset: .74, easing: "cubic-bezier(.4,0,.6,1)" },
    { transform: R(180, -5, 1), offset: .87, easing: "ease-in-out" },
    { transform: R(180, 2, 1), offset: .95, easing: "ease-out" },
    { transform: R(180, 0, 1) }
  ];
  const INCLINA = 10, INCLINA_SOLA = 3;   // grados maximos de B2
  function armarCartas() {
    document.querySelectorAll(".proyecto.carta-p").forEach((art) => {
      const carta = art.querySelector(".carta"), caras = [...art.querySelectorAll(".cara")];
      const sola = art.classList.contains("sola"), inclina = sola ? INCLINA_SOLA : INCLINA;
      let abierta = false, girando = false, anim = null;
      const base = () => (abierta ? "rotateY(180deg) " : "");
      // cierre en seco (sin animacion): al cambiar de apartado todas las cartas vuelven al frente
      art._cerrarCarta = () => {
        if (anim) { anim.cancel(); anim = null; }
        abierta = false; girando = false;
        art.classList.remove("girando");
        carta.style.transition = ""; carta.style.transform = "";
        carta.setAttribute("aria-pressed", "false");
        art.querySelectorAll("video").forEach((v) => v.play().catch(() => {}));
      };
      const conMouse = () => matchMedia("(hover: hover) and (min-width: 861px)").matches;

      art.addEventListener("mousemove", (e) => {
        if (girando || !conMouse()) return;
        const r = art.getBoundingClientRect();
        const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
        const dx = px - .5, dy = py - .5;
        caras.forEach((c) => { c.style.setProperty("--mx", (px * 100) + "%"); c.style.setProperty("--my", (py * 100) + "%"); });
        // en el dorso el eje Y esta espejado: se invierte para que siga al mouse igual
        carta.style.transform = `${base()}rotateX(${-dy * inclina * 2}deg) rotateY(${(abierta ? -dx : dx) * inclina * 2}deg)`;
      });
      art.addEventListener("mouseleave", () => { if (!girando) carta.style.transform = base(); });
      if (sola) return;

      function girar() {
        if (girando) return;
        girando = true;
        art.classList.add("girando");
        art.querySelectorAll("video").forEach((v) => v.pause());
        document.dispatchEvent(new CustomEvent("carta-girada", { detail: { art, abierta: !abierta } }));
        // 1) la carta vuelve suave a su posicion neutra (la inclinacion del mouse se apaga)
        carta.style.transition = "transform .15s ease-out";
        carta.style.transform = base();
        setTimeout(() => {
          if (!girando) return;   // se cerro en seco mientras tanto (cambio de proyecto o de apartado)
          // 2) el salto con rebote (A3), hacia adelante o en reversa segun el lado
          carta.style.transition = "";
          if (anim) anim.cancel();
          anim = carta.animate(GIRO_A3, { duration: 1000, fill: "forwards", direction: abierta ? "reverse" : "normal" });
          anim.onfinish = () => {
            abierta = !abierta;
            // 3) se fija el resultado en el estilo y se libera la animacion: el mouse vuelve a mandar
            anim.commitStyles(); anim.cancel(); anim = null;
            carta.style.transform = base();
            carta.setAttribute("aria-pressed", String(abierta));
            girando = false;
            art.classList.remove("girando");
            art.querySelectorAll("video").forEach((v) => v.play().catch(() => {}));
          };
        }, 160);
      }
      carta.addEventListener("click", (e) => { if (e.target.closest("a, button, .riel")) return; girar(); });
      carta.addEventListener("keydown", (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); girar(); } });
    });
  }

  // Los carruseles: botones, puntos y contador. Deslizar con el dedo ya lo hace el scroll.
  function armarCarruseles() {
    document.querySelectorAll(".carrusel").forEach((c) => {
      const riel = c.querySelector(".riel"), puntos = [...c.querySelectorAll(".puntos i")], cuenta = c.querySelector(".cuenta b");
      const indice = () => Math.round(riel.scrollLeft / riel.clientWidth);
      const ir = (i) => riel.scrollTo({ left: ((i + puntos.length) % puntos.length) * riel.clientWidth, behavior: "smooth" });
      c.querySelector(".ant").addEventListener("click", () => ir(indice() - 1));
      c.querySelector(".sig").addEventListener("click", () => ir(indice() + 1));
      riel.addEventListener("scroll", () => {
        const i = indice();
        puntos.forEach((p, k) => p.classList.toggle("on", k === i));
        if (cuenta) cuenta.textContent = i + 1;
      }, { passive: true });
    });
  }

  // ---------- desfile ----------
  // Los que comparten "fila" en datos.js van de a dos en la misma linea como CARTAS que giran al clic
  // (Monito + FaenApp + Stab de a tres, Earth Survivor + Space G, Ready + MARSICARE); el borde usa su "color".
  // Los que tienen "carta: true" van solos en una carta grande sin giro (Monito Amarillo).
  // El resto va completo, sin carta: texto a un lado e imagen al otro, alternando.
  function pintarProyectos() {
    const total = D.proyectos.length;
    $("#menu-total").textContent = total;
    const filas = [];
    D.proyectos.forEach((p) => {
      const ultima = filas[filas.length - 1];
      if (p.fila && ultima && ultima.fila === p.fila) ultima.items.push(p);
      else filas.push({ fila: p.fila, items: [p] });
    });
    const tarjeta = (p, i, sola, lado, forzarCarta, entrada) => {
      const n = String(i + 1).padStart(2, "0");
      const img = media(p);
      // El boton muestra el link tal cual (sin https:// ni barra final), por pedido de Esteban.
      // Sin enlace publico (Ready, La Castañuela): una placa apagada del mismo tamaño, asi la carta se distribuye igual que las demas.
      const link = p.link
        ? `<a class="link" href="${esc(p.link)}" target="_blank" rel="noopener"><span>${esc(p.link.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</span><i aria-hidden="true">↗</i></a>`
        : `<span class="link sin-enlace"><span>${esc(t("Proyecto privado · sin enlace"))}</span><i aria-hidden="true">–</i></span>`;
      const etiquetas = `
            <span class="anio">${esc(t(p.anio))}</span>
            <span class="tipo">${esc(t(p.tipo))}</span>
            <span class="rar">${rareza(p.rareza)}</span>
            ${p.sinIA ? `<span class="sin-ia">${esc(t("Hecho sin IA"))}</span>` : ""}
            <span class="n">${n} / ${total}</span>`;
      const tec = `<ul class="tec">${t(p.tecnica).split(" · ").map((x) => `<li>${esc(x)}</li>`).join("")}</ul>`;
      const rol = `<p class="rol"><span>${esc(t("Rol"))}</span> ${esc(t(p.rol))}</p>`;
      const clases = "proyecto carta-p aparece" + (sola ? " sola" : "") + (lado ? " der" : "") + (p.borde ? " " + p.borde : "");
      const estilo = [p.color && `--borde:${p.color}`, p.boton && `--boton:${p.boton}`].filter(Boolean).join(";");
      const color = (estilo ? ` style="${esc(estilo)}"` : "") + (entrada ? ` data-entrada="${entrada}"` : "");

      // Completo, sin carta: como era el desfile original.
      if (!sola && !p.fila && !forzarCarta) {
        return `
      <article class="proyecto aparece${lado ? " der" : ""}" id="p-${n}">
        <div class="texto">
          <h3>${esc(p.nombre)}</h3>
          <div class="meta">${etiquetas}</div>
          <p class="desc">${resaltar(t(p.desc))}</p>
          ${link}
          ${tec}
          ${rol}
        </div>
        ${img}
      </article>`;
      }

      // Carta grande sola: una cara, texto a un lado y la imagen al otro. No gira y llena el alto.
      if (sola) {
        return `
      <article class="${clases}" id="p-${n}"${color}>
        <div class="flotante"><div class="carta">
          <div class="cara frente">
            <div class="texto">
              ${p.logo ? `<img class="logo-s${p.logoPixel ? " pixel" : ""}" src="${esc(p.logo)}" alt=""><h3 class="sr">${esc(p.nombre)}</h3>` : `<h3>${esc(p.nombre)}</h3>`}
              <div class="meta">${etiquetas}</div>
              <p class="desc">${resaltar(t(p.desc))}</p>
              ${link}
              ${tec}
              ${rol}
            </div>
            ${img}
          </div>
        </div></div>
      </article>`;
      }

      // Carta de a dos, en cinco lineas (vision de Esteban):
      // 1 logo (o nombre) + sello · 2 etiquetas + tecnica + rol · 3 video/carrusel · 4 pista · 5 boton
      // Dos caras: el frente y el dorso (la descripcion). Flota (B2), se inclina con el mouse y gira al clic (A3).
      const cabeza = (p.logo ? `<img class="logo${p.logoPixel ? " pixel" : ""}" src="${esc(p.logo)}" alt="">` : "") + `<h3 class="nombre-c">${esc(p.nombre)}</h3>`;
      return `
      <article class="${clases}" id="p-${n}"${color}>
        <div class="flotante"><div class="carta" tabindex="0" role="button" aria-pressed="false" aria-label="${esc(p.nombre)}">
          <div class="cara frente">
            <div class="cab-d${p.logo ? " con-logo" : " sin-logo"}">
              ${cabeza}
              <span class="sello">${esc(t(p.etiqueta))}</span>
            </div>
            <div class="linea2">${etiquetas}<span class="sep" aria-hidden="true"></span>${tec}${rol}</div>
            ${img}
            <span class="pista" aria-hidden="true">${esc(t("Toca la carta para ver más"))}</span>
            ${link}
          </div>
          <div class="cara dorso">
            <span class="k">${esc(t("Más información"))}</span>
            <h3>${esc(p.nombre)}</h3>
            <p class="desc">${resaltar(t(p.desc))}</p>
            ${tec}
            ${rol}
            ${link}
          </div>
        </div></div>
      </article>`;
    };
    // TABLET (vertical): los 11 proyectos en una rejilla de 4 columnas, todos a la vista; al tocar uno, su carta
    // completa (la misma del telefono) se abre al frente en #detalle-p. Las anchas: destacadas + carta sola, y se
    // ensanchan las ultimas hasta cerrar la fila (11 → 16 celdas, 4 x 4, sin huecos).
    if (modoActual() === "tableta") {
      const reabrir = estadoDet.abierto ? estadoDet.i : -1;
      if (reabrir >= 0) { cerrarDetalle(true, true); estadoDet.empujado = true; } else cerrarDetalle(true);
      const lista = D.proyectos;
      const ancha = lista.map((p) => !!(p.destacado || p.carta));
      let celdas = lista.length + ancha.filter(Boolean).length;
      for (let i = lista.length - 1; celdas % 4 && i >= 0; i--) if (!ancha[i]) { ancha[i] = true; celdas++; }
      const fila = []; let ocupadas = 0;
      lista.forEach((_, i) => { fila[i] = Math.floor(ocupadas / 4); ocupadas += ancha[i] ? 2 : 1; });
      const ENTRADA_FILA = ["lados", "zoom", "caida", "reparto"];
      const tesela = (p, i) => {
        const src = p.poster || (p.imgs && p.imgs[0]) || p.img || "";
        const estilo = [p.color && `--borde:${p.color}`, `--i:${i}`].filter(Boolean).join(";");
        const cabeza = p.logo
          ? `<img class="tes-logo${p.logoPixel ? " pixel" : ""}" src="${esc(p.logo)}" alt="">`
          : `<b class="tes-nombre">${esc(p.nombre)}</b>`;
        return `
        <button type="button" class="tesela${ancha[i] ? " ancha" : ""}${p.borde ? " " + p.borde : ""}" data-i="${i}" data-entrada="${ENTRADA_FILA[fila[i] % ENTRADA_FILA.length]}" style="${esc(estilo)}" aria-label="${esc(t("Ver proyecto") + ": " + p.nombre)}">
          <span class="tes-cab">${cabeza}<span class="tes-sello">${esc(t(p.etiqueta))}</span></span>
          <span class="tes-img${p.pixel ? " pixel" : ""}${p.imgLogo ? " logo" : ""}"><img src="${esc(src)}" alt="" loading="lazy"></span>
          <span class="tes-pie"><span>${esc(t(p.anio))}<em> · ${esc(t(p.tipo))}</em></span><i aria-hidden="true">+</i></span>
        </button>`;
      };
      $("#proyectos").innerHTML = `
      <div class="rejilla-cab"><span>${esc(t("PROYECTOS"))} · <b>${total}</b></span><span>${esc(t("Toca uno para verlo"))}</span></div>
      <div class="rejilla-p" style="--filas:${celdas / 4}">${lista.map(tesela).join("")}</div>`;
      armarDetalle(lista.map((p, i) => `<div class="det-slot" data-i="${i}">${tarjeta(p, i, false, false, true, null)}</div>`).join(""), total);
      // pixel art: nitido solo cuando la tesela lo agranda; al achicarlo, suave (regla de la casa)
      $("#proyectos").querySelectorAll(".tes-img.pixel img").forEach((im) => {
        const nitidez = () => { im.style.imageRendering = im.clientWidth > im.naturalWidth ? "pixelated" : "auto"; };
        if (im.complete && im.naturalWidth) nitidez(); else im.addEventListener("load", nitidez, { once: true });
      });
      if (reabrir >= 0) setTimeout(() => abrirDetalle(reabrir, null, true), 0);   // tras armar cartas y carruseles
      return;
    }
    vaciarDetalle();
    // En telefono todas las cartas se ven iguales (formato de a dos): la carta grande sola es solo de PC.
    const telefono = matchMedia("(max-width: 860px)").matches;
    // Cada fila entra distinto (lados, zoom, giro, subida, barrido); la carta grande sola entra como terminal.
    const ENTRADAS = ["lados", "zoom", "caida", "subida", "reparto"];
    let k = 0, lados = 0, r = 0;
    $("#proyectos").innerHTML = filas.map((f) => {
      const dos = f.items.length > 1, p = f.items[0];
      if (dos) { const ent = ENTRADAS[r++ % ENTRADAS.length]; return `<div class="fila-cartas ${f.items.length > 2 ? "tres" : "dos"}">${f.items.map((x) => tarjeta(x, k++, false, false, false, ent)).join("")}</div>`; }
      const lado = lados++ % 2 === 1;
      if (p.carta) return `<div class="fila-cartas una">${telefono ? tarjeta(p, k++, false, false, true, "terminal") : tarjeta(p, k++, true, lado, false, "terminal")}</div>`;
      return tarjeta(p, k++, false, lado);
    }).join("");
  }

  // ---------- cronica ----------
  function pintarCronica() {
    $("#cronica-lista").innerHTML = D.cronica.map((c, k) => `
      <li style="--d:${(k * .12).toFixed(2)}s"><span class="anio">${esc(c.anio)}</span><i class="punto" aria-hidden="true"></i>
        <div class="items">${c.items.map((it) => `<div><b>${esc(it.t)}</b><span>${esc(t(it.d))}</span></div>`).join("")}</div>
      </li>`).join("");
  }

  // ---------- servicios ----------
  function pintarServicios() {
    $("#servicios-lista").innerHTML = D.servicios.map((s) => `
      <div class="servicio">
        <h3>${esc(t(s.nombre))}</h3>
        ${s.desc ? `<p class="desc">${esc(t(s.desc))}</p>` : ""}
        ${s.prueba ? `<p class="prueba"><span>${esc(t("Prueba"))}:</span> ${esc(t(s.prueba))}</p>` : ""}
      </div>`).join("");
  }

  // ---------- arte ----------
  function pintarArte() {
    $("#galeria").innerHTML = D.arte.map((src, i) => `<figure role="button" tabindex="0" style="--i:${i}" aria-label="${esc(t("Ver pieza"))} ${i + 1}"><img src="${esc(src)}" alt="${esc(t("Pieza de arte"))} ${i + 1}" loading="lazy"></figure>`).join("");
  }
  // el visor: se toca una pieza y se ve grande; se cierra tocando, con la X o con Escape
  const visor = $("#visor");
  if (visor) {
    const abrirVisor = (src) => { visor.querySelector("img").src = src; visor.hidden = false; document.documentElement.classList.add("con-visor"); };
    const cerrarVisor = () => { visor.hidden = true; visor.querySelector("img").src = ""; document.documentElement.classList.remove("con-visor"); };
    document.addEventListener("click", (e) => { const fig = e.target.closest("#galeria figure"); if (fig) abrirVisor(fig.querySelector("img").src); });
    document.addEventListener("keydown", (e) => { if (e.key === "Escape") cerrarVisor(); const fig = e.target.closest && e.target.closest("#galeria figure"); if (fig && (e.key === "Enter" || e.key === " ")) { e.preventDefault(); abrirVisor(fig.querySelector("img").src); } });
    visor.addEventListener("click", cerrarVisor);
  }
  // atributos: cada vez que la seccion entra en pantalla, las barras se llenan y los numeros suben desde 0
  (function animarAtributos() {
    const sec = $("#atributos-sec");
    if (!sec || !("IntersectionObserver" in window)) return;
    let cuadros = [];
    const contar = () => {
      cuadros.forEach(cancelAnimationFrame); cuadros = [];
      sec.querySelectorAll(".atr-card .val").forEach((v, i) => {
        const fin = +v.dataset.val, t0 = performance.now() + i * 90, dur = 1000;
        const paso = (t) => { const p = Math.min(1, Math.max(0, (t - t0) / dur)); v.textContent = Math.round(fin * (1 - Math.pow(1 - p, 3))); if (p < 1) cuadros.push(requestAnimationFrame(paso)); };
        cuadros.push(requestAnimationFrame(paso));
      });
    };
    let activo = false;
    const entrar = () => { if (activo) return; activo = true; sec.classList.add("animar"); contar(); };
    const salir = () => { if (!activo) return; activo = false; sec.classList.remove("animar"); cuadros.forEach(cancelAnimationFrame); sec.querySelectorAll(".atr-card .val").forEach((v) => (v.textContent = "0")); };
    // dos disparadores: el IntersectionObserver (scroll libre) y el aviso de la pagina al cambiar de apartado (diapositivas / reel)
    new IntersectionObserver((es) => es.forEach((e) => (e.isIntersecting ? entrar() : salir())), { threshold: .35 }).observe(sec);
    document.addEventListener("diapo-al-frente", (e) => (e.detail === sec ? entrar() : salir()));
  })();

  // ---------- contacto ----------
  function pintarRedes() {
    $("#redes").innerHTML = D.persona.redes.map((r) => `<li><a href="${esc(r.url)}" target="_blank" rel="noopener">${esc(r.nombre)} ↗</a></li>`).join("");
  }

  function pintarTodo() {
    pintarAtributos(); pintarNumeros(); pintarProyectos(); pintarCronica(); pintarServicios(); pintarArte(); pintarRedes();
    armarCarruseles();
    armarAmbiente();
    armarCartas();
    traducirEstaticos();
    armarPaginado();
    observarAparecer();
    if (idioma === "en" && faltan.size) console.warn("[seinp] sin traducir:", [...faltan]);
  }

  $("#idioma").addEventListener("click", () => {
    idioma = idioma === "en" ? "es" : "en";
    try { localStorage.setItem("seinp-idioma", idioma); } catch {}
    faltan.clear();
    pintarTodo();
  });

  // ---------- escritorio: cada apartado es una DIAPOSITIVA que llena la pantalla ----------
  // Una rueda del mouse = un apartado, con desplazamiento animado. Si el contenido no cabe
  // en el alto de la ventana, se escala (zoom) para que siempre entre entero.
  // En escritorio ("paginado") cada fila de cartas y cada proyecto completo es una diapositiva; en
  // telefono ("reel", estilo TikTok: se desliza con el dedo y engancha) cada proyecto es una diapositiva.
  const DIAPOS_PC  = [".hero", ".fila-cartas", ".proyecto:not(.carta-p)", "#atributos-sec", "#cronica", "#servicios", "#arte", "#contacto"];
  const DIAPOS_TEL = [".hero", ".proyecto", "#atributos-sec", "#cronica", "#servicios", "#arte", "#contacto"];
  // Tablet en vertical: el layout del telefono (ficha arriba, reel con el dedo) pero el desfile es UN apartado con la
  // rejilla. Telefonos (≤ 430 de ancho) y telefonos acostados (alto ≈ 390) quedan fuera: el telefono no cambia.
  const TABLETA = "(min-width: 600px) and (max-width: 860px) and (min-height: 860px)";
  const DIAPOS_TAB = [".hero", "#desfile", "#atributos-sec", "#cronica", "#servicios", "#arte", "#contacto"];
  const modoActual = () => (matchMedia("(min-width: 861px)").matches ? "paginado" : matchMedia(TABLETA).matches ? "tableta" : "reel");
  const paginado = () => document.documentElement.classList.contains("paginado");
  const reel = () => document.documentElement.classList.contains("reel");
  const diapos = () => [...document.querySelectorAll(".diapo")];
  let modoArmado = "";
  function desarmarPaginado() {
    diapos().forEach((d) => {
      const dentro = d.querySelector(":scope > .diapo-in");
      if (dentro) { while (dentro.firstChild) d.appendChild(dentro.firstChild); dentro.remove(); }
      d.classList.remove("diapo", "desplaza");
    });
  }
  function armarPaginado() {
    const modo = modoActual();
    if (modoArmado && modoArmado !== modo) {
      cerrarDetalle(true); desarmarPaginado(); pintarProyectos(); armarCarruseles(); armarAmbiente(); armarCartas();
      if (modo !== "tableta") document.getElementById("desfile").classList.remove("al-frente", "animar");
    }
    modoArmado = modo;
    const raiz = document.documentElement;
    raiz.classList.toggle("paginado", modo === "paginado");
    raiz.classList.toggle("reel", modo !== "paginado");
    raiz.classList.toggle("tableta", modo === "tableta");
    document.querySelectorAll((modo === "paginado" ? DIAPOS_PC : modo === "tableta" ? DIAPOS_TAB : DIAPOS_TEL).join(",")).forEach((d) => {
      if (d.classList.contains("diapo")) return;
      d.classList.add("diapo");
      const dentro = document.createElement("div");
      dentro.className = "diapo-in";
      while (d.firstChild) dentro.appendChild(d.firstChild);
      d.appendChild(dentro);
      [...dentro.children].forEach((c, k) => c.style.setProperty("--d", (k * .09).toFixed(2) + "s"));
    });
    ajustarDiapos();
  }
  // PC: si el contenido no cabe en el alto, se achica (hasta 55%; si aun asi no cabe, se desplaza por dentro).
  // Telefono: cada apartado CALZA EXACTO en la pantalla, crezca o se achique (cartas y portada entre 50% y
  // 145%; las secciones largas hasta 80% y despues se desplazan por dentro). Como el ancho se queda en 100%
  // y el texto se reacomoda al cambiar la escala, se itera unas veces hasta que el alto coincide.
  function ajustarDiapos() {
    const enReel = reel();
    diapos().forEach((d) => {
      const dentro = d.querySelector(":scope > .diapo-in");
      if (!dentro) return;
      dentro.style.zoom = 1;
      d.classList.remove("desplaza");
      const cs = getComputedStyle(d);
      const disponible = d.clientHeight - parseFloat(cs.paddingTop) - parseFloat(cs.paddingBottom);
      if (!enReel) {
        const necesita = dentro.scrollHeight;
        if (necesita <= disponible) return;
        const k = disponible / necesita;
        dentro.style.zoom = Math.max(.55, k).toFixed(3);
        if (k < .55) d.classList.add("desplaza");
        return;
      }
      // Busqueda binaria de la escala mas grande que entra (el alto visual crece con la escala, porque el
      // ancho se queda en 100% y el texto se reacomoda; iterar "a ojo" oscilaba y no convergia).
      // Cartas: la carta ya llena el alto (la imagen crece), asi que no se agranda (max 1) y solo se achica
      // si alguna de sus dos caras no entra. Portada: puede crecer hasta 145%. Secciones: hasta 80% y scroll.
      const carta = d.classList.contains("proyecto"), portada = d.classList.contains("hero");
      const minimo = carta || portada ? .5 : .8, maximo = portada ? 1.45 : 1;
      const caras = carta ? [...d.querySelectorAll(".cara")] : [];
      if (escalaQueCabe(dentro, disponible, minimo, maximo, caras)) d.classList.add("desplaza");
    });
    marcarFrente();
    calzarDetalle();
  }
  // La escala mas grande (entre minimo y maximo) a la que "dentro" entra en "disponible" y ninguna cara desborda.
  // Devuelve true si ni con el minimo entra (el apartado se desplaza por dentro).
  function escalaQueCabe(dentro, disponible, minimo, maximo, caras) {
    const cabe = (z) => {
      dentro.style.zoom = z.toFixed(3);
      if (dentro.getBoundingClientRect().height > disponible + .5) return false;
      return caras.every((c) => c.scrollHeight <= c.clientHeight + 1);
    };
    let z, sobra = false;
    if (cabe(maximo)) z = maximo;
    else if (!cabe(minimo)) { z = minimo; sobra = true; }
    else { let lo = minimo, hi = maximo; for (let i = 0; i < 7; i++) { const m = (lo + hi) / 2; if (cabe(m)) lo = m; else hi = m; } z = lo; }
    dentro.style.zoom = z.toFixed(3);
    return sobra;
  }
  // Solo el apartado que se ve anima (bordes corrientes, flotar, latido): los demas quedan quietos.
  function marcarFrente() {
    const ds = diapos();
    if (!ds.length) return;
    const i = indiceActual();
    ds.forEach((d, k) => d.classList.toggle("al-frente", k === i));
    // El apartado al frente se anima (.animar: entrada de sus piezas, barras de atributos, linea de la cronica);
    // los demas vuelven a cero para que la entrada se repita la proxima vez. La primera vez se marca tras el
    // primer cuadro (asi la portada tambien entra animada) y se recalcula el indice por si la pagina ya salto.
    const animar = () => { const j = indiceActual(); ds.forEach((d, k) => d.classList.toggle("animar", k === j)); document.dispatchEvent(new CustomEvent("diapo-al-frente", { detail: ds[j] })); };
    // Mientras la intro tapa la pagina, nada se anima (se animaria detras de la cortina y no se veria):
    // la primera entrada sale recien cuando la cortina se va, un cuadro despues.
    if (!introLista) {
      if (!esperandoIntro) {
        esperandoIntro = true;
        esperarIntro().then(() => { let hecho = false; const unaVez = () => { if (!hecho) { hecho = true; animar(); } }; requestAnimationFrame(() => requestAnimationFrame(unaVez)); setTimeout(unaVez, 120); });
      }
      return;
    }
    animar();
  }
  let esperandoIntro = false;
  // El desplazamiento entre diapositivas lo anima la pagina (curva suave propia), no el navegador:
  // asi no lo pelea el snap y siempre dura lo mismo.
  let animando = false, acumulado = 0, ultimoGiro = 0, objetivo = -1, cuadro = 0, ticks = [];
  // Rapida y "digital": 420 ms con frenada seca (ease-out exponencial), una linea de barrido
  // que cruza la columna en la direccion del viaje y un micro-glitch al entrar el apartado.
  // Si se sigue dando a la rueda mientras viaja, el destino se corre al siguiente apartado y el
  // viaje se acorta (hasta 190 ms) arrancando desde donde va: la velocidad se acumula.
  const DURACION = 420, DURACION_MIN = 190;
  const seca = (x) => (x >= 1 ? 1 : 1 - Math.pow(2, -10 * x));
  function animarScroll(destino, duracion = DURACION) {
    cancelAnimationFrame(cuadro);
    const desde = scrollY, delta = destino - desde, t0 = performance.now();
    animando = true;
    const raiz = document.documentElement;
    raiz.classList.remove("viajando", "arriba");
    void raiz.offsetWidth;   // reinicia las animaciones del barrido y el glitch
    raiz.classList.add("viajando");
    if (delta < 0) raiz.classList.add("arriba");
    const paso = (t) => {
      const p = Math.min(1, (t - t0) / duracion);
      scrollTo({ top: desde + delta * seca(p), behavior: "instant" });
      if (p < 1) cuadro = requestAnimationFrame(paso);
      else { animando = false; objetivo = -1; acumulado = 0; marcarFrente(); setTimeout(() => raiz.classList.remove("viajando", "arriba"), 260); }
    };
    cuadro = requestAnimationFrame(paso);
  }
  function indiceActual() {
    const tops = diapos().map((d) => d.getBoundingClientRect().top);
    return tops.reduce((mejor, t, k) => (Math.abs(t) < Math.abs(tops[mejor]) ? k : mejor), 0);
  }
  // cuantos apartados se pidieron en el ultimo medio segundo → que tan rapido ir
  function duracionSegunRitmo() {
    const ahora = Date.now();
    ticks = ticks.filter((t) => ahora - t < 550);
    ticks.push(ahora);
    return Math.max(DURACION_MIN, DURACION - 75 * (ticks.length - 1));
  }
  function irA(dir) {
    const ds = diapos();
    if (!ds.length) return;
    const duracion = duracionSegunRitmo();
    // ya esta viajando: se corre el destino un apartado mas, sin frenar
    if (animando && objetivo >= 0) {
      const j = objetivo + dir;
      if (j < 0 || j >= ds.length) return;   // en el borde termina el viaje; el bucle es para la rueda siguiente
      objetivo = j;
      return animarScroll(scrollY + ds[j].getBoundingClientRect().top, duracion);
    }
    if (animando) return;
    const i = indiceActual();
    const j = i + dir;
    ultimoGiro = Date.now();
    // en los extremos la cinta da la vuelta: del primero hacia arriba aparece el ultimo, y al reves
    if (j < 0 || j >= ds.length) return bucle(ds[(j + ds.length) % ds.length], dir);
    objetivo = j;
    animarScroll(scrollY + ds[j].getBoundingClientRect().top, duracion);
  }
  // Bucle: un clon del apartado destino entra deslizandose por encima (desde arriba o desde
  // abajo, segun el sentido) mientras la pagina salta al destino por debajo. Al terminar, el
  // clon se quita y queda el apartado real, exactamente en el mismo lugar.
  // Se clonan LOS DOS apartados (el actual y el destino) en una capa fija: el actual se va y el
  // destino entra, como un pase normal; por debajo la pagina salta al destino y al final la
  // capa se quita. Sirve en PC (columna derecha) y en telefono (bajo la ficha y la barra).
  function bucle(objetivo, dir) {
    const ds = diapos(), actual = ds[indiceActual()];
    if (!actual || actual === objetivo) return;
    animando = true;
    const raiz = document.documentElement;
    raiz.classList.remove("viajando", "arriba");
    void raiz.offsetWidth;
    raiz.classList.add("viajando");
    if (dir < 0) raiz.classList.add("arriba");
    const capa = document.createElement("div");
    capa.className = "capa-bucle";
    const a = actual.cloneNode(true), b = objetivo.cloneNode(true);
    [a, b].forEach((c) => { c.classList.add("clon-bucle"); c.removeAttribute("id"); c.querySelectorAll("[id]").forEach((x) => x.removeAttribute("id")); });
    a.style.transform = "translateY(0)";
    b.style.transform = `translateY(${dir < 0 ? -100 : 100}%)`;
    capa.append(a, b);
    document.body.appendChild(capa);
    const margen = reel() ? parseFloat(getComputedStyle(raiz).scrollPaddingTop) || 0 : 0;
    scrollTo({ top: scrollY + objetivo.getBoundingClientRect().top - margen, behavior: "instant" });
    requestAnimationFrame(() => requestAnimationFrame(() => {
      a.style.transform = `translateY(${dir < 0 ? 100 : -100}%)`;
      b.style.transform = "translateY(0)";
    }));
    setTimeout(() => {
      capa.remove();
      animando = false; acumulado = 0; objetivo = -1; marcarFrente();
      setTimeout(() => raiz.classList.remove("viajando", "arriba"), 260);
    }, DURACION + 60);
  }
  // ---------- telefono: paginado con el dedo, estilo TikTok / Reels ----------
  // No hay scroll nativo (touch-action en el CSS): el contenido sigue al dedo y, al soltar, pasa UN
  // apartado en la direccion del gesto, o vuelve al suyo si el gesto fue corto. En los extremos da la
  // vuelta (bucle). Un gesto horizontal (carrusel) o el scroll interno de una seccion larga que no
  // este en su borde se dejan en paz.
  let toqueY = null, toqueX = null, base = 0, arrastrando = false, ajeno = false, conScroll = null;
  const UMBRAL = 45;
  addEventListener("touchstart", (e) => {
    if (!reel() || estadoDet.abierto) return;
    const t = e.touches[0];
    toqueY = t.clientY; toqueX = t.clientX; base = scrollY; arrastrando = false; ajeno = false;
    conScroll = e.target.closest(".diapo.desplaza");
  }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (!reel() || toqueY === null || ajeno || estadoDet.abierto) return;
    if (animando) { if (e.cancelable) e.preventDefault(); return; }
    const t = e.touches[0], dy = t.clientY - toqueY, dx = t.clientX - toqueX;
    if (!arrastrando) {
      if (Math.abs(dy) < 6 && Math.abs(dx) < 6) return;
      if (Math.abs(dx) > Math.abs(dy)) { ajeno = true; return; }
      if (conScroll) {
        const arriba = conScroll.scrollTop <= 0, abajo = conScroll.scrollTop + conScroll.clientHeight >= conScroll.scrollHeight - 1;
        if (!((dy > 0 && arriba) || (dy < 0 && abajo))) { ajeno = true; return; }
      }
      arrastrando = true;
    }
    if (e.cancelable) e.preventDefault();
    scrollTo({ top: base - dy, behavior: "instant" });
  }, { passive: false });
  addEventListener("touchend", (e) => {
    if (!reel() || toqueY === null) return;
    const dy = e.changedTouches[0].clientY - toqueY, era = arrastrando;
    toqueY = toqueX = null; arrastrando = false; conScroll = null;
    if (!era || animando) return;
    const ds = diapos();
    if (!ds.length) return;
    const margen = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0;
    const topDe = (d) => scrollY + d.getBoundingClientRect().top - margen;
    const i = ds.reduce((m, d, k) => (Math.abs(topDe(d) - base) < Math.abs(topDe(ds[m]) - base) ? k : m), 0);
    if (Math.abs(dy) < UMBRAL) return animarScroll(topDe(ds[i]));
    const dir = dy < 0 ? 1 : -1, j = i + dir;
    if (j < 0 || j >= ds.length) return bucle(ds[(j + ds.length) % ds.length], dir);
    animarScroll(topDe(ds[j]));
  }, { passive: true });
  addEventListener("touchcancel", () => { toqueY = toqueX = null; arrastrando = false; conScroll = null; }, { passive: true });
  addEventListener("wheel", (e) => {
    if (!paginado()) return;
    e.preventDefault();
    if (Date.now() - ultimoGiro < 50) return;
    // la rueda suma: un toque leve de rueda o dos dedos en el trackpad alcanzan
    const d = e.deltaMode === 1 ? e.deltaY * 16 : e.deltaY;
    acumulado = Math.sign(d) === Math.sign(acumulado) ? acumulado + d : d;
    if (Math.abs(acumulado) >= 24) { const dir = acumulado > 0 ? 1 : -1; acumulado = 0; ultimoGiro = Date.now(); irA(dir); }
  }, { passive: false });
  // si se arrastra la barra de scroll, al soltar se acomoda a la diapositiva mas cercana
  // red de seguridad: si algo salto por su cuenta (hash, historial), el apartado visible se marca igual
  addEventListener("hashchange", () => setTimeout(marcarFrente, 60));
  addEventListener("scrollend", () => { if (paginado() && !animando) { const d = diapos()[indiceActual()]; if (d && Math.abs(d.getBoundingClientRect().top) > 2) animarScroll(scrollY + d.getBoundingClientRect().top); else marcarFrente(); } });
  // los enlaces del menu tambien viajan con la animacion propia
  // TODOS los enlaces internos (menu, portada, servicios, la ficha: "Hablemos de tu proyecto" y "Correo") viajan con la
  // animacion propia; asi el apartado destino queda al frente y entra animado (un salto nativo lo dejaba sin pintar).
  document.querySelectorAll('a[href^="#"]:not([href="#"])').forEach((a) => a.addEventListener("click", (e) => {
    if (!paginado() && !reel()) return;
    const sec = document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    e.preventDefault();
    if (estadoDet.abierto && sec.id === "desfile") return cerrarDetalle();
    const margen = reel() ? parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 0 : 0;
    animarScroll(scrollY + sec.getBoundingClientRect().top - margen);
  }));
  addEventListener("keydown", (e) => {
    if (!paginado() || e.target.closest("input, textarea")) return;
    if (["ArrowDown", "PageDown"].includes(e.key) || (e.key === " " && !e.target.closest("button, a, [role=button]"))) { e.preventDefault(); irA(1); }
    if (["ArrowUp", "PageUp"].includes(e.key)) { e.preventDefault(); irA(-1); }
  });
  addEventListener("resize", () => { armarPaginado(); ajustarDiapos(); });
  matchMedia("(min-width: 861px)").addEventListener("change", () => { armarPaginado(); ajustarDiapos(); });
  matchMedia(TABLETA).addEventListener("change", () => { armarPaginado(); ajustarDiapos(); });
  addEventListener("load", () => setTimeout(ajustarDiapos, 300));

  // ---------- telefono: la ficha resumida se abre y se cierra al tocarla ----------
  const ficha = $("#ficha"), toggle = $("#ficha-toggle");
  const esTelefono = () => matchMedia("(max-width: 860px)").matches;
  const detalle = $("#ficha-detalle");
  function abrirFicha(abrir) {
    ficha.classList.toggle("abierta", abrir);
    toggle.setAttribute("aria-expanded", String(abrir));
    // La altura se mide en vivo: el detalle se despliega exactamente hasta su contenido.
    detalle.style.maxHeight = abrir ? Math.min(detalle.scrollHeight, innerHeight * 0.72) + "px" : "";
    detalle.style.overflowY = abrir && detalle.scrollHeight > innerHeight * 0.72 ? "auto" : "";
  }
  ["#retrato", "#quien", "#ficha-toggle"].forEach((s) => $(s).addEventListener("click", () => { if (esTelefono()) abrirFicha(!ficha.classList.contains("abierta")); }));
  // si se toca un enlace del detalle (contacto, CV), la ficha se cierra para que se vea la pagina
  $("#ficha-detalle").addEventListener("click", (e) => { if (e.target.closest("a") && esTelefono()) abrirFicha(false); });
  // la barra de secciones se pega debajo de la ficha: se le avisa la altura real, cuadro a cuadro
  if ("ResizeObserver" in window) {
    new ResizeObserver(() => { document.documentElement.style.setProperty("--ficha-alto", ficha.offsetHeight + "px"); ajustarDiapos(); }).observe(ficha);
    new ResizeObserver(() => document.documentElement.style.setProperty("--menu-alto", $(".menu").offsetHeight + "px")).observe($(".menu"));
  }
  // si se toca una seccion del menu con la ficha abierta, se cierra para que la seccion se vea
  document.querySelectorAll(".menu a").forEach((a) => a.addEventListener("click", () => { if (esTelefono()) abrirFicha(false); }));

  // ---------- copiar el correo ----------
  $("#copiar").addEventListener("click", async () => {
    const correo = $("#correo-texto").textContent;
    const b = $("#copiar");
    try { await navigator.clipboard.writeText(correo); b.textContent = t("Copiado"); }
    catch { const r = document.createRange(); r.selectNodeContents($("#correo-texto")); const s = getSelection(); s.removeAllRanges(); s.addRange(r); }
    setTimeout(() => { b.textContent = t("Copiar"); }, 1600);
  });

  // Al llegar a un apartado, TODAS las cartas se cierran en seco: ninguna entra mostrando el detalle ni en espejo.
  document.addEventListener("diapo-al-frente", () => {
    document.querySelectorAll(".proyecto.carta-p").forEach((art) => { if (!art.closest("#detalle-p") && art._cerrarCarta) art._cerrarCarta(); });
  });

  // ---------- Monito Amarillo: la carta arranca como su web. La tele se enciende (CSS) y los textos del frente
  // se escriben caracter a caracter con un cursor, como en una terminal. Se repite cada vez que llega la carta. ----------
  const terminal = { nodos: [], cuadro: 0, cursor: null };
  function terminalCancelar() {
    cancelAnimationFrame(terminal.cuadro);
    document.querySelectorAll(".escribiendo").forEach((el) => el.classList.remove("escribiendo"));
    terminal.nodos.forEach((o) => { o.n.textContent = o.texto; });
    terminal.nodos = [];
    if (terminal.cursor) { terminal.cursor.remove(); terminal.cursor = null; }
  }
  function terminalEscribir(art, cara = "frente", espera = 380) {
    terminalCancelar();
    const raiz = art.querySelector(".cara." + cara);
    if (!raiz) return;
    const vistos = new Set(), nodos = [];
    raiz.querySelectorAll(".cab-d .nombre-c, .texto h3, .meta, .linea2, .desc, .tec, .rol, .pista").forEach((el) => {
      if (el.closest(".link")) return;
      const w = document.createTreeWalker(el, NodeFilter.SHOW_TEXT);
      let n;
      while ((n = w.nextNode())) { if (n.textContent.trim() && !vistos.has(n)) { vistos.add(n); nodos.push({ n, texto: n.textContent }); } }
    });
    if (!nodos.length) return;
    terminal.nodos = nodos;
    nodos.forEach((o) => (o.n.textContent = ""));
    const cursor = document.createElement("span"); cursor.className = "cursor-term"; terminal.cursor = cursor;
    const VEL = 7, t0 = performance.now() + espera;
    let i = 0, hechos = 0, ultimo = 0;
    art.classList.add("escribiendo");
    const paso = (t) => {
      if (t - ultimo < 28) { terminal.cuadro = requestAnimationFrame(paso); return; }
      ultimo = t;
      const objetivo = Math.floor((t - t0) / VEL);
      while (hechos < objetivo && i < nodos.length) {
        const o = nodos[i];
        if (o.n.textContent.length < o.texto.length) { o.n.textContent = o.texto.slice(0, o.n.textContent.length + 1); hechos++; }
        else i++;
      }
      const act = nodos[Math.min(i, nodos.length - 1)];
      if (act.n.parentNode && cursor.previousSibling !== act.n) act.n.parentNode.insertBefore(cursor, act.n.nextSibling);
      if (i < nodos.length) terminal.cuadro = requestAnimationFrame(paso);
      else { art.classList.remove("escribiendo"); setTimeout(() => { if (terminal.cursor === cursor) { cursor.remove(); terminal.cursor = null; } }, 1600); }
    };
    terminal.cuadro = requestAnimationFrame(paso);
  }
  document.addEventListener("diapo-al-frente", (e) => {
    const art = document.querySelector(".proyecto.carta-p.dorado");
    if (!art || art.closest("#detalle-p")) return;
    if (e.detail === art.closest(".diapo")) terminalEscribir(art); else terminalCancelar();
  });
  // en el telefono la carta de Monito gira: al mostrar el dorso, el detalle tambien se escribe como terminal
  document.addEventListener("carta-girada", (e) => {
    const { art, abierta } = e.detail;
    if (!art.classList.contains("dorado")) return;
    if (abierta) terminalEscribir(art, "dorso", 700); else terminalCancelar();
  });

  // ---------- TABLET: el proyecto al frente ----------
  // #detalle-p vive en <body> (los apartados tienen contain:paint y encerrarian un fixed). Cubre el area de contenido
  // (debajo de la ficha y la barra), tapa la rejilla y muestra UNA carta completa. Se abre desde su tesela (FLIP de
  // 420 ms, solo transform + opacity), las flechas ‹ › recorren las 11 con bucle, y se cierra con la X, tocando el
  // fondo, con Atras de Android (history) o yendo a otra seccion.
  const estadoDet = { abierto: false, i: -1, empujado: false, tesela: null };
  const $det = () => document.getElementById("detalle-p");
  function armarDetalle(html, total) {
    let el = $det();
    if (!el) {
      el = document.createElement("div");
      el.id = "detalle-p"; el.className = "detalle-p"; el.hidden = true;
      el.setAttribute("role", "dialog");
      el.innerHTML = '<div class="det-fondo"></div><div class="det-caja"><div class="det-escena"></div><div class="det-barra"><button type="button" class="det-ant">‹</button><span class="det-cuenta"><b>01</b><i>/</i><span>11</span></span><button type="button" class="det-sig">›</button><button type="button" class="det-cerrar">✕</button></div></div>';
      document.body.appendChild(el);
      const caja = el.querySelector(".det-caja");
      el.querySelector(".det-ant").addEventListener("click", () => moverDetalle(-1));
      el.querySelector(".det-sig").addEventListener("click", () => moverDetalle(1));
      el.querySelector(".det-cerrar").addEventListener("click", () => cerrarDetalle());
      // tocar fuera de la carta (el margen o la barra vacia) cierra
      caja.addEventListener("click", (e) => { if (e.target === caja || e.target.classList.contains("det-barra")) cerrarDetalle(); });
      // deslizar en horizontal fuera de un carrusel pasa de proyecto
      let x0 = null, y0 = 0, enRiel = false;
      caja.addEventListener("touchstart", (e) => { const tt = e.touches[0]; x0 = tt.clientX; y0 = tt.clientY; enRiel = !!e.target.closest(".riel"); }, { passive: true });
      caja.addEventListener("touchend", (e) => {
        if (x0 === null) return;
        const tt = e.changedTouches[0], dx = tt.clientX - x0, dy = tt.clientY - y0; x0 = null;
        if (!enRiel && Math.abs(dx) > 60 && Math.abs(dx) > Math.abs(dy) * 1.5) moverDetalle(dx < 0 ? 1 : -1);
      }, { passive: true });
    }
    el.querySelector(".det-ant").setAttribute("aria-label", t("Anterior"));
    el.querySelector(".det-sig").setAttribute("aria-label", t("Siguiente"));
    el.querySelector(".det-cerrar").setAttribute("aria-label", t("Cerrar"));
    el.querySelector(".det-cuenta span").textContent = String(total).padStart(2, "0");
    el.querySelector(".det-escena").innerHTML = html;
    el.querySelectorAll("video").forEach((v) => v.pause());
  }
  function vaciarDetalle() {
    const el = $det();
    if (!el) return;
    cerrarDetalle(true);
    el.querySelector(".det-escena").innerHTML = "";
  }
  function calzarDetalle() {
    const el = $det();
    if (!el || el.hidden) return;
    const slot = el.querySelector(".det-slot.visible"), art = slot && slot.querySelector(".proyecto");
    if (art) escalaQueCabe(art, slot.clientHeight, .5, 1, [...art.querySelectorAll(".cara")]);
  }
  function mostrarSlot(i, dir = 0) {
    const el = $det(), slots = [...el.querySelectorAll(".det-slot")];
    i = (i + slots.length) % slots.length;
    terminalCancelar();
    slots.forEach((s, k) => {
      if (k === i) return;
      const otra = s.querySelector(".proyecto");
      s.classList.remove("visible");
      if (otra) { if (otra._cerrarCarta) otra._cerrarCarta(); otra.classList.remove("animar"); }
      s.querySelectorAll("video").forEach((v) => v.pause());
    });
    const slot = slots[i], art = slot.querySelector(".proyecto");
    slot.classList.add("visible");
    art.classList.remove("animar"); void art.offsetWidth; art.classList.add("animar");   // re-dispara la tele de Monito
    slot.querySelectorAll("video").forEach((v) => v.play().catch(() => {}));
    estadoDet.i = i;
    el.querySelector(".det-cuenta b").textContent = String(i + 1).padStart(2, "0");
    el.setAttribute("aria-label", D.proyectos[i].nombre);
    calzarDetalle();
    if (dir && !matchMedia("(prefers-reduced-motion: reduce)").matches) slot.animate([{ transform: `translateX(${dir * 28}%)`, opacity: 0 }, { transform: "none", opacity: 1 }], { duration: 280, easing: "cubic-bezier(.2,.8,.2,1)" });
    if (art.classList.contains("dorado")) terminalEscribir(art);
    return slot;
  }
  const rectFlip = (desde, hasta) => `translate(${desde.left - hasta.left}px, ${desde.top - hasta.top}px) scale(${desde.width / hasta.width}, ${desde.height / hasta.height})`;
  function abrirDetalle(i, tesela, restaurar = false) {
    const el = $det();
    if (!el || estadoDet.abierto) return;
    estadoDet.tesela = tesela || document.querySelector(`.tesela[data-i="${i}"]`);
    estadoDet.abierto = true;
    el.hidden = false;
    document.documentElement.classList.add("con-detalle");
    $("#proyectos").inert = true;
    const slot = mostrarSlot(i);
    if (!restaurar && estadoDet.tesela && !matchMedia("(prefers-reduced-motion: reduce)").matches) {
      const de = estadoDet.tesela.getBoundingClientRect(), a = slot.getBoundingClientRect();
      slot.style.transformOrigin = "0 0";
      slot.animate([{ transform: rectFlip(de, a), opacity: .35 }, { transform: "none", opacity: 1 }], { duration: 420, easing: "cubic-bezier(.2,.8,.2,1)" });
    }
    void el.offsetWidth; el.classList.add("abierto");
    if (!restaurar) { history.pushState({ detalleP: true }, ""); estadoDet.empujado = true; }
    el.querySelector(".det-cerrar").focus({ preventScroll: true });
  }
  function moverDetalle(dir) { if (estadoDet.abierto) mostrarSlot(estadoDet.i + dir, dir); }
  function cerrarDetalle(instantaneo = false, desdeHistorial = false) {
    const el = $det();
    if (!el || el.hidden) return;
    const slot = el.querySelector(".det-slot.visible"), art = slot && slot.querySelector(".proyecto");
    const tesela = (estadoDet.i >= 0 && document.querySelector(`.tesela[data-i="${estadoDet.i}"]`)) || estadoDet.tesela;
    estadoDet.abierto = false;
    terminalCancelar();
    if (estadoDet.empujado) { estadoDet.empujado = false; if (!desdeHistorial) history.back(); }
    $("#proyectos").inert = false;
    const fin = () => {
      if (estadoDet.abierto) return;   // se volvio a abrir mientras se cerraba: no esconder el nuevo
      el.hidden = true;
      el.classList.remove("abierto");
      el.querySelectorAll(".det-slot").forEach((s) => s.classList.remove("visible"));
      if (art) { if (art._cerrarCarta) art._cerrarCarta(); art.classList.remove("animar"); }
      el.querySelectorAll("video").forEach((v) => v.pause());
      document.documentElement.classList.remove("con-detalle");
      if (tesela && !instantaneo) tesela.focus({ preventScroll: true });
    };
    if (instantaneo || !slot || !tesela || matchMedia("(prefers-reduced-motion: reduce)").matches) return fin();
    el.classList.remove("abierto");
    const a = slot.getBoundingClientRect(), hacia = tesela.getBoundingClientRect();
    slot.style.transformOrigin = "0 0";
    const an = slot.animate([{ transform: "none", opacity: 1 }, { transform: rectFlip(hacia, a), opacity: .15 }], { duration: 320, easing: "cubic-bezier(.4,0,.2,1)" });
    let hecho = false; const unaVez = () => { if (!hecho) { hecho = true; fin(); } };
    an.onfinish = unaVez; setTimeout(unaVez, 420);   // red de seguridad si el navegador frena los cuadros
  }
  // tocar una tesela abre su proyecto (delegado: la rejilla se re-dibuja al cambiar idioma o modo)
  $("#proyectos").addEventListener("click", (e) => { const ts = e.target.closest(".tesela"); if (ts) abrirDetalle(+ts.dataset.i, ts); });
  addEventListener("popstate", () => { if (estadoDet.abierto) cerrarDetalle(false, true); });
  addEventListener("keydown", (e) => {
    if (!estadoDet.abierto) return;
    if (e.key === "Escape") { e.preventDefault(); cerrarDetalle(); }
    if (e.key === "ArrowRight") { e.preventDefault(); moverDetalle(1); }
    if (e.key === "ArrowLeft") { e.preventDefault(); moverDetalle(-1); }
  });
  // irse a otra seccion (la barra de arriba) cierra el proyecto abierto
  document.addEventListener("diapo-al-frente", (e) => { if (estadoDet.abierto && e.detail && e.detail.id !== "desfile") cerrarDetalle(true); });

  // ---------- la portada: en PC se inclina (poco) con el mouse y el brillo lo sigue, como las cartas ----------
  (function armarPortada() {
    const carta = $(".hero-carta");
    if (!carta) return;
    const INCLINA_PORTADA = 3;
    const conMouse = () => matchMedia("(hover: hover) and (min-width: 861px)").matches;
    carta.addEventListener("mousemove", (e) => {
      if (!conMouse()) return;
      const r = carta.getBoundingClientRect();
      const px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
      carta.style.setProperty("--mx", (px * 100).toFixed(1) + "%");
      carta.style.setProperty("--my", (py * 100).toFixed(1) + "%");
      carta.style.transform = `rotateX(${(-(py - .5) * INCLINA_PORTADA * 2).toFixed(2)}deg) rotateY(${((px - .5) * INCLINA_PORTADA * 2).toFixed(2)}deg)`;
    });
    carta.addEventListener("mouseleave", () => { carta.style.transform = ""; carta.style.removeProperty("--mx"); carta.style.removeProperty("--my"); });
  })();

  // ---------- menu activo + aparecer ----------
  function observarAparecer() {
    if (!("IntersectionObserver" in window)) return;
    const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.remove("lejos"); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
    document.querySelectorAll(".aparece").forEach((el) => {
      const r = el.getBoundingClientRect();
      if (r.top > innerHeight) el.classList.add("lejos");
      io.observe(el);
    });
  }
  const enlaces = [...document.querySelectorAll(".menu a")];
  if ("IntersectionObserver" in window) {
    const ioMenu = new IntersectionObserver((es) => {
      es.forEach((e) => { if (e.isIntersecting) enlaces.forEach((a) => a.classList.toggle("activo", a.getAttribute("href") === "#" + e.target.id)); });
    }, { rootMargin: "-40% 0px -55% 0px" });
    enlaces.forEach((a) => { const sec = document.querySelector(a.getAttribute("href")); if (sec) ioMenu.observe(sec); });
  }

  pintarTodo();
})();
