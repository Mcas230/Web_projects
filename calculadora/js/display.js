import {
    calcular,
    prepararExpresion,
    compilar
} from "./parser.js";

const grafica =
    document.getElementById("grafica");

const contexto =
    grafica.getContext("2d");


let centroX = 300;
let centroY = 200;
let escala = 20;


// ============================================
// CÁMARA
// ============================================

let desplazamientoX = 0;
let desplazamientoY = 0;

let arrastrando = false;

let ultimoMouseX = 0;
let ultimoMouseY = 0;


// Última expresión dibujada.
// Permite redibujar al mover o hacer zoom.
let expresionActual = null;


const limiteX = 15;
const limiteY = 15;

const pasoEcuacion = 0.025;

const extensionSegmento =
    pasoEcuacion * 1.2;


contexto.strokeStyle = "white";
contexto.lineWidth = 3;


// ============================================
// DIBUJAR EJES
// ============================================

function dibujarEjes() {

    // EJE X

    contexto.beginPath();

    contexto.moveTo(
        0,
        centroY + desplazamientoY
    );

    contexto.lineTo(
        600,
        centroY + desplazamientoY
    );

    contexto.stroke();


    // EJE Y

    contexto.beginPath();

    contexto.moveTo(
        centroX + desplazamientoX,
        0
    );

    contexto.lineTo(
        centroX + desplazamientoX,
        400
    );

    contexto.stroke();
}


// ============================================
// CALCULAR DIFERENCIA
// ============================================

function calcularDiferencia(
    resultado,
    x,
    y
) {

    return (
        resultado.izquierdaCompilada(x, y) -
        resultado.derechaCompilada(x, y)
    );
}


// ============================================
// INTERPOLAR PUNTO
// ============================================

function interpolarPunto(
    x1,
    y1,
    valor1,
    x2,
    y2,
    valor2
) {

    const diferencia =
        valor1 - valor2;


    if (
        diferencia == 0
    ) {

        return {
            x: (x1 + x2) / 2,
            y: (y1 + y2) / 2
        };
    }


    const porcentaje =
        valor1 /
        diferencia;


    return {
        x:
            x1 +
            (x2 - x1) * porcentaje,

        y:
            y1 +
            (y2 - y1) * porcentaje
    };
}


// ============================================
// CONVERTIR COORDENADAS
// ============================================

function convertirX(x) {

    return (
        centroX +
        desplazamientoX +
        x * escala
    );
}


function convertirY(y) {

    return (
        centroY +
        desplazamientoY -
        y * escala
    );
}


// ============================================
// CONVERTIR PANTALLA → MUNDO
// ============================================

function convertirMundoX(
    pantallaX
) {

    return (
        pantallaX -
        centroX -
        desplazamientoX
    ) / escala;
}


function convertirMundoY(
    pantallaY
) {

    return (
        centroY +
        desplazamientoY -
        pantallaY
    ) / escala;
}


// ============================================
// OBTENER LÍMITES VISIBLES
// ============================================

function obtenerLimitesVisibles() {

    return {
        minimoX:
            convertirMundoX(0),

        maximoX:
            convertirMundoX(600),

        minimoY:
            convertirMundoY(400),

        maximoY:
            convertirMundoY(0)
    };
}


// ============================================
// OBTENER PASO ADAPTATIVO DE CUADRÍCULA
// ============================================

function obtenerPasoCuadricula() {

    // Queremos aproximadamente esta cantidad
    // de píxeles entre líneas.

    const pixelesDeseados = 60;


    // Cuántas unidades matemáticas caben en
    // los píxeles deseados.

    const pasoAproximado =
        pixelesDeseados / escala;


    // Potencia de 10 más cercana.

    const potencia =
        Math.pow(
            10,
            Math.floor(
                Math.log10(pasoAproximado)
            )
        );


    const normalizado =
        pasoAproximado /
        potencia;


    let multiplicador;


    if (
        normalizado <= 1
    ) {

        multiplicador = 1;

    }

    else if (
        normalizado <= 2
    ) {

        multiplicador = 2;

    }

    else if (
        normalizado <= 5
    ) {

        multiplicador = 5;

    }

    else {

        multiplicador = 10;
    }


    return (
        multiplicador *
        potencia
    );
}


// ============================================
// FORMATEAR NÚMEROS
// ============================================

