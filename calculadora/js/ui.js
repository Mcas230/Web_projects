const raiz =
    document.documentElement;


// ============================================
// CONFIGURACIÓN
// ============================================

const minimoAnchoPanel = 160;
const maximoAnchoPanel = 500;

const minimoAltoControles = 140;
const maximoAltoControles = 400;


// ============================================
// CREAR DIVISORES
// ============================================

const divisorIzquierdo =
    document.createElement("div");

const divisorDerecho =
    document.createElement("div");

const divisorControles =
    document.createElement("div");


divisorIzquierdo.classList.add(
    "divisor",
    "divisorIzquierdo"
);

divisorDerecho.classList.add(
    "divisor",
    "divisorDerecho"
);

divisorControles.classList.add(
    "divisor",
    "divisorControles"
);


document.body.appendChild(
    divisorIzquierdo
);

document.body.appendChild(
    divisorDerecho
);

document.body.appendChild(
    divisorControles
);


// ============================================
// ESTADO
// ============================================

let redimensionandoIzquierdo = false;
let redimensionandoDerecho = false;
let redimensionandoControles = false;


// ============================================
// FUNCIONES AUXILIARES
// ============================================

function restaurarCursor() {

    document.body.style.cursor = "";
    document.body.style.userSelect = "";
}


// ============================================
// PANEL IZQUIERDO
// ============================================

divisorIzquierdo.addEventListener(
    "pointerdown",
    (evento) => {

        redimensionandoIzquierdo =
            true;

        divisorIzquierdo.setPointerCapture(
            evento.pointerId
        );

        document.body.style.cursor =
            "col-resize";

        document.body.style.userSelect =
            "none";
    }
);


divisorIzquierdo.addEventListener(
    "pointermove",
    (evento) => {

        if (
            !redimensionandoIzquierdo
        ) {
            return;
        }


        const ancho =
            evento.clientX;


        const anchoLimitado =
            Math.max(
                minimoAnchoPanel,
                Math.min(
                    maximoAnchoPanel,
                    ancho
                )
            );


        raiz.style.setProperty(
            "--ancho-panel-izquierdo",
            `${anchoLimitado}px`
        );
    }
);


divisorIzquierdo.addEventListener(
    "pointerup",
    (evento) => {

        redimensionandoIzquierdo =
            false;

        divisorIzquierdo.releasePointerCapture(
            evento.pointerId
        );

        restaurarCursor();
    }
);


divisorIzquierdo.addEventListener(
    "pointercancel",
    () => {

        redimensionandoIzquierdo =
            false;

        restaurarCursor();
    }
);


// ============================================
// PANEL DERECHO
// ============================================

divisorDerecho.addEventListener(
    "pointerdown",
    (evento) => {

        redimensionandoDerecho =
            true;

        divisorDerecho.setPointerCapture(
            evento.pointerId
        );

        document.body.style.cursor =
            "col-resize";

        document.body.style.userSelect =
            "none";
    }
);


divisorDerecho.addEventListener(
    "pointermove",
    (evento) => {

        if (
            !redimensionandoDerecho
        ) {
            return;
        }


        const ancho =
            window.innerWidth -
            evento.clientX;


        const anchoLimitado =
            Math.max(
                minimoAnchoPanel,
                Math.min(
                    maximoAnchoPanel,
                    ancho
                )
            );


        raiz.style.setProperty(
            "--ancho-panel-derecho",
            `${anchoLimitado}px`
        );
    }
);


divisorDerecho.addEventListener(
    "pointerup",
    (evento) => {

        redimensionandoDerecho =
            false;

        divisorDerecho.releasePointerCapture(
            evento.pointerId
        );

        restaurarCursor();
    }
);


divisorDerecho.addEventListener(
    "pointercancel",
    () => {

        redimensionandoDerecho =
            false;

        restaurarCursor();
    }
);


// ============================================
// PANEL DE CONTROLES
// ============================================

divisorControles.addEventListener(
    "pointerdown",
    (evento) => {

        redimensionandoControles =
            true;

        divisorControles.setPointerCapture(
            evento.pointerId
        );

        document.body.style.cursor =
            "row-resize";

        document.body.style.userSelect =
            "none";
    }
);


divisorControles.addEventListener(
    "pointermove",
    (evento) => {

        if (
            !redimensionandoControles
        ) {
            return;
        }


        const alto =
            window.innerHeight -
            evento.clientY;


        const altoLimitado =
            Math.max(
                minimoAltoControles,
                Math.min(
                    maximoAltoControles,
                    alto
                )
            );


        raiz.style.setProperty(
            "--alto-controles",
            `${altoLimitado}px`
        );
    }
);


divisorControles.addEventListener(
    "pointerup",
    (evento) => {

        redimensionandoControles =
            false;

        divisorControles.releasePointerCapture(
            evento.pointerId
        );

        restaurarCursor();
    }
);


divisorControles.addEventListener(
    "pointercancel",
    () => {

        redimensionandoControles =
            false;

        restaurarCursor();
    }
);