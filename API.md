# VisClasses API Reference

This library of visualisations uses ES Modules.

## All Visualisations

All visualisation classes come with the following set of constructor options: 

| Option Name | Description | Default Value |
| --- | --- | --- |
| `container` | Selector of the visualisation's DOM container | `'body'` |
| `width` | Visualisation's width in pixels | `800` |
| `height` | Visualisation's height in pixels | `800` |
| `margin` | Visualisation's margins in pixels, as `[top, bottom, left, right]` | `[10,10,10,10]` |
| `title` | Text to display as title of the visualisation | `null` (no title) |

## Bar Charts and Histograms

### Files

 - `BarChart.min.js` to import in your scripts
 - `BarChart.min.css` to load in your HTML

### Constructor

```js
import BarChart from './dist/Barchart.min.js';

let bars = new BarChart({/*options*/});
```

#### List of Options

| Option Name | Description | Default Value |
| ---- | ---- | ---- |
| `xLabel` | Text to display as label of the x axis | `null` (no label) |
| `yLabel` | Text to display as label of the y axis | `null` (no label) |
| `xPadding` | Padding percentage for the bars, between `[0,1[` | `0.2` |
| `yType` | D3 scale to use on the y axis, must be [continuous](https://github.com/d3/d3-scale#continuous-scales) | `d3.sclaeLinear` |
| `yDomain` | Custom domain of values to use on the y axis, defined as `[min, max]` | `undefined` (will use `[0,max]` of the data, or `[min,max]` if `min<0` or `[min,0]` if `max<0`) |
| `yTicks` | Number of ticks to render on the y axis | `undefined` (will use D3's default) |
| `yFormat` | Format of ticks to render on the y axis | `undefined` (will use D3's default) |
| `over` | Event callback (`(event, datum)=>{...}`) when the mouse hovers a bar | `()=>{}` (no behaviour) |
| `out` | Event callback (`(event, datum)=>{...}`) when the mouse exits a bar | `()=>{}` (no behaviour) |
| `click` | Event callback (`(event, datum)=>{...}`) when a bar is clicked | `()=>{}` (no behaviour) |
| `values` | Accessor function for the value of each bar | `d=>d.v` |
| `keys` | Accessor function for the key of each bar | `d=>d.k` |
| `colors` | Function to set the colours of each bar | `()=>null` (use CSS) |
| `tooltips` | Function to set the tooltip text of each bar | `undefined` (no tooltip) |
| `data` | Dataset to render initially | `[]` (no data) |