/**
 * SERVIDOR DE GESTIÓN VETERINARIA - BP VETERINARIA
 * Tecnologías: Node.js, Express, Mongoose (MongoDB)
 */

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// ==========================================
// MIDDLEWARES
// ==========================================
app.use(express.json()); // Permite recibir datos JSON en el cuerpo de las peticiones
app.use(express.static(__dirname)); // Sirve el archivo index.html y assets estáticos

// ==========================================
// CONEXIÓN A MONGO DB COMPASS
// ==========================================
// Se conecta a la base de datos 'bp_veterinaria'
mongoose.connect('mongodb+srv://BPKZ:Kevin600y@veterinaria.4bcssc0.mongodb.net/veterinaria?appName=VETERINARIA')
  .then(() => {
    console.log('🚀 Conexión exitosa a MongoDB en Linea');
    seedDatabase(); // Llena la base de datos con datos de prueba si está vacía
  })
  .catch(err => console.error('❌ Error crítico de conexión:', err));

// ==========================================
// MODELOS DE DATOS (ESQUEMAS)
// ==========================================

// 1. Pacientes: Información de mascotas
const Paciente = mongoose.model('Paciente', new mongoose.Schema({
    nombre: String, especie: String, raza: String, edad: Number, propietario: String
}));

// 2. Citas: Agenda médica
const Cita = mongoose.model('Cita', new mongoose.Schema({
    fecha: String, hora: String, mascota: String, veterinario: String, motivo: String
}));

// 3. Veterinarios: Personal clínico
const Veterinario = mongoose.model('Veterinario', new mongoose.Schema({
    nombre: String, especialidad: String, telefono: String, turno: String
}));

// 4. Inventario: Productos y stock
const Inventario = mongoose.model('Inventario', new mongoose.Schema({
    producto: String, categoria: String, stock: Number, precio: Number
}));

// 5. Facturas: Control financiero
const Factura = mongoose.model('Factura', new mongoose.Schema({
    cliente: String, total: Number, metodoPago: String, estado: String
}));

// 6. Servicios: Catálogo de precios
const Servicio = mongoose.model('Servicio', new mongoose.Schema({
    nombreServicio: String, duracion: String, costo: Number, sala: String
}));

// ==========================================
// RUTAS DE LA API (CRUD COMPLETO)
// ==========================================

/**
 * Función genérica para crear rutas CRUD rápidamente
 * @param {String} ruta - Nombre del endpoint
 * @param {Mongoose.Model} Modelo - Modelo de Mongoose a usar
 */
function generarRutasCRUD(ruta, Modelo) {
    // LEER TODO
    app.get(`/api/${ruta}`, async (req, res) => {
        try { res.json(await Modelo.find()); } 
        catch (e) { res.status(500).send(e); }
    });

    // CREAR UNO
    app.post(`/api/${ruta}`, async (req, res) => {
        try {
            const nuevo = new Modelo(req.body);
            await nuevo.save();
            res.status(201).json(nuevo);
        } catch (e) { res.status(400).send(e); }
    });

    // ACTUALIZAR UNO
    app.put(`/api/${ruta}/:id`, async (req, res) => {
        try {
            const actualizado = await Modelo.findByIdAndUpdate(req.params.id, req.body, { new: true });
            res.json(actualizado);
        } catch (e) { res.status(400).send(e); }
    });

    // ELIMINAR UNO
    app.delete(`/api/${ruta}/:id`, async (req, res) => {
        try {
            await Modelo.findByIdAndDelete(req.params.id);
            res.json({ mensaje: "Eliminado correctamente" });
        } catch (e) { res.status(500).send(e); }
    });
}

// Generamos los endpoints para todas nuestras colecciones
generarRutasCRUD('pacientes', Paciente);
generarRutasCRUD('citas', Cita);
generarRutasCRUD('veterinarios', Veterinario);
generarRutasCRUD('inventario', Inventario);
generarRutasCRUD('facturas', Factura);
generarRutasCRUD('servicios', Servicio);

// ==========================================
// SEEDING (DATOS INICIALES)
// ==========================================
async function seedDatabase() {
    const count = await Paciente.countDocuments();
    if (count === 0) {
        console.log("🌱 Poblando base de datos inicial...");
        await Paciente.insertMany([
            { nombre: "Toby", especie: "Perro", raza: "Golden", edad: 3, propietario: "Carlos Mendoza" },
            { nombre: "Luna", especie: "Gato", raza: "Siamés", edad: 2, propietario: "Ana Gómez" }
        ]);
        await Cita.insertMany([
            { fecha: "2026-05-26", hora: "09:00 AM", mascota: "Toby", veterinario: "Dr. Ramírez", motivo: "Vacunación" }
        ]);
        await Veterinario.insertMany([
            { nombre: "Dr. Hugo Ramírez", especialidad: "Traumatología", telefono: "555-0192", turno: "Mañana" }
        ]);
        await Inventario.insertMany([
            { producto: "Antibiótico Amoxicilina", categoria: "Fármacos", stock: 45, precio: 250 }
        ]);
        await Factura.insertMany([
            { cliente: "Carlos Mendoza", total: 600, metodoPago: "Tarjeta", estado: "Pagado" }
        ]);
        await Servicio.insertMany([
            { nombreServicio: "Consulta General", duracion: "30 min", costo: 350, sala: "Consultorio 1" }
        ]);
    }
}

// Iniciar servidor
app.listen(PORT, () => {
    console.log(`🌐 Servidor corriendo en http://localhost:${PORT}`);
});