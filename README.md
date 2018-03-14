# sb-input-spinner

A Bootstrap/jQuery plugin to create input spinner elements with Bootstrap 4.

## Example

[Demo Page](http://shaack.com/projekte/sb-input-spinner/)

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
config = {
    decrementHtml: "<strong>-</strong>",
    incrementHtml: "<strong>+</strong>",
    buttonClass: "btn-outline-secondary",
    buttonWidth: "2.5em",
    textAlign: "center"
};
```

