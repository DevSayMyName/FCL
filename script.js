// ==========================================
// 1. MENÚ FLUIDO Y HAMBURGUESA URBANO
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
// 2. EFECTO DE ESCRIBIR HERO
// ==========================================
(function() {
  const palabras = ["RESPETO Y COMPROMISO", "EXCELENCIA COMPETITIVA", "CULTURA URBAN ESPORTS", "FN LEAGUE S2"];
  let palabraIndex = 0;
  let caracterIndex = 0;
  let estaBorrando = false;
  
  const velocidadEscribir = 120;
  const velocidadBorrar = 60;
  const esperaPalabraCompleta = 2200;

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

  document.addEventListener("DOMContentLoaded", escribirEfecto);
})();

// ==========================================
// 3. ANIMACIONES EN SCROLL (INTERSECTION OBSERVER)
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
// 4. ANIMACIÓN 3D TILT EN MOUSEMOVE
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const tiltElements = document.querySelectorAll('[data-tilt]');

  tiltElements.forEach(element => {
    element.addEventListener('mousemove', (e) => {
      const rect = element.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      
      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -12;
      const rotateY = ((x - centerX) / centerX) * 12;

      element.style.transform = `perspective(1000px) rotateX(${rotateX}deg) rotateY(${rotateY}deg) scale3d(1.02, 1.02, 1.02)`;
    });

    element.addEventListener('mouseleave', () => {
      element.style.transform = 'perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)';
    });
  });
});

// ==========================================
// 5. CONTROLADOR DE TABS DE REGLAMENTO
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
// 6. SINCRONIZACIÓN DE GOOGLE SHEETS & PODIOS
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1vEbJm85_5iIOEcU26GtWt_cvi0gnfM52IzfTMPAqVtI/export?format=xlsx"; 
  const LOGO_POR_DEFECTO = "img/icono.PNG";

  const tablaCuerpo = document.querySelector("#tabla-puntos-web tbody");
  const tablaCabecera = document.querySelector("#tabla-puntos-web thead");

  if (!tablaCuerpo || !tablaCabecera) return;

  fetch(GOOGLE_SHEET_URL)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo conectar a Google Sheets.");
      return response.arrayBuffer();
    })
    .then(buffer => {
      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, { type: "array" });
      
      const nombreHoja = workbook.SheetNames[0];
      const hoja = workbook.Sheets[nombreHoja];
      
      const filas = XLSX.utils.sheet_to_json(hoja); 

      if (filas.length === 0) {
        throw new Error("El documento no contiene datos.");
      }

      const todasLasColumnas = Object.keys(filas[0]);
      const columnasVisibles = todasLasColumnas.filter(col => col.toUpperCase() !== 'LOGO');

      // 1. Cabeceras
      let cabeceraHTML = "<tr>";
      columnasVisibles.forEach(col => {
        const alignStyle = col.toUpperCase() === 'EQUIPO' ? 'style="text-align: left;"' : 'style="text-align: center;"';
        cabeceraHTML += `<th ${alignStyle}>${col}</th>`;
      });
      cabeceraHTML += "</tr>";
      tablaCabecera.innerHTML = cabeceraHTML;

      // 2. Filas + Badges de Podio 3D
      let filasHTML = "";
      filas.forEach((fila, index) => {
        let clasePodio = "";
        let badgePodio = "";

        if (index === 0) {
          clasePodio = "primer-lugar";
          badgePodio = `<span class="rank-badge rank-1">1</span>`;
        } else if (index === 1) {
          clasePodio = "segundo-lugar";
          badgePodio = `<span class="rank-badge rank-2">2</span>`;
        } else if (index === 2) {
          clasePodio = "tercer-lugar";
          badgePodio = `<span class="rank-badge rank-3">3</span>`;
        } else {
          badgePodio = `<span class="rank-badge rank-normal">${index + 1}</span>`;
        }

        filasHTML += `<tr class="${clasePodio}">`;
        
        columnasVisibles.forEach(col => {
          let valor = fila[col] !== undefined ? fila[col] : "0";
          const colNombre = col.toUpperCase();

          if (colNombre === "POS") {
            valor = badgePodio;
          }

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

          const alignStyle = colNombre === "EQUIPO" ? 'style="text-align: left;"' : 'style="text-align: center;"';
          filasHTML += `<td ${alignStyle}>${valor}</td>`;
        });
        
        filasHTML += "</tr>";
      });

      tablaCuerpo.innerHTML = filasHTML;
    })
    .catch(error => {
      console.error("Error al sincronizar datos:", error);
      tablaCabecera.innerHTML = "";
      tablaCuerpo.innerHTML = `
        <tr>
          <td colspan="10" style="text-align: center; color: var(--color-rojo-brillante); padding: 30px; font-weight: bold;">
            ⚠️ Error de sincronización. Asegúrate de que el documento de Google Sheets sea público y contenga la columna 'LOGO'.
          </td>
        </tr>`;
    });
});

// ==========================================
// 7. CONTROLADOR MODO CLARO / OSCURO
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