function formatearNumero(
    numero
) {

    if (
        Number.isInteger(numero)
    ) {

        return numero.toString();
    }


    return numero
        .toFixed(10)
        .replace(
            /\.?0+$/,
            ""
        );
}


// ============================================
// DIBUJAR SEGMENTO
// ============================================

function dibujarSegmento(
    punto1,
    punto2
) {

    const dx =
        punto2.x - punto1.x;

    const dy =
        punto2.y - punto1.y;


    const distancia =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distancia == 0
    ) {

        return;
    }


    const direccionX =
        dx / distancia;

    const direccionY =
        dy / distancia;


    const inicioX =
        punto1.x -
        direccionX *
        extensionSegmento;

    const inicioY =
        punto1.y -
        direccionY *
        extensionSegmento;


    const finalX =
        punto2.x +
        direccionX *
        extensionSegmento;

    const finalY =
        punto2.y +
        direccionY *
        extensionSegmento;


    contexto.moveTo(
        convertirX(inicioX),
        convertirY(inicioY)
    );


    contexto.lineTo(
        convertirX(finalX),
        convertirY(finalY)
    );
}


// ============================================
// DIBUJAR ECUACIÓN
// MARCHING SQUARES
// ============================================

function graficarEcuacion(
    resultado
) {

    const columnas =
        Math.round(
            (limiteX * 2) /
            pasoEcuacion
        );

    const filas =
        Math.round(
            (limiteY * 2) /
            pasoEcuacion
        );


    // ========================================
    // CREAR CUADRÍCULA
    // ========================================

    const valores =
        new Array(
            filas + 1
        );


    for (
        let fila = 0;
        fila <= filas;
        fila++
    ) {

        const filaValores =
            new Float64Array(
                columnas + 1
            );


        const y =
            -limiteY +
            fila * pasoEcuacion;


        for (
            let columna = 0;
            columna <= columnas;
            columna++
        ) {

            const x =
                -limiteX +
                columna * pasoEcuacion;


            filaValores[columna] =
                calcularDiferencia(
                    resultado,
                    x,
                    y
                );
        }


        valores[fila] =
            filaValores;
    }


    contexto.beginPath();


    // ========================================
    // RECORRER CADA CELDA
    // ========================================

    for (
        let fila = 0;
        fila < filas;
        fila++
    ) {

        const filaAbajo =
            valores[fila];

        const filaArriba =
            valores[fila + 1];


        const y =
            -limiteY +
            fila * pasoEcuacion;

        const yArriba =
            y + pasoEcuacion;


        for (
            let columna = 0;
            columna < columnas;
            columna++
        ) {

            const x =
                -limiteX +
                columna * pasoEcuacion;

            const xDerecha =
                x + pasoEcuacion;


            // ====================================
            // ESQUINAS
            // ====================================

            const valorAbajoIzquierda =
                filaAbajo[columna];

            const valorAbajoDerecha =
                filaAbajo[columna + 1];

            const valorArribaIzquierda =
                filaArriba[columna];

            const valorArribaDerecha =
                filaArriba[columna + 1];


            // ====================================
            // PUNTOS
            // ====================================

            let punto1 = null;
            let punto2 = null;
            let punto3 = null;
            let punto4 = null;

            let cantidadPuntos = 0;


            // ====================================
            // BORDE INFERIOR
            // ====================================

            if (
                (
                    valorAbajoIzquierda < 0 &&
                    valorAbajoDerecha > 0
                ) ||
                (
                    valorAbajoIzquierda > 0 &&
                    valorAbajoDerecha < 0
                )
            ) {

                punto1 =
                    interpolarPunto(
                        x,
                        y,
                        valorAbajoIzquierda,

                        xDerecha,
                        y,
                        valorAbajoDerecha
                    );

                cantidadPuntos++;
            }


            // ====================================
            // BORDE DERECHO
            // ====================================

            if (
                (
                    valorAbajoDerecha < 0 &&
                    valorArribaDerecha > 0
                ) ||
                (
                    valorAbajoDerecha > 0 &&
                    valorArribaDerecha < 0
                )
            ) {

                const punto =
                    interpolarPunto(
                        xDerecha,
                        y,
                        valorAbajoDerecha,

                        xDerecha,
                        yArriba,
                        valorArribaDerecha
                    );


                if (
                    cantidadPuntos == 0
                ) {

                    punto1 = punto;

                }

                else if (
                    cantidadPuntos == 1
                ) {

                    punto2 = punto;

                }

                else if (
                    cantidadPuntos == 2
                ) {

                    punto3 = punto;

                }

                else {

                    punto4 = punto;
                }


                cantidadPuntos++;
            }


            // ====================================
            // BORDE SUPERIOR
            // ====================================

            if (
                (
                    valorArribaIzquierda < 0 &&
                    valorArribaDerecha > 0
                ) ||
                (
                    valorArribaIzquierda > 0 &&
                    valorArribaDerecha < 0
                )
            ) {

                const punto =
                    interpolarPunto(
                        x,
                        yArriba,
                        valorArribaIzquierda,

                        xDerecha,
                        yArriba,
                        valorArribaDerecha
                    );


                if (
                    cantidadPuntos == 0
                ) {

                    punto1 = punto;

                }

                else if (
                    cantidadPuntos == 1
                ) {

                    punto2 = punto;

                }

                else if (
                    cantidadPuntos == 2
                ) {

                    punto3 = punto;

                }

                else {

                    punto4 = punto;
                }


                cantidadPuntos++;
            }


            // ====================================
            // BORDE IZQUIERDO
            // ====================================

            if (
                (
                    valorAbajoIzquierda < 0 &&
                    valorArribaIzquierda > 0
                ) ||
                (
                    valorAbajoIzquierda > 0 &&
                    valorArribaIzquierda < 0
                )
            ) {

                const punto =
                    interpolarPunto(
                        x,
                        y,
                        valorAbajoIzquierda,

                        x,
                        yArriba,
                        valorArribaIzquierda
                    );


                if (
                    cantidadPuntos == 0
                ) {

                    punto1 = punto;

                }

                else if (
                    cantidadPuntos == 1
                ) {

                    punto2 = punto;

                }

                else if (
                    cantidadPuntos == 2
                ) {

                    punto3 = punto;

                }

                else {

                    punto4 = punto;
                }


                cantidadPuntos++;
            }


            // ====================================
            // SEGMENTO NORMAL
            // ====================================

            if (
                cantidadPuntos == 2
            ) {

                dibujarSegmento(
                    punto1,
                    punto2
                );
            }


            // ====================================
            // CASO AMBIGUO
            // ====================================

            else if (
                cantidadPuntos == 4
            ) {

                const centro =
                    calcularDiferencia(
                        resultado,

                        x +
                        pasoEcuacion / 2,

                        y +
                        pasoEcuacion / 2
                    );


                if (
                    centro > 0
                ) {

                    dibujarSegmento(
                        punto1,
                        punto2
                    );

                    dibujarSegmento(
                        punto3,
                        punto4
                    );

                }

                else {

                    dibujarSegmento(
                        punto1,
                        punto4
                    );

                    dibujarSegmento(
                        punto2,
                        punto3
                    );
                }
            }
        }
    }


    contexto.stroke();
}


