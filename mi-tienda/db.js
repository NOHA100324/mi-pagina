const mysql = require('mysql2');
const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

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
        
        // 1. Crear tabla si no existe
        const sql = `
            CREATE TABLE IF NOT EXISTS productos (
                id INT AUTO_INCREMENT PRIMARY KEY,
                nombre VARCHAR(255) NOT NULL,
                precio DECIMAL(10,2) NOT NULL,
                img TEXT,
                marca VARCHAR(50)
            );
        `;
        
        db.query(sql, (err) => {
            if (err) return console.error("Error creating table:", err);
            
            // 2. Asegurar que img sea TEXT
            db.query('ALTER TABLE productos MODIFY COLUMN img TEXT', (err) => {
                if (err) console.log("Nota: No se pudo alterar la columna, tal vez ya es TEXT.");
                
                // 3. Insertar datos si está vacía
                db.query('SELECT COUNT(*) AS count FROM productos', (err, result) => {
                    if (err) return console.error("Error checking table:", err);
                    
                    if (result[0].count === 0) {
                        const sampleProducts = [
                            ['Laptop Gamer ASUS ROG', 4500.00, 'https://dlcdnwebimgs.asus.com/gain/27339121-7546-4444-934C-340D8389656A/w717/h525', 'ASUS'],
                            ['MacBook Air M2', 5200.00, 'https://store.storeimages.cdn-apple.com/4982/as-images.apple.com/is/macbook-air-midnight-select-20220606?wid=452&hei=420&fmt=jpeg&qlt=95&.v=1653084303665', 'Apple'],
                            ['HP Pavilion 15', 2800.00, 'https://ssl-product-images.www8-hp.com/digfc/c08170251_en_US_1.png', 'HP'],
                            ['Lenovo Legion 5', 4100.00, 'https://p1-ofp.static.pub/medias/bWFya2V0cGxhY2UvcHByb2QvODE2RURDMDAtM0I2MC00QzZBLUFGNDYtRDFFMEQyMUFEMzVB/lenovo-laptop-legion-5-15ach6h-82ju000uus-amd-ryzen-7-5000-series-5800h-3-20-ghz-16-gb-memory-512-gb-pcie-ssd-nvidia-geforce-rtx-3060-15-6-windows-10-home-64-bit-v2.jpg', 'Lenovo'],
                            ['Dell XPS 13', 5800.00, 'https://i.dell.com/is/image/DellContent/content/dam/ss2/product-images/dell-client-products/notebooks/xps-notebooks/xps-13-9315/media-gallery/laptop-xps-13-9315-blue-gallery-1.psd?fmt=pjpg&pscan=auto&scl=1&wid=4106&hei=2422&qlt=100,0&resMode=sharp2&size=4106,2422', 'Dell']
                        ];
                        const insertSql = 'INSERT INTO productos (nombre, precio, img, marca) VALUES ?';
                        db.query(insertSql, [sampleProducts], (err) => {
                            if (err) console.error("Error inserting sample data:", err);
                            else console.log("✅ Datos de prueba insertados");
                        });
                    }
                });
            });
        });
    }
});

// Endpoint para enviar productos al Frontend
app.get('/api/productos', (req, res) => {
    db.query('SELECT * FROM productos', (err, results) => {
        if (err) return res.status(500).json(err);
        res.json(results);
    });
});

app.listen(3000, () => console.log("🔥 Servidor API corriendo en puerto 3000"));
