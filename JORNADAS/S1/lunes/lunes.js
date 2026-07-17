document.addEventListener("DOMContentLoaded", () => {
  // Seleccionamos todos los botones de acordeón de la página
  const botonesAcordeon = document.querySelectorAll(".acordeonFLC-boton");

  botonesAcordeon.forEach((boton) => {
    boton.addEventListener("click", () => {
      // 1. Alternamos la clase 'activo' en el botón pulsado (para girar el '+')
      boton.classList.toggle("activo");

      // 2. Buscamos el contenedor padre común (.acordeonFLC-container)
      const contenedorPadre = boton.closest(".acordeonFLC-container");

      if (contenedorPadre) {
        // 3. Dentro de ese padre, buscamos el bloque de contenido específico
        const contenidoAsociado = contenedorPadre.querySelector(".acordeonFLC-contenido");

        if (contenidoAsociado) {
          // 4. Alternamos la clase 'activo' solo a ese bloque de contenido
          contenidoAsociado.classList.toggle("activo");
        }
      }
    });
  });
});