// ============================================
// GRAFICAR
// ============================================

function graficar(
    expresion
) {

    // Guardar la expresión actual para
    // poder redibujar al mover o hacer zoom.

    expresionActual =
        expresion;


    contexto.clearRect(
        0,
        0,
        600,
        400
    );


    dibujarCuadricula();

    dibujarEjes();

    dibujarNumeros();


    // ========================================
    // OBTENER TIPO
    // ========================================

    const resultadoInicial =
        calcular(
            expresion
        );


    const esEcuacion =
        typeof resultadoInicial == "object" &&
        resultadoInicial.tipo == "ecuacion";


    const esFuncion =
        typeof resultadoInicial == "object" &&
        resultadoInicial.tipo != "ecuacion";


    // ========================================
    // ECUACIÓN
    // ========================================

    if (
        esEcuacion
    ) {

        graficarEcuacion(
            resultadoInicial
        );

        return;
    }


    // ========================================
    // FUNCIÓN
    // ========================================

    if (
        esFuncion
    ) {

        const expresionPreparada =
            resultadoInicial.expresionPreparada;


        // COMPILAR UNA SOLA VEZ

        const funcionCompilada =
            compilar(
                expresionPreparada,
                [
                    resultadoInicial.variable
                ]
            );


        // Obtener el rango matemático
        // que actualmente está visible.

        const limites =
            obtenerLimitesVisibles();


        contexto.beginPath();

        let primerPunto = true;


        for (
            let x = limites.minimoX;
            x <= limites.maximoX;
            x += 0.05
        ) {

            const y =
                funcionCompilada(
                    x
                );


            if (
                typeof y != "number" ||
                !Number.isFinite(y)
            ) {

                primerPunto = true;

                continue;
            }


            const pantallaX =
                convertirX(x);

            const pantallaY =
                convertirY(y);


            if (
                primerPunto
            ) {

                contexto.moveTo(
                    pantallaX,
                    pantallaY
                );

                primerPunto = false;
            }

            else {

                contexto.lineTo(
                    pantallaX,
                    pantallaY
                );
            }
        }


        contexto.stroke();

        return;
    }


    // ========================================
    // EXPRESIÓN NORMAL
    // ========================================

    /*
        Primero usamos calcular() para conservar
        exactamente la validación que ya tenía
        el parser.

        Si la expresión no produce un número
        usando x, no la dibujamos.
    */

    const prueba =
        calcular(
            expresion,
            {
                x: 0
            }
        );


    if (
        typeof prueba != "number"
    ) {

        return;
    }


    /*
        La expresión ya fue validada.

        Ahora la preparamos y compilamos una
        sola vez en lugar de llamar calcular()
        para cada punto.
    */

    let expresionPreparada =
        prepararExpresion(
            expresion
        );


    const funcionCompilada =
        compilar(
            expresionPreparada,
            ["x"]
        );


    // Obtener el rango matemático
    // que actualmente está visible.

    const limites =
        obtenerLimitesVisibles();


    contexto.beginPath();

    let primerPunto = true;


    for (
        let x = limites.minimoX;
        x <= limites.maximoX;
        x += 0.05
    ) {

        const y =
            funcionCompilada(
                x
            );


        if (
            typeof y != "number" ||
            !Number.isFinite(y)
        ) {

            primerPunto = true;

            continue;
        }


        const pantallaX =
            convertirX(x);

        const pantallaY =
            convertirY(y);


        if (
            primerPunto
        ) {

            contexto.moveTo(
                pantallaX,
                pantallaY
            );

            primerPunto = false;
        }

        else {

            contexto.lineTo(
                pantallaX,
                pantallaY
            );
        }
    }


    contexto.stroke();
}


