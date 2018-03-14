# be-bootstrap-input-spinner

A Bootstrap/jQuery plugin to create input spinner elements with Bootstrap 4.

## Example

[Demo Page](http://shaack.com/projekte/be-bootstrap-input-spinner/)

## Usage

```html
<input type="number" id="input1" value="50" min="0" max="100" step="10"/>
<script>
    $("input[type='number']").InputSpinner();
</script>
```

## Syntax

```javascript
$(element).InputSpinner(config);
```

default config is:

```javascript
const config = {
    decrementHtml: "<strong>-</strong>", // button text
    incrementHtml: "<strong>+</strong>", // button text
    buttonClass: "btn-outline-secondary",
    buttonWidth: "2.5em",
    textAlign: "center",
    autoDelay: 500, // ms holding before auto value change
    autoInterval: 100, // speed of auto value change
    boostThreshold: 15, // boost after these steps
    boostMultiplier: 10
};
```

