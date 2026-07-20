document.addEventListener("DOMContentLoaded", () => {
  const DIA_ACTUAL = "Viernes";
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1CXUM0KIXimv7m3FYKdNrnQZF5vL0l1EXnP3ZP7-If9Q/export?format=xlsx";

  const contenedorSemanas = document.getElementById("contenedor-semanas");
  const contenedorSalas = document.getElementById("contenedor-salas");
  const contenedorGrid = document.getElementById("contenedor-fotos-grid");
  const mensajeEstado = document.getElementById("mensaje-estado");

  function normalizar(texto) {
    return texto
      ? texto.toString().trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "")
      : "";
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

      // 1. Filtrar filas del día Lunes
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

  // Función para agrupar fotos por NOMBRE_SALA
  function cargarSalasDeSemana(semanaSeleccionada, fotosDia) {
    const fotosSemana = fotosDia.filter(f => f.SEMANA && f.SEMANA.toString().trim() === semanaSeleccionada);
    contenedorSalas.innerHTML = "";

    if (fotosSemana.length === 0) {
      mostrarMensaje("No hay salas para la semana seleccionada.");
      return;
    }

    // Agrupamos en un Map: NombreSala -> Lista de URLs
    const salasMap = new Map();

    fotosSemana.forEach(item => {
      const nombreSala = item.NOMBRE_SALA ? item.NOMBRE_SALA.toString().trim() : "Sala";
      
      if (!salasMap.has(nombreSala)) {
        salasMap.set(nombreSala, []);
      }

      if (item.URL_FOTO) {
        // Separa URLs si hay varias por espacio, coma o salto de línea
        const rawUrls = item.URL_FOTO.toString().split(/[\n,\s]+/);
        rawUrls.forEach(u => {
          const urlLimpia = u.trim();
          if (urlLimpia.startsWith("http")) {
            salasMap.get(nombreSala).push(urlLimpia);
          }
        });
      }
    });

    let esPrimerBoton = true;

    salasMap.forEach((urlsArray, nombreSala) => {
      const btnSala = document.createElement("button");
      btnSala.classList.add("btn-sala");
      btnSala.textContent = nombreSala;

      if (esPrimerBoton) {
        btnSala.classList.add("active");
        renderizarFotos(urlsArray);
        esPrimerBoton = false;
      }

      btnSala.addEventListener("click", () => {
        document.querySelectorAll(".btn-sala").forEach(b => b.classList.remove("active"));
        btnSala.classList.add("active");
        renderizarFotos(urlsArray);
      });

      contenedorSalas.appendChild(btnSala);
    });
  }

  // Renderiza TODAS las fotos pertenecientes a la sala seleccionada
  function renderizarFotos(urlsArray) {
    contenedorGrid.innerHTML = "";

    if (!urlsArray || urlsArray.length === 0) {
      mensajeEstado.textContent = "No hay fotos adjuntas para esta sala.";
      mensajeEstado.style.display = "block";
      return;
    }

    mensajeEstado.style.display = "none";

    urlsArray.forEach((url, i) => {
      const img = document.createElement("img");
      img.src = url;
      img.alt = `Captura ${i + 1}`;
      img.classList.add("img-responsive-flc");
      contenedorGrid.appendChild(img);
    });
  }

  function mostrarMensaje(msj) {
    contenedorSalas.innerHTML = "";
    contenedorGrid.innerHTML = "";
    mensajeEstado.textContent = msj;
    mensajeEstado.style.display = "block";
  }
});