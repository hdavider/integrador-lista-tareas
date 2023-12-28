require('dotenv').config();
const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');
const jwt = require('jsonwebtoken');

const app = express();
const port = 3000;
const tareas = [];

// Usuarios
const usuarios = [
    { id: 1, nombre: "hugo", contrasena: "contrasena1" },
];

// Middleware para analizar JSON
app.use(bodyParser.json());

// Ruta principal para servir index.html
app.get('/', (req, res) => {
    const filePath = path.join(__dirname, 'index.html');
    fs.readFile(filePath, 'utf8', (err, data) => {
        if (err) {
            res.status(500).send('Internal Server Error');
        } else {
            res.send(data);
        }
    });
});

// Middleware para validar JWT
function validarJWT(req, res, next) {
    const token = req.headers['authorization'];

    if (!token) {
        return res.sendStatus(401);
    }

    jwt.verify(token, process.env.JWT_SECRET, (err, usuario) => {
        if (err) {
            return res.sendStatus(403);
        }
        req.usuario = usuario;
        next();
    });
}

// Middleware para validar el cuerpo de la solicitud, aplicado solo a ciertas rutas
function validateRequestBody(req, res, next) {
    if (req.method === 'POST' && !req.body.descripcion) {
        return res.status(400).json({ message: 'Falta información válida para crear la tarea.' });
    }
    if (req.method === 'PUT' && (typeof req.body.estado !== 'boolean')) {
        return res.status(400).json({ message: 'Falta información válida para actualizar la tarea.' });
    }
    next();
}

// Ruta de autenticación para crear JWT
app.post('/login', (req, res) => {
    const { nombre, contrasena } = req.body;
    const usuario = usuarios.find(u => u.nombre === nombre && u.contrasena === contrasena);

    if (usuario) {
        const token = jwt.sign({ id: usuario.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
        res.json({ mensaje: "Autenticación exitosa", token });
    } else {
        res.status(401).json({ mensaje: "Nombre de usuario o contraseña incorrectos" });
    }
});


// Rutas para la gestión de tareas
app.get('/tareas', validarJWT, (req, res) => {
    const { estado } = req.query;
    let tareasFiltradas = [...tareas];

    if (estado !== undefined) {
        const estadoBool = estado === 'completas';
        tareasFiltradas = tareas.filter(tarea => tarea.estado === estadoBool);
    }

    res.json(tareasFiltradas);
});

app.post('/tareas', validarJWT, validateRequestBody, (req, res) => {
    const nuevaTarea = { descripcion: req.body.descripcion, estado: false };
    tareas.push(nuevaTarea);
    res.status(201).json({ mensaje: 'Tarea agregada correctamente.' });
});

app.put('/tareas/:indice', validarJWT, validateRequestBody, (req, res) => {
    const indice = parseInt(req.params.indice, 10) - 1;

    if (indice >= 0 && indice < tareas.length) {
        tareas[indice].estado = req.body.estado;
        res.json({ mensaje: `Tarea #${indice + 1} actualizada correctamente.` });
    } else {
        res.status(404).json({ mensaje: 'La tarea no existe.' });
    }
});

app.delete('/tareas/:indice', validarJWT, (req, res) => {
    const indice = parseInt(req.params.indice, 10) - 1;

    if (indice >= 0 && indice < tareas.length) {
        tareas.splice(indice, 1);
        res.json({ mensaje: `Tarea #${indice + 1} eliminada correctamente.` });
    } else {
        res.status(404).json({ mensaje: 'La tarea no existe.' });
    }
});

app.get('/tareas/:indice', validarJWT, (req, res) => {
    const indice = parseInt(req.params.indice, 10) - 1;

    if (indice >= 0 && indice < tareas.length) {
        res.json(tareas[indice]);
    } else {
        res.status(404).json({ mensaje: 'La tarea no existe.' });
    }
});

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
