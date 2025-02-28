---
data_url: ../../assets/data/music_data.js
---

# Axes, title, tooltip

To build a chart with `Vizzu`, you have to add data series to the channels.
Channels will be explained more in-depth later, but for now, think of channels
as different elements of the chart we can bind data to. The simplest and most
often used channels are the x and y-axes.

The first step is to create a simple column chart, adding one of the dimensions
from the data set we added in the previous chapter (`Genres`) to the x-axis and
the measure (`Popularity`) to the y-axis using the set property.

<div id="tutorial_01"></div>

??? info "Info - How to setup Vizzu"
    In `HTML`, create a placeholder element that will contain the rendered
    chart.

    ```html
    <html>
     <body>
      <div id="myVizzu">
      </div>
     </body>
    </html>

    ```

    In `JavaScript`, initialize and configure the chart:

    ```javascript
    import Vizzu from 'https://cdn.jsdelivr.net/npm/vizzu@latest/dist/vizzu.min.js'
    import data from 'https://lib.vizzuhq.com/latest/assets/data/music_data.js'

    let chart = new Vizzu('myVizzu')

    chart.initializing

    chart.animate({
        data
    })
    ```

```javascript
chart.animate({
    config: {
        channels: {
            y: {
                set: ['Popularity']
            },
            x: {
                set: ['Genres']
            }
        }
    }
})
```

In the next step, the chart is rearranged by putting both series on the y-axis
using once again the set property, resulting in a single column chart. `Vizzu`
automatically animates between the initial state and this one.

<div id="tutorial_02"></div>

```javascript
chart.animate({
    config: {
        channels: {
            x: {
                set: null
            },
            y: {
                set: ['Genres', 'Popularity']
            }
        }
    }
})
```

Instead of set, you can use attach and detach to add or remove series to/from
the channels.

<div id="tutorial_03"></div>

```javascript
chart.animate({
    config: {
        channels: {
            y: {
                detach: ['Popularity']
            },
            x: {
                attach: ['Popularity']
            }
        }
    }
})
```

Using attach & detach makes it easier to build your animated charts
step-by-step, however you either have to keep in mind what you had on which
channel in the previous step or add the following code to access the actual
configuration of the chart.

```javascript
console.log(chart.config);
```

Setting the chart title with the title command.

<div id="tutorial_04"></div>

```javascript
chart.animate({
    title: 'My first chart'
})
```

Switching on the tooltips that appear on the chart elements when the user hovers
over them with their mouse by adding the (`'tooltip'`, `true`) parameters to the
`chart.feature` method.

<div id="tutorial_05"></div>

```javascript
chart.feature('tooltip', true)
```

!!! note
    Calls to this method before the
    [library initialization](../reference/classes/Vizzu.md#initializing)
    completed will fail.

<script src="../axes_title_tooltip.js"></script>