// ============================================
// ARRASTRAR GRÁFICA
// ============================================

grafica.addEventListener(
    "mousedown",
    (evento) => {

        arrastrando = true;

        ultimoMouseX =
            evento.offsetX;

        ultimoMouseY =
            evento.offsetY;
    }
);


grafica.addEventListener(
    "mousemove",
    (evento) => {

        if (!arrastrando) {
            return;
        }


        const diferenciaX =
            evento.offsetX -
            ultimoMouseX;

        const diferenciaY =
            evento.offsetY -
            ultimoMouseY;


        desplazamientoX +=
            diferenciaX;

        desplazamientoY +=
            diferenciaY;


        ultimoMouseX =
            evento.offsetX;

        ultimoMouseY =
            evento.offsetY;


        if (
            expresionActual != null
        ) {

            graficar(
                expresionActual
            );
        }
    }
);


grafica.addEventListener(
    "mouseup",
    () => {

        arrastrando = false;
    }
);


grafica.addEventListener(
    "mouseleave",
    () => {

        arrastrando = false;
    }
);


// ============================================
// ZOOM
// ============================================

grafica.addEventListener(
    "wheel",
    (evento) => {

        evento.preventDefault();


        const mouseX =
            evento.offsetX;

        const mouseY =
            evento.offsetY;


        // Coordenada matemática que está
        // exactamente debajo del cursor.

        const mundoX =
            convertirMundoX(
                mouseX
            );

        const mundoY =
            convertirMundoY(
                mouseY
            );


        const factor =
            evento.deltaY < 0
                ? 1.1
                : 0.9;


        escala *= factor;

        // Zoom mínimo
        if (
            escala < 0.000000001
        ) {

            escala = 0.000000001;
        }

        // Zoom máximo
        if (
            escala > 1e15
        ) {

            escala = 1e15;
        }


        // Volvemos a calcular dónde quedó
        // el mismo punto matemático.

        const nuevoMouseX =
            convertirX(
                mundoX
            );

        const nuevoMouseY =
            convertirY(
                mundoY
            );


        // Ajustamos el desplazamiento para
        // que el punto permanezca bajo el cursor.

        desplazamientoX +=
            mouseX -
            nuevoMouseX;

        desplazamientoY +=
            mouseY -
            nuevoMouseY;


        if (
            expresionActual != null
        ) {

            graficar(
                expresionActual
            );
        }
    }
);


