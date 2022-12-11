/**
 * A bar chart visualisation class.
 */

import Visualisation from './utils/vis/Visualisation.js';
import * as d3 from 'd3';
import tippy from 'tippy.js';

import './styles/barchart.css';

export default class BarChart extends Visualisation{

    // accessors
    #V; // value
    #K; // key
    #C; // color
    #T; // tooltip text

    // scales
    #xScale;
    #yScale;
    #yDomainC; // custom y domain

    // selections
    #barGroup;
    #xAxis;
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
        xPadding = 0.2,
        yType = d3.scaleLinear,
        yDomain = undefined,
        yTicks = undefined,
        yFormat = undefined,
        over = ()=>{},
        out = ()=>{},
        click = ()=>{},
        values = d=>d.v,
        keys = d=>d.k,
        colors = ()=>null,
        tooltips = undefined,
        data = []
    }={}){
        // call super constructor
        super({container, width, height, margin, classed: 'barchart', title});

        // set up scales
        this.#xScale = d3.scaleBand().padding(xPadding);
        this.#yScale = yType().nice();
        this.#yDomainC = yDomain;

        // set up selections
        this.#barGroup = this._svg.append('g')
            .classed('bars', true)
            .attr('transform', `translate${this._grid.tLS}`);

        this.#xAxis = this._svg.append('g').attr('transform', `translate${this._grid.bLS}`);
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
        this.#V = values;
        this.#K = keys;
        this.#C = colors;
        this.#T = tooltips;

        if(data.length > 0){this.render(data)}
    }

    // internal callback on visualisation resize to reposition all elements
    _onResize = ()=>{
        this.#barGroup.attr('transform', `translate${this._grid.tLS}`);
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
    // use the custom y domain if provided, otherwise y domain is set to [0, max] or [min, max] if min<0 
    #updateScales(){
        let yDomain = this.#yDomainC === undefined ? [Math.min(0, d3.min(this.#data, this.#V)), Math.max(0,d3.max(this.#data, this.#V))] : this.#yDomainC;
        let xDomain = this.#data.map(this.#K);
        this.#xScale.domain(xDomain)
            .range([0, this._grid.iW]);
        this.#yScale.domain(yDomain)
            .range([this._grid.iH, 0]);
    }

    // private function to update the axes
    // applies the custom tick number and format to y axis if provided
    // the x axis is moved vertically to the 0 value on the y scale
    // will reposition the x tick labels if that value is negative
    #updateAxes(tPosition, tSize){
        d3.axisBottom(this.#xScale).tickSize(0).tickPadding(9)(this.#xAxis.transition(tPosition));
        d3.axisLeft(this.#yScale).ticks(this.#yTicks,this.#yFormat)(this.#yAxis.transition(tSize));
        this.#xAxis.transition(tSize)
            .attr('transform', `translate(${this._grid.l},${this._grid.b-this._grid.iH+this.#yScale(0)})`);
        this.#xAxis.selectAll('g.tick')
            .filter(d=>this.#data.filter(d2=>this.#K(d2) == d).length > 0 ? this.#V(this.#data.filter(d2=>this.#K(d2) == d)[0])<0 : false)
            .selectAll('text')
            .transition(tSize)
            .attr('y', -12);
    }

    // private function to update the bars
    #updateBars(tRemove, tPosition, tSize){   
        let yOrigin = this.#yScale(Math.max(0, this.#yScale.domain()[0]))     
        this.#barGroup.selectAll('rect.bar')
            .data(this.#data, this.#K)
            .join(
                enter => enter.append('rect')
                    .classed('bar', true)
                    .attr('y', yOrigin),
                update => update,
                exit => exit.call(exit => exit.transition(tRemove)
                    .attr('height', 0)
                    .attr('y', yOrigin)
                    .remove())
            )
            .transition(tPosition)
            .attr('x', (d,i)=>this.#xScale(this.#K(d,i)))
            .attr('width', this.#xScale.bandwidth())
            .transition(tSize)
            .style('fill', this.#C)
            .attr('height', (d,i)=>Math.abs(yOrigin-this.#yScale(this.#V(d,i))))
            .attr('y', (d,i)=>Math.min(yOrigin, this.#yScale(this.#V(d,i))));
        this.#setTooltips();
        this.#setEvents();
    }

    // private function to update the color of bars
    #setColor(){
        this.#barGroup.selectAll('rect.bar')
            .transition()
            .style('fill', this.#C);
    }

    // private function to update the bars tooltips, if any text callback is provided
    #setTooltips(){
        this.#tips.forEach(t=>t.destroy());
        if(this.#T !== undefined){
            let bars = this.#barGroup.selectAll('rect.bar')
                .attr('data-tippy-content', this.#T)
            this.#tips = tippy(bars.nodes(),{allowHTML:true, duration:50,theme:'vis-dark'})
        } else {
            this.#tips = [];
        }
    }

    // private function to update the bars callbacks
    #setEvents(){
        this.#barGroup.selectAll('rect.bar')
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

    // private function to mark a bar with a custom selection type, e.g. 'selected', 'highlighted'
    #select(keys, type){
        this.#barGroup.selectAll('rect.bar')
            .classed(type, false)
            .filter((d,i)=>keys.includes(this.#K(d,i)))
            .classed(type, true);
        return this;
    }

    // PUBLIC API

    // Function to render the provided dataset
    render(dataset){
        this.#data = dataset;
        let {tRemove, tPosition, tSize} = this.#makeTransitions();
        this.#updateScales();
        this.#updateAxes(tPosition, tSize);
        this.#updateBars(tRemove, tPosition, tSize);
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
    // Function to update the type of the Y scale
    // Linear by default
    setYType(type=d3.scaleLinear){
        this.#yScale = type().nice();
        this.#refresh();
        return this;
    }
    // Function to update a custom domain to use on the Y axis
    // Undefined by default, i.e., [0, max] or [min, max] if min < 0
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
    // Function to update the mouseover callback
    // Empty by default, i.e., no behaviour
    setOver(f=()=>{}){
        this.#over = f;
        this.#setEvents();
        return this;
    }
    // Function to update the mouseour callback
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
    // Function to update the bar value accessor
    // d.v by default
    setValues(f=d=>d.v){
        this.#V = f;
        this.#refresh();
        return this;
    }
    // Function to update the bar key accessor
    // d.k by default
    setKeys(f=d=>d.k){
        this.#K = f;
        this.#refresh();
        return this;
    }
    // Function to update the bar tooltip text accessor
    // Undefined by default, i.e., no tooltip
    setTooltips(f=undefined){
        this.#T = f;
        this.#setTooltips();
        return this;
    }
    // Function to update the bar color accessor
    // Null by default, i.e., use CSS setting
    setColor(c=null){
        this.#C = typeof c === 'function' ? c : ()=>c;
        this.#setColor();
        return this;
    }

    // Function to mark bars with matching keys as highlighted
    // No keys by default, i.e., remove all highlight
    highlightBars(keys=[]){
        return this.selectBars(keys, 'highlighted');
    }
    // Function to mark bars with matching keys as the provided selection type
    // Selection type set to 'selected' by default
    // No keys by default, i.e., remove selected marker
    selectBars(keys=[], type = 'selected'){
        this.#select(keys, type);
        return this;
    }
}