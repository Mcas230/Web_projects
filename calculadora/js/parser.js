import * as operations from "./operations.js";


// ============================================
// CACHÉS
// ============================================

const expresionesPreparadas = new Map();
const expresionesCompiladas = new Map();


// ============================================
// FUNCIONES
// ============================================

const funciones =
    [
        "sin",
        "cos",
        "tan"
    ];


// ============================================
// PRIORIDAD
// ============================================

function prioridad(simbolo) {

    if (
        simbolo == "+" ||
        simbolo == "-"
    ) {
        return 1;
    }

    if (
        simbolo == "*" ||
        simbolo == "/"
    ) {
        return 2;
    }

    if (
        simbolo == "u+" ||
        simbolo == "u-" ||
        simbolo == "^"
    ) {
        return 3;
    }

    if (
        simbolo == "√" ||
        simbolo == "sin" ||
        simbolo == "cos" ||
        simbolo == "tan"
    ) {
        return 4;
    }

    return 0;
}


// ============================================
// COMPROBAR VARIABLE
// ============================================

function esVariable(simbolo) {

    return (
        typeof simbolo == "string" &&
        simbolo.length == 1 &&
        (
            simbolo >= "a" &&
            simbolo <= "z" ||
            simbolo >= "A" &&
            simbolo <= "Z"
        )
    );
}


// ============================================
// COMPROBAR FUNCIÓN
// ============================================

function obtenerFuncion(
    expresion,
    posicion
) {

    for (
        let i = 0;
        i < funciones.length;
        i++
    ) {

        let nombre =
            funciones[i];


        if (
            expresion.startsWith(
                nombre,
                posicion
            )
        ) {

            let siguiente =
                expresion[
                    posicion +
                    nombre.length
                ];


            if (
                siguiente == "("
            ) {

                return nombre;
            }
        }
    }


    return "";
}


// ============================================
// OBTENER VARIABLES REALES
// ============================================

function obtenerVariables(
    expresion
) {

    let variables = [];


    for (
        let i = 0;
        i < expresion.length;
        i++
    ) {

        let funcion =
            obtenerFuncion(
                expresion,
                i
            );


        if (
            funcion != ""
        ) {

            i +=
                funcion.length - 1;

            continue;
        }


        let caracter =
            expresion[i];


        if (
            esVariable(caracter) &&
            !variables.includes(caracter)
        ) {

            variables.push(
                caracter
            );
        }
    }


    return variables;
}


// ============================================
// PREPARAR EXPRESIÓN
// ============================================

