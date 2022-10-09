/**
 * A bar chart visualisation class.
 */

import Visualisation from './utils/vis/Visualisation.js';
import * as d3 from 'd3';

export default class BarChart extends Visualisation{

    svg;

    constructor({
        container = 'body',
        width = 800,
        height = 800,
        margin = [10,10,10,10],
        title = null
    }){
        // call super constructor
        super({container, width, height, margin, classed: 'barchart', title});

        


    }
}