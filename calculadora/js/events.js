import { calcular } from "./parser.js";
import { graficar } from "./display.js";
/*import { agregarFuncion } from "./functions.js";*/

const expresionInput = document.getElementById("expresionInput");
const texto = document.getElementById("texto");

const listaFunciones = document.getElementById("listaFunciones");
const botonAgregar = document.getElementById("botonAgregar");

const boton1 = document.getElementById("boton1");
const boton2 = document.getElementById("boton2");
const boton3 = document.getElementById("boton3");
const boton4 = document.getElementById("boton4");
const boton5 = document.getElementById("boton5");
const boton6 = document.getElementById("boton6");
const boton7 = document.getElementById("boton7");
const boton8 = document.getElementById("boton8");
const boton9 = document.getElementById("boton9");
const boton0 = document.getElementById("boton0");

const botonPunto = document.getElementById("botonPunto");

const botonAbrir = document.getElementById("botonAbrir");
const botonCerrar = document.getElementById("botonCerrar");

const botonSuma = document.getElementById("botonSuma");
const botonResta = document.getElementById("botonResta");
const botonMultiplicacion = document.getElementById("botonMultiplicacion");
const botonDivision = document.getElementById("botonDivision");

const botonPotencia = document.getElementById("botonPotencia");
const botonRaiz = document.getElementById("botonRaiz");


// PREVISUALIZAR LA EXPRESIÓN

expresionInput.addEventListener("input", function() {

    const expresion = expresionInput.value;

    graficar(expresion);

});


// AGREGAR CARÁCTER AL INPUT

function agregarNumero(numero) {

    let ultimo = expresionInput.value[
        expresionInput.value.length - 1
    ];

    if (
        (ultimo == "+" ||
        ultimo == "-" ||
        ultimo == "*" ||
        ultimo == "/" ||
        ultimo == "^") &&
        (numero == "+" ||
        numero == "-" ||
        numero == "*" ||
        numero == "/" ||
        numero == "^")
    ) {
        return;
    }

    expresionInput.value += numero;

    expresionInput.dispatchEvent(
        new Event("input")
    );

}


// BOTONES NUMÉRICOS

boton1.addEventListener("click", function() {
    agregarNumero("1");
});

boton2.addEventListener("click", function() {
    agregarNumero("2");
});

boton3.addEventListener("click", function() {
    agregarNumero("3");
});

boton4.addEventListener("click", function() {
    agregarNumero("4");
});

boton5.addEventListener("click", function() {
    agregarNumero("5");
});

boton6.addEventListener("click", function() {
    agregarNumero("6");
});

boton7.addEventListener("click", function() {
    agregarNumero("7");
});

boton8.addEventListener("click", function() {
    agregarNumero("8");
});

boton9.addEventListener("click", function() {
    agregarNumero("9");
});

boton0.addEventListener("click", function() {
    agregarNumero("0");
});


// OPERADORES

botonSuma.addEventListener("click", function() {
    agregarNumero("+");
});

botonResta.addEventListener("click", function() {
    agregarNumero("-");
});

botonMultiplicacion.addEventListener("click", function() {
    agregarNumero("*");
});

botonDivision.addEventListener("click", function() {
    agregarNumero("/");
});

botonPotencia.addEventListener("click", function() {
    agregarNumero("^");
});

botonRaiz.addEventListener("click", function() {
    agregarNumero("√");
});


// OTROS

botonPunto.addEventListener("click", function() {
    agregarNumero(".");
});

botonAbrir.addEventListener("click", function() {
    agregarNumero("(");
});

botonCerrar.addEventListener("click", function() {
    agregarNumero(")");
});


// AGREGAR FUNCIÓN AL PANEL IZQUIERDO

botonAgregar.addEventListener("click", function() {

    const expresion = expresionInput.value.trim();

    if (expresion == "") {
        return;
    }

    const funcion = document.createElement("button");

    funcion.classList.add("funcion");

    funcion.textContent = expresion;

    funcion.addEventListener("click", function() {

        expresionInput.value = expresion;

        expresionInput.dispatchEvent(
            new Event("input")
        );

    });

    listaFunciones.appendChild(funcion);

});

graficar("");