function prepararExpresion(expresion) {

    // CACHÉ

    if (
        expresionesPreparadas.has(expresion)
    ) {

        return expresionesPreparadas.get(
            expresion
        );
    }


    let lista = [];
    let operadores = [];
    let numero = "";


    // ========================================
    // CONVERTIR A POSTFIJA
    // ========================================

    for (
        let i = 0;
        i < expresion.length;
        i++
    ) {

        let simbolo =
            expresion[i];


        // ====================================
        // NÚMERO
        // ====================================

        if (
            simbolo >= "0" &&
            simbolo <= "9"
        ) {

            numero += simbolo;

            continue;
        }


        // ====================================
        // FUNCIÓN
        // ====================================

        let funcion =
            obtenerFuncion(
                expresion,
                i
            );


        if (
            funcion != ""
        ) {

            // Guardar número anterior

            if (
                numero != ""
            ) {

                lista.push(
                    Number(numero)
                );

                numero = "";

                operadores.push(
                    "*"
                );
            }


            // Multiplicación implícita
            // después de un paréntesis

            if (
                i > 0 &&
                expresion[i - 1] == ")"
            ) {

                operadores.push(
                    "*"
                );
            }


            operadores.push(
                funcion
            );


            i +=
                funcion.length - 1;

            continue;
        }


        // ====================================
        // VARIABLE
        // ====================================

        if (
            esVariable(simbolo)
        ) {

            if (
                numero != ""
            ) {

                lista.push(
                    Number(numero)
                );

                numero = "";

                operadores.push(
                    "*"
                );
            }


            lista.push(
                simbolo
            );

            continue;
        }


        // ====================================
        // GUARDAR NÚMERO
        // ====================================

        if (
            numero != ""
        ) {

            lista.push(
                Number(numero)
            );

            numero = "";
        }


        // ====================================
        // PARÉNTESIS ABIERTO
        // ====================================

        if (
            simbolo == "("
        ) {

            if (
                i > 0
            ) {

                let anterior =
                    expresion[i - 1];


                if (
                    (
                        anterior >= "0" &&
                        anterior <= "9"
                    ) ||
                    anterior == ")"
                ) {

                    operadores.push(
                        "*"
                    );
                }
            }


            operadores.push(
                "("
            );

            continue;
        }


        // ====================================
        // PARÉNTESIS CERRADO
        // ====================================

        if (
            simbolo == ")"
        ) {

            while (
                operadores.length > 0 &&
                operadores[
                    operadores.length - 1
                ] != "("
            ) {

                lista.push(
                    operadores.pop()
                );
            }


            operadores.pop();

            continue;
        }


        // ====================================
        // RAÍZ
        // ====================================

        if (
            simbolo == "√"
        ) {

            if (
                i > 0
            ) {

                let anterior =
                    expresion[i - 1];


                if (
                    (
                        anterior >= "0" &&
                        anterior <= "9"
                    ) ||
                    anterior == ")"
                ) {

                    while (
                        operadores.length > 0 &&
                        operadores[
                            operadores.length - 1
                        ] != "(" &&
                        prioridad(
                            operadores[
                                operadores.length - 1
                            ]
                        ) >= prioridad("*")
                    ) {

                        lista.push(
                            operadores.pop()
                        );
                    }


                    operadores.push(
                        "*"
                    );
                }
            }


            operadores.push(
                "√"
            );

            continue;
        }


        // ====================================
        // OPERADORES
        // ====================================

        if (
            simbolo == "+" ||
            simbolo == "-" ||
            simbolo == "*" ||
            simbolo == "/" ||
            simbolo == "^"
        ) {

            let operador =
                simbolo;


            // UNARIO

            if (
                simbolo == "+" ||
                simbolo == "-"
            ) {

                let anterior =
                    expresion[i - 1];


                let unario =
                    i == 0 ||
                    anterior == "(" ||
                    anterior == "+" ||
                    anterior == "-" ||
                    anterior == "*" ||
                    anterior == "/" ||
                    anterior == "^";


                if (
                    unario
                ) {

                    operador =
                        simbolo == "+"
                        ? "u+"
                        : "u-";
                }
            }


            while (
                operadores.length > 0 &&
                operadores[
                    operadores.length - 1
                ] != "(" &&
                prioridad(
                    operadores[
                        operadores.length - 1
                    ]
                ) >= prioridad(
                    operador
                )
            ) {

                lista.push(
                    operadores.pop()
                );
            }


            operadores.push(
                operador
            );
        }
    }


    // ========================================
    // ÚLTIMO NÚMERO
    // ========================================

    if (
        numero != ""
    ) {

        lista.push(
            Number(numero)
        );
    }


    // ========================================
    // OPERADORES RESTANTES
    // ========================================

    while (
        operadores.length > 0
    ) {

        lista.push(
            operadores.pop()
        );
    }


    // ========================================
    // GUARDAR CACHÉ
    // ========================================

    expresionesPreparadas.set(
        expresion,
        lista
    );


    return lista;
}


// ============================================
// COMPILAR EXPRESIÓN
// ============================================

function compilar(
    lista,
    variables = ["x", "y"]
) {

    // Crear clave para caché

    let clave =
        lista.join("|") +
        "::" +
        variables.join(",");


    if (
        expresionesCompiladas.has(clave)
    ) {

        return expresionesCompiladas.get(
            clave
        );
    }


    let pila = [];


    // ========================================
    // CONVERTIR POSTFIJA A JAVASCRIPT
    // ========================================

    for (
        let i = 0;
        i < lista.length;
        i++
    ) {

        let elemento =
            lista[i];


        // ====================================
        // NÚMERO
        // ====================================

        if (
            typeof elemento == "number"
        ) {

            pila.push(
                String(elemento)
            );

            continue;
        }


        // ====================================
        // VARIABLE
        // ====================================

        if (
            esVariable(elemento)
        ) {

            pila.push(
                elemento
            );

            continue;
        }


        // ====================================
        // RAÍZ
        // ====================================

        if (
            elemento == "√"
        ) {

            let a =
                pila.pop();


            pila.push(
                `Math.sqrt(${a})`
            );

            continue;
        }


        // ====================================
        // SENO
        // ====================================

        if (
            elemento == "sin"
        ) {

            let a =
                pila.pop();


            pila.push(
                `Math.sin(${a})`
            );

            continue;
        }


        // ====================================
        // COSENO
        // ====================================

        if (
            elemento == "cos"
        ) {

            let a =
                pila.pop();


            pila.push(
                `Math.cos(${a})`
            );

            continue;
        }


        // ====================================
        // TANGENTE
        // ====================================

        if (
            elemento == "tan"
        ) {

            let a =
                pila.pop();


            pila.push(
                `Math.tan(${a})`
            );

            continue;
        }


        // ====================================
        // UNARIO NEGATIVO
        // ====================================

        if (
            elemento == "u-"
        ) {

            let a =
                pila.pop();


            pila.push(
                `(-(${a}))`
            );

            continue;
        }


        // ====================================
        // UNARIO POSITIVO
        // ====================================

        if (
            elemento == "u+"
        ) {

            let a =
                pila.pop();


            pila.push(
                `(+(${a}))`
            );

            continue;
        }


        // ====================================
        // OPERACIÓN BINARIA
        // ====================================

        let b =
            pila.pop();

        let a =
            pila.pop();


        if (
            elemento == "+"
        ) {

            pila.push(
                `(${a}+${b})`
            );
        }

        else if (
            elemento == "-"
        ) {

            pila.push(
                `(${a}-${b})`
            );
        }

        else if (
            elemento == "*"
        ) {

            pila.push(
                `(${a}*${b})`
            );
        }

        else if (
            elemento == "/"
        ) {

            pila.push(
                `(${a}/${b})`
            );
        }

        else if (
            elemento == "^"
        ) {

            pila.push(
                `(${a}**${b})`
            );
        }
    }


    let codigo =
        `return ${pila[0]};`;


    let funcion =
        new Function(
            ...variables,
            codigo
        );


    // ========================================
    // GUARDAR CACHÉ
    // ========================================

    expresionesCompiladas.set(
        clave,
        funcion
    );


    return funcion;
}


