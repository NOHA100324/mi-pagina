let carrito = [];
let isAdmin = false;

async function cargarProductos() {
    const catalogo = document.getElementById('catalogo');
    const adminControls = document.getElementById('admin-controls');
    
    try {
        const respuesta = await fetch('/api/productos');
        const productos = await respuesta.json();
        
        // Renderizar botón de Admin si está logueado
        adminControls.innerHTML = isAdmin ? 
            `<button class="btn-admin-add" onclick="abrirModalAdmin()">➕ Agregar Nuevo Producto</button>` : '';

        if (productos.length === 0) {
            catalogo.innerHTML = "<p style='grid-column:1/-1; text-align:center; padding:50px; color:#666;'>No hay productos disponibles por ahora.</p>";
            return;
        }

        catalogo.innerHTML = productos.map(p => {
            const stockClass = p.stock <= 0 ? 'stock-out' : (p.stock < 5 ? 'stock-low' : 'stock-normal');
            const stockText = p.stock <= 0 ? 'Agotado' : (p.stock < 5 ? `¡Últimas ${p.stock} unid!` : `Stock: ${p.stock} unid.`);
            
            return `
            <div class="card">
                ${isAdmin ? `<span class="admin-badge">ADMIN ID: ${p.id}</span>` : ''}
                <img src="${p.img || 'https://via.placeholder.com/300'}" alt="${p.nombre}">
                <div class="card-info">
                    <span class="brand-tag">${p.marca || 'GENERIC'}</span>
                    <h4>${p.nombre}</h4>
                    <span class="stock-tag ${stockClass}">${stockText}</span>
                    <div class="price-row">
                        <span class="price">S/ ${parseFloat(p.precio).toFixed(2)}</span>
                        <button class="btn-add" 
                            onclick="agregarAlCarrito('${p.nombre}', ${p.precio}, ${p.stock})"
                            ${p.stock <= 0 ? 'disabled' : ''}>
                            ${p.stock > 0 ? 'Añadir' : 'Agotado'}
                        </button>
                    </div>
                    ${isAdmin ? `
                        <div class="admin-tools">
                            <button class="btn-tool btn-edit" onclick='prepararEdicion(${JSON.stringify(p)})'>Editar</button>
                            <button class="btn-tool btn-delete" onclick="eliminarProducto(${p.id})">Eliminar</button>
                        </div>
                    ` : ''}
                </div>
            </div>
            `;
        }).join('');
    } catch (error) {
        console.error("Error al cargar productos:", error);
    }
}

// --- UTILIDADES ---
function mostrarToast(mensaje) {
    const t = document.createElement('div');
    t.className = 'toast';
    t.innerText = mensaje;
    document.body.appendChild(t);
    setTimeout(() => t.remove(), 3000);
}

function cerrarModalFuera(e, id) {
    if (e.target.id === id) document.getElementById(id).style.display = 'none';
}

// --- CARRITO ---
function toggleCarrito() {
    document.getElementById('cart-drawer').classList.toggle('active');
}

function agregarAlCarrito(nombre, precio, stock) {
    const enCarrito = carrito.filter(i => i.nombre === nombre).length;
    if (enCarrito >= stock) return alert("No hay más unidades disponibles");
    
    carrito.push({ nombre, precio: parseFloat(precio) });
    actualizarCarritoUI();
    mostrarToast(`✅ ${nombre} añadido`);
}

function actualizarCarritoUI() {
    const total = carrito.reduce((s, i) => s + i.precio, 0);
    document.getElementById('cart-total-nav').innerText = `S/ ${total.toFixed(2)}`;
    document.getElementById('cart-total-final').innerText = `S/ ${total.toFixed(2)}`;
    
    const container = document.getElementById('carrito-items');
    if (carrito.length === 0) {
        container.innerHTML = "<p style='text-align:center; color:#999; margin-top:50px;'>Tu carrito está vacío</p>";
        return;
    }
    container.innerHTML = carrito.map((item, index) => `
        <div class="cart-item">
            <div>
                <strong style="font-size:13px; display:block;">${item.nombre}</strong>
                <span style="color:var(--blue); font-weight:700;">S/ ${item.precio.toFixed(2)}</span>
            </div>
            <button onclick="eliminarDelCarrito(${index})" style="background:#fee; color:var(--red); border:none; padding:5px 10px; border-radius:5px; cursor:pointer;">✕</button>
        </div>
    `).join('');
}

