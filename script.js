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