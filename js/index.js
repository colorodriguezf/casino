"use strict";

const canvas = document.getElementById('tragamonedasCanvas');
const ctx = canvas.getContext('2d');

const MAXFILA = 5;
const MAXCOLUMNA = 5;
const fichas = {
    1: 'A',
    2: 'K',
    3: 'Q',
    4: 'J',
    5: '10',
    6: 'comodin',
    7: 'dinero',
    8: 'premio'
};

const sound_premio = new Audio();
sound_premio.src = "sonidos/sonidoPremio.mp3";

const sound_dinero = new Audio();
sound_dinero.src = "sonidos/sonidoDinero.mp3";

const matriz = [];

// Puntuación inicial
let puntuacion = 0;

function actualizarPuntuacion(valor) {
    // Actualizar la puntuación
    puntuacion += valor;

    // Mostrar la puntuación en el elemento HTML correspondiente
    console.log(`Puntuación: ${puntuacion}`);
}


const lineasGanadoras = [
    // Ejemplo de línea horizontal en la fila 0
    [{ fila: 0, columna: 0 }, { fila: 0, columna: 1 }, { fila: 0, columna: 2 }],

    // Ejemplo de línea vertical en la columna 0
    [{ fila: 0, columna: 0 }, { fila: 1, columna: 0 }, { fila: 2, columna: 0 }],

    // Agrega más líneas según tus necesidades
];

function verificarLineas() {
    lineasGanadoras.forEach(linea => {
        const celdas = linea.map(coord => matriz[coord.fila][coord.columna]);
        if (celdas.every((val, index, arr) => val === arr[0])) {
            // Todas las celdas de la línea coinciden
            const puntaje = obtenerPuntajeLinea(linea);
            actualizarPuntuacion(puntaje);
        }
    });
}

function obtenerPuntajeLinea(linea) {
    console.log(linea);
    return 100; // Puntaje de ejemplo
}

const maxPremiosPorColumna = 1;
const maxPremiosTotales = 3;
let premiosPorColumna = new Array(MAXCOLUMNA).fill(0);
let premiosTotales = 0;

