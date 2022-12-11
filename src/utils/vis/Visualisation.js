/**
 * A Visualisation super class. 
 */

 import VisGrid from './VisGrid.js';
 import * as d3 from 'd3';
 
 export default class Vis{
 
     // size values
     #svgWidth;
     #svgHeight;
     #svgMargin;
 
     // svg selection
     _svg;
     // grig object
     _grid;
     // title selection
     _title;
     // resize callback
     _onResize = ()=>{};
 
     constructor({
         container = 'body', 
         width = 800, 
         height = 800,
         margin = [10,10,10,10],
         classed = '',
         title = null
     }={}){
         // set the svg size values
         this.#svgWidth = width;
         this.#svgHeight = height;
         this.#svgMargin = margin;
 
         // create grid object
         this._grid = new VisGrid(this.#svgWidth, this.#svgHeight, this.#svgMargin);
 
         // make svg selection
         this._svg = d3.select(container).append('svg')
             .classed(classed, true).classed('vis', true)
             .attr('width', this._grid.w).attr('height', this._grid.h);
         
         // make title
         this._title = this._svg.append('text')
             .classed('title', true)
             .attr('transform', `translate(${this._grid.w/2},25)`);
         this.setTitle(title);
     }
 
     // private function called when change in size
     // calls _onResize which can be unique for each child class
     #resize(){
         this._grid.w = this.#svgWidth;
         this._grid.h = this.#svgHeight;
         this._grid.p = this.#svgMargin;
 
         this._svg.attr('width', this._grid.w).attr('height', this._grid.h);
 
         this._title.attr('transform', `translate(${this._grid.w/2},25)`);
     
         this._onResize();
     }
 
     // public functions to change size values
     setWidth(w=500){
         this.#svgWidth = w;
         this.#resize();
         return this;
     }
     setHeight(h=500){
         this.#svgHeight = h;
         this.#resize();
         return this;
     }
     // setSize(w=500,h=500){
     //     this.#svgWidth = w;
     //     this.#svgHeight = h;
     //     this.#resize();
     //     return this;
     // }
     setMargin(m=[10,10,10,10]){
         this.#svgMargin = m;
         this.#resize();
         return this;
     }
 
     // public function to update the title value
     setTitle(text = null){
         this._title.text(text);
         return this;
     }
 
 }