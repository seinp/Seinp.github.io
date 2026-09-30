// TODO EL CONTENIDO DE LA PAGINA vive aca: la persona, los atributos, los 13 proyectos, la
// cronica, los servicios con sus precios y la galeria de arte. app.js lo dibuja.
// Los textos van en espanol; textos.js tiene la traduccion al ingles (la clave ES el texto).
window.DATOS = {

  persona: {
    nombre: "José Esteban Da Rocha",
    alias: "SEINP",
    nivel: 8,
    cargo: "Programador Full Stack / Arquitecto de software",
    lugar: "Venezuela → Colombia · remoto",
    frase: "Construyo el producto completo y lo pongo en producción.",
    bajada: "Del arte y el concepto hasta el backend, el servidor y el cliente que paga. Dueño de FaenApp y cofundador de Monito Amarillo.",
    correo: "estebandarocha7@gmail.com",
    foto: "assets/img/fotoPerfil.jpg",
    cv: "cv.html",
    redes: [
      { nombre: "itch.io", url: "https://seinp.itch.io/" },
      { nombre: "Monito Amarillo", url: "https://monitoamarillo.com/" },
      { nombre: "FaenApp", url: "https://faenapp.com/" },
      { nombre: "GitHub", url: "https://github.com/seinp" }
    ]
  },

  // Los seis atributos de la ficha. La rareza sale del valor: 90+ legendario, 80+ épico, 70+ raro.
  atributos: [
    { nombre: "Backend",  valor: 80, prueba: "Firestore + endpoints PHP propios · servidor VPS de STAB" },
    { nombre: "Frontend", valor: 95, prueba: "Webapp Vue de FaenApp · 4 webs en vivo" },
    { nombre: "Móvil",    valor: 80, prueba: "Dos apps Flutter firmadas y distribuidas" },
    { nombre: "Juegos",   valor: 90, prueba: "5 juegos publicados · C# + raylib sin motor" },
    { nombre: "Arte",     valor: 70, prueba: "Pixel art y marca · Spine 2D, Blender, ZBrush, Inkscape" },
    { nombre: "IA",       valor: 78, prueba: "Servidor MCP propio · agentes que ejecutan · núcleo IA de FaenApp" }
  ],

  // Los numeros grandes de la portada.
  numeros: [
    { valor: "8",      etiqueta: "años de experiencia" },
    { valor: "5",      etiqueta: "juegos publicados" },
    { valor: "3",      etiqueta: "apps en producción" },
    { valor: "369",    etiqueta: "pantallas documentadas" }
  ],

  formacion: [
    { titulo: "Estudios",  texto: "Ingeniería en Sistemas (carrera completa, tesis pendiente)." },
    { titulo: "Docencia",  texto: "Clases privadas de programación, estructura de datos y análisis de datos durante una carrera entera." },
    { titulo: "Equipo",    texto: "Dirige a un desarrollador de interfaz en FaenApp, con procedimiento de aprobación." }
  ],

  // El desfile: los proyectos, en este orden. rareza: legendario | epico | raro | comun
  // fila: los que la comparten (y van seguidos) salen de a dos en la misma linea, como cartas que giran.
  // carta: true → va solo en una carta grande sin giro, con marco del color indicado (cobalto). El resto va completo, sin carta.
  // color: el borde de la carta, sacado de las capturas del proyecto. boton: el color del boton del link.
  proyectos: [
    { nombre: "FaenApp", anio: "2025–26", rareza: "legendario", fila: "destacados", destacado: true, color: "#3A8FD6", etiqueta: "Producto propio", logo: "assets/logos/faenapp.png",
      desc: "SaaS de gestión para negocios de servicios con **clientes pagando**: **dos apps Flutter**, **webapp Vue**, landing, documentación y un mapa de **369 pantallas**. Construido y operado **en solitario**.",
      tipo: "SaaS", tecnica: "Flutter · Vue · Node · Firestore · PHP", rol: "Diseño, desarrollo y operación",
      imgs: ["assets/img/capturas/faenapp.webp", "assets/img/capturas/faenapp-agenda.png"], alt: "Panel de funciones de FaenApp",
      link: "https://faenapp.com/", linkTexto: "Ver FaenApp" },

    { nombre: "Stab Your Friends", anio: "2026", rareza: "legendario", fila: "destacados", destacado: true, etiqueta: "Videojuego en línea", logo: "assets/logos/stab.png", logoPixel: true, borde: "arcoiris",
      desc: "Multijugador comercial escrito en **C# sobre raylib, sin motor**. **Servidor dedicado propio**, cola de emparejamiento real, **ranking** y seis modos. En **beta abierta**.",
      tipo: "Videojuego", tecnica: "C# · .NET 9 · raylib · PHP · VPS", rol: "Programación, arte y servidor",
      video: "assets/video/stab-1.mp4", poster: "assets/video/stab-1.jpg", img: "assets/img/capturas/stab.png", alt: "Partida de Stab Your Friends",
      link: "https://monitoamarillo.com/stab", linkTexto: "Ver la web del juego" },

    { nombre: "Monito Amarillo", anio: "2026", rareza: "legendario", etiqueta: "Estudio", carta: true, boton: "#ECBA07", borde: "dorado",
      desc: "Estudio de videojuegos que fundé con un amigo de **más de 17 años**, separados por la frontera entre Colombia y Venezuela. Hacemos juegos **divertidos** para jugar **con amigos**, en local u online, **sin motor y sin plantillas**. Yo llevo **todo lo técnico**: web, marca, cuentas, pagos y servidor.",
      tipo: "Estudio de videojuegos", tecnica: "HTML · JS · PHP · Wompi · VPS", rol: "Cofundador y todo lo técnico",
      img: "assets/img/capturas/monito.png", imgLogo: true, alt: "Logo de Monito Amarillo",
      link: "https://monitoamarillo.com/", linkTexto: "Visitar el estudio" },

    { nombre: "Momi Medic", anio: "2022", rareza: "epico", carta: true, color: "#3B6FEA", etiqueta: "Salud",
      desc: "Consultas médicas a domicilio con solicitud en vivo, tipo Uber: el paciente pide, el médico acepta. Recetas, historiales e incapacidades, con una app por cada lado.",
      tipo: "Apps Android", tecnica: "Android Studio · Firebase", rol: "Desarrollador del sistema completo",
      imgs: ["assets/img/MOMI/MOMI1.jpeg", "assets/img/MOMI/MOMI 2.jpeg", "assets/img/MOMI/MOMI 3.jpeg", "assets/img/MOMI/MOMI 4.jpeg", "assets/img/MOMI/MOMI 5.jpeg", "assets/img/MOMI/MOMI 6.jpeg"], vertical: true, sinIA: true, alt: "Pantalla de Momi Medic" },

    { nombre: "Earth Survivor", anio: "2024", rareza: "raro", fila: "juegos", color: "#E0224A", etiqueta: "Videojuego",
      desc: "Roguelike frenético de supervivencia por oleadas: defender la Tierra de una invasión con una nave indestructible. Demo publicada.",
      tipo: "Videojuego", tecnica: "Unity · C#", rol: "Programación y arte",
      img: "assets/img/juegos/miniatura.png", pixel: true, alt: "Portada de Earth Survivor",
      link: "https://seinp.itch.io/", linkTexto: "Ver en itch.io" },

    { nombre: "Space G", anio: "2021", rareza: "comun", fila: "juegos", color: "#6A5CE8", etiqueta: "Videojuego",
      desc: "Arcade shoot'em up: sobrevivir a oleadas de enemigos y acumular puntos mientras mejorás tu nave.",
      tipo: "Videojuego", tecnica: "Unity · C#", rol: "Programación y arte",
      img: "assets/img/juegos/space G.png", pixel: true, alt: "Portada de Space G",
      link: "https://seinp.itch.io/", linkTexto: "Ver en itch.io" },

    { nombre: "Idle of Tyr", anio: "2021", rareza: "comun", carta: true, color: "#3B6FEA", etiqueta: "Videojuego",
      desc: "AFK farming infinito con misiones, ambientado en los nórdicos vikingos.",
      tipo: "Videojuego", tecnica: "Unity · C#", rol: "Programación y arte",
      img: "assets/img/juegos/tyr.png", pixel: true, alt: "Portada de Idle of Tyr",
      link: "https://seinp.itch.io/", linkTexto: "Ver en itch.io" },

    { nombre: "Mad King", anio: "2020", rareza: "comun", carta: true, color: "#3B6FEA", etiqueta: "Videojuego",
      desc: "El primer juego publicado: plataformas con oleadas infinitas donde sobrevivir el mayor tiempo posible es la clave.",
      tipo: "Videojuego · PC", tecnica: "Unity · C#", rol: "Programación y arte",
      img: "assets/img/juegos/mad king.png", pixel: true, alt: "Portada de Mad King",
      link: "https://seinp.itch.io/", linkTexto: "Ver en itch.io" },

    { nombre: "Ready", anio: "2020", rareza: "raro", fila: "webs", color: "#3B6FEA", etiqueta: "Plataforma web",
      desc: "Comida a domicilio para Valera, Trujillo (Venezuela): una plataforma de pedidos hecha a medida para una ciudad sin cobertura de las grandes apps.",
      tipo: "Plataforma web", tecnica: "PHP · MySQL · JS", rol: "Desarrollador del proyecto completo",
      imgs: ["assets/img/ready_1.png", "assets/img/ready_2.png"], alt: "Pantalla de Ready" },

    { nombre: "MARSICARE", anio: "2026", rareza: "raro", fila: "webs", color: "#3B6FEA", etiqueta: "Web de cliente",
      desc: "Web educativa sobre lesiones por adhesivos médicos, para una enfermera de la Universidad del Valle. Publicada.",
      tipo: "Web educativa", tecnica: "HTML · CSS · JS · GitHub Pages", rol: "Diseño y desarrollo",
      img: "assets/img/capturas/marsicare.jpg", alt: "Portada de MARSICARE",
      link: "https://katerineramirez1305.github.io/", linkTexto: "Ver la web" },

    { nombre: "La Castañuela", anio: "2018", rareza: "raro", carta: true, color: "#3B6FEA", etiqueta: "Sistema de restaurante",
      desc: "Administración de un restaurante y bar con pedidos por código QR en cada mesa, para depender menos de los meseros. El primer sistema en producción.",
      tipo: "Sistema web", tecnica: "PHP · MySQL · JS · wireframes propios", rol: "Desarrollador del proyecto completo",
      imgs: ["assets/img/la_castanuela_6.png", "assets/img/la_castanuela_7.png", "assets/img/la_castanuela_8.png", "assets/img/la_castanuela_9.png", "assets/img/la_castanuela_1.jpg", "assets/img/la_castanuela_2.jpg", "assets/img/la_castanuela_3.jpg", "assets/img/la_castanuela_4.jpg", "assets/img/la_castanuela_5.jpg", "assets/img/casta wireframes.jpg"], alt: "Pantalla de La Castañuela" }
  ],

  cronica: [
    { anio: "2018", items: [ { t: "La Castañuela App", d: "Restaurante con pedidos por QR en cada mesa" } ] },
    { anio: "2020", items: [ { t: "Ready", d: "Comida a domicilio para Valera, Trujillo" }, { t: "Mad King", d: "El primer juego publicado" } ] },
    { anio: "2021", items: [ { t: "Space G", d: "Arcade shoot'em up" }, { t: "Idle of Tyr", d: "RPG idle vikingo" } ] },
    { anio: "2022", items: [ { t: "Momi Medic", d: "Consultas médicas a domicilio" } ] },
    { anio: "2024", items: [ { t: "Earth Survivor", d: "Demo publicada" } ] },
    { anio: "2025", items: [ { t: "FaenApp", d: "Nace el SaaS propio" } ] },
    { anio: "2026", items: [ { t: "Monito Amarillo", d: "Estudio en vivo desde el 8 de septiembre" }, { t: "Stab Your Friends", d: "Beta abierta" }, { t: "FaenApp", d: "En producción, con clientes pagando" } ] }
  ],

  // Rangos en dólares. Los quito y los pongo Esteban: ver seinp-web/CONTEXTO.md, seccion 3c.
  servicios: [
    { nombre: "Identidad visual / logos",     desc: "Logotipos, mascotas y propuestas de marca",                         prueba: "Fritas, Frigomax, Hoguera, Ninja Store, ULA FC",          precio: "$200 – $1.200" },
    { nombre: "Documentación de producto",    desc: "Manuales, capturas y mapas de pantallas",                            prueba: "faenapp.com/docs, mapa de 369 pantallas",                   precio: "$400 – $2.000" },
    { nombre: "Página web a medida",          desc: "Diseño, desarrollo y publicación. Bilingüe si se pide",             prueba: "monitoamarillo.com, la web de STAB, faenapp.com, MARSICARE", precio: "$600 – $4.000" },
    { nombre: "Backend e infraestructura",    desc: "Base de datos, endpoints propios, VPS, almacenamiento de archivos", prueba: "Backend de FaenApp, servidor de STAB",                       precio: "$1.000 – $6.000" },
    { nombre: "Catálogo y pedidos en línea",  desc: "Catálogo público, pedidos, reservas, QR por mesa",                  prueba: "Catálogo de FaenApp, La Castañuela",                         precio: "$1.200 – $5.000" },
    { nombre: "Automatización con IA",        desc: "Agentes que ejecutan tareas, servidores MCP, orquestación de modelos", prueba: "Núcleo IA de FaenApp, servidores MCP propios",                              precio: "$1.200 – $7.000" },
    { nombre: "App móvil Android",            desc: "Flutter, firmada, distribuida y con actualizaciones",               prueba: "FaenApp Admins y Empleado, Momi Medic",                      precio: "$3.000 – $15.000" },
    { nombre: "Desarrollo de videojuegos",    desc: "Unity o motor propio; gameplay y multijugador con servidor",        prueba: "5 juegos publicados, Stab Your Friends",                     precio: "desde $5.000", nota: "según alcance" },
    { nombre: "Por hora, para trabajo suelto", desc: "",                                                                 prueba: "",                                                           precio: "$35 – $60 / h" }
  ],

  // La galeria: solo las piezas, sin texto (decision de Esteban).
  arte: [
    "BERSERKER1.png", "berserker.png", "Cocole1.png", "Cocole2.png", "FRITAS8.png",
    "fritas definitivo fondo blanco.png", "fritas definitivo fondo negro.png", "frigomax.png",
    "hoguera logo blanco desenfoque.png", "hoguera logo negro desenfoque.png",
    "NINJASTORE VERSIONES 1.png", "ninja store propuesta 3.png", "Nave.png", "promo21 clas.png",
    "seinp space3.png", "seinp viking.png", "ula fc con fondo.png", "ula fc mascota.png",
    "mi logo.png", "Dj9fuHNXsAAUNgj.jpg", "DmwbjHpWwAE7QHA.jpg", "kbRYYHXL_400x400.jpg"
  ].map((a) => "assets/img/ArteDigital/" + a)
};
