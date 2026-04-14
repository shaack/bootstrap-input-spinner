# bootstrap-input-spinner

A Bootstrap 5 extension to create input spinner elements for number input. Zero dependencies other than Bootstrap 5 — **no jQuery required** since v5.0.0.

> **Unofficial third-party component** — `bootstrap-input-spinner` is maintained by [shaack.com](https://shaack.com) and is not affiliated with or endorsed by the Bootstrap team.

> Note: bootstrap-input-spinner is now an ES6 module. The legacy ES5 version has been removed; if you still need it, pin to npm `3.x`. If you still need jQuery integration, pin to `4.x`.

![bootstrap-input-spinner](https://shaack.com/projekte/assets/img/bootstrap-input-spinner-floatingpoint-and-i18n.png)
*Examples with floating-point and german localization*

## References

- [Demo page with usage examples](http://shaack.com/projekte/bootstrap-input-spinner/)
- [GitHub repository](https://github.com/shaack/bootstrap-input-spinner/)
- [npm package](https://www.npmjs.com/package/bootstrap-input-spinner)

### Older version, Bootstrap 4 compatible

> The current is compatible with **Bootstrap 5**, but we remain a Bootstrap 4 compatible version with the branch
> <a href="https://github.com/shaack/bootstrap-input-spinner/tree/bootstrap4-compatible">bootstrap4-compatible</a>. 
> npm package versions 3.x are Bootstrap 5 compatible, versions 2.x Bootstrap 4 compatible.

- [Bootstrap 4 compatible npm package](https://www.npmjs.com/package/bootstrap-input-spinner/v/2.1.2)

## Features

The Bootstrap InputSpinner

- is **mobile friendly** and **responsive**,
- automatically changes the value when **holding a button**,
- has **internationalized** number formatting,
- allows setting a **prefix** or a **suffix** text in the input,
- handles **`val()`** like the native element,
- **dynamically handles** changing **attribute values** like `disabled` or `class`,
- supports **templates** and **custom editors**, (*new!*)
- dispatches **`change`** and **`input`** **events on value change** like the native element and
- works **without extra css**, only Bootstrap 5 is needed.

## Quickstart

### Installation

Current version, Bootstrap 5 compatible
```bash
npm install bootstrap-input-spinner
```
Bootstrap 4 compatible version
```bash
npm install bootstrap-input-spinner@2.2.0
```


Or just download the GitHub repository and include `src/bootstrap-input-spinner.js`.

### HTML

Create the element in HTML. The attributes are compatible to the native `input[type="number"]` element.

```html
<input type="number" value="50" min="0" max="100" step="10"/>
```

### Script

```html
<script type="module">
    import {InputSpinner} from "./src/InputSpinner.js"

    const inputSpinnerElements = document.querySelectorAll("input[type='number']")
    for (const inputSpinnerElement of inputSpinnerElements) {
        new InputSpinner(inputSpinnerElement)
    }
</script>
```

That's it. **No extra css needed**, just Bootstrap 5.

## API Reference

### HTML Attributes

```html
<input type="number" value="4.5" min="0" max="9" step="0.1" data-decimals="2" data-suffix="°C"/>
```

Use these attributes to configure the behaviour

- `value` // starting value on element creation
- `min` // minimum value when stepping
- `max` // maximum value when stepping
- `step` // step size
- `inputmode` // the "inputmode" of the input, defaults to "decimal" (shows decimal keyboard on touch devices)
- `data-decimals` // shown decimal places
- `data-digit-grouping` // "false" to disable grouping (thousands separator), default is "true"
- `data-prefix` // show a prefix text in the input element
- `data-suffix` // show a suffix text in the input element

The InputSpinner also handles the standard input attributes `required`, `disabled`, `readonly` and `placeholder`.

### Create an instance in JavaScript

Instantiate the `InputSpinner` class on any `<input type="number">` element. You may provide additional configuration
in an object as a second parameter.

```js
import {InputSpinner} from "bootstrap-input-spinner/src/InputSpinner.js"

new InputSpinner(element, config)
```

#### Configuration (props)

The default configuration is

```javascript
var props = {
    decrementButton: "<strong>&minus;</strong>", // button text
    incrementButton: "<strong>&plus;</strong>", // ..
    groupClass: "", // css class of the resulting input-group
    buttonsClass: "btn-outline-secondary",
    buttonsWidth: "2.5rem",
    textAlign: "center", // alignment of the entered number
    autoDelay: 500, // ms threshold before auto value change
    autoInterval: 50, // speed of auto value change, set to `undefined` to disable auto-change
    buttonsOnly: false, // set this `true` to disable the possibility to enter or paste the number via keyboard
    keyboardStepping: true, // set this to `false` to disallow the use of the up and down arrow keys to step
    locale: navigator.language, // the locale, per default detected automatically from the browser
    editor: I18nEditor, // the editor (parsing and rendering of the input)
    template: // the template of the input
        '<div class="input-group ${groupClass}">' +
        '<button style="min-width: ${buttonsWidth}" class="btn btn-decrement ${buttonsClass} btn-minus" type="button">${decrementButton}</button>' +
        '<input type="text" inputmode="decimal" style="text-align: ${textAlign}" class="form-control form-control-text-input"/>' +
        '<button style="min-width: ${buttonsWidth}" class="btn btn-increment ${buttonsClass} btn-plus" type="button">${incrementButton}</button>' +
        '</div>'
}
```

##### decrementButton, incrementButton

HTML of the texts inside the buttons.

##### groupClass

Additional css class for the `input-group` of the rendered Bootstrap input.

##### buttonsClass

The css class of the buttons. Use it to style the increment and decrement buttons as
described [here](https://getbootstrap.com/docs/4.0/components/buttons/). Maybe `buttonsClass: btn-primary`
or `btn-success` or whatever type of buttons you want.

##### buttonsWidth

The width of the increment and decrement buttons.

##### textAlign

The text alignment inside the `<input>`.

##### autoDelay

The delay in ms after which the input automatically changes the value, when holding the increment or decrement button.

##### autoInterval

Speed of the value change when holding the button in ms. A lower value makes it faster.

##### buttonsOnly

In `buttonsOnly` mode (set `true`) no direct text input is allowed, the text-input gets the attribute `readonly`, but
the plus and minus buttons still allow to change the value.

##### keyboardStepping

In `keyboardStepping` mode (set `true`) allows the use of the up/down arrow keys to increase/decrease the number by the
step.

##### locale

Used to format the number in the UI. Detected automatically from the user's browser, can be set to "de", "en",… or "
de_DE", "en_GB",….

##### editor

An Editor defines how the input is parsed and rendered. The default editor is the internal `I18nEditor`, which
parses and renders an internationalized number. Additional editors live in `src/custom-editors.js` and are available
as named ES exports:

```js
import {RawEditor, TimeEditor} from "bootstrap-input-spinner/src/custom-editors.js"

new InputSpinner(element, {editor: TimeEditor})
```

An Editor must implement two functions: `parse(customFormat)` to turn the input string into a number, and
`render(number)` to format the number back for display.

The simplest custom Editor is the `RawEditor`, it renders just the value und parses just the value, without any changes,
like a native number input. It looks like this:

```javascript
var RawEditor = function (props, element) {
    this.parse = function (customFormat) {
        // parse nothing
        return customFormat
    }
    this.render = function (number) {
        // render raw
        return number
    }
}
```

`props` is the configuration of the spinner and `element` is the original HTML element. You can use these values for the
configuration of the Editor, like in `I18nEditor`, which uses `props` for the language and `element` for the attributes.

The `TimeEditor` renders and parses the number to time in hours and minutes, separated by a colon.

![bootstrap-input-spinner](https://shaack.com/projekte/assets/img/time-editor.png)
*Supports custom editors to parse and render everything*

##### template

To modify the look completely, you can use the template parameter. There is an example about this on the
[Demo Page](http://shaack.com/projekte/bootstrap-input-spinner/).

### Programmatic change and read of value

Read via `element.value`, write via `element.setValue(newValue)`:

```javascript
const currentValue = element.value       // read
element.setValue(newValue)                // write
```

> Writing directly with `element.value = 5` bypasses the editor rendering, so always use `setValue` to update the spinner value programmatically.

### Handling attributes

The attributes
`min`, `max`, `step`, `decimals`, `placeholder`, `required`, `disabled`, `readonly` and `class`
are handled dynamically. The `class` attribute value is dynamically copied to the input element.

#### Sizing

If the original elements class is set to `form-control-sm` of `form-control-lg` the class of the resulting input-group
is dynamically set to `input-group-sm` or `input-group-lg`.

### Events

The InputSpinner dispatches native `input` and `change` events on the original element, just like a native number input.

```javascript
element.addEventListener("change", function (event) {
    const newValue = event.target.value
})
```

### Methods

#### destroy

Removes the InputSpinner and shows the original input element.

```javascript
element.destroyInputSpinner()
```

## Minified version

I don't provide a minified version because I think it should be up to the using programmer to create minified versions,
with all the used script sources concatenated to one file.

But, if you want it, it is easy to create your minified version with uglify: https://www.npmjs.com/package/uglify-js

Just install uglify

```bash
npm install uglify-js -g
```

and then in the `src` folder

```bash
uglifyjs InputSpinner.js --compress --mangle > InputSpinner.min.js
```

Violà! :)

## Testing

There is a [Teevi](https://github.com/shaack/teevi) based browser test suite under `test/`. Serve the repo with any
static server and open `test/index.html` in a browser to run it:

```bash
npx http-server -p 8080
# then open http://localhost:8080/test/
```

## Browser support

The spinner works in all modern browsers that support ES modules.

---

Find more high quality modules from [shaack.com](https://shaack.com)
on [our projects page](https://shaack.com/works).
