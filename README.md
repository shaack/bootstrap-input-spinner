# bootstrap-input-spinner

A Bootstrap 4 / jQuery plugin to create input spinner elements for number input.

[Demo Page with examples for the main features](http://shaack.com/projekte/bootstrap-input-spinner/)

## Features

The Bootstrap 4 InputSpinner is

- mobile friendly and responsive,
- automatically changes value when holding button, boosts value change when holding button longer,
- has internationalized number formatting,
- handles `val()` like the native element,
- dispatches `change` and `input` events on value change like the native element and
- does not need to include extra css.

## Installation

```bash
npm install -save bootstrap-input-spinner
```

Or just download this repository and include `src/InputSpinner.js`.

## Usage

### HTML
Create the element in HTML. The attributes are compatible to the native `input[type="number"]` element.
```html
<input type="number" value="50" min="0" max="100" step="10"/>
```

### Script
Is is a jQuery plugin.
Enable the InputSpinner for all inputs with `type='number'` with the following script.

```html
<script src="./src/InputSpinner.js"></script>
<script>
    $("input[type='number']").InputSpinner();
</script>
```

Thats it. **No extra css needed**, just Bootstrap 4 and jQuery.

## Syntax and configuration

### HTML

```html
<input type="number" value="4.5" data-decimals="2" min="0" max="9" step="0.1"/>
```

Uses the following attributes

- **min** // minimum value when stepping
- **max** // maximum value when stepping
- **step** // step size 
- **data-decimals** // shown decimal places

### JavaScript

Use JavaScript to create the instance as jQuery plugin. Provide additional
configuration in an object as parameter.

```javascript
$(element).InputSpinner(config);
```

#### Configuration

The default configuration is

```javascript
var config = {
    decrementButton: "<strong>-</strong>", // button text
    incrementButton: "<strong>+</strong>", // ..
    groupClass: "", // css class of the input-group (sizing with input-group-sm or input-group-lg)
    buttonsClass: "btn-outline-secondary",
    buttonsWidth: "2.5em",
    textAlign: "center",
    autoDelay: 500, // ms holding before auto value change
    autoInterval: 100, // speed of auto value change
    boostThreshold: 15, // boost after these steps
    boostMultiplier: 4,
    locale: null // the locale for number rendering; if null, the browsers language is used
}
```

##### decrementButton, incrementButton

HTML of the texts inside the buttons.

##### groupClass

Additional css class for the `input-group`, results in

```html
<div class="input-group ' + config.groupClass + '">
```

You can use it for sizing with `groupClass: input-group-sm` or `input-group-lg`.

##### buttonsClass

The css class of the buttons. Use it to style 
the increment and decrement buttons as described [here](https://getbootstrap.com/docs/4.0/components/buttons/).
Maybe `buttonsClass: btn-primary` or `btn-success` or whatever type of buttons you want.

##### buttonsWidth

The width of the increment and decrement buttons.

##### textAlign

The text alignment inside the `<input>`

##### autoDelay

The delay in ms after which the input automatically changes 
the value, when holding the increment or decrement button.

##### autoInterval

Speed of the auto value change in ms. Lower value makes it faster.

##### boostThreshold

After these auto value changes the speed will increase with `boostMultiplier`.

##### boostMultiplier

The speed multiplier after `boostThreshold` steps of auto value change. 

##### locale

Set a locale for the number formatting. Use values like `en-US` 
or `de-DE`. If not set, the locate will be set automatically from the
browser language.

### Programmatic change and read of value

The change or read the value just use the jQuery `val()` function
on the input, like this

```javascript
var currentValue = $(element).val() // read
$(element).val(newValue) // write
```

> **Hint:** Reading the value in vanilla JS with `element.value` will also work, but to set the value you have to use `element.setValue(newValue)` or `$(element).val(newValue)`  

### Events

The InputSpinner handles `input` and `change` events like the  native element.

#### Event handling with vanilla JavaScript
```javascript
element.addEventListener("change", function(event) {
    newValue = element.value
})
```

#### Event handling with jQuery syntax
```javascript
$(element).on("change", function (event) {
    newValue = $(element).val()
})
```
