document.getElementById('bto_guardar').addEventListener('click', function(event) {
    event.preventDefault();  // Prevenir el envío del formulario

    // Obtener los valores de los campos
    const maquina = document.getElementById('input_agregar').value;
    const preguntas = Array.from(document.getElementsByClassName('preguntas')).map(input => input.value);
    
    // Crear un objeto con los datos que deseas enviar
    const data = {
        maquina: maquina,
        preguntas: preguntas
    };

    // Enviar los datos al backend usando fetch()
    fetch('/submit-form', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        console.log('Respuesta del servidor:', data);
        // Aquí podrías hacer algo adicional como mostrar un mensaje de éxito o limpiar el formulario
    })
    .catch(error => {
        console.error('Error:', error);
    });
});

