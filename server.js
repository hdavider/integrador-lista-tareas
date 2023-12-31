const express = require('express');
const fs = require('fs');
const path = require('path');
const bodyParser = require('body-parser');

const app = express();
const port = 3000;
const tareas = [];

app.use(bodyParser.json());

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
