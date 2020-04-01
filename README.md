# bootstrap-input-spinner

A Bootstrap 4 / jQuery plugin to create input spinner elements for number input.

**[Demo page with examples](http://shaack.com/projekte/bootstrap-input-spinner/)**

![bootstrap-input-spinner](https://shaack.com/projekte/assets/img/bootstrap-input-spinner.png)
*Screenshot with floating point example and german localization.*

## Features

The Bootstrap 4 InputSpinner is

- **mobile friendly** and **responsive**,
- automatically changes value when **holding button**, boosts value change when holding button longer,
- has **internationalized** number formatting,
- allows setting a **prefix** or a **suffix** text in the input,
- handles **`val()`** like the native element,
- **dynamically handles** changing **attribute values** like `disabled` or `class`,
- dispatches **`change`** and **`input`** **events on value change** like the native element and
- works **without extra css**, only the bootstrap 4 standard css is needed.

## Installation

```bash
npm install -save bootstrap-input-spinner
```

Or just download the GitHub repository and include `src/bootstrap-input-spinner.js`.

## Usage

### HTML
Create the element in HTML. The attributes are compatible to the native `input[type="number"]` element.
```html
<input type="number" value="50" min="0" max="100" step="10"/>
```

### Script
It is a jQuery plugin.
So, enable the InputSpinner for all inputs with `type='number'` with the following script.

```html
<script src="./src/bootstrap-input-spinner.js"></script>
<script>
    $("input[type='number']").inputSpinner();
</script>
```

Thats it. **No extra css needed**, just Bootstrap 4 and jQuery.

## Syntax and configuration

### HTML

```html
<input type="number" value="4.5" min="0" max="9" step="0.1" data-decimals="2" data-suffix="°C"/>
```

Use these attributes to configure the behaviour

- `value` // starting value on element creation
- `min` // minimum value when stepping
- `max` // maximum value when stepping
- `step` // step size  
- `inputmode` // the "inputmode" of the input, defaults to "decimal" (shows decimal keyboard on touch devices)
- `data-step-max` // max boost when stepping
- `data-decimals` // shown decimal places
- `data-digit-grouping` // "false" to disable grouping (thousands separator), default is "true"
- `data-prefix` // show a prefix text in the input element
- `data-suffix` // show a suffix text in the input element

The InputSpinner also handles the standard input attributes `required`, `disabled`, `readonly` and `placeholder`.

### JavaScript

Use JavaScript to create the instance as a jQuery plugin. You may provide additional
configuration in an object as a config parameter.

```javascript
$(element).inputSpinner(config);
```

#### Configuration

The default configuration is

```javascript
var config = {
    decrementButton: "<strong>-</strong>", // button text
    incrementButton: "<strong>+</strong>", // ..
    groupClass: "", // css class of the resulting input-group
    buttonsClass: "btn-outline-secondary",
    buttonsWidth: "2.5rem",
    textAlign: "center",
    autoDelay: 500, // ms holding before auto value change
    autoInterval: 100, // speed of auto value change
    boostThreshold: 10, // boost after these steps
    boostMultiplier: "auto" // you can also set a constant number as multiplier
}
```

The locale for number formatting is detected from the browser settings.

##### decrementButton, incrementButton

HTML of the texts inside the buttons.

##### groupClass

Additional css class for the `input-group`, results in

```html
<div class="input-group ' + config.groupClass + '">
```

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

Speed of the value change when holding the button in ms. Lower value makes it faster.

##### boostThreshold

After these auto value changes the speed will increase with `boostMultiplier`.

##### boostMultiplier

The speed multiplier after `boostThreshold` steps of auto value change. 
If set to `"auto"` (default value) the multiplier will increase over time.

### Programmatic change and read of value

The change or read the value just use the jQuery `val()` function
on the input, like this

```javascript
var currentValue = $(element).val() // read
$(element).val(newValue) // write
```

> **Hint:** Reading the value in vanilla JS with `element.value` will also work, but to set the value you have to use `element.setValue(newValue)` or `$(element).val(newValue)`  

### Handling attributes

The attributes
`min`, `max`, `step`, `stepMax`, `decimals`, `placeholder`, `required`, `disabled`, `readonly` and `class`
are handled dynamically. The `class` attribute value is dynamically copied to the input element.

#### Sizing

If the original elements class is set to `form-control-sm` of `form-control-lg` the class of the resulting input-group is 
dynamically set to `input-group-sm` or `input-group-lg`. 

### Events

The InputSpinner handles `input` and `change` events like the  native element.

#### Event handling with vanilla JavaScript

```javascript
element.addEventListener("change", function(event) {
    newValue = this.value
})
```

#### Event handling with jQuery syntax

```javascript
$(element).on("change", function (event) {
    newValue = $(this).val()
})
```

## Minified version

I don't provide a minified version because I think it should be up to the using programmer 
to create minified versions, with all the used script sources concatenated to one file.

But, if you want it, it is easy to create your minified version with uglify: https://www.npmjs.com/package/uglify-js

Just install uglify
```bash
npm install uglify-js -g
```
and then in the src-folder
```bash
uglifyjs bootstrap-input-spinner.js --compress --mangle > bootstrap-input-spinner.min.js
```

Violà! :)

## Browser support

The spinner works in all modern browsers and in the Internet Explorer. Not tested with IE < 11.

For older browsers (IE 9 or so), that doesn't support `Intl`, when you get an error message like
**"Intl is not defined"** (See [issue #34](https://github.com/shaack/bootstrap-input-spinner/issues/34)),
just use a shim or polyfill like [Intl.js](https://github.com/andyearnshaw/Intl.js), and it works.
