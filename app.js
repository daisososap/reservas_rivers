let experiencias = [];
let reservas = [];
let textoBusqueda = "";
let categoriaActual = "todas";
let ordenActual = "normal";
let precioMaximo = "";

const catalogo = document.querySelector("#catalogo");
const buscador = document.querySelector("#buscador");
const filtroCategoria = document.querySelector("#filtroCategoria");
const ordenPrecio = document.querySelector("#ordenPrecio");
const precioMaximoInput = document.querySelector("#precioMaximo");
const listaReservas = document.querySelector("#listaReservas");
const total = document.querySelector("#total");
const totalPersonas = document.querySelector("#totalPersonas");
const estado = document.querySelector("#estado");
const mensaje = document.querySelector("#mensaje");
const vaciarReserva = document.querySelector("#vaciarReserva");


async function cargarExperiencias() {
  try {
    const respuesta = await fetch("./data/experiencias.json");

    if (!respuesta.ok) {
      throw new Error("No se pudo cargar el archivo");
    }

    experiencias = await respuesta.json();

    estado.textContent =
      `${experiencias.length} experiencias disponibles`;

    actualizarCatalogo();

  } catch (error) {
    estado.textContent = "Error al cargar las experiencias";
    console.error(error);
  }
}


function obtenerResultados() {

  let resultados = [...experiencias];

  if (categoriaActual !== "todas") {
    resultados = resultados.filter(
      experiencia =>
        experiencia.categoria === categoriaActual
    );
  }

  if (textoBusqueda !== "") {
    resultados = resultados.filter(
      experiencia =>
        experiencia.nombre
          .toLowerCase()
          .includes(textoBusqueda)
    );
  }

  if (precioMaximo !== "") {
    resultados = resultados.filter(
      experiencia =>
        experiencia.precio <= Number(precioMaximo)
    );
  }

  if (ordenActual === "ascendente") {
    resultados.sort(
      (a, b) => a.precio - b.precio
    );
  }

  if (ordenActual === "descendente") {
    resultados.sort(
      (a, b) => b.precio - a.precio
    );
  }

  return resultados;
}


function actualizarCatalogo() {

  const resultados = obtenerResultados();

  if (resultados.length === 0) {
    catalogo.innerHTML =
      `<p class="sin-resultados">
        No se encontraron experiencias
      </p>`;

    estado.textContent = "0 resultados";
    return;
  }

  catalogo.innerHTML = resultados.map(
    experiencia => `

    <article class="tarjeta">

      <div class="imagen">
        ${experiencia.icono}
      </div>

      <div class="informacion">

        <span class="categoria">
          ${experiencia.categoria}
        </span>

        <h3>${experiencia.nombre}</h3>

        <p>Cupo: ${experiencia.cupo}</p>

        <p class="precio">
          $${experiencia.precio} MXN
        </p>

        <label>
          Personas:
          <input
            type="number"
            id="cantidad-${experiencia.id}"
            min="1"
            max="${experiencia.cupo}"
            value="1"
          >
        </label>

        <button
          class="btn-reservar"
          data-id="${experiencia.id}"
        >
          Agregar
        </button>

      </div>

    </article>
    `
  ).join("");

  estado.textContent =
    `${resultados.length} resultados`;

  document.querySelectorAll(".btn-reservar")
    .forEach(boton => {

      boton.addEventListener("click", () => {

        agregarReserva(
          Number(boton.dataset.id)
        );

      });

    });
}


function agregarReserva(id) {

  const experiencia = experiencias.find(
    elemento => elemento.id === id
  );

  const entrada = document.querySelector(
    `#cantidad-${id}`
  );

  const cantidad = Number(entrada.value);

  if (
    cantidad < 1 ||
    cantidad > experiencia.cupo
  ) {
    mensaje.textContent = "La Cantidad supera el cupo disponible";
    return;
  }

  const reserva = reservas.find(
    elemento => elemento.experienciaId === id
  );

  if (reserva) {

    if (
      reserva.cantidad + cantidad >
      experiencia.cupo
    ) {
      mensaje.textContent =
        "La cantidad supera el cupo disponible";
      return;
    }

    reserva.cantidad += cantidad;

  } else {

    reservas.push({
      experienciaId: experiencia.id,
      nombre: experiencia.nombre,
      precio: experiencia.precio,
      cantidad: cantidad
    });
  }

  mostrarReservas();
}


