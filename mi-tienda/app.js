let carrito = [];

async function cargarProductos() {
    const catalogo = document.getElementById('catalogo');
    try {
        // Si el HTML y el Servidor están en la misma PC, usa localhost. 
        // Si el servidor está en el VPS, cambia localhost por 136.248.247.250
        const respuesta = await fetch('http://localhost:3000/api/productos');
        const productos = await respuesta.json();
        
        if (productos.length === 0) {
            catalogo.innerHTML = "<p>No hay productos registrados.</p>";
            return;
        }
        mostrarEnPantalla(productos);
    } catch (error) {
        console.error("Error detallado:", error);
        catalogo.innerHTML = "<p style='color:red;'>⚠️ Error: Revisa que el servidor Node.js esté encendido en el puerto 3000.</p>";
    }
}

function mostrarEnPantalla(lista) {
    const catalogo = document.getElementById('catalogo');
    catalogo.innerHTML = lista.map(p => `
        <div class="card">
            <img src="${p.img || 'https://via.placeholder.com/200'}" alt="${p.nombre}">
            <small>${p.marca || 'INFO'}</small>
            <h4>${p.nombre}</h4>
            <span class="price">S/ ${parseFloat(p.precio).toFixed(2)}</span>
            <button class="btn-add" onclick="agregarAlCarrito('${p.nombre}', ${p.precio})">
                Añadir
            </button>
        </div>
    `).join('');
}

function agregarAlCarrito(nombre, precio) {
    carrito.push({ nombre, precio: parseFloat(precio) });
    actualizarCarrito();
    
    // Mostrar el carrito automáticamente
    document.getElementById('cart-drawer').classList.add('active');
    
    // Notificación visual rápida
    const toast = document.createElement('div');
    toast.innerText = `✅ ${nombre} añadido`;
    toast.style.cssText = `
        position: fixed; top: 20px; right: 20px; background: #0066ff; color: white;
        padding: 12px 24px; border-radius: 8px; z-index: 3000; box-shadow: 0 4px 12px rgba(0,0,0,0.1);
        animation: fadeInOut 2.5s forwards; font-weight: 600;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 2500);
}

function actualizarCarrito() {
    const total = carrito.reduce((sum, item) => sum + item.precio, 0);
    document.getElementById('cart-total-nav').innerText = `S/ ${total.toFixed(2)}`;
    document.getElementById('cart-total-final').innerText = `S/ ${total.toFixed(2)}`;
    
    const contenedor = document.getElementById('carrito-items');
    if (carrito.length === 0) {
        contenedor.innerHTML = '<p style="text-align:center; color:#999; margin-top:50px;">El carrito está vacío</p>';
        return;
    }

    contenedor.innerHTML = carrito.map((item, index) => `
        <div class="cart-item">
            <div class="cart-item-info">
                <strong>${item.nombre}</strong>
                <span>S/ ${item.precio.toFixed(2)}</span>
            </div>
            <button class="remove-btn" onclick="eliminarDelCarrito(${index})">✕</button>
        </div>
    `).join('');
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarrito();
}

function toggleCarrito() {
    document.getElementById('cart-drawer').classList.toggle('active');
}

function buscarProducto() {
    const texto = document.getElementById('buscador').value.toLowerCase();
    document.querySelectorAll('.card').forEach(t => {
        const nombre = t.querySelector('h4').innerText.toLowerCase();
        t.style.display = nombre.includes(texto) ? "flex" : "none";
    });
}

cargarProductos();