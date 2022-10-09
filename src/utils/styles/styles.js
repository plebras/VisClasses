/**
 * A helper module for applying styles. 
 */

import * as config from './stylesConfig.js';

export function applyStyleSVG(svg){
    svg.style('border', config.visBorder)
        .style('background-color', config.visBackColor);
}

export function applyStyleTitle(title){
    title.style('font-family', config.titleFont)
        .style('fill', config.titleColor)
        .style('font-size', config.titleSize)
        .style('text-anchor', config.titleAlign)
        .style('font-weight', config.titleWeight)
}