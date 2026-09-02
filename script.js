// ==========================================
// 1. MENÚ FLC JS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector('.menuFLC-hamburger');
  const navLinks = document.querySelector('.menuFLC-links');
  const links = document.querySelectorAll('.menuFLC-links li a');

  if (hamburger && navLinks) {
    hamburger.addEventListener('click', () => {
      hamburger.classList.toggle('activo');
      navLinks.classList.toggle('activo');
    });

    links.forEach(link => {
      link.addEventListener('click', () => {
        hamburger.classList.remove('activo');
        navLinks.classList.remove('activo');
      });
    });
  }
});

// ==========================================
// 2. MÁQUINA DE ESCRIBIR (HERO SECTION)
// ==========================================
(function() {
  const palabras = ["FN", "EXCELENCIA", "COMPETITIVOS", "FN LEAGUE"];
  
  let palabraIndex = 0;
  let caracterIndex = 0;
  let estaBorrando = false;
  
  const velocidadEscribir = 150;
  const velocidadBorrar = 75;
  const esperaPalabraCompleta = 2000;

  function escribirEfecto() {
    const contenedorTexto = document.getElementById("heroFLC-typewriter");
    if (!contenedorTexto) return;

    const palabraActual = palabras[palabraIndex];

    if (estaBorrando) {
      contenedorTexto.textContent = palabraActual.substring(0, caracterIndex - 1);
      caracterIndex--;
    } else {
      contenedorTexto.textContent = palabraActual.substring(0, caracterIndex + 1);
      caracterIndex++;
    }

    let retraso = estaBorrando ? velocidadBorrar : velocidadEscribir;

    if (!estaBorrando && caracterIndex === palabraActual.length) {
      retraso = esperaPalabraCompleta;
      estaBorrando = true;
    } else if (estaBorrando && caracterIndex === 0) {
      estaBorrando = false;
      palabraIndex = (palabraIndex + 1) % palabras.length;
      retraso = 500;
    }

    setTimeout(escribirEfecto, retraso);
  }

  document.addEventListener("DOMContentLoaded", () => {
    escribirEfecto();
  });
})();

// ==========================================
// 3. DETECTOR DE SCROLL PARA ANIMACIONES
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const elementosARevelar = document.querySelectorAll('.revelar');

  const observadorOptions = {
    root: null,
    rootMargin: '0px',
    threshold: 0.15
  };

  const observador = new IntersectionObserver((entradas, observador) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('activo');
        observador.unobserve(entrada.target); 
      }
    });
  }, observadorOptions);

  elementosARevelar.forEach(elemento => {
    observador.observe(elemento);
  });
});

// ==========================================
// 4. CONTROLADOR DE TABS / DÍAS DE JORNADA
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const botonesTab = document.querySelectorAll(".tab-btn");
  const panelesDia = document.querySelectorAll(".dia-panel");

  botonesTab.forEach(boton => {
    boton.addEventListener("click", () => {
      botonesTab.forEach(btn => btn.classList.remove("active"));
      panelesDia.forEach(panel => panel.classList.remove("active"));

      boton.classList.add("active");

      const diaSeleccionado = boton.getAttribute("data-dia");
      const panelObjetivo = document.getElementById(`panel-${diaSeleccionado}`);

      if (panelObjetivo) {
        panelObjetivo.classList.add("active");
      }
    });
  });
});

// ==========================================
// 5. SINCRONIZACIÓN DE DATOS Y LOGOS CON GOOGLE SHEETS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1vEbJm85_5iIOEcU26GtWt_cvi0gnfM52IzfTMPAqVtI/export?format=xlsx"; 
  const LOGO_POR_DEFECTO = "https://via.placeholder.com/30/D4AF37/121212?text=FLC";

  const tablaCuerpo = document.querySelector("#tabla-puntos-web tbody");
  const tablaCabecera = document.querySelector("#tabla-puntos-web thead");

  if (!tablaCuerpo || !tablaCabecera) return;

  fetch(GOOGLE_SHEET_URL)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo obtener la hoja de cálculo de Google.");
      return response.arrayBuffer();
    })
    .then(buffer => {
      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, { type: "array" });
      
      const nombreHoja = workbook.SheetNames[0];
      const hoja = workbook.Sheets[nombreHoja];
      
      const filas = XLSX.utils.sheet_to_json(hoja); 

      if (filas.length === 0) {
        throw new Error("El documento de Google Sheets no tiene datos.");
      }

      // Ocultamos la columna LOGO de las cabeceras visibles
      const todasLasColumnas = Object.keys(filas[0]);
      const columnasVisibles = todasLasColumnas.filter(col => col.toUpperCase() !== 'LOGO');

      // 1. Generar la cabecera limpia de la tabla
      let cabeceraHTML = "<tr>";
      columnasVisibles.forEach(col => {
        cabeceraHTML += `<th>${col}</th>`;
      });
      cabeceraHTML += "</tr>";
      tablaCabecera.innerHTML = cabeceraHTML;

      // 2. Generar las filas de posiciones e inyectar el logo en la celda del EQUIPO
      let filasHTML = "";
      filas.forEach((fila, index) => {
        const esPrimero = index === 0;
        
        filasHTML += `<tr class="${esPrimero ? 'primer-lugar' : ''}">`;
        
        columnasVisibles.forEach(col => {
          let valor = fila[col] !== undefined ? fila[col] : "0";
          const colNombre = col.toUpperCase();

          // Formato especial para la columna de Posición
          if (colNombre === "POS" && esPrimero) {
            valor = `👑 ${valor}`;
          }

          // Formato especial para la columna del Equipo (agrega el logo)
          if (colNombre === "EQUIPO") {
            const urlLogo = (fila.LOGO && String(fila.LOGO).trim() !== "") 
              ? fila.LOGO 
              : LOGO_POR_DEFECTO;

            valor = `
              <div class="equipo-cell">
                <img 
                  src="${urlLogo}" 
                  alt="${fila[col]}" 
                  class="equipo-logo" 
                  onerror="this.onerror=null; this.src='${LOGO_POR_DEFECTO}';"
                >
                <span class="equipo-nombre">${fila[col]}</span>
              </div>
            `;
          }
          
          filasHTML += `<td>${valor}</td>`;
        });
        
        filasHTML += "</tr>";
      });

      tablaCuerpo.innerHTML = filasHTML;
    })
    .catch(error => {
      console.error("Error al sincronizar con Google Sheets:", error);
      tablaCabecera.innerHTML = "";
      tablaCuerpo.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; color: #9B111E; padding: 30px; font-weight: bold;">
            ⚠️ Error de sincronización. Por favor, revisa que la columna "LOGO" exista en Google Sheets y el enlace sea público.
          </td>
        </tr>`;
    });
});

// ==========================================
// 6. CAMBIO DE TEMA (CLARO/OSCURO)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const btnTheme = document.getElementById('theme-toggle');
  const iconTheme = document.getElementById('theme-icon');

  const temaGuardado = localStorage.getItem('tema_flc') || 'dark';
  document.documentElement.setAttribute('data-theme', temaGuardado);
  if (iconTheme) iconTheme.textContent = temaGuardado === 'light' ? '☀️' : '🌙';

  if (btnTheme) {
    btnTheme.addEventListener('click', () => {
      const temaActual = document.documentElement.getAttribute('data-theme');
      const nuevoTema = temaActual === 'light' ? 'dark' : 'light';

      document.documentElement.setAttribute('data-theme', nuevoTema);
      localStorage.setItem('tema_flc', nuevoTema);
      if (iconTheme) iconTheme.textContent = nuevoTema === 'light' ? '☀️' : '🌙';
    });
  }
});