function eliminarDelCarrito(index) {
    carrito.splice(index, 1);
    actualizarCarritoUI();
}

// --- ADMIN & LOGIN ---
function abrirModalLogin() { document.getElementById('login-modal').style.display = 'flex'; }
function cerrarModalLogin() { document.getElementById('login-modal').style.display = 'none'; }

async function login() {
    const user = document.getElementById('login-user').value;
    const pass = document.getElementById('login-pass').value;
    const res = await fetch('/api/login', {
        method: 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify({ username: user, password: pass })
    });
    const data = await res.json();
    if (data.success) {
        isAdmin = true;
        document.getElementById('user-status').innerText = 'Administrador';
        document.getElementById('user-action').innerText = 'Panel Activo';
        cerrarModalLogin();
        cargarProductos();
        mostrarToast("Bienvenido, Admin");
    } else {
        alert("Credenciales incorrectas");
    }
}

function abrirModalAdmin() {
    document.getElementById('admin-modal-title').innerText = "Nuevo Producto";
    document.getElementById('prod-id').value = "";
    document.querySelectorAll('#admin-modal input').forEach(i => i.value = "");
    document.getElementById('admin-modal').style.display = 'flex';
}

function cerrarModalAdmin() { document.getElementById('admin-modal').style.display = 'none'; }

function prepararEdicion(p) {
    document.getElementById('admin-modal-title').innerText = "Editar Producto";
    document.getElementById('prod-id').value = p.id;
    document.getElementById('prod-nombre').value = p.nombre;
    document.getElementById('prod-precio').value = p.precio;
    document.getElementById('prod-img').value = p.img;
    document.getElementById('prod-marca').value = p.marca;
    document.getElementById('prod-stock').value = p.stock;
    document.getElementById('admin-modal').style.display = 'flex';
}

async function guardarProducto() {
    const id = document.getElementById('prod-id').value;
    const data = {
        nombre: document.getElementById('prod-nombre').value,
        precio: document.getElementById('prod-precio').value,
        img: document.getElementById('prod-img').value,
        marca: document.getElementById('prod-marca').value,
        stock: document.getElementById('prod-stock').value
    };
    const res = await fetch(id ? `/api/productos/${id}` : '/api/productos', {
        method: id ? 'PUT' : 'POST',
        headers: {'Content-Type': 'application/json'},
        body: JSON.stringify(data)
    });
    if (res.ok) {
        cerrarModalAdmin();
        cargarProductos();
        mostrarToast(id ? "Actualizado" : "Creado");
    }
}

async function eliminarProducto(id) {
    if (!confirm("¿Borrar este producto?")) return;
    await fetch(`/api/productos/${id}`, { method: 'DELETE' });
    cargarProductos();
}

// --- PAGOS ---
function abrirModalPago() { 
    if(carrito.length === 0) return alert("Añade algo primero");
    document.getElementById('payment-modal').style.display = 'flex'; 
}
function cerrarModalPago() { document.getElementById('payment-modal').style.display = 'none'; }

function procesarPago(metodo) {
    alert(`Compra exitosa con ${metodo}. ¡Gracias por confiar en Infotec!`);
    carrito = [];
    actualizarCarritoUI();
    cerrarModalPago();
    toggleCarrito();
}

// Búsqueda en vivo
function buscarProducto() {
    const text = document.getElementById('buscador').value.toLowerCase();
    document.querySelectorAll('.card').forEach(c => {
        const name = c.querySelector('h4').innerText.toLowerCase();
        c.style.display = name.includes(text) ? 'flex' : 'none';
    });
}

cargarProductos();