const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const path = require('path');
const app = express();

app.use(cors());
app.use(express.json());

// Servir archivos estáticos
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

app.get('/style.css', (req, res) => {
    res.sendFile(path.join(__dirname, 'style.css'));
});

app.get('/app.js', (req, res) => {
    res.sendFile(path.join(__dirname, 'app.js'));
});

// Configuración de tu VPS
const db = mysql.createConnection({
    host: '136.248.247.250',
    port: 8080,
    user: 'mysql',
    password: '123456',
    database: 'noha-',
    multipleStatements: true
});

db.connect(err => {
    if (err) {
        console.error("❌ Error de conexión al VPS:", err.message);
    } else {
        console.log("✅ Conectado exitosamente al VPS de Infotec");
        
        // 2. Crear tabla de usuarios (Admin)
        const sqlUsers = `
            CREATE TABLE IF NOT EXISTS usuarios (
                id INT AUTO_INCREMENT PRIMARY KEY,
                username VARCHAR(50) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL
            );
        `;
        db.query(sqlUsers, (err) => {
            if (err) console.error("Error creando tabla usuarios:", err);
            // Insertar admin por defecto si no existe
            db.query('INSERT IGNORE INTO usuarios (username, password) VALUES ("admin", "admin123")');
        });

        // 1. Crear tabla si no existe con columna stock ... (resto del código igual)

    }
});

// Endpoint para enviar productos al Frontend
app.get('/api/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

// --- RUTAS DE ADMINISTRACIÓN ---

// Login de Admin
app.post('/api/login', (req, res) => {
    const { username, password } = req.body;
    db.query('SELECT * FROM usuarios WHERE username = ? AND password = ?', [username, password], (err, result) => {
        if (err) return res.status(500).json(err);
        if (result.length > 0) {
            res.json({ success: true, message: "Bienvenido Admin" });
        } else {
            res.status(401).json({ success: false, message: "Usuario o contraseña incorrectos" });
        }
    });
});

// Agregar producto
app.post('/api/productos', (req, res) => {
    const { nombre, precio, img, marca, stock } = req.body;
    const sql = 'INSERT INTO productos (nombre, precio, img, marca, stock) VALUES (?, ?, ?, ?, ?)';
    db.query(sql, [nombre, precio, img, marca, stock], (err, result) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true, id: result.insertId });
    });
});

// Editar producto
app.put('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    const { nombre, precio, img, marca, stock } = req.body;
    const sql = 'UPDATE productos SET nombre=?, precio=?, img=?, marca=?, stock=? WHERE id=?';
    db.query(sql, [nombre, precio, img, marca, stock, id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

// Eliminar producto
app.delete('/api/productos/:id', (req, res) => {
    const { id } = req.params;
    db.query('DELETE FROM productos WHERE id = ?', [id], (err) => {
        if (err) return res.status(500).json(err);
        res.json({ success: true });
    });
});

app.listen(3000, () => console.log("🔥 Servidor API corriendo en puerto 3000"));