// ============================================
// EJES DESDE EL PRINCIPIO
// ============================================

dibujarEjes();


// ============================================
// DIBUJAR CUADRÍCULA
// ============================================

function dibujarCuadricula() {

    const limites =
        obtenerLimitesVisibles();

    const paso =
        obtenerPasoCuadricula();


    contexto.strokeStyle =
        "#333333";

    contexto.lineWidth =
        1;


    // ========================================
    // LÍNEAS VERTICALES
    // ========================================

    const inicioX =
        Math.ceil(
            limites.minimoX /
            paso
        ) * paso;

    const finalX =
        Math.floor(
            limites.maximoX /
            paso
        ) * paso;


    for (
        let x = inicioX;
        x <= finalX;
        x += paso
    ) {

        const pantallaX =
            convertirX(x);


        contexto.beginPath();

        contexto.moveTo(
            pantallaX,
            0
        );

        contexto.lineTo(
            pantallaX,
            400
        );

        contexto.stroke();
    }


    // ========================================
    // LÍNEAS HORIZONTALES
    // ========================================

    const inicioY =
        Math.ceil(
            limites.minimoY /
            paso
        ) * paso;

    const finalY =
        Math.floor(
            limites.maximoY /
            paso
        ) * paso;


    for (
        let y = inicioY;
        y <= finalY;
        y += paso
    ) {

        const pantallaY =
            convertirY(y);


        contexto.beginPath();

        contexto.moveTo(
            0,
            pantallaY
        );

        contexto.lineTo(
            600,
            pantallaY
        );

        contexto.stroke();
    }


    // Volver al estilo de la gráfica

    contexto.strokeStyle =
        "white";

    contexto.lineWidth =
        3;
}


// ============================================
// DIBUJAR NÚMEROS
// ============================================

function dibujarNumeros() {

    const limites =
        obtenerLimitesVisibles();

    const paso =
        obtenerPasoCuadricula();


    contexto.fillStyle =
        "#aaaaaa";

    contexto.font =
        "12px Arial";


    // ========================================
    // NÚMEROS DEL EJE X
    // ========================================

    const inicioX =
        Math.ceil(
            limites.minimoX /
            paso
        ) * paso;

    const finalX =
        Math.floor(
            limites.maximoX /
            paso
        ) * paso;


    for (
        let x = inicioX;
        x <= finalX;
        x += paso
    ) {

        // No dibujar el 0 porque el eje
        // ya ocupa esa posición.

        if (
            Math.abs(x) <
            paso / 1000
        ) {

            continue;
        }


        const pantallaX =
            convertirX(x);

        const ejeY =
            centroY +
            desplazamientoY;


        // Evitar números fuera del canvas

        if (
            pantallaX < 0 ||
            pantallaX > 600
        ) {

            continue;
        }


        contexto.fillText(
            formatearNumero(x),
            pantallaX + 4,
            ejeY - 5
        );
    }


    // ========================================
    // NÚMEROS DEL EJE Y
    // ========================================

    const inicioY =
        Math.ceil(
            limites.minimoY /
            paso
        ) * paso;

    const finalY =
        Math.floor(
            limites.maximoY /
            paso
        ) * paso;


    for (
        let y = inicioY;
        y <= finalY;
        y += paso
    ) {

        // No dibujar el 0 porque el eje
        // ya ocupa esa posición.

        if (
            Math.abs(y) <
            paso / 1000
        ) {

            continue;
        }


        const pantallaY =
            convertirY(y);

        const ejeX =
            centroX +
            desplazamientoX;


        // Evitar números fuera del canvas

        if (
            pantallaY < 0 ||
            pantallaY > 400
        ) {

            continue;
        }


        contexto.fillText(
            formatearNumero(y),
            ejeX + 5,
            pantallaY - 5
        );
    }


    contexto.fillStyle =
        "white";
}


export {
    graficar
};