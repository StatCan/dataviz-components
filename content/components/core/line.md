# Line Chart

![Example Line Chart - NA](/test/media/default_demo_p0va0.png)

> A line chart or line graph is a type of chart which displays information as a series of data points called 'markers' connected by straight line segments. It is a basic type of chart common in many fields. It is similar to a scatter plot except that the measurement points are ordered (typically by their x-axis value) and joined with straight line segments. A line chart is often used to visualize a trend in data over intervals of time – a time series – thus the line is often drawn chronologically. In these cases they are known as run charts.  [^https://en.wikipedia.org/wiki/Line_chart]

## Existing Functionality
* feature, config options [example]()
* feature, config options [example]()

## Sample Data
* Data that demonstrates X (low count?)
* Data that demonstrates Y (high count?)
* Data that demonstrates Z (non zero?)

# Development Plan

## Phase 1 Functionality
* Unlimited lines
* Unlimited datapoint per line
* Limited dataset size of 1MB
* Reads native visualization JSON format
* Data labels, on the right, allowing styling via CSS
* Data point animations on dataset change
* Dynamic scaling to dataset values
* Unlimited viewport sizing
* Supports non-zero positive X axis

## Phase 2 Functionality
* Native accessibility
* Additional format compatibility
* Coordinate with Canada.ca and WET to aid integration
* Automated Testing via CI

## Phase 3 Functionality
* Positive and negative, x and y axis
* Underlays and overlays (e.g.: percentile, trend line)
* On hover labels

## Phases N
* Smooth lines
* Save output, svg, png

# Inspirational D3 components
* [Integrated values](https://bl.ocks.org/mbostock/4b66c0d9be9a0d56484e)
* [Multi-line highlight](https://bl.ocks.org/mbostock/8033015)
* [Intersection highlight, trend line](https://bl.ocks.org/mbostock/5cfd3a46562461d7f2db)
* [Proximity highlight](https://bl.ocks.org/mbostock/a76006c5bc2a95695c6f)
* [Missing values](https://bl.ocks.org/mbostock/0533f44f2cfabecc5e3a)
* [Smooth interpolation](https://bl.ocks.org/mbostock/3310233)
* [Crazy Interpolation](https://bl.ocks.org/mbostock/3310323)
* [Smoothing splines](https://bl.ocks.org/mbostock/9bd540de6728a1fb9343)
* [Smoothing tension](https://bl.ocks.org/mbostock/1016220)
* [Live slide transition](https://bl.ocks.org/mbostock/1642874)
* [Live 2 line transition, longer scale](https://bost.ocks.org/mike/path/)
* [Vector colour](https://bl.ocks.org/mbostock/1117287)

# Footnoots
[^https://en.wikipedia.org/wiki/Line_chart]: Line chart
