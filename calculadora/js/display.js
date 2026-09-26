import {
    calcular,
    prepararExpresion,
    compilar
} from "./parser.js";

const grafica =
    document.getElementById("grafica");

const contexto =
    grafica.getContext("2d");

const visualizacion =
    grafica.parentElement;


// ============================================
// TAMAÑO REAL DE LA GRÁFICA
// ============================================

let anchoGrafica = 0;
let altoGrafica = 0;


// ============================================
// CÁMARA
// ============================================

let centroX = 0;
let centroY = 0;

let escala = 20;

let desplazamientoX = 0;
let desplazamientoY = 0;

let arrastrando = false;

let ultimoMouseX = 0;
let ultimoMouseY = 0;


// Última expresión dibujada.

let expresionActual = null;


// ============================================
// CONFIGURACIÓN DEL RENDERER
// ============================================

const pixelesPorMuestra = 2;

const minimoMuestras = 2;
const maximoMuestras = 1200;


// ============================================
// AJUSTAR CANVAS
// ============================================

function ajustarCanvas() {

    const rectangulo =
        visualizacion.getBoundingClientRect();

    const nuevoAncho =
        Math.max(
            1,
            Math.round(rectangulo.width)
        );

    const nuevoAlto =
        Math.max(
            1,
            Math.round(rectangulo.height)
        );


    if (
        nuevoAncho == anchoGrafica &&
        nuevoAlto == altoGrafica
    ) {
        return;
    }


    // ========================================
    // CONSERVAR EL CENTRO MATEMÁTICO
    // ========================================

    let mundoCentroX = 0;
    let mundoCentroY = 0;


    if (
        anchoGrafica > 0 &&
        altoGrafica > 0
    ) {

        mundoCentroX =
            convertirMundoX(
                anchoGrafica / 2
            );

        mundoCentroY =
            convertirMundoY(
                altoGrafica / 2
            );
    }


    anchoGrafica =
        nuevoAncho;

    altoGrafica =
        nuevoAlto;


    centroX =
        anchoGrafica / 2;

    centroY =
        altoGrafica / 2;


    // ========================================
    // CONSERVAR EL CENTRO
    // ========================================

    desplazamientoX =
        -mundoCentroX * escala;

    desplazamientoY =
        mundoCentroY * escala;


    // ========================================
    // RESOLUCIÓN REAL DEL CANVAS
    // ========================================

    grafica.width =
        anchoGrafica;

    grafica.height =
        altoGrafica;


    // ========================================
    // REDIBUJAR
    // ========================================

    if (
        expresionActual != null
    ) {

        graficar(
            expresionActual
        );

    } else {

        dibujarCuadricula();
        dibujarEjes();
        dibujarNumeros();
    }
}


// ============================================
// CÁMARA → MUESTREO
// ============================================

function obtenerPasoEcuacion(
    minimo,
    maximo,
    pixeles
) {

    const rango =
        maximo - minimo;


    if (
        !Number.isFinite(rango) ||
        rango <= 0
    ) {
        return 1;
    }


    let paso =
        pixelesPorMuestra /
        escala;


    if (
        !Number.isFinite(paso) ||
        paso <= 0
    ) {

        paso =
            rango / 300;
    }


    // ========================================
    // EVITAR DEMASIADAS MUESTRAS
    // ========================================

    const muestras =
        rango / paso;


    if (
        muestras > maximoMuestras
    ) {

        paso =
            rango / maximoMuestras;
    }


    // ========================================
    // EVITAR MUY POCAS MUESTRAS
    // ========================================

    const muestrasFinales =
        rango / paso;


    if (
        muestrasFinales < minimoMuestras
    ) {

        paso =
            rango / minimoMuestras;
    }


    return paso;
}


// ============================================
// DIBUJAR EJES
// ============================================

