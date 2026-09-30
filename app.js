// seinp.github.io: dibuja la pagina desde datos.js, cambia de idioma con textos.js (la clave
// es el texto en espanol) y trae los datos vivos de STAB (version y ranking) del servidor real.
(function () {
  "use strict";
  const D = window.DATOS, T = window.TEXTOS || {};
  const $ = (s, r) => (r || document).querySelector(s);

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
  function armarAmbiente() {
    document.querySelectorAll(".carta-p .frente .imagen:not(.logo)").forEach((caja) => {
      const img = caja.querySelector("img"), video = caja.querySelector("video");
      const src = img ? img.getAttribute("src") : video && video.getAttribute("poster");
      if (src) caja.style.setProperty("--fondo", `url("${src}")`);
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
        // 1) la carta vuelve suave a su posicion neutra (la inclinacion del mouse se apaga)
        carta.style.transition = "transform .15s ease-out";
        carta.style.transform = base();
        setTimeout(() => {
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
    const tarjeta = (p, i, sola, lado, forzarCarta) => {
      const n = String(i + 1).padStart(2, "0");
      const img = media(p);
      // El boton muestra el link tal cual (sin https:// ni barra final), por pedido de Esteban.
      const link = p.link ? `<a class="link" href="${esc(p.link)}" target="_blank" rel="noopener"><span>${esc(p.link.replace(/^https?:\/\//, "").replace(/\/$/, ""))}</span><i aria-hidden="true">↗</i></a>` : "";
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
      const color = estilo ? ` style="${esc(estilo)}"` : "";

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
            <span class="pista" aria-hidden="true">${esc(t("Tocá la carta para ver más"))}</span>
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
    // En telefono todas las cartas se ven iguales (formato de a dos): la carta grande sola es solo de PC.
    const telefono = matchMedia("(max-width: 860px)").matches;
    let k = 0, lados = 0;
    $("#proyectos").innerHTML = filas.map((f) => {
      const dos = f.items.length > 1, p = f.items[0];
      if (dos) return `<div class="fila-cartas ${f.items.length > 2 ? "tres" : "dos"}">${f.items.map((x) => tarjeta(x, k++, false, false)).join("")}</div>`;
      const lado = lados++ % 2 === 1;
      if (p.carta) return `<div class="fila-cartas una">${telefono ? tarjeta(p, k++, false, false, true) : tarjeta(p, k++, true, lado)}</div>`;
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
    $("#galeria").innerHTML = D.arte.map((src, i) => `<figure role="button" tabindex="0" aria-label="${esc(t("Ver pieza"))} ${i + 1}"><img src="${esc(src)}" alt="${esc(t("Pieza de arte"))} ${i + 1}" loading="lazy"></figure>`).join("");
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
    const modo = matchMedia("(min-width: 861px)").matches ? "paginado" : "reel";
    if (modoArmado && modoArmado !== modo) { desarmarPaginado(); pintarProyectos(); armarCarruseles(); armarCartas(); }
    modoArmado = modo;
    document.documentElement.classList.toggle("paginado", modo === "paginado");
    document.documentElement.classList.toggle("reel", modo === "reel");
    document.querySelectorAll((modo === "paginado" ? DIAPOS_PC : DIAPOS_TEL).join(",")).forEach((d) => {
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
      const cabe = (z) => {
        dentro.style.zoom = z.toFixed(3);
        if (dentro.getBoundingClientRect().height > disponible + .5) return false;
        return caras.every((c) => c.scrollHeight <= c.clientHeight + 1);
      };
      let z;
      if (cabe(maximo)) z = maximo;
      else if (!cabe(minimo)) { z = minimo; d.classList.add("desplaza"); }
      else { let lo = minimo, hi = maximo; for (let i = 0; i < 7; i++) { const m = (lo + hi) / 2; if (cabe(m)) lo = m; else hi = m; } z = lo; }
      dentro.style.zoom = z.toFixed(3);
    });
    marcarFrente();
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
    if (primeraMarca) { primeraMarca = false; requestAnimationFrame(() => requestAnimationFrame(animar)); } else animar();
  }
  let primeraMarca = true;
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
    if (!reel()) return;
    const t = e.touches[0];
    toqueY = t.clientY; toqueX = t.clientX; base = scrollY; arrastrando = false; ajeno = false;
    conScroll = e.target.closest(".diapo.desplaza");
  }, { passive: true });
  addEventListener("touchmove", (e) => {
    if (!reel() || toqueY === null || ajeno) return;
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
  addEventListener("scrollend", () => { if (paginado() && !animando) { const d = diapos()[indiceActual()]; if (d && Math.abs(d.getBoundingClientRect().top) > 2) animarScroll(scrollY + d.getBoundingClientRect().top); } });
  // los enlaces del menu tambien viajan con la animacion propia
  document.querySelectorAll('.menu a[href^="#"], .hero-cta[href^="#"], .servicios-cta[href^="#"]').forEach((a) => a.addEventListener("click", (e) => {
    if (!paginado() && !reel()) return;
    const sec = document.querySelector(a.getAttribute("href"));
    if (!sec) return;
    e.preventDefault();
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
