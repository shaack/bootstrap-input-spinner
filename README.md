# bootstrap-input-spinner

A Bootstrap 4 / jQuery plugin to create input spinner elements for number input.

## Example

[Demo Page](http://shaack.com/projekte/bootstrap-input-spinner/)

## Features

- Mobile friendly and responsive
- Internationalized number formatting
- Automatically changes value when holding button
- Boosts value change when holding button longer
- Dispatches `change` and `input` events on value change like native elements

## Installation

`npm install -save bootstrap-input-spinner`

Or just download this repository and include `src/InputSpinner.js`.

**No extra css needed**, only Bootstrap 4 and jQuery.

## Usage

```html
<input type="number" value="50" min="0" max="100" step="10"/>
<script>
    $("input[type='number']").InputSpinner();
</script>
```

### Syntax

#### HTML

Uses the following tag-attributes:

- min
- max
- step
- data-decimals

```html
<input type="number" value="4.5" data-decimals="2" min="0" max="9" step="0.1"/>
```

#### JavaScript

```javascript
$(element).InputSpinner(config);
```

default config is:

```javascript
var config = {
    decrementButton: "<strong>-</strong>", // button text
    incrementButton: "<strong>+</strong>", // ..
    groupClass: "input-group-spinner", // css class of the input-group
    buttonsClass: "btn-outline-secondary",
    buttonsWidth: "2.5em",
    textAlign: "center",
    autoDelay: 500, // ms holding before auto value change
    autoInterval: 100, // speed of auto value change
    boostThreshold: 15, // boost after these steps
    boostMultiplier: 4,
    locale: null // the locale for number rendering; if null, the browsers language is used
};
```

