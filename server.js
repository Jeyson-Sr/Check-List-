const express = require('express'); 
const fs = require('node:fs/promises'); 
const bodyParser = require('body-parser');

const app = express(); 
const port = 3000;

app.use(bodyParser.json());

app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.post('/submit-form', async (req, res) => {
    const { nombre_maquina, preguntas } = req.body;

    try {
        let data = await fs.readFile('maquinas.json', 'utf8');
        let maquinas = JSON.parse(data);

        maquinas.push({ nombre_maquina, preguntas });

        await fs.writeFile('maquinas.json', JSON.stringify(maquinas, null, 2));

        res.status(200).json({ message: 'Datos guardados con éxito', data: { nombre_maquina, preguntas } });
    } catch (err) {
        if (err.code === 'ENOENT') {
            console.log('Archivo no encontrado, creándolo...');
            let maquinas = [{ nombre_maquina, preguntas }];

            try {
                await fs.writeFile('maquinas.json', JSON.stringify(maquinas, null, 2));
                res.status(200).json({ message: 'Datos guardados con éxito', data: { nombre_maquina, preguntas } });
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

// // Ruta para buscar nombres en el archivo según lo que envía el cliente
// app.get('/buscar-nombres', (req, res) => {
//     const { nombre } = req.query;  // Extrae el parámetro 'nombre' de la query, que es lo que se escribe en la barra de búsqueda.

//     fs.readFile('datos.json', 'utf8', (err, data) => {
//         if (err) {
//             console.log("Archivo no encontrado");
//             return res.status(500).send('Error al leer los datos'); // Responde con un error si no se puede leer el archivo.
//         }

//         const datos = JSON.parse(data); // Convierte el contenido JSON en un arreglo de objetos.
//         const filtrados = datos.filter(item => item.nombre.toLowerCase().includes(nombre.toLowerCase()));
//         // Filtra los nombres que incluyen el texto que busca el usuario.
//         const nombresFiltrados = filtrados.map(item => item.nombre);  // Extrae solo los nombres.
//         res.json(nombresFiltrados); // Envia la lista de nombres filtrados en formato JSON.
//     });
// });

// // Ruta para obtener detalles específicos de un usuario (nombre y edad) desde el archivo
// app.get('/obtener-detalles', (req, res) => {
//     const { nombre } = req.query; // Extrae el parámetro 'nombre' de la query, que el usuario ingresa para buscar.

//     fs.readFile('datos.json', 'utf8', (err, data) => {
//         if (err) {
//             console.log("Archivo no encontrado");
//             return res.status(500).send('Error al leer los datos'); // Responde con error si el archivo no se encuentra.
//         }

//         const datos = JSON.parse(data); // Convierte el archivo JSON a un arreglo de objetos.
//         const detalle = datos.find(item => item.nombre.toLowerCase() === nombre.toLowerCase()); // Busca el objeto que coincide exactamente con el nombre ingresado.

//         if (detalle) {
//             res.json(detalle);  // Envia el objeto encontrado con nombre y edad.
//         } else {
//             res.status(404).send('No se encontró el nombre'); // Si no lo encuentra, responde con un error 404 (no encontrado).
//         }
//     });
// });



app.listen(port, async () => {
    const open = await import('open'); 
    open.default(`http://localhost:${port}`);
});
