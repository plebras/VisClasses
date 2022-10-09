/**
 * A configuration module for styles. 
 */

const BLACK='#282828',
    GREY='#656565',
    WHITE='#fefefe';

const FONT='sans-serif';

const visBorder = `solid 1px ${BLACK}`,
    visBackColor = WHITE;

const titleFont = FONT,
    titleAlign = 'middle',
    titleColor = GREY,
    titleSize = '1.2em',
    titleWeight = 'bold';

const legendFont = FONT,
    legendColor = GREY,
    legendAlign = 'middle',
    legendSize = '0.8em';

export {
    visBorder, visBackColor,
    titleFont, titleAlign, titleColor, titleSize, titleWeight,
    legendAlign, legendColor, legendFont, legendSize
}