// ============================================
// EVALUAR EXPRESIÓN PREPARADA
// ============================================

function evaluar(
    lista,
    variables
) {

    let pila = [];


    for (
        let i = 0;
        i < lista.length;
        i++
    ) {

        let elemento =
            lista[i];


        // ====================================
        // NÚMERO
        // ====================================

        if (
            typeof elemento == "number"
        ) {

            pila.push(
                elemento
            );

            continue;
        }


        // ====================================
        // VARIABLE
        // ====================================

        if (
            esVariable(elemento)
        ) {

            let valor =
                variables[elemento];


            if (
                valor === undefined
            ) {

                return "";
            }


            pila.push(
                valor
            );

            continue;
        }


        // ====================================
        // RAÍZ
        // ====================================

        if (
            elemento == "√"
        ) {

            let a =
                pila.pop();


            pila.push(
                Math.sqrt(a)
            );

            continue;
        }


        // ====================================
        // SENO
        // ====================================

        if (
            elemento == "sin"
        ) {

            let a =
                pila.pop();


            pila.push(
                Math.sin(a)
            );

            continue;
        }


        // ====================================
        // COSENO
        // ====================================

        if (
            elemento == "cos"
        ) {

            let a =
                pila.pop();


            pila.push(
                Math.cos(a)
            );

            continue;
        }


        // ====================================
        // TANGENTE
        // ====================================

        if (
            elemento == "tan"
        ) {

            let a =
                pila.pop();


            pila.push(
                Math.tan(a)
            );

            continue;
        }


        // ====================================
        // UNARIO NEGATIVO
        // ====================================

        if (
            elemento == "u-"
        ) {

            pila.push(
                -pila.pop()
            );

            continue;
        }


        // ====================================
        // UNARIO POSITIVO
        // ====================================

        if (
            elemento == "u+"
        ) {

            continue;
        }


        // ====================================
        // OPERACIÓN
        // ====================================

        let b =
            pila.pop();

        let a =
            pila.pop();


        if (
            elemento == "+"
        ) {

            pila.push(
                operations.sum(a, b)
            );
        }

        else if (
            elemento == "-"
        ) {

            pila.push(
                operations.sub(a, b)
            );
        }

        else if (
            elemento == "*"
        ) {

            pila.push(
                operations.mult(a, b)
            );
        }

        else if (
            elemento == "/"
        ) {

            pila.push(
                operations.div(a, b)
            );
        }

        else if (
            elemento == "^"
        ) {

            pila.push(
                operations.pow(a, b)
            );
        }
    }


    return pila[0];
}


// ============================================
// CALCULAR
// ============================================

