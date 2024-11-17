const express = require('express');
const fs = require('fs/promises'); 
const bodyParser = require('body-parser');
const app = express();
const port = 3000;

app.use(bodyParser.json());


app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});


app.post('/submit-form', async (req, res) => {
    const { nombre_maquina, preguntas_mantenimiento } = req.body;

    if (!nombre_maquina || !preguntas_mantenimiento || preguntas_mantenimiento.length === 0) {
        return res.status(400).json({ message: 'El nombre de la máquina y las preguntas de mantenimiento son obligatorios.' });
    }

    try {
        let data = await fs.readFile('maquinas.json', 'utf8');
        let maquinas = JSON.parse(data);

        let nuevoId = "MF-00001";  

        if (maquinas.length > 0) {
            let ultimoId = maquinas[maquinas.length - 1].id_maquina;  
            let idParts = ultimoId.split("-");  
            let numeroActual = parseInt(idParts[1]);  
            numeroActual++; 

            nuevoId = "MF-" + numeroActual.toString().padStart(5, '0');
        }

        maquinas.push({ id_maquina: nuevoId, nombre_maquina, preguntas_mantenimiento });

        await fs.writeFile('maquinas.json', JSON.stringify(maquinas, null, 2));

        res.status(200).json({ message: 'Datos guardados con éxito', data: { id_maquina: nuevoId, nombre_maquina, preguntas_mantenimiento } });
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('Archivo no encontrado, creándolo...');
            let maquinas = [{
                id_maquina: "MF-00001",  // Primer id
                nombre_maquina,
                preguntas_mantenimiento
            }];

            try {
                await fs.writeFile('maquinas.json', JSON.stringify(maquinas, null, 2));
                res.status(200).json({ message: 'Datos guardados con éxito', data: { id_maquina: "MF-00001", nombre_maquina, preguntas_mantenimiento } });
            } catch (writeError) {
                console.error('Error al guardar el archivo:', writeError);
                res.status(500).json({ message: 'Error al guardar los datos' });
            }
        } else {
            console.error('Error al leer o procesar el archivo:', err);
            res.status(500).json({ message: 'Error al procesar los datos' });
        }
    }
});

app.get('/buscar-nombres', async (req, res) => {
    const { nombreMaquinas } = req.query;  

    try {
        let data = await fs.readFile('maquinas.json', 'utf8');
        const datos = JSON.parse(data);

        const filtrados = datos.filter(item => item.nombre_maquina.toLowerCase().includes(nombreMaquinas.toLowerCase()));
        const nombresFiltrados = filtrados.map(item => item.nombre_maquina);

        res.json(nombresFiltrados); 
    } catch (err) {
        console.log("Archivo no encontrado");
        res.status(500).send('Error al leer los datos'); 
    }
});

app.get('/obtener-detalles', async (req, res) => {
    const { nombreMaquinas } = req.query; 

    try {
        let data = await fs.readFile('maquinas.json', 'utf8');
        const datos = JSON.parse(data);
        
        const detalle = datos.find(item => item.nombre_maquina.toLowerCase() === nombreMaquinas.toLowerCase()); 

        if (detalle) {
            res.json(detalle);  
        } else {
            res.status(404).send('No se encontró el nombre'); 
        }
    } catch (err) {
        console.log("Archivo no encontrado");
        res.status(500).send('Error al leer los datos'); 
    }
});

// Iniciar el servidor
app.listen(port, async () => {
    const open = await import('open'); 
    open.default(`http://localhost:${port}`);
});
