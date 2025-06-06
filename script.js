// Variables de estado
let filtroActual = "all"
let indiceImagenActual = 0
let tallaSeleccionada = ""
let productos = []

// Elementos del DOM
const cuadriculaProductos = document.getElementById("cuadricula-productos")
const overlayBusqueda = document.getElementById("overlay-busqueda")
const entradaBusqueda = document.getElementById("entrada-busqueda")
const resultadosBusqueda = document.getElementById("productos-busqueda")
const menuMovil = document.getElementById("menu-movil")
const paginaInicio = document.getElementById("pagina-inicio")
const paginaProducto = document.getElementById("pagina-producto")

// Inicializar la aplicación
document.addEventListener("DOMContentLoaded", () => {
  cargarProductos()
  configurarEventListeners()
})

// Cargar productos desde el archivo JSON
async function cargarProductos() {
  try {
    const respuesta = await fetch("productos.json")
    const datos = await respuesta.json()
    productos = datos.productos
    renderizarProductos()
  } catch (error) {
    console.error("Error al cargar los productos:", error)
    cuadriculaProductos.innerHTML =
      '<p style="text-align: center; padding: 20px;">Error al cargar los productos. Por favor, intenta de nuevo más tarde.</p>'
  }
}

// Configurar los event listeners
function configurarEventListeners() {
  // Funcionalidad de búsqueda
  document.getElementById("boton-buscar").addEventListener("click", abrirBusqueda)
  document.getElementById("cerrar-busqueda").addEventListener("click", cerrarBusqueda)
  entradaBusqueda.addEventListener("input", manejarBusqueda)

  // Menú móvil
  document.getElementById("boton-menu").addEventListener("click", abrirMenu)
  document.getElementById("cerrar-menu").addEventListener("click", cerrarMenu)

  // Cerrar overlays al hacer clic fuera
  overlayBusqueda.addEventListener("click", (e) => {
    if (e.target === overlayBusqueda) cerrarBusqueda()
  })

  menuMovil.addEventListener("click", (e) => {
    if (e.target === menuMovil) cerrarMenu()
  })

  // Atajos de teclado
  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      cerrarBusqueda()
      cerrarMenu()
    }
  })
}

// Funcionalidad de búsqueda
function abrirBusqueda() {
  overlayBusqueda.classList.add("activo")
  entradaBusqueda.focus()
  document.body.style.overflow = "hidden"
}

function cerrarBusqueda() {
  overlayBusqueda.classList.remove("activo")
  document.body.style.overflow = "auto"
  entradaBusqueda.value = ""
  resultadosBusqueda.innerHTML = ""
}

function manejarBusqueda(e) {
  const consulta = e.target.value.toLowerCase().trim()

  if (consulta.length === 0) {
    resultadosBusqueda.innerHTML = ""
    return
  }

  const productosFiltrados = productos.filter(
    (producto) =>
      producto.nombre.toLowerCase().includes(consulta) ||
      producto.playa.toLowerCase().includes(consulta) ||
      producto.categoria.toLowerCase().includes(consulta),
  )

  renderizarResultadosBusqueda(productosFiltrados)
}

function renderizarResultadosBusqueda(productosFiltrados) {
  if (productosFiltrados.length === 0) {
    resultadosBusqueda.innerHTML =
      '<p style="text-align: center; color: #666; padding: 20px;">No se encontraron productos</p>'
    return
  }

  resultadosBusqueda.innerHTML = productosFiltrados
    .map(
      (producto) => `
    <div class="producto-busqueda" onclick="abrirProducto(${producto.id}); cerrarBusqueda();">
      <img src="${producto.imagen}" alt="${producto.nombre}">
      <div class="info-producto-busqueda">
        <h4>${producto.nombre}</h4>
        <p>$${producto.precio.toLocaleString()} COP</p>
      </div>
    </div>
  `,
    )
    .join("")
}

// Funcionalidad del menú móvil
function abrirMenu() {
  menuMovil.classList.add("activo")
  document.body.style.overflow = "hidden"
}

function cerrarMenu() {
  menuMovil.classList.remove("activo")
  document.body.style.overflow = "auto"
}

