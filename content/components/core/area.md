# Area Chart

![Example Area Chart - NA](/test/media/default_demo_p0va0.png)

> An area chart or area graph displays graphically quantitative data. It is based on the line chart. The area between axis and line are commonly emphasized with colors, textures and hatchings. Commonly one compares with an area chart two or more quantities.  [^https://en.wikipedia.org/wiki/Area_chart]

## Existing Functionality
* feature, config options [example]()
* feature, config options [example]()

## Sample Data
* Data that demonstrates X (low count?)
* Data that demonstrates Y (high count?)
* Data that demonstrates Z (non zero?)

# Development Plan

## Phase 1 Functionality
* Unlimited stacked areas
* Unlimited datapoint per area
* Limited dataset size of 1MB
* Reads native visualization JSON format
* Data labels, on the right, allowing styling via CSS
* Data point animations on dataset change
* Dynamic scaling to dataset values
* Unlimited viewport sizing
* Supports non-zero positive X axis
* Axis labeling

## Phase 2 Functionality
* Native accessibility
* Additional format compatibility
* Coordinate with Canada.ca and WET to aid integration
* Automated Testing via CI

## Phase 3 Functionality
* More style transition, gradients, value transitions
* Positive and negative, x and y axis
* On hover labels
* Gradient styling
* Missing data compatibility
* Underlays and overlays (e.g.: percentiles, trend lines)

## Future Phases
* Smooth lines
* Transparency, native style (hatch, lines, symbols), loadable style (images, svg)
* Save output, svg, png

# Inspirational D3 components
* [100% stack](https://bl.ocks.org/mbostock/3885211)
* [Bar Chart Hybrid](https://bl.ocks.org/mbostock/3035090)
* [Zoomable Area](https://bl.ocks.org/mbostock/4015254)
* [Stream Graph, smooth lines](http://bl.ocks.org/WillTurman/4631136)

# Footnotes
[^https://en.wikipedia.org/wiki/Area_chart]: Wikipedia: Area chart