function calcular(
    expresion,
    variables = {}
) {

    let partes =
        expresion.split("=");


    // ========================================
    // MÁS DE UN "="
    // ========================================

    if (
        partes.length > 2
    ) {

        return "";
    }


    // ========================================
    // ECUACIÓN
    // ========================================

    if (
        partes.length == 2
    ) {

        let izquierda =
            partes[0].trim();

        let derecha =
            partes[1].trim();


        let parentesis =
            izquierda.indexOf("(");


        // Obtener variables reales
        // ignorando nombres de funciones

        let variablesIzquierda =
            obtenerVariables(
                izquierda
            );

        let variablesDerecha =
            obtenerVariables(
                derecha
            );


        let variablesEcuacion =
            [];


        for (
            let i = 0;
            i < variablesIzquierda.length;
            i++
        ) {

            if (
                !variablesEcuacion.includes(
                    variablesIzquierda[i]
                )
            ) {

                variablesEcuacion.push(
                    variablesIzquierda[i]
                );
            }
        }


        for (
            let i = 0;
            i < variablesDerecha.length;
            i++
        ) {

            if (
                !variablesEcuacion.includes(
                    variablesDerecha[i]
                )
            ) {

                variablesEcuacion.push(
                    variablesDerecha[i]
                );
            }
        }


        // ====================================
        // ECUACIÓN IMPLÍCITA
        // ====================================

        if (
            variablesEcuacion.length >= 2
        ) {

            let izquierdaPreparada =
                prepararExpresion(
                    izquierda
                );

            let derechaPreparada =
                prepararExpresion(
                    derecha
                );


            let izquierdaCompilada =
                compilar(
                    izquierdaPreparada,
                    ["x", "y"]
                );

            let derechaCompilada =
                compilar(
                    derechaPreparada,
                    ["x", "y"]
                );


            return {

                tipo:
                    "ecuacion",

                izquierda:
                    izquierda,

                derecha:
                    derecha,

                variables:
                    variablesEcuacion,

                izquierdaPreparada:
                    izquierdaPreparada,

                derechaPreparada:
                    derechaPreparada,

                izquierdaCompilada:
                    izquierdaCompilada,

                derechaCompilada:
                    derechaCompilada
            };
        }


        // ====================================
        // f(x) = ...
        // ====================================

        if (
            parentesis != -1
        ) {

            let nombre =
                izquierda.slice(
                    0,
                    parentesis
                );


            let variable =
                izquierda.slice(
                    parentesis + 1,
                    -1
                );


            if (
                !izquierda.endsWith(")") ||
                nombre == "" ||
                variable == ""
            ) {

                return "";
            }


            let expresionPreparada =
                prepararExpresion(
                    derecha
                );


            return {

                nombre:
                    nombre,

                variable:
                    variable,

                expresion:
                    derecha,

                expresionPreparada:
                    expresionPreparada
            };
        }


        // ====================================
        // y = ...
        // ====================================

        else {

            let nombre =
                izquierda;


            if (
                nombre == ""
            ) {

                return "";
            }


            if (
                !esVariable(nombre)
            ) {

                return "";
            }


            let variable =
                "";


            // Buscar la primera variable real
            // ignorando sin, cos y tan

            for (
                let i = 0;
                i < variablesDerecha.length;
                i++
            ) {

                variable =
                    variablesDerecha[i];

                break;
            }


            if (
                variable == nombre
            ) {

                return "";
            }


            let expresionPreparada =
                prepararExpresion(
                    derecha
                );


            return {

                nombre:
                    nombre,

                variable:
                    variable,

                expresion:
                    derecha,

                expresionPreparada:
                    expresionPreparada
            };
        }
    }


    // ========================================
    // EXPRESIÓN NORMAL
    // ========================================

    // Evitar operadores consecutivos

    for (
        let i = 0;
        i < expresion.length - 1;
        i++
    ) {

        let actual =
            expresion[i];

        let siguiente =
            expresion[i + 1];


        if (
            (
                actual == "+" ||
                actual == "-" ||
                actual == "*" ||
                actual == "/" ||
                actual == "^"
            ) &&
            (
                siguiente == "+" ||
                siguiente == "-" ||
                siguiente == "*" ||
                siguiente == "/" ||
                siguiente == "^"
            )
        ) {

            return "";
        }
    }


    // ========================================
    // ELIMINAR OPERADOR FINAL
    // ========================================

    let ultimo =
        expresion[
            expresion.length - 1
        ];


    if (
        ultimo == "+" ||
        ultimo == "-" ||
        ultimo == "*" ||
        ultimo == "/" ||
        ultimo == "^" ||
        ultimo == "√"
    ) {

        expresion =
            expresion.slice(
                0,
                -1
            );
    }


    // ========================================
    // PREPARAR
    // ========================================

    let lista =
        prepararExpresion(
            expresion
        );


    // ========================================
    // EVALUAR
    // ========================================

    return evaluar(
        lista,
        variables
    );
}


export {
    calcular,
    prepararExpresion,
    evaluar,
    compilar
};

