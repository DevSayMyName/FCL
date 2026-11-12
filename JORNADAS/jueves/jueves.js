document.addEventListener("DOMContentLoaded", () => {
  const DIA_ACTUAL = "Jueves";
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1CXUM0KIXimv7m3FYKdNrnQZF5vL0l1EXnP3ZP7-If9Q/export?format=xlsx";

  const contenedorSemanas = document.getElementById("contenedor-semanas");
  const contenedorSalas = document.getElementById("contenedor-salas");
  const contenedorGrid = document.getElementById("contenedor-fotos-grid");
  const mensajeEstado = document.getElementById("mensaje-estado");

  // Orden oficial de cruces según el día
  const ORDEN_GRUPOS_POR_DIA = {
    lunes: ["AXB", "CXD"],
    martes: ["AXC", "BXD"],
    miercoles: ["AXD", "BXC"],
    jueves: ["AXB", "CXD"],
    viernes: ["AXC", "BXD"]
  };

  function normalizar(texto) {
    return texto
      ? texto.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : "";
  }

  function formatearGrupo(rawGrupo) {
    if (!rawGrupo || rawGrupo.toString().trim() === "") {
      return { clave: "GENERAL", etiqueta: "RESULTADOS DE SALA" };
    }
    const limpia = rawGrupo.toString().trim().toUpperCase();
    const sinEspacios = limpia.replace(/\s+/g, "");

    const mapaEtiquetas = {
      AXB: "GRUPO A x B",
      CXD: "GRUPO C x D",
      AXC: "GRUPO A x C",
      BXD: "GRUPO B x D",
      AXD: "GRUPO A x D",
      BXC: "GRUPO B x C"
    };

    return {
      clave: sinEspacios,
      etiqueta: mapaEtiquetas[sinEspacios] || `GRUPO ${limpia}`
    };
  }

  fetch(GOOGLE_SHEET_URL)
    .then(res => {
      if (!res.ok) throw new Error("Error de conexión");
      return res.arrayBuffer();
    })
    .then(buffer => {
      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, { type: "array" });
      const hoja = workbook.Sheets[workbook.SheetNames[0]];
      const filas = XLSX.utils.sheet_to_json(hoja);

      // 1. Filtrar filas del día Jueves
      const fotosDia = filas.filter(f => normalizar(f.DIA) === normalizar(DIA_ACTUAL));

      if (fotosDia.length === 0) {
        mostrarMensaje(`No hay capturas registradas para el día ${DIA_ACTUAL}.`);
        return;
      }

      // 2. Extraer semanas únicas
      const semanasSet = new Set();
      fotosDia.forEach(f => {
        if (f.SEMANA) semanasSet.add(f.SEMANA.toString().trim());
      });
      const semanasDisponibles = Array.from(semanasSet);

      // 3. Crear botones de Semanas
      contenedorSemanas.innerHTML = "";
      semanasDisponibles.forEach((sem, idx) => {
        const btnSem = document.createElement("button");
        btnSem.classList.add("btn-semana");
        btnSem.textContent = sem.toUpperCase().startsWith("S") ? `Semana ${sem.substring(1)}` : `Semana ${sem}`;

        if (idx === semanasDisponibles.length - 1) {
          btnSem.classList.add("active");
          cargarSalasDeSemana(sem, fotosDia);
        }

        btnSem.addEventListener("click", () => {
          document.querySelectorAll(".btn-semana").forEach(b => b.classList.remove("active"));
          btnSem.classList.add("active");
          cargarSalasDeSemana(sem, fotosDia);
        });

        contenedorSemanas.appendChild(btnSem);
      });
    })
    .catch(err => {
      console.error(err);
      mostrarMensaje("Ocurrió un error al cargar las fotos desde Google Sheets.");
    });

  // Agrupa fotos por NOMBRE_SALA y dentro de cada sala por GRUPO
  function cargarSalasDeSemana(semanaSeleccionada, fotosDia) {
    const fotosSemana = fotosDia.filter(f => f.SEMANA && f.SEMANA.toString().trim() === semanaSeleccionada);
    contenedorSalas.innerHTML = "";

    if (fotosSemana.length === 0) {
      mostrarMensaje("No hay salas para la semana seleccionada.");
      return;
    }

    // Map: NombreSala -> Map(claveGrupo -> { clave, etiqueta, urls: [] })
    const salasMap = new Map();

    fotosSemana.forEach(item => {
      const nombreSala = item.NOMBRE_SALA ? item.NOMBRE_SALA.toString().trim() : "Sala";
      const infoGrupo = formatearGrupo(item.GRUPO);

      if (!salasMap.has(nombreSala)) {
        salasMap.set(nombreSala, new Map());
      }

      const gruposDeSala = salasMap.get(nombreSala);
      if (!gruposDeSala.has(infoGrupo.clave)) {
        gruposDeSala.set(infoGrupo.clave, {
          clave: infoGrupo.clave,
          etiqueta: infoGrupo.etiqueta,
          urls: []
        });
      }

      if (item.URL_FOTO) {
        const rawUrls = item.URL_FOTO.toString().split(/[\n,\s]+/);
        rawUrls.forEach(u => {
          const urlLimpia = u.trim();
          if (urlLimpia.startsWith("http")) {
            gruposDeSala.get(infoGrupo.clave).urls.push(urlLimpia);
          }
        });
      }
    });

    let esPrimerBoton = true;

    salasMap.forEach((gruposDeSalaMap, nombreSala) => {
      const btnSala = document.createElement("button");
      btnSala.classList.add("btn-sala");
      btnSala.textContent = nombreSala;

      if (esPrimerBoton) {
        btnSala.classList.add("active");
        renderizarFotosPorGrupo(gruposDeSalaMap);
        esPrimerBoton = false;
      }

      btnSala.addEventListener("click", () => {
        document.querySelectorAll(".btn-sala").forEach(b => b.classList.remove("active"));
        btnSala.classList.add("active");
        renderizarFotosPorGrupo(gruposDeSalaMap);
      });

      contenedorSalas.appendChild(btnSala);
    });
  }

  // Renderiza los grupos de la sala seleccionada (Arriba A x B, Abajo C x D)
  function renderizarFotosPorGrupo(gruposDeSalaMap) {
    contenedorGrid.innerHTML = "";

    const ordenEsperado = ORDEN_GRUPOS_POR_DIA[normalizar(DIA_ACTUAL)] || [];
    const listaGrupos = Array.from(gruposDeSalaMap.values()).sort((a, b) => {
      const idxA = ordenEsperado.indexOf(a.clave);
      const idxB = ordenEsperado.indexOf(b.clave);
      if (idxA === -1 && idxB === -1) return 0;
      if (idxA === -1) return 1;
      if (idxB === -1) return -1;
      return idxA - idxB;
    });

    const hayFotos = listaGrupos.some(g => g.urls.length > 0);
    if (!hayFotos) {
      mensajeEstado.textContent = "No hay fotos adjuntas para esta sala.";
      mensajeEstado.style.display = "block";
      return;
    }

    mensajeEstado.style.display = "none";

    listaGrupos.forEach(grupoObj => {
      if (grupoObj.urls.length === 0) return;

      const bloqueGrupo = document.createElement("div");
      bloqueGrupo.classList.add("grupo-bloque-flc");

      // Encabezado del Grupo (ej. GRUPO A x B)
      const headerGrupo = document.createElement("div");
      headerGrupo.classList.add("grupo-header-flc");
      headerGrupo.innerHTML = `
        <h3 class="grupo-titulo-flc">⚔️ ${grupoObj.etiqueta}</h3>
        <span class="grupo-contador-pill">${grupoObj.urls.length} ${grupoObj.urls.length === 1 ? "Captura" : "Capturas"}</span>
      `;
      bloqueGrupo.appendChild(headerGrupo);

      // Contenedor de las 2 capturas del grupo
      const gridInterno = document.createElement("div");
      gridInterno.classList.add("fotos-grid");

      grupoObj.urls.forEach((url, i) => {
        const img = document.createElement("img");
        img.src = url;
        img.alt = `${grupoObj.etiqueta} - Captura ${i + 1}`;
        img.classList.add("img-responsive-flc");
        img.loading = "lazy";
        gridInterno.appendChild(img);
      });

      bloqueGrupo.appendChild(gridInterno);
      contenedorGrid.appendChild(bloqueGrupo);
    });
  }

  function mostrarMensaje(msj) {
    contenedorSalas.innerHTML = "";
    contenedorGrid.innerHTML = "";
    mensajeEstado.textContent = msj;
    mensajeEstado.style.display = "block";
  }
});