function dibujarEjes() {

    const ejeX =
        centroY +
        desplazamientoY;

    const ejeY =
        centroX +
        desplazamientoX;


    contexto.strokeStyle =
        "white";

    contexto.lineWidth =
        3;


    // EJE X

    contexto.beginPath();

    contexto.moveTo(
        0,
        ejeX
    );

    contexto.lineTo(
        anchoGrafica,
        ejeX
    );

    contexto.stroke();


    // EJE Y

    contexto.beginPath();

    contexto.moveTo(
        ejeY,
        0
    );

    contexto.lineTo(
        ejeY,
        altoGrafica
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
            (x2 - x1) *
            porcentaje,

        y:
            y1 +
            (y2 - y1) *
            porcentaje
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
// PANTALLA → MUNDO
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
// LÍMITES VISIBLES
// ============================================

function obtenerLimitesVisibles() {

    return {

        minimoX:
            convertirMundoX(0),

        maximoX:
            convertirMundoX(
                anchoGrafica
            ),

        minimoY:
            convertirMundoY(
                altoGrafica
            ),

        maximoY:
            convertirMundoY(0)
    };
}


// ============================================
// PASO ADAPTATIVO DE CUADRÍCULA
// ============================================

function obtenerPasoCuadricula() {

    const pixelesDeseados =
        60;


    const pasoAproximado =
        pixelesDeseados /
        escala;


    if (
        !Number.isFinite(
            pasoAproximado
        ) ||
        pasoAproximado <= 0
    ) {

        return 1;
    }


    const potencia =
        Math.pow(
            10,
            Math.floor(
                Math.log10(
                    pasoAproximado
                )
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
    punto2,
    extension
) {

    const dx =
        punto2.x -
        punto1.x;

    const dy =
        punto2.y -
        punto1.y;


    const distancia =
        Math.sqrt(
            dx * dx +
            dy * dy
        );


    if (
        distancia == 0 ||
        !Number.isFinite(
            distancia
        )
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
        extension;

    const inicioY =
        punto1.y -
        direccionY *
        extension;


    const finalX =
        punto2.x +
        direccionX *
        extension;

    const finalY =
        punto2.y +
        direccionY *
        extension;


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
// MARCHING SQUARES ADAPTATIVO
// ============================================

function graficarEcuacion(
    resultado
) {

    const limites =
        obtenerLimitesVisibles();


    // ========================================
    // PASO ADAPTATIVO
    // ========================================

    const pasoX =
        obtenerPasoEcuacion(
            limites.minimoX,
            limites.maximoX,
            anchoGrafica
        );


    const pasoY =
        obtenerPasoEcuacion(
            limites.minimoY,
            limites.maximoY,
            altoGrafica
        );


    const extensionSegmento =
        Math.max(
            Math.min(
                Math.min(
                    pasoX,
                    pasoY
                ) * 0.15,

                1 / escala
            ),

            0
        );


    // ========================================
    // CANTIDAD DE CELDAS
    // ========================================

    const columnas =
        Math.max(
            1,
            Math.ceil(
                (
                    limites.maximoX -
                    limites.minimoX
                ) / pasoX
            )
        );


    const filas =
        Math.max(
            1,
            Math.ceil(
                (
                    limites.maximoY -
                    limites.minimoY
                ) / pasoY
            )
        );


    // ========================================
    // COORDENADAS
    // ========================================

    const posicionesX =
        new Float64Array(
            columnas + 1
        );

    const posicionesY =
        new Float64Array(
            filas + 1
        );


    for (
        let columna = 0;
        columna <= columnas;
        columna++
    ) {

        posicionesX[columna] =
            Math.min(
                limites.minimoX +
                columna * pasoX,

                limites.maximoX
            );
    }


    for (
        let fila = 0;
        fila <= filas;
        fila++
    ) {

        posicionesY[fila] =
            Math.min(
                limites.minimoY +
                fila * pasoY,

                limites.maximoY
            );
    }


    // ========================================
    // VALORES
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
            posicionesY[fila];


        for (
            let columna = 0;
            columna <= columnas;
            columna++
        ) {

            const x =
                posicionesX[columna];


            const valor =
                calcularDiferencia(
                    resultado,
                    x,
                    y
                );


            filaValores[columna] =
                Number.isFinite(valor)
                    ? valor
                    : NaN;
        }


        valores[fila] =
            filaValores;
    }


    contexto.beginPath();


    // ========================================
    // RECORRER CELDAS
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
            posicionesY[fila];

        const yArriba =
            posicionesY[fila + 1];


        const alturaCelda =
            yArriba - y;


        for (
            let columna = 0;
            columna < columnas;
            columna++
        ) {

            const x =
                posicionesX[columna];

            const xDerecha =
                posicionesX[columna + 1];


            const anchoCelda =
                xDerecha - x;


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


            if (
                !Number.isFinite(
                    valorAbajoIzquierda
                ) ||
                !Number.isFinite(
                    valorAbajoDerecha
                ) ||
                !Number.isFinite(
                    valorArribaIzquierda
                ) ||
                !Number.isFinite(
                    valorArribaDerecha
                )
            ) {

                continue;
            }


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
                    punto2,
                    extensionSegmento
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
                        anchoCelda / 2,

                        y +
                        alturaCelda / 2
                    );


                if (
                    Number.isFinite(
                        centro
                    )
                ) {

                    if (
                        centro > 0
                    ) {

                        dibujarSegmento(
                            punto1,
                            punto2,
                            extensionSegmento
                        );

                        dibujarSegmento(
                            punto3,
                            punto4,
                            extensionSegmento
                        );

                    }

                    else {

                        dibujarSegmento(
                            punto1,
                            punto4,
                            extensionSegmento
                        );

                        dibujarSegmento(
                            punto2,
                            punto3,
                            extensionSegmento
                        );
                    }
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

    expresionActual =
        expresion;


    // ========================================
    // LIMPIAR TODO EL CANVAS
    // ========================================

    contexto.clearRect(
        0,
        0,
        anchoGrafica,
        altoGrafica
    );


    // ========================================
    // FONDO
    // ========================================

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
        resultadoInicial != null &&
        resultadoInicial.tipo ==
            "ecuacion";


    const esFuncion =
        typeof resultadoInicial == "object" &&
        resultadoInicial != null &&
        resultadoInicial.tipo !=
            "ecuacion";


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


        const funcionCompilada =
            compilar(
                expresionPreparada,
                [
                    resultadoInicial.variable
                ]
            );


        dibujarFuncion(
            funcionCompilada
        );

        return;
    }


    // ========================================
    // EXPRESIÓN NORMAL
    // ========================================

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


    const expresionPreparada =
        prepararExpresion(
            expresion
        );


    const funcionCompilada =
        compilar(
            expresionPreparada,
            ["x"]
        );


    dibujarFuncion(
        funcionCompilada
    );
}


// ============================================
// DIBUJAR FUNCIÓN
// ============================================

function dibujarFuncion(
    funcionCompilada
) {

    const limites =
        obtenerLimitesVisibles();


    const paso =
        obtenerPasoEcuacion(
            limites.minimoX,
            limites.maximoX,
            anchoGrafica
        );


    const cantidadMuestras =
        Math.max(
            1,
            Math.ceil(
                (
                    limites.maximoX -
                    limites.minimoX
                ) / paso
            )
        );


    contexto.beginPath();


    let primerPunto = true;


    for (
        let i = 0;
        i <= cantidadMuestras;
        i++
    ) {

        const x =
            Math.min(
                limites.minimoX +
                i * paso,

                limites.maximoX
            );


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
            !Number.isFinite(
                pantallaX
            ) ||
            !Number.isFinite(
                pantallaY
            )
        ) {

            primerPunto = true;

            continue;
        }


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


        const rectangulo =
            grafica.getBoundingClientRect();


        ultimoMouseX =
            evento.clientX -
            rectangulo.left;

        ultimoMouseY =
            evento.clientY -
            rectangulo.top;
    }
);


grafica.addEventListener(
    "mousemove",
    (evento) => {

        if (!arrastrando) {
            return;
        }


        const rectangulo =
            grafica.getBoundingClientRect();


        const mouseX =
            evento.clientX -
            rectangulo.left;

        const mouseY =
            evento.clientY -
            rectangulo.top;


        const diferenciaX =
            mouseX -
            ultimoMouseX;

        const diferenciaY =
            mouseY -
            ultimoMouseY;


        desplazamientoX +=
            diferenciaX;

        desplazamientoY +=
            diferenciaY;


        ultimoMouseX =
            mouseX;

        ultimoMouseY =
            mouseY;


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


        const rectangulo =
            grafica.getBoundingClientRect();


        const mouseX =
            evento.clientX -
            rectangulo.left;

        const mouseY =
            evento.clientY -
            rectangulo.top;


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


        if (
            escala < 0.000000001
        ) {

            escala =
                0.000000001;
        }


        if (
            escala > 1e15
        ) {

            escala =
                1e15;
        }


        const nuevoMouseX =
            convertirX(
                mundoX
            );

        const nuevoMouseY =
            convertirY(
                mundoY
            );


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
// CUADRÍCULA
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
    // VERTICALES
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


    const cantidadLineasX =
        Math.ceil(
            (
                finalX -
                inicioX
            ) / paso
        );


    for (
        let i = 0;
        i <= cantidadLineasX;
        i++
    ) {

        const x =
            inicioX +
            i * paso;


        if (
            x > finalX
        ) {

            break;
        }


        const pantallaX =
            convertirX(x);


        if (
            pantallaX < 0 ||
            pantallaX > anchoGrafica
        ) {

            continue;
        }


        contexto.beginPath();

        contexto.moveTo(
            pantallaX,
            0
        );

        contexto.lineTo(
            pantallaX,
            altoGrafica
        );

        contexto.stroke();
    }


    // ========================================
    // HORIZONTALES
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


    const cantidadLineasY =
        Math.ceil(
            (
                finalY -
                inicioY
            ) / paso
        );


    for (
        let i = 0;
        i <= cantidadLineasY;
        i++
    ) {

        const y =
            inicioY +
            i * paso;


        if (
            y > finalY
        ) {

            break;
        }


        const pantallaY =
            convertirY(y);


        if (
            pantallaY < 0 ||
            pantallaY > altoGrafica
        ) {

            continue;
        }


        contexto.beginPath();

        contexto.moveTo(
            0,
            pantallaY
        );

        contexto.lineTo(
            anchoGrafica,
            pantallaY
        );

        contexto.stroke();
    }


    contexto.strokeStyle =
        "white";

    contexto.lineWidth =
        3;
}


// ============================================
// NÚMEROS
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
    // EJE X
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


    const cantidadNumerosX =
        Math.ceil(
            (
                finalX -
                inicioX
            ) / paso
        );


    for (
        let i = 0;
        i <= cantidadNumerosX;
        i++
    ) {

        const x =
            inicioX +
            i * paso;


        if (
            x > finalX
        ) {

            break;
        }


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


        if (
            pantallaX < 0 ||
            pantallaX > anchoGrafica
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
    // EJE Y
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


    const cantidadNumerosY =
        Math.ceil(
            (
                finalY -
                inicioY
            ) / paso
        );


    for (
        let i = 0;
        i <= cantidadNumerosY;
        i++
    ) {

        const y =
            inicioY +
            i * paso;


        if (
            y > finalY
        ) {

            break;
        }


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


        if (
            pantallaY < 0 ||
            pantallaY > altoGrafica
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


// ============================================
// OBSERVAR CAMBIOS DE TAMAÑO
// ============================================

const observador =
    new ResizeObserver(
        () => {

            ajustarCanvas();
        }
    );


observador.observe(
    visualizacion
);


// ============================================
// INICIALIZACIÓN
// ============================================

ajustarCanvas();


// ============================================
// EXPORTAR
// ============================================

export {
    graficar
};