function dibujarMatriz() {
    // Limpia el canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Dibuja la matriz
    const celdaSize = 80; // Tamaño de cada celda
    const padding = 3; // Espaciado entre celdas

    function dibujarFicha(i, j) {
        const x = j * (celdaSize + padding);
        const y = i * (celdaSize + padding);

        ctx.fillStyle = '#ddd'; // Color de fondo de la celda
        ctx.fillRect(x, y, celdaSize, celdaSize);

        ctx.strokeStyle = '#333'; // Color del borde
        ctx.strokeRect(x, y, celdaSize, celdaSize);

        ctx.font = '18px Arial';
        ctx.fillStyle = '#333'; // Color del texto

        // Agrega un efecto de caída para las fichas especiales
        if (matriz[i][j] === 'comodin' || matriz[i][j] === 'premio' || matriz[i][j] === 'dinero') {
            const translateY = `translateY(${canvas.height}px)`;
            ctx.transform = translateY;

            // Restaura la transformación después de una pequeña pausa para permitir la animación
            setTimeout(() => {
                ctx.transform = 'none';
            }, 10);
        }

        // Dibuja el texto o la imagen después de la transformación
        if (matriz[i][j] === 'comodin') {
                // Si es un comodín y no se ha alcanzado el límite, dibuja la imagen
                const img_comodin = new Image();
                img_comodin.src = "img/comodin.png";
                ctx.drawImage(img_comodin, x, y, celdaSize, celdaSize);
        } else if (matriz[i][j] === 'premio') {
            if (premiosPorColumna[j] < maxPremiosPorColumna && premiosTotales < maxPremiosTotales) {
                premiosPorColumna[j]++;
                premiosTotales++;
                // Si es un premio y no se ha alcanzado el límite, dibuja la imagen
                const img_premio = new Image();
                img_premio.src = "img/premio.jpg";

                const sound_premio = new Audio();
                sound_premio.src = "sonidos/sonidoPremio.mp3";
                sound_premio.play();

                ctx.drawImage(img_premio, x, y, celdaSize, celdaSize);
            } else {
                const opcionesTexto = ["A", "K", "Q", "J"];
                const opcionAleatoria = opcionesTexto[Math.floor(Math.random() * opcionesTexto.length)];
                ctx.fillText(opcionAleatoria, x + celdaSize / 2 - 10, y + celdaSize / 2 + 5);
            }
        } else if (matriz[i][j] === 'dinero') {
            // Si es "dinero", asigna un número aleatorio entre 120 y 1500
            const valorAleatorio = Math.floor(Math.random() * (1500 - 120) + 120);

            const sound_dinero = new Audio();
            sound_dinero.src = "sonidos/sonidoDinero.mp3";
            sound_dinero.play();

            // Dibuja un círculo con el número en su interior
            const centerX = x + celdaSize / 2;
            const centerY = y + celdaSize / 2;

            ctx.beginPath();
            ctx.arc(centerX, centerY, celdaSize / 2, 0, 2 * Math.PI);
            ctx.fillStyle = '#1cbf0d'; // Color dorado
            ctx.fill();
            ctx.stroke();

            ctx.font = '14px Arial';
            ctx.fillStyle = '#fff'; // Color del texto
            ctx.fillText( `$${valorAleatorio}`, centerX - 18, centerY + 5);
        } else {
            // Si no es una ficha especial, muestra el texto
            ctx.fillText(matriz[i][j], x + celdaSize / 2 - 10, y + celdaSize / 2 + 5);
        }
    }

    // Iterar sobre cada columna
    for (let j = 0; j < MAXCOLUMNA; j++) {
        premiosTotales = 0;
        for (let i = 0; i < MAXFILA; i++) {
            setTimeout(() => {
                dibujarFicha(i, j);
            }, i * 50 + j * 600);
        }
    }
}



async function girarColumna(columnaIndex) {
    const fichas = matriz.map(fila => fila[columnaIndex]);
    const columnas = document.querySelectorAll('.matriz-columna');

    for (let i = 0; i < fichas.length; i++) {
        await delay(200);
        matriz[i][columnaIndex] = fichas[i];

        dibujarMatriz();

        if (i === fichas.length - 1) {
            columnas[columnaIndex].classList.remove('girando');
        }
    }
}

function delay(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

async function girarRuleta() {
    matriz.length = 0; // Limpiar la matriz antes de cada giro

    // Actualiza la matriz con valores aleatorios
    for (let i = 0; i < MAXFILA; i++) {
        matriz[i] = [];
        for (let j = 0; j < MAXCOLUMNA; j++) {
            const randomValue = Math.floor(Math.random() * Object.keys(fichas).length) + 1;
            matriz[i][j] = fichas[randomValue];
        }
    }

    // Dibuja la matriz actualizada en el canvas
    dibujarMatriz();

    // Girar las columnas con animación secuencial
    const columnas = Array.from(document.querySelectorAll('.matriz-container > div'));

    // Utilizar reduce para ejecutar las animaciones en orden
    await columnas.reduce(async (prevPromise, columna, i) => {
        await prevPromise;
        await girarColumna(columna, i);
    }, Promise.resolve());

    // Verificar las líneas después de cada giro
    verificarLineas();
}

async function girarColumna(columna, columnaIndex) {
    return new Promise(resolve => {
        setTimeout(() => {
            columna.style.transform = 'translateY(100%)';
            setTimeout(() => {
                columna.style.transform = 'translateY(0)';
                resolve();
            }, 500); // Tiempo de espera más corto
        }, 1500 * columnaIndex);
    });
}


// Llama a la función al cargar la página
document.addEventListener('DOMContentLoaded', girarRuleta);

// Agrega un evento al botón "Girar" para llamar a la función cuando se presiona
const girarBtn = document.getElementById('girar-btn');
girarBtn.addEventListener('click', girarRuleta);