function mostrarReservas() {

  if (reservas.length === 0) {

    listaReservas.innerHTML =
      "<p>No hay experiencias seleccionadas.</p>";

    total.textContent = "$0 MXN";
    totalPersonas.textContent = "0";

    return;
  }

  listaReservas.innerHTML = reservas.map(
    reserva => `

    <article class="item-reserva">

      <div>

        <strong>${reserva.nombre}</strong>

        <p>
          ${reserva.cantidad}
          persona(s) ×
          $${reserva.precio}
        </p>

        <button
          class="btn-cantidad"
          data-id="${reserva.experienciaId}"
          data-accion="disminuir"
        >
          -
        </button>

        <button
          class="btn-cantidad"
          data-id="${reserva.experienciaId}"
          data-accion="aumentar"
        >
          +
        </button>

      </div>

      <div>

        <strong>
          $${reserva.cantidad * reserva.precio} MXN
        </strong>

        <br>

        <button
          class="btn-eliminar"
          data-id="${reserva.experienciaId}"
        >
          Eliminar
        </button>

      </div>

    </article>
    `
  ).join("");

  const totalReserva = reservas.reduce(
    (acumulado, reserva) =>
      acumulado +
      reserva.cantidad * reserva.precio,
    0
  );

  const personas = reservas.reduce(
    (acumulado, reserva) =>
      acumulado + reserva.cantidad,
    0
  );

  total.textContent = `$${totalReserva} MXN`;
  totalPersonas.textContent = personas;


  document.querySelectorAll(".btn-cantidad")
    .forEach(boton => {

      boton.addEventListener("click", () => {

        cambiarCantidad(
          Number(boton.dataset.id),
          boton.dataset.accion
        );

      });

    });


  document.querySelectorAll(".btn-eliminar")
    .forEach(boton => {

      boton.addEventListener("click", () => {

        eliminarReserva(
          Number(boton.dataset.id)
        );

      });

    });
}


function cambiarCantidad(id, accion) {

  const reserva = reservas.find(
    elemento => elemento.experienciaId === id
  );

  const experiencia = experiencias.find(
    elemento => elemento.id === id
  );

  if (accion === "aumentar") {

    if (reserva.cantidad >= experiencia.cupo) {
      mensaje.textContent =
        "Ya alcanzaste el cupo disponible";
      return;
    }

    reserva.cantidad++;
  }

  if (accion === "disminuir") {

    if (reserva.cantidad <= 1) {
      mensaje.textContent =
        "La cantidad mínima es 1";
      return;
    }

    reserva.cantidad--;
  }

  mostrarReservas();
}


function eliminarReserva(id) {

  reservas = reservas.filter(
    reserva =>
      reserva.experienciaId !== id
  );

  mostrarReservas();
}


/* Buscar */

buscador.addEventListener("input", () => {

  textoBusqueda =
    buscador.value.trim().toLowerCase();

  actualizarCatalogo();

});


/* Categoría */

filtroCategoria.addEventListener("change", () => {

  categoriaActual =
    filtroCategoria.value;

  actualizarCatalogo();

});

/* Orden */

ordenPrecio.addEventListener("change", () => {

  ordenActual =
    ordenPrecio.value;

  actualizarCatalogo();

});

/* Precio máximo */

precioMaximoInput.addEventListener("input", () => {

  precioMaximo =
    precioMaximoInput.value;

  actualizarCatalogo();

});


/* Vaciar reservación */

vaciarReserva.addEventListener("click", () => {

  if (reservas.length === 0) {
    mensaje.textContent =
      "No hay reservas para vaciar";
    return;
  }

  if (
    confirm(
      "¿Seguro que quieres vaciar la reservación?"
    )
  ) {

    reservas = [];

    mostrarReservas();

    mensaje.textContent =
      "Reservación vaciada";
  }

});

cargarExperiencias();