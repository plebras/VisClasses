/**
 * A bar chart visualisation class.
 */

import Visualisation from './utils/vis/Visualisation.js';
import * as d3 from 'd3';
import tippy from 'tippy.js';

import './styles/bubblechart.css';

export default class BubbleChart extends Visualisation{

    //accessors
    #X; // x
    #Y; // y 
    #R; // radius
    #K; // key
    #C; // color
    #T; // tooltip text

    // scales
    #xScale;
    #yScale;
    #rScale;
    #xDomainC;
    #yDomainC;
    #rDomainC;
    #rRangeC;

    // selections
    #bubbleGroup;
    #bubbleContainer; // for zoom
    #xAxis;
    #xTicks;
    #xFormat;
    #yAxis;
    #yTicks;
    #yFormat;
    #xLabel;
    #yLabel;

    // callbacks
    #over;
    #out;
    #click;

    #brush; // TODO
    #zoom; //TODO

    // tooltips
    #tips = [];

    // data
    #data = [];

    constructor({
        container = 'body',
        width = 800,
        height = 800,
        margin = [10,10,10,10],
        title = null,
        xLabel = null,
        yLabel = null,
        xType = d3.scaleLinear,
        xDomain = undefined,
        xTicks = undefined,
        xFormat = undefined,
        yType = d3.scaleLinear,
        yDomain = undefined,
        yTicks = undefined,
        yFormat = undefined,
        rType = d3.scaleSqrt(),
        rDomain = undefined,
        rRange = [0,25],
        over = ()=>{},
        out = ()=>{},
        click = ()=>{},
        x = d=>d.x,
        y = d=>d.y,
        r = d=>d.r,
        keys = (_,i)=>i,
        colors = ()=>null,
        tooltips = undefined,
        data = []
    }){
        // call super constructor
        super({container, width, height, margin, classed: 'bubblechart', title});
    
        // set up scales
        this.#xScale = xType().nice();
        this.#xDomainC = xDomain;
        this.#yScale = yType().nice();
        this.#yDomainC = yDomain;
        this.#rScale = rType.nice();
        this.#rDomainC = rDomain;
        this.#rRangeC = rRange;

        // set up selections
        this.#bubbleContainer = this._svg.append('g')
            .attr('transform', `translate${this._grid.tLS}`);
        this.#bubbleGroup = this.#bubbleContainer.append('g')
            .classed('bubbles', true);

        this.#xAxis = this._svg.append('g').attr('transform', `translate${this._grid.bLS}`);
        this.#xTicks = xTicks;
        this.#xFormat = xFormat;
        this.#yAxis = this._svg.append('g').attr('transform', `translate${this._grid.tLS}`);
        this.#yTicks = yTicks;
        this.#yFormat = yFormat;

        this.#xLabel = this._svg.append('text')
            .classed('legend', true)
            .attr('transform', `translate${this._grid.bCS}`)
            .attr('dy', 30);
        this.#yLabel = this._svg.append('text')
            .classed('legend', true)
            .attr('transform', `translate${this._grid.mLS} rotate(-90)`)
            .attr('dy', -30);
        this.setXLabel(xLabel);
        this.setYLabel(yLabel);

        // set up callbacks
        this.#over = over;
        this.#out = out;
        this.#click = click;

        // set up accessor
        this.#X = x;
        this.#Y = y;
        this.#R = r;
        this.#K = keys;
        this.#C = colors;
        this.#T = tooltips;

        if(data.length > 0){this.render(data)}

    }

    // internal callback on visualisation resize to reposition all elements
    _onResize = ()=>{
        this.#bubbleGroup.attr('transform', `translate${this._grid.tLS}`);
        this.#yAxis.attr('transform', `translate${this._grid.tLS}`);
        this.#xAxis.attr('transform', `translate${this._grid.bLS}`);
        this.#xLabel.attr('transform', `translate${this._grid.bCS}`);
        this.#yLabel.attr('transform', `translate${this._grid.mLS} rotate(-90)`);
        this.#refresh();
    }
    
    // private refresh function
    #refresh(){
        if(this.#data.length > 0){this.render(this.#data)};
    }

