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



//fuente de consumo de archivo xls teletr
// ===================================================
// CONSUMO DE HOJA DE INTEGRANTES / PERFILES FLC
// ===================================================

document.addEventListener("DOMContentLoaded", () => {
  // Enlace directo de exportación XLSX de tu Google Sheet
  const GOOGLE_SHEET_PERFILES_URL = "https://docs.google.com/spreadsheets/d/1HAdmJYUlcGmJZ0Zny76b5tpZaPRpi2BraPHalbQTsSs/export?format=xlsx";
  const LOGO_DEFECTO = "https://via.placeholder.com/90/D4AF37/121212?text=FLC";

  const contenedor = document.getElementById("contenedor-perfiles-flc");
  if (!contenedor) return;

  // Iconos SVG Integrados para Redes Sociales
  const ICONOS_SVG = {
    tiktok: `<svg viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 1 1-5.2-1.74 2.89 2.89 0 0 1 2.31-1.42V8.92a6.34 6.34 0 0 0-3.52 1.07 6.33 6.33 0 1 0 9.86 5.26V9.18a8.21 8.21 0 0 0 4.77 1.52V7.2a4.85 4.85 0 0 1-1.04-.51z"/></svg>`,
    instagram: `<svg viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>`,
    whatsapp: `<svg viewBox="0 0 24 24"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg>`
  };

  fetch(GOOGLE_SHEET_PERFILES_URL)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo cargar la hoja de integrantes.");
      return response.arrayBuffer();
    })
    .then(buffer => {
      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, { type: "array" });
      const nombreHoja = workbook.SheetNames[0];
      const hoja = workbook.Sheets[nombreHoja];
      const filas = XLSX.utils.sheet_to_json(hoja);

      if (!filas || filas.length === 0) {
        contenedor.innerHTML = `<div class="perfilesFLC-loading">No se encontraron integrantes registrados.</div>`;
        return;
      }

      let tarjetasHTML = "";

      filas.forEach(persona => {
        const nombre = persona.NOMBRE || "Integrante FLC";
        const logo = (persona.LOGO && String(persona.LOGO).trim() !== "") ? persona.LOGO : LOGO_DEFECTO;
        const bio = persona.BIOGRAFIA || "Miembro oficial de FLC Esports.";

        // Procesar Redes Sociales
        let redesHTML = "";

        // TikTok
        if (persona.TIKTOK && String(persona.TIKTOK).trim() !== "") {
          const url = persona.TIKTOK.startsWith("http") ? persona.TIKTOK : `https://www.tiktok.com/@${persona.TIKTOK.replace('@', '')}`;
          redesHTML += `<a href="${url}" target="_blank" rel="noopener" class="perfilFLC-social-btn" title="TikTok">${ICONOS_SVG.tiktok}</a>`;
        }

        // Instagram
        if (persona.INSTAGRAM && String(persona.INSTAGRAM).trim() !== "") {
          const url = persona.INSTAGRAM.startsWith("http") ? persona.INSTAGRAM : `https://www.instagram.com/${persona.INSTAGRAM.replace('@', '')}`;
          redesHTML += `<a href="${url}" target="_blank" rel="noopener" class="perfilFLC-social-btn" title="Instagram">${ICONOS_SVG.instagram}</a>`;
        }

        // WhatsApp
        if (persona.WHATSAPP && String(persona.WHATSAPP).trim() !== "") {
          const numLimpio = String(persona.WHATSAPP).replace(/\D/g, '');
          const url = persona.WHATSAPP.startsWith("http") ? persona.WHATSAPP : `https://wa.me/${numLimpio}`;
          redesHTML += `<a href="${url}" target="_blank" rel="noopener" class="perfilFLC-social-btn" title="WhatsApp">${ICONOS_SVG.whatsapp}</a>`;
        }

        // Estructura de la tarjeta
        tarjetasHTML += `
          <div class="perfilFLC-card">
            <div class="perfilFLC-logo-wrapper">
              <img 
                src="${logo}" 
                alt="${nombre}" 
                class="perfilFLC-logo" 
                onerror="this.onerror=null; this.src='${LOGO_DEFECTO}';"
              >
            </div>
            <h3 class="perfilFLC-nombre">${nombre}</h3>
            <p class="perfilFLC-bio">${bio}</p>
            <div class="perfilFLC-socials">
              ${redesHTML || '<span style="font-size:0.8rem; color:#666;">Sin redes vinculadas</span>'}
            </div>
          </div>
        `;
      });

      contenedor.innerHTML = tarjetasHTML;
    })
    .catch(error => {
      console.error("Error al cargar perfiles:", error);
      contenedor.innerHTML = `<div class="perfilesFLC-loading" style="color:#9B111E;">⚠️ Error al cargar la lista de integrantes. Por favor, verifica el enlace de Google Sheets.</div>`;
    });
});