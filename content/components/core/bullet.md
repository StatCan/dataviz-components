# Bullet graph

![Example Bullet graph - NA](/test/media/default_demo_p0va0.png)

> A bullet graph is a variation of a bar graph developed by Stephen Few. Seemingly inspired by the traditional thermometer charts and progress bars found in many dashboards, the bullet graph serves as a replacement for dashboard gauges and meters.  [^https://en.wikipedia.org/wiki/Bullet_graph]

## Existing Functionality
* feature, config options [example]()
* feature, config options [example]()

## Sample Data
* Data that demonstrates X (low count?)
* Data that demonstrates Y (high count?)
* Data that demonstrates Z (non zero?)

# Development Plan

## Phase 1 Functionality
* Unlimited datapoint per bullet
* Limited dataset size of 1MB
* Reads native visualization JSON format
* Group labels left or right
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
* Non 0 and negative baselines
* On hover labels
* Gradient styling

## Phases N
* Transparency, native style (hatch, lines, symbols), loadable style (images, svg)
* Save output, svg, png

# Inspirational D3 components
* [Basics](http://www.d3noob.org/2013/07/introduction-to-bullet-charts-in-d3js.html)
* [Bostock example](https://bl.ocks.org/mbostock/4061961)
* [Vertical](https://www.jasondavies.com/bullet/)
* [More style](http://dimplejs.org/advanced_examples_viewer.html?id=advanced_bullet)
* [Even more styles](https://www.google.ca/search?q=d3+bullet+charts&safe=off&tbm=isch&tbo=u&source=univ&sa=X&ved=0ahUKEwj33-qDy8XTAhUl44MKHXv8AP8QsAQIRg&biw=1130&bih=736)

# Footnotes
[^https://en.wikipedia.org/wiki/Bullet_graph]: Wikipedia: Bullet graph