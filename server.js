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
    const { nombre_maquina, preguntas_mantenimiento } = req.body;

    try {
        // Leer el archivo y obtener las máquinas existentes
        let data = await fs.readFile('maquinas.json', 'utf8');
        let maquinas = JSON.parse(data);

        // Lógica para generar el nuevo id_maquina
        let nuevoId = "MF-00001";  // Valor por defecto si no hay máquinas

        if (maquinas.length > 0) {
            // Obtener el último id_maquina y separarlo por "-"
            let ultimoId = maquinas[maquinas.length - 1].id_maquina;  // Último id_maquina en el archivo
            let idParts = ultimoId.split("-");  // Separar el prefijo ("MF") y el número
            let numeroActual = parseInt(idParts[1]);  // Convertir el número a entero
            numeroActual++;  // Incrementar el número en 1

            // Formatear el número con 5 dígitos, agregando ceros a la izquierda
            nuevoId = "MF-" + numeroActual.toString().padStart(5, '0');
        }

        // Agregar el nuevo registro con el id_maquina generado
        maquinas.push({ id_maquina: nuevoId, nombre_maquina, preguntas_mantenimiento });

        // Escribir los cambios al archivo
        await fs.writeFile('maquinas.json', JSON.stringify(maquinas, null, 2));

        // Responder con los datos guardados
        res.status(200).json({ message: 'Datos guardados con éxito', data: { id_maquina: nuevoId, nombre_maquina, preguntas_mantenimiento } });
    } catch (err) {
        if (err.code === 'ENOENT') {
            // Si el archivo no existe, crear uno con el primer id
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


// app.get('/buscar-nombres', (req, res) => {
//     const { nombre } = req.query;  

//     fs.readFile('datos.json', 'utf8', (err, data) => {
//         if (err) {
//             console.log("Archivo no encontrado");
//             return res.status(500).send('Error al leer los datos'); 
//         }

//         const datos = JSON.parse(data); 
//         const filtrados = datos.filter(item => item.nombre.toLowerCase().includes(nombre.toLowerCase()));
//         const nombresFiltrados = filtrados.map(item => item.nombre); 

//         res.json(nombresFiltrados); 
//     });
// });

// app.get('/obtener-detalles', (req, res) => {
//     const { nombre } = req.query; 

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
