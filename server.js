const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const tareas = [];

// Middleware para validar que solo lleguen solicitudes por métodos HTTP válidos
app.use((req, res, next) => {
    if (req.method !== 'GET' && req.method !== 'POST' && req.method !== 'PUT' && req.method !== 'DELETE') {
        return res.status(400).json({ message: 'Método HTTP no válido.' });
    }
    next();
});

app.use(bodyParser.json());

// Middleware para el router list-edit-router
app.use('/tareas', (req, res, next) => {
    if (req.method === 'POST' && (!req.body || !req.body.descripcion || req.body.descripcion.trim() === '')) {
        return res.status(400).json({ message: 'Solicitud POST con cuerpo vacío o descripción faltante.' });
    }

    if (req.method === 'PUT' && (!req.body || !req.body.indice)) {
        return res.status(400).json({ message: 'Solicitud PUT con cuerpo vacío o índice faltante.' });
    }

    next();
});

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

app.get('/tareas', (req, res) => {
    const tareasConIndice = tareas.map((tarea, indice) => ({ ...tarea, indice: indice + 1 }));
    res.json(tareasConIndice);
});

app.post('/tareas', (req, res) => {
    const nuevaTarea = req.body;
    agregarTarea(nuevaTarea.descripcion);
    res.status(201).json({ message: 'Tarea agregada correctamente.' });
});

app.put('/tareas', (req, res) => {
    const { indice } = req.body;
    const tareaExistente = completarTarea(indice);

    if (tareaExistente) {
        res.json({ message: `Tarea #${indice} marcada como completada.` });
    } else {
        res.status(404).json({ message: 'La tarea no existe.' });
    }
});

app.delete('/tareas/:indice', (req, res) => {
    const indice = parseInt(req.params.indice, 10);
    const tareaEliminada = eliminarTarea(indice);

    if (tareaEliminada) {
        res.json({ message: `Tarea #${indice} eliminada.` });
    } else {
        res.status(404).json({ message: 'La tarea no existe.' });
    }
});

app.use((req, res) => {
    res.status(404).send('404 Not Found');
});

function agregarTarea(descripcion) {
    if (!descripcion || descripcion.trim() === '') {
        descripcion = 'Tarea Generica';
    }
    const nuevaTarea = { descripcion, estado: false };
    tareas.push(nuevaTarea);
}

function completarTarea(indice) {
    const tarea = tareas[indice - 1];
    if (tarea) {
        tarea.estado = true;
        console.log(`Tarea #${indice} marcada como completada.`);
        return true;
    } else {
        console.error('La tarea no existe.');
        return false;
    }
}

function eliminarTarea(indice) {
    if (indice > 0 && indice <= tareas.length) {
        tareas.splice(indice - 1, 1);
        console.log(`Tarea #${indice} eliminada.`);
        return true;
    } else {
        console.error('La tarea no existe.');
        return false;
    }
}

app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});
