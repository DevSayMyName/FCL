//MENU FLC JS

// Esperamos a que todo el HTML cargue
document.addEventListener("DOMContentLoaded", () => {
  const hamburger = document.querySelector('.menuFLC-hamburger');
  const navLinks = document.querySelector('.menuFLC-links');
  const links = document.querySelectorAll('.menuFLC-links li a');

  // Abrir y cerrar menú al tocar la hamburguesa
  hamburger.addEventListener('click', () => {
    hamburger.classList.toggle('activo');
    navLinks.classList.toggle('activo');
  });

  // Cerrar el menú automáticamente al tocar cualquier enlace
  links.forEach(link => {
    link.addEventListener('click', () => {
      hamburger.classList.remove('activo');
      navLinks.classList.remove('activo');
    });
  });
});

//maquina de escribir
/**
 * Componente: Hero Section - Efecto Máquina de Escribir (Typewriter)
 */
(function() {
  // Lista de palabras requeridas
  const palabras = ["FN", "EXCELENCIA", "COMPETITIVOS", "FN LEAGUE"];
  
  let palabraIndex = 0;
  let caracterIndex = 0;
  let estaBorrando = false;
  
  const velocidadEscribir = 150; // Milisegundos por letra
  const velocidadBorrar = 75;    // Borra el doble de rápido
  const esperaPalabraCompleta = 2000; // Tiempo que se queda la palabra escrita

  function escribirEfecto() {
    const contenedorTexto = document.getElementById("heroFLC-typewriter");
    if (!contenedorTexto) return; // Validación de seguridad

    const palabraActual = palabras[palabraIndex];

    if (estaBorrando) {
      // Quita una letra
      contenedorTexto.textContent = palabraActual.substring(0, caracterIndex - 1);
      caracterIndex--;
    } else {
      // Agrega una letra
      contenedorTexto.textContent = palabraActual.substring(0, caracterIndex + 1);
      caracterIndex++;
    }

    // Determinar la velocidad de la siguiente ejecución
    let retraso = estaBorrando ? velocidadBorrar : velocidadEscribir;

    // Lógica de cambio de estados
    if (!estaBorrando && caracterIndex === palabraActual.length) {
      // Terminó de escribir, espera un momento antes de borrar
      retraso = esperaPalabraCompleta;
      estaBorrando = true;
    } else if (estaBorrando && caracterIndex === 0) {
      // Terminó de borrar, pasa a la siguiente palabra
      estaBorrando = false;
      palabraIndex = (palabraIndex + 1) % palabras.length;
      retraso = 500; // Pausa pequeña antes de empezar la nueva palabra
    }

    setTimeout(escribirEfecto, retraso);
  }

  // Iniciar la animación al cargar la página
  document.addEventListener("DOMContentLoaded", () => {
    escribirEfecto();
  });
})();


// ==========================================
// DETECTOR DE SCROLL PARA ANIMACIONES (Intersection Observer)
// ==========================================
document.addEventListener("DOMContentLoaded", () => {
  const elementosARevelar = document.querySelectorAll('.revelar');

  const observadorOptions = {
    root: null, // Usa la pantalla del navegador como referencia
    rootMargin: '0px',
    threshold: 0.15 // El elemento se activa cuando se ve el 20% de él
  };

  const observador = new IntersectionObserver((entradas, observador) => {
    entradas.forEach(entrada => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add('activo');
        // Opcional: deja de observar el elemento una vez animado para mejor rendimiento
        observador.unobserve(entrada.target); 
      }
    });
  }, observadorOptions);

  elementosARevelar.forEach(elemento => {
    observador.observe(elemento);
  });
});


document.addEventListener("DOMContentLoaded", () => {
  const botonesTab = document.querySelectorAll(".tab-btn");
  const panelesDia = document.querySelectorAll(".dia-panel");

  botonesTab.forEach(boton => {
    boton.addEventListener("click", () => {
      // 1. Quitar la clase activa de todos los botones
      botonesTab.forEach(btn => btn.classList.remove("active"));
      
      // 2. Quitar la clase activa de todos los paneles de contenido
      panelesDia.forEach(panel => panel.classList.remove("active"));

      // 3. Añadir clase activa al botón presionado
      boton.classList.add("active");

      // 4. Buscar el panel que corresponde al atributo "data-dia" del botón
      const diaSeleccionado = boton.getAttribute("data-dia");
      const panelObjetivo = document.getElementById(`panel-${diaSeleccionado}`);

      if (panelObjetivo) {
        panelObjetivo.classList.add("active");
      }
    });
  });
});

// ==========================================
// SINCRONIZACIÓN DE DATOS CON GOOGLE SHEETS
// ==========================================

document.addEventListener("DOMContentLoaded", () => {
  // Tu enlace de Google Sheets formateado para descarga directa de datos
  const GOOGLE_SHEET_URL = "https://docs.google.com/spreadsheets/d/1vEbJm85_5iIOEcU26GtWt_cvi0gnfM52IzfTMPAqVtI/export?format=xlsx"; 

  const tablaCuerpo = document.querySelector("#tabla-puntos-web tbody");
  const tablaCabecera = document.querySelector("#tabla-puntos-web thead");

  fetch(GOOGLE_SHEET_URL)
    .then(response => {
      if (!response.ok) throw new Error("No se pudo obtener la hoja de cálculo de Google.");
      return response.arrayBuffer();
    })
    .then(buffer => {
      const data = new Uint8Array(buffer);
      const workbook = XLSX.read(data, { type: "array" });
      
      // Obtenemos la primera pestaña del Google Sheets
      const nombreHoja = workbook.SheetNames[0];
      const hoja = workbook.Sheets[nombreHoja];
      
      // Convertimos los datos de la hoja a formato JSON
      const filas = XLSX.utils.sheet_to_json(hoja); 

      if (filas.length === 0) {
        throw new Error("El documento de Google Sheets no tiene datos.");
      }

      // 1. Generamos los nombres de las columnas (ej: POS, EQUIPO, LUNES...)
      let cabeceraHTML = "<tr>";
      const columnas = Object.keys(filas[0]);
      columnas.forEach(col => {
        cabeceraHTML += `<th>${col}</th>`;
      });
      cabeceraHTML += "</tr>";
      tablaCabecera.innerHTML = cabeceraHTML;

      // 2. Generamos las filas de puntuación de los equipos
      let filasHTML = "";
      filas.forEach((fila, index) => {
        const esPrimero = index === 0; // Identificamos al puntero de la liga
        
        filasHTML += `<tr class="${esPrimero ? 'primer-lugar' : ''}">`;
        
        columnas.forEach(col => {
          let valor = fila[col] !== undefined ? fila[col] : "0";
          
          // Agregamos la corona dorada al que esté de primer lugar
          if (col === "POS" && esPrimero) {
            valor = `👑 ${valor}`;
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
            ⚠️ Error de sincronización. Por favor, revisa que la hoja de cálculo de Google sea pública ("Cualquier persona con el enlace puede ver").
          </td>
        </tr>`;
    });
});



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