// Renderizado de productos
function renderizarProductos(filtro = "all") {
  const productosFiltrados =
    filtro === "all" ? productos : productos.filter((producto) => producto.categoria === filtro)

  cuadriculaProductos.innerHTML = productosFiltrados.map((producto) => crearTarjetaProducto(producto)).join("")
}

function crearTarjetaProducto(producto) {
  return `
    <div class="tarjeta-producto" onclick="abrirProducto(${producto.id})">
      ${producto.oferta ? '<div class="etiqueta-oferta">Oferta</div>' : ""}
      <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto">
      <div class="info-producto">
        <h4 class="nombre-producto">${producto.nombre}</h4>
        <div class="precio-producto">
          ${producto.precioOriginal ? `<span class="precio-original">$${producto.precioOriginal.toLocaleString()}</span>` : ""}
          <span class="precio-actual">$${producto.precio.toLocaleString()} COP</span>
        </div>
      </div>
    </div>
  `
}

// Funcionalidad de detalle de producto
function abrirProducto(productoId) {
  const producto = productos.find((p) => p.id === productoId)
  if (!producto) return

  indiceImagenActual = 0
  tallaSeleccionada = ""

  const htmlDetalleProducto = crearHTMLDetalleProducto(producto)
  paginaProducto.innerHTML = htmlDetalleProducto

  // Mostrar página de producto
  paginaInicio.style.display = "none"
  paginaProducto.style.display = "block"

  // Desplazarse al inicio
  window.scrollTo(0, 0)

  // Configurar event listeners de la página de producto
  configurarListenersProducto(producto)
}

function crearHTMLDetalleProducto(producto) {
  const productosRecomendados = productos.filter((p) => p.id !== producto.id).slice(0, 4)

  return `
    <div class="detalle-producto">
      <div class="galeria-producto">
        <button class="boton-regresar" onclick="volver()">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path d="M19 12H5M12 19l-7-7 7-7"/>
          </svg>
        </button>
        <img src="${producto.imagenes[0]}" alt="${producto.nombre}" class="imagen-principal" id="imagen-principal">
        <div class="navegacion-galeria">
          <span id="contador-imagen">1/${producto.imagenes.length}</span>
        </div>
      </div>
      
      <div class="info-detalle-producto">
        <div class="marca-producto">EstrelladelMar.COM</div>
        <h1 class="titulo-producto">${producto.nombre}</h1>
        
        <div class="precios-producto">
          ${producto.precioOriginal ? `<span class="precio-original">$${producto.precioOriginal.toLocaleString()},00 COP</span>` : ""}
          <span class="precio-actual">$${producto.precio.toLocaleString()},00 COP</span>
          ${producto.oferta ? '<span class="etiqueta-oferta">Oferta</span>' : ""}
        </div>
        
        <div class="info-pago">
          <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
            <circle cx="12" cy="12" r="10"/>
            <path d="M12 6v6l4 2"/>
          </svg>
          <div class="texto-pago">
            <strong>No te quedes sin el tuyo.</strong> Aprovecha 
          </div>
        </div>
        
        <div class="selector-talla">
          <h3 class="titulo-talla">Tamaño</h3>
          <div class="opciones-talla">
            ${producto.tallas
              .map(
                (talla) => `
              <div class="opcion-talla" data-talla="${talla}" onclick="seleccionarTalla('${talla}')">${talla}</div>
            `,
              )
              .join("")}
          </div>
        </div>
        
        <div class="selector-color">
          <h3 class="titulo-color">Color</h3>
          <p style="font-size: 14px; color: #666;">${producto.colores.join(", ")}</p>
        </div>
        
        <div class="botones-accion">
          <a href="#" class="boton-comprar-whatsapp" id="boton-comprar-whatsapp">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893A11.821 11.821 0 0020.465 3.516"/>
            </svg>
            Comprar por WhatsApp
          </a>
          <button class="boton-compartir" onclick="compartirProducto()">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path d="M4 12v8a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-8"/>
              <polyline points="16,6 12,2 8,6"/>
              <line x1="12" y1="2" x2="12" y2="15"/>
            </svg>
          </button>
        </div>
        
        <div class="descripcion-producto">
          <h3 class="titulo-descripcion">Descripción</h3>
          <p class="texto-descripcion">${producto.descripcion}</p>
          <br>
          <p class="texto-descripcion"><strong>Playa inspiradora:</strong> ${producto.playa}</p>
          <p class="texto-descripcion"><strong>Obtén información detallada y personalizada mediante nuestro servicio de whatsapp.</strong></p>
        </div>
      </div>
    </div>
    
    <div class="productos-recomendados">
      <h2 class="titulo-recomendados">También te puede gustar</h2>
      <div class="cuadricula-recomendados">
        ${productosRecomendados
          .map(
            (producto) => `
          <div class="tarjeta-producto" onclick="abrirProducto(${producto.id})">
            ${producto.oferta ? '<div class="etiqueta-oferta">Oferta</div>' : ""}
            <img src="${producto.imagen}" alt="${producto.nombre}" class="imagen-producto">
            <div class="info-producto">
              <h4 class="nombre-producto">${producto.nombre}</h4>
              <div class="precio-producto">
                ${producto.precioOriginal ? `<span class="precio-original">$${producto.precioOriginal.toLocaleString()},00 COP</span>` : ""}
                <span class="precio-actual">$${producto.precio.toLocaleString()},00 COP</span>
              </div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
    </div>
  `
}

function configurarListenersProducto(producto) {
  // Navegación de galería de imágenes
  const imagenPrincipal = document.getElementById("imagen-principal")
  const contadorImagen = document.getElementById("contador-imagen")

  if (imagenPrincipal) {
    imagenPrincipal.addEventListener("click", () => {
      indiceImagenActual = (indiceImagenActual + 1) % producto.imagenes.length
      imagenPrincipal.src = producto.imagenes[indiceImagenActual]
      contadorImagen.textContent = `${indiceImagenActual + 1}/${producto.imagenes.length}`
    })
  }

  // Botón de WhatsApp
  const botonWhatsapp = document.getElementById("boton-comprar-whatsapp")
  if (botonWhatsapp) {
    botonWhatsapp.addEventListener("click", (e) => {
      e.preventDefault()
      const talla = tallaSeleccionada || "No especificada"
      const mensaje = `¡Hola! Me interesa el ${producto.nombre}

💰 Precio: $${producto.precio.toLocaleString()} COP
📏 Talla: ${talla}
🏖️ Inspirado en: ${producto.playa}

¿Podrías darme más información sobre disponibilidad y envío a Santa Marta?`

      const urlWhatsapp = `https://wa.me/573001112233?text=${encodeURIComponent(mensaje)}`
      window.open(urlWhatsapp, "_blank")
    })
  }
}

