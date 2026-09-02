function calcular(expresion) {

    let lista = [];
    let operadores = [];
    let pila = [];
    let numero = "";

    // Evitar operadores consecutivos
    for (let i = 0; i < expresion.length - 1; i++) {

        let actual = expresion[i];
        let siguiente = expresion[i + 1];

        if (
            (actual == "+" || actual == "-" || actual == "*" || actual == "/" || actual == "^") &&
            (siguiente == "+" || siguiente == "-" || siguiente == "*" || siguiente == "/" || siguiente == "^")
        ) {
            return "";
        }
    }

    // Evitar expresiones que terminan en un operador
    let ultimo = expresion[expresion.length - 1];

    if (
        ultimo == "+" ||
        ultimo == "-" ||
        ultimo == "*" ||
        ultimo == "/" ||
        ultimo == "^" ||
        ultimo == "√"
    ) {
        expresion = expresion.slice(0, -1);
    }

    // Prioridad de los operadores
    function prioridad(simbolo) {

        if (simbolo == "+" || simbolo == "-") {
            return 1;
        }

        if (simbolo == "*" || simbolo == "/") {
            return 2;
        }

        if (simbolo == "^") {
            return 3;
        }

        if (simbolo == "√") {
            return 4;
        }

        return 0;
    }

    // Convertir la expresión a notación postfija
    for (let i = 0; i < expresion.length; i++) {

        let simbolo = expresion[i];

        if (!isNaN(simbolo) && simbolo != " ") {
            numero += simbolo;
        }

        else {

            // Guardar el número antes del operador
            if (numero != "") {
                lista.push(Number(numero));
                numero = "";
            }

            if (simbolo == "(") {
                operadores.push(simbolo);
            }

            else if (simbolo == ")") {

                while (
                    operadores.length > 0 &&
                    operadores[operadores.length - 1] != "("
                ) {
                    lista.push(operadores.pop());
                }

                operadores.pop();
            }
            
            else if (simbolo == "√") {
                
                if (i > 0) {
                    
                    let anterior = expresion[i - 1];
                    
                    if (!isNaN(anterior) || anterior == ")") {
                        while (
                            operadores.length > 0 &&
                            operadores[operadores.length - 1] != "(" && prioridad(operadores[operadores.length - 1]) >= prioridad("*")
                        ) {
                            lista.push(operadores.pop());
                        }operadores.push("*");
                    }
                }
                
                operadores.push(simbolo);
            }

            else if (
                simbolo == "+" ||
                simbolo == "-" ||
                simbolo == "*" ||
                simbolo == "/" ||
                simbolo == "^"
            ) {

                while (
                    operadores.length > 0 &&
                    operadores[operadores.length - 1] != "(" &&
                    prioridad(operadores[operadores.length - 1]) >= prioridad(simbolo)
                ) {
                    lista.push(operadores.pop());
                }

                operadores.push(simbolo);
            }
        }
    }

    // Guardar el último número
    if (numero != "") {
        lista.push(Number(numero));
    }

    // Sacar los operadores restantes
    while (operadores.length > 0) {
        lista.push(operadores.pop());
    }

    // Evaluar la notación postfija
    for (let i = 0; i < lista.length; i++) {

        if (typeof lista[i] === "number") {
            pila.push(lista[i]);
        }

        else {

            if (lista[i] == "√") {

                let a = pila.pop();

                pila.push(Math.sqrt(a));
            }

            else {

                let b = pila.pop();
                let a = pila.pop();

                if (lista[i] == "+") {
                    pila.push(a + b);
                }

                if (lista[i] == "-") {
                    pila.push(a - b);
                }

                if (lista[i] == "*") {
                    pila.push(a * b);
                }

                if (lista[i] == "/") {
                    pila.push(a / b);
                }

                if (lista[i] == "^") {
                    pila.push(a ** b);
                }
            }
        }
    }

    return pila[0];
}