    // private getter for bubble selection
    #getBubbles(){
        return this.#bubbleGroup.selectAll('circle.bubble');
    }

    // private function to generate transition objects
    #makeTransitions(){
        let duration = 300,
            ease = d3.easeLinear;
        let tRemove = d3.transition()
            .ease(ease)
            .duration(duration);
        let tPosition = d3.transition()
            .ease(ease)
            .duration(duration)
            .delay(duration);
        let tSize = d3.transition()
            .ease(ease)
            .duration(duration)
            .delay(duration*2);
        return {tRemove, tPosition, tSize};
    }

    // private function to update scales
    // use the custom y domain if provided, otherwise y domain is set to [0, max] or [min, max] if min<0 or [min, 0] if max<0
    // use the custom x domain if provided, otherwise x domain is set to [0, max] or [min, max] if min<0 or [min, 0] if max<0
    // use the custom r domain if provided, otherwise r domain is set to [0, max]
    // x and y scales are readjusted to account for the maximum radius
    #updateScales(){
        let minX = d3.min(this.#data, this.#X),
            maxX = d3.max(this.#data, this.#X),
            minY = d3.min(this.#data, this.#Y),
            maxY = d3.max(this.#data, this.#Y),
            maxR = d3.max(this.#data, this.#R);
        let yDomain = this.#yDomainC === undefined ? [Math.min(0,minY), Math.max(0,maxY)] : this.#yDomainC,
            xDomain = this.#xDomainC === undefined ? [Math.min(0,minX), Math.max(0,maxX)] : this.#xDomainC,
            rDomain = this.#rDomainC === undefined ? [0, maxR] : this.#rDomainC,
            rRange = this.#rRangeC;

        this.#rScale.domain(rDomain).range(rRange);
        this.#xScale.domain([0,maxX]).range([0, this._grid.iW]);
        this.#xScale.domain([xDomain[0]-this.#xScale.invert(rRange[1]), xDomain[1]+this.#xScale.invert(rRange[1])]);
        this.#yScale.domain([0,maxY]).range([0, this._grid.iH]);
        this.#yScale.domain([yDomain[0]-this.#yScale.invert(rRange[1]), yDomain[1]+this.#yScale.invert(rRange[1])]);
        this.#yScale.range([this._grid.iH, 0]);
    }

    // private function to update the axes
    // applies the custom tick number and format to x and y axes if provided
    // the x axis is moved vertically to the 0 value on the y scale
    // the y axis is moved horizontally to the 0 value on the x scale
    #updateAxes(tPosition){
        let axisGenX = d3.axisBottom(this.#xScale).ticks(this.#xTicks,this.#xFormat),
            axisGenY = d3.axisLeft(this.#yScale).ticks(this.#yTicks,this.#yFormat);
        axisGenX(
            this.#xAxis.transition(tPosition)
                .attr('transform', `translate(${this._grid.l},${this._grid.b-this._grid.iH+this.#yScale(0)})`)
        );
        axisGenY(
            this.#yAxis.transition(tPosition)
                .attr('transform', `translate(${this._grid.l+this.#xScale(0)},${this._grid.t})`)
        );
    }

    // private function to update the bubbles
    #updateBubbles(tRemove, tPosition, tSize){
        this.#getBubbles()
            .data(this.#data, this.#K)
            .join(
                enter => enter.append('circle')
                    .classed('bubble', true)
                    .attr('r', 0),
                update => update,
                exit => exit.call(exit => exit.transition(tRemove)
                    .attr('r', 0)
                    .remove())
            )
            .sort((a,b)=>d3.descending(this.#R(a),this.#R(b)))
            .transition(tPosition)
            .attr('cx', d=>this.#xScale(this.#X(d)))
            .attr('cy', d=>this.#yScale(this.#Y(d)))
            .transition(tSize)
            .attr('r', d=>this.#rScale(this.#R(d)))
            .style('fill', this.#C);
        this.#setTooltips();
        this.#setEvents();
    }

    // private function to update the color of bubbles
    #setColor(){
        this.#getBubbles()
            .transition()
            .style('fill', this.#C);
    }

    // private function to update the bubbles tooltips, if any text callback is provided
    #setTooltips(){
        this.#tips.forEach(t=>t.destroy());
        if(this.#T !== undefined){
            let bubbles = this.#getBubbles()
                .attr('data-tippy-content', this.#T)
            this.#tips = tippy(bubbles.nodes(),{allowHTML:true, duration:50,theme:'vis-dark'})
        } else {
            this.#tips = [];
        }
    }

    // private function to update the bubbles callbacks
    #setEvents(){
        this.#getBubbles()
            .on('mouseover', (e,d)=>{
                this.#over(e,d);
            })
            .on('mouseout', (e,d)=>{
                this.#out(e,d);
            })
            .on('click', (e,d)=>{
                this.#click(e,d);
            });
    }

    // private function to mark a bubble with a custom selection type, e.g. 'selected', 'highlighted'
    #select(keys, type){
        this.#getBubbles()
            .classed(type, false)
            .filter(d=>keys.includes(this.#K(d)))
            .classed(type, true);
        return this;
    }

    // PUBLIC API

    // Function to render the provided dataset
    render(dataset){
        this.#data = dataset;
        let {tRemove, tPosition, tSize} = this.#makeTransitions();
        this.#updateScales();
        this.#updateAxes(tPosition);
        this.#updateBubbles(tRemove, tPosition, tSize);
        return this;
    }

    // Function to update the label used for the X axis
    // Null by default
    setXLabel(t=null){
        this.#xLabel.text(t);
        return this;
    }
    // Function to update the label used for the Y axis
    // Null by default
    setYLabel(t=null){
        this.#yLabel.text(t);
        return this;
    }
    // Function to update the type of the X scale
    // Linear by default
    setXType(type=d3.scaleLinear){
        this.#xScale = type().nice();
        this.#refresh();
        return this;
    }
    // Function to update a custom domain to use on the X axis
    // Undefined by default, i.e., [0, max] or [min, max] if min < 0 or [min, 0] if max < 0
    setXDomain(domain=undefined){
        this.#xDomainC = domain;
        this.#refresh();
        return this;
    }
    // Function to update the number of ticks on the X axis
    // Undefined by default, i.e., D3's default
    setXTicks(ticks=undefined){
        this.#xTicks = ticks;
        this.#refresh();
        return this; 
    }
    // Function to update the format of ticks on the X axis
    // Undefined by default, i.e., no format
    setXFormat(format=undefined){
        this.#xFormat = format;
        this.#refresh();
        return this; 
    }
    // Function to update the type of the Y scale
    // Linear by default
    setYType(type=d3.scaleLinear){
        this.#yScale = type().nice();
        this.#refresh();
        return this;
    }
    // Function to update a custom domain to use on the Y axis
    // Undefined by default, i.e., [0, max] or [min, max] if min < 0 or [min, 0] if max < 0
    setYDomain(domain=undefined){
        this.#yDomainC = domain;
        this.#refresh();
        return this;
    }
    // Function to update the number of ticks on the Y axis
    // Undefined by default, i.e., D3's default
    setYTicks(ticks=undefined){
        this.#yTicks = ticks;
        this.#refresh();
        return this; 
    }
    // Function to update the format of ticks on the Y axis
    // Undefined by default, i.e., no format
    setYFormat(format=undefined){
        this.#yFormat = format;
        this.#refresh();
        return this; 
    }
    // Function to update the type of the R scale
    // SquareRoot by default
    setRType(type=d3.scaleSqrt){
        this.#rScale = type().nice();
        this.#refresh();
        return this;
    }
    // Function to update a custom domain to use on the Radii
    // Undefined by default, i.e., [0, max]
    setRDomain(domain=undefined){
        this.#rDomainC = domain;
        this.#refresh();
        return this;
    }
    // Function to update a custom range to use on the Radii
    // [0,25] by default
    setRRange(range=[0,25]){
        this.#rRangeC = range;
        this.#refresh();
        return this;
    }
    // Function to update the mouseover callback
    // Empty by default, i.e., no behaviour
    setOver(f=()=>{}){
        this.#over = f;
        this.#setEvents();
        return this;
    }
    // Function to update the mouseout callback
    // Empty by default, i.e., no behaviour
    setOut(f=()=>{}){
        this.#out = f;
        this.#setEvents();
        return this;
    }
    // Function to update the click callback
    // Empty by default, i.e., no behaviour
    setClick(f=()=>{}){
        this.#click = f;
        this.#setEvents();
        return this;
    }
    // Function to update the bubble x value accessor
    // d.x by default
    setX(f=d=>d.x){
        this.#X = f;
        this.#refresh();
        return this;
    }
    // Function to update the bubble y value accessor
    // d.y by default
    setY(f=d=>d.y){
        this.#Y = f;
        this.#refresh();
        return this;
    }
    // Function to update the bubble radius value accessor
    // d.y by default
    setR(f=d=>d.r){
        this.#R = f;
        this.#refresh();
        return this;
    }
    // Function to update the bubble key accessor
    // index by default
    setKeys(f=(_,i)=>i){
        this.#K = f;
        this.#refresh();
        return this;
    }
    // Function to update the bubble tooltip text accessor
    // Undefined by default, i.e., no tooltip
    setTooltips(f=undefined){
        this.#T = f;
        this.#setTooltips();
        return this;
    }
    // Function to update the bubble color accessor
    // Null by default, i.e., use CSS setting
    setColor(c=null){
        this.#C = typeof c === 'function' ? c : ()=>c;
        this.#setColor();
        return this;
    }

    // Function to mark bubbles with matching keys as highlighted
    // No keys by default, i.e., remove all highlight
    highlightBubbles(keys=[]){
        return this.selectBubbles(keys, 'highlighted');
    }
    // Function to mark bubbles with matching keys as the provided selection type
    // Selection type set to 'selected' by default
    // No keys by default, i.e., remove selected marker
    selectBubbles(keys=[], type = 'selected'){
        this.#select(keys, type);
        return this;
    }

}