// Funciones de utilidad
function seleccionarTalla(talla) {
  tallaSeleccionada = talla
  document.querySelectorAll(".opcion-talla").forEach((opcion) => {
    opcion.classList.remove("seleccionada")
  })
  document.querySelector(`[data-talla="${talla}"]`).classList.add("seleccionada")
}

function compartirProducto() {
  if (navigator.share) {
    navigator
      .share({
        title: document.querySelector(".titulo-producto").textContent,
        text: "Mira este hermoso vestido de baño de Santa Marta Swimwear",
        url: window.location.href,
      })
      .catch((error) => console.log("Error al compartir:", error))
  } else {
    // Alternativa para navegadores que no soportan Web Share API
    const url = window.location.href
    navigator.clipboard.writeText(url).then(() => {
      alert("Enlace copiado al portapapeles")
    })
  }
}

function volver() {
  paginaProducto.style.display = "none"
  paginaInicio.style.display = "block"
  window.scrollTo(0, 0)
}

function mostrarInicio() {
  cerrarMenu()
  volver()
  filtroActual = "all"
  renderizarProductos()
}

function filtrarProductos(categoria) {
  cerrarMenu()
  volver()
  filtroActual = categoria
  renderizarProductos(categoria)
}

// Desplazamiento suave para enlaces internos
document.addEventListener("click", (e) => {
  if (e.target.matches('a[href^="#"]')) {
    e.preventDefault()
    const destino = document.querySelector(e.target.getAttribute("href"))
    if (destino) {
      destino.scrollIntoView({
        behavior: "smooth",
        block: "start",
      })
    }
  }
})
