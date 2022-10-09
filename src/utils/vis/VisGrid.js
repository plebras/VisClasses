/**
 * A grid helper class for placing elements within width/height and padding. 
 */

 export default class VisGrid {

    #width;
    #height;
    #padding;

    constructor(width = 500, height = 500, padding = [0,0,0,0]){
        this.#width = width;
        this.#height = height;
        this.#padding = padding;
    }

    // Lengths

    // total width
    get w(){ return this.#width; }
    set w(width){ this.#width = width; }
    // total height
    get h(){ return this.#height; }
    set h(height){ this.#height = height; }
    // padding: all values
    get p(){ return this.#padding; }
    set p(padding){ this.#padding = padding; }
    // padding top
    get pT(){ return this.#padding[0]; }
    set pT(padding){ this.#padding[0] = padding; }
    // padding bottom
    get pB(){ return this.#padding[1]; }
    set pB(padding){ this.#padding[1] = padding; }
    // padding left
    get pL(){ return this.#padding[2]; }
    set pL(padding){ this.#padding[3] = padding; }
    // padding right
    get pR(){ return this.#padding[3]; }
    set pR(padding){ this.#padding[4] = padding; }
    // inner width (total width minus horizontal padding)
    get iW(){ return this.w - this.pL - this.pR; }
    // inner height (total height minus vertical padding)
    get iH(){ return this.h - this.pT - this.pB; }

    // Coordinates

    // top
    get t(){ return this.pT; }
    // bottom
    get b(){ return this.h - this.pB; }
    // left
    get l(){ return this.pL; }
    // right
    get r(){ return this.w - this.pR; }
    // middle (vertical axis)
    get m(){ return this.t + this.iH/2; }
    // center (horizontal axis)
    get c(){ return this.l + this.iW/2; }

    // Points

    // top left
    get tL(){ return [this.l, this.t]; }
    // top center
    get tC(){ return [this.c, this.t]; }
    // top right
    get tR(){ return [this.r, this.t]; }
    // middle left
    get mL(){ return [this.l, this.m]; }
    // middle center
    get mC(){ return [this.c, this.m]; }
    // middle right
    get mR(){ return [this.r, this.m]; }
    // bottom left
    get bL(){ return [this.l, this.b]; }
    // bottom center
    get bC(){ return [this.c, this.b]; }
    // bottom right
    get bR(){ return [this.r, this.b]; }

    // Points String

    // top left string
    get tLS(){ return `(${this.l},${this.t})`; }
    // top center string
    get tCS(){ return `(${this.c},${this.t})`; }
    // top right string
    get tRS(){ return `(${this.r},${this.t})`; }
    // middle left string
    get mLS(){ return `(${this.l},${this.m})`; }
    // middle center string
    get mCS(){ return `(${this.c},${this.m})`; }
    // middle right string
    get mRS(){ return `(${this.r},${this.m})`; }
    // bottom left string
    get bLS(){ return `(${this.l},${this.b})`; }
    // bottom center string
    get bCS(){ return `(${this.c},${this.b})`; }
    // bottom right string
    get bRS(){ return `(${this.r},${this.b})`; }
}