const boton = document.getElementById("boton");
const boton2 = document.getElementById("boton2");
const botonReset = document.getElementById("botonReset");

let x;
let y;

 if (x === undefined || x === NaN) {
    x = 0;
}


function actualizarTexto() {
    texto.innerHTML = x;
}

boton.addEventListener("click", () => {

    x = ++x;
    actualizarTexto()
})

boton2.addEventListener("click", () => {
    
    --x;
    actualizarTexto()
})


botonReset.addEventListener("click", () => {
    x = 0;
    actualizarTexto();
}); 