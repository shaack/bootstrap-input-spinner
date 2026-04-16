/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/bootstrap-input-spinner
 * License: MIT, see file 'LICENSE'
 */

// the default editor for parsing and rendering
const I18nEditor = function (props, element) {
    const locale = props.locale || "en-US"

    let parseRegexes = null
    this.parse = function (customFormat) {
        if (!parseRegexes) {
            const fmt = new Intl.NumberFormat(locale)
            const thousandSeparator = fmt.format(11111).replace(/1/g, '') || '.'
            const decimalSeparator = fmt.format(1.1).replace(/1/g, '')
            parseRegexes = {
                space: / /g,
                thousand: new RegExp('\\' + thousandSeparator, 'g'),
                decimal: new RegExp('\\' + decimalSeparator)
            }
        }
        return parseFloat(customFormat
            .replace(parseRegexes.space, '')
            .replace(parseRegexes.thousand, '')
            .replace(parseRegexes.decimal, '.')
        )
    }

    let renderFmt = null
    let renderDecimals = -1
    let renderGrouping = null
    this.render = function (number) {
        const decimals = parseInt(element.getAttribute("data-decimals")) || 0
        const digitGrouping = !(element.getAttribute("data-digit-grouping") === "false")
        if (!renderFmt || decimals !== renderDecimals || digitGrouping !== renderGrouping) {
            renderFmt = new Intl.NumberFormat(locale, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
                useGrouping: digitGrouping
            })
            renderDecimals = decimals
            renderGrouping = digitGrouping
        }
        return renderFmt.format(number)
    }
}

let triggerKeyPressed = false

function parseTemplate(html) {
    const tpl = document.createElement("template")
    tpl.innerHTML = html.trim()
    return tpl.content.firstElementChild
}

function parseNumberAttr(el, name, fallback) {
    const raw = el.getAttribute(name)
    if (raw === null || raw === "" || isNaN(parseFloat(raw))) {
        return fallback
    }
    return parseFloat(raw)
}

export class InputSpinner {

    constructor(element, props) {

        const self = this
        this.element = element

        this.props = {
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
            mouseWheel: false, // set `true` to step the value on wheel when the input is focused. Off by default — modern browsers no longer wheel-step native <input type="number">.
            locale: navigator.language, // the locale, per default detected automatically from the browser
            editor: I18nEditor, // the editor (parsing and rendering of the input)
            template: // the template of the input
                '<div class="input-group ${groupClass}">' +
                '<button style="min-width: ${buttonsWidth}" class="btn btn-decrement ${buttonsClass} btn-minus" type="button">${decrementButton}</button>' +
                '<input type="text" inputmode="decimal" style="text-align: ${textAlign}" class="form-control form-control-text-input"/>' +
                '<button style="min-width: ${buttonsWidth}" class="btn btn-increment ${buttonsClass} btn-plus" type="button">${incrementButton}</button>' +
                '</div>'
        }

        Object.assign(this.props, props)

        const html = this.props.template
            .replace(/\${groupClass}/g, this.props.groupClass)
            .replace(/\${buttonsWidth}/g, this.props.buttonsWidth)
            .replace(/\${buttonsClass}/g, this.props.buttonsClass)
            .replace(/\${decrementButton}/g, this.props.decrementButton)
            .replace(/\${incrementButton}/g, this.props.incrementButton)
            .replace(/\${textAlign}/g, this.props.textAlign)

        if (element["bootstrap-input-spinner"]) {
            console.warn("element", element, "is already a bootstrap-input-spinner")
            return
        }

        this.original = element
        this.original["bootstrap-input-spinner"] = true
        this.original.style.display = "none"
        this.original.inputSpinnerEditor = new this.props.editor(this.props, element)

        this.autoDelayHandler = null
        this.autoIntervalHandler = null

        this.inputGroup = parseTemplate(html)
        this.buttonDecrement = this.inputGroup.querySelector(".btn-decrement")
        this.buttonIncrement = this.inputGroup.querySelector(".btn-increment")
        this.input = this.inputGroup.querySelector("input")

        this.label = null
        if (this.original.id) {
            this.label = document.querySelector("label[for='" + this.original.id + "']")
        }
        if (!this.label) {
            this.label = this.original.closest("label")
        }

        this.min = null
        this.max = null
        this.step = null

        updateAttributes()

        this.value = parseFloat(this.original.value)
        let pointerState = false

        const prefix = this.original.getAttribute("data-prefix") || ""
        const suffix = this.original.getAttribute("data-suffix") || ""

        if (prefix) {
            const prefixElement = document.createElement("span")
            prefixElement.className = "input-group-text"
            prefixElement.textContent = prefix
            this.input.parentNode.insertBefore(prefixElement, this.input)
        }
        if (suffix) {
            const suffixElement = document.createElement("span")
            suffixElement.className = "input-group-text"
            suffixElement.textContent = suffix
            this.input.parentNode.insertBefore(suffixElement, this.input.nextSibling)
        }

        this.original.setValue = function (newValue) {
            setValue(newValue)
        }
        this.original.destroyInputSpinner = function () {
            destroy()
        }

        this.observer = new MutationObserver(function () {
            updateAttributes()
            setValue(self.value, true)
        })
        this.observer.observe(this.original, {attributes: true})

        this.original.parentNode.insertBefore(this.inputGroup, this.original.nextSibling)

        setValue(this.value)

        // Track listeners so destroy() can detach them cleanly.
        this._teardown = []
        const bind = function (target, type, handler, options) {
            target.addEventListener(type, handler, options)
            self._teardown.push(function () {
                target.removeEventListener(type, handler, options)
            })
        }

        const onInputEvent = function (event) {
            let newValue = self.input.value
            const focusOut = event.type === "focusout"
            if (!self.props.buttonsOnly) {
                newValue = self.original.inputSpinnerEditor.parse(newValue)
                setValue(newValue, focusOut)
                dispatchEvent(self.original, event.type)
            }
            if (self.props.keyboardStepping && focusOut) { // stop stepping
                resetTimer()
            }
        }
        bind(this.input, "paste", onInputEvent)
        bind(this.input, "input", onInputEvent)
        bind(this.input, "change", onInputEvent)
        bind(this.input, "focusout", onInputEvent)

        bind(this.input, "keydown", function (event) {
            if (!self.props.keyboardStepping) return
            if (event.key === "ArrowUp" || event.keyCode === 38) {
                event.preventDefault()
                if (!self.buttonIncrement.disabled) {
                    stepHandling(self.step)
                }
            } else if (event.key === "ArrowDown" || event.keyCode === 40) {
                event.preventDefault()
                if (!self.buttonDecrement.disabled) {
                    stepHandling(-self.step)
                }
            }
        })
        bind(this.input, "keyup", function (event) {
            if (self.props.keyboardStepping &&
                (event.key === "ArrowUp" || event.key === "ArrowDown" ||
                    event.keyCode === 38 || event.keyCode === 40)) {
                event.preventDefault()
                resetTimer()
            }
        })

        // Focus-gated mouse-wheel stepping: matches native <input type="number">.
        // The listener is attached on focus and detached on blur, so an
        // unfocused spinner never hijacks page scroll and no passive-listener
        // warnings are produced while the input is idle.
        const onWheel = function (event) {
            if (self.input.disabled || self.input.readOnly) return
            if (event.deltaY === 0) return
            event.preventDefault()
            // Scroll up → increment (macOS natural-scroll convention:
            // pushing the wheel/trackpad up yields deltaY > 0).
            const direction = event.deltaY > 0 ? 1 : -1
            calcStep(direction * self.step)
            dispatchEvent(self.original, "change")
        }
        let wheelBound = false
        const attachWheel = function () {
            if (wheelBound || !self.props.mouseWheel) return
            self.input.addEventListener("wheel", onWheel, {passive: false})
            wheelBound = true
        }
        const detachWheel = function () {
            if (!wheelBound) return
            self.input.removeEventListener("wheel", onWheel, {passive: false})
            wheelBound = false
        }
        bind(this.input, "focus", attachWheel)
        bind(this.input, "blur", detachWheel)
        self._teardown.push(detachWheel)

        // decrement button
        onPointerDown(self.buttonDecrement, function () {
            if (!self.buttonDecrement.disabled) {
                pointerState = true
                stepHandling(-self.step)
            }
        })
        // increment button
        onPointerDown(self.buttonIncrement, function () {
            if (!self.buttonIncrement.disabled) {
                pointerState = true
                stepHandling(self.step)
            }
        })
        onPointerUp(document.body, function () {
            if (pointerState === true) {
                resetTimer()
                dispatchEvent(self.original, "change")
                pointerState = false
            }
        })

        function setValue(newValue, updateInput) {
            if (updateInput === undefined) {
                updateInput = true
            }
            if (isNaN(newValue) || newValue === "") {
                self.original.value = ""
                if (updateInput) {
                    self.input.value = ""
                }
                self.value = NaN
            } else {
                newValue = parseFloat(newValue)
                newValue = Math.min(Math.max(newValue, self.min), self.max)
                self.original.value = newValue
                if (updateInput) {
                    self.input.value = self.original.inputSpinnerEditor.render(newValue)
                }
                self.value = newValue
            }
        }

        function destroy() {
            if (self.input.required) {
                self.original.required = true
            }
            self.observer.disconnect()
            resetTimer()
            for (const off of self._teardown) off()
            self._teardown = []
            self.inputGroup.remove()
            self.original.style.display = ""
            self.original["bootstrap-input-spinner"] = undefined
            delete self.original.setValue
            delete self.original.destroyInputSpinner
            delete self.original.inputSpinnerEditor
            if (self.label) {
                self.label.setAttribute("for", self.original.id || "")
            }
        }

        function dispatchEvent(target, type) {
            if (!type) return
            setTimeout(function () {
                target.dispatchEvent(new Event(type, {bubbles: true}))
            })
        }

        function stepHandling(step) {
            // Capture only the direction; re-read self.step on every tick so
            // consumers can change the step attribute mid-hold and have the
            // new value take effect on the next auto-repeat tick.
            const direction = step < 0 ? -1 : 1
            calcStep(direction * self.step)
            resetTimer()
            if (self.props.autoInterval !== undefined) {
                self.autoDelayHandler = setTimeout(function () {
                    self.autoIntervalHandler = setInterval(function () {
                        calcStep(direction * self.step)
                    }, self.props.autoInterval)
                }, self.props.autoDelay)
            }
        }

        function calcStep(step) {
            if (isNaN(self.value)) {
                self.value = 0
            }
            setValue(Math.round(self.value / step) * step + step)
            dispatchEvent(self.original, "input")
        }

        function resetTimer() {
            clearTimeout(self.autoDelayHandler)
            clearInterval(self.autoIntervalHandler)
        }

        function updateAttributes() {
            // copy properties from original to the new input
            if (self.original.required) {
                self.input.required = true
                self.original.removeAttribute("required")
            }
            self.input.placeholder = self.original.placeholder
            self.input.setAttribute("inputmode", self.original.getAttribute("inputmode") || "decimal")
            const disabled = self.original.disabled
            const readonly = self.original.readOnly
            self.input.disabled = disabled
            self.input.readOnly = readonly || self.props.buttonsOnly
            self.buttonIncrement.disabled = disabled || readonly
            self.buttonDecrement.disabled = disabled || readonly
            if (disabled || readonly) {
                resetTimer()
            }
            const originalClass = self.original.className || ""
            let groupClass = ""
            if (/form-control-sm/g.test(originalClass)) {
                groupClass = "input-group-sm"
            } else if (/form-control-lg/g.test(originalClass)) {
                groupClass = "input-group-lg"
            }
            const inputClass = originalClass.replace(/form-control(-(sm|lg))?/g, "")
            self.inputGroup.className = "input-group " + groupClass + " " + self.props.groupClass
            self.input.className = "form-control " + inputClass

            self.min = parseNumberAttr(self.original, "min", -Infinity)
            self.max = parseNumberAttr(self.original, "max", Infinity)
            self.step = parseNumberAttr(self.original, "step", 1) || 1

            if (self.original.hasAttribute("hidden")) {
                self.inputGroup.setAttribute("hidden", self.original.getAttribute("hidden") || "")
            } else {
                self.inputGroup.removeAttribute("hidden")
            }
            if (self.original.id) {
                self.input.id = self.original.id + ":input_spinner" // give the spinner a unique id...
                if (self.label) {
                    self.label.setAttribute("for", self.input.id) // ...to rewire the label
                }
            }
        }

        function onPointerUp(el, callback) {
            bind(el, "mouseup", function (e) {
                callback(e)
            })
            bind(el, "touchend", function (e) {
                callback(e)
            })
            bind(el, "keyup", function (e) {
                if ((e.keyCode === 32 || e.keyCode === 13)) {
                    triggerKeyPressed = false
                    callback(e)
                }
            })
        }

        function onPointerDown(el, callback) {
            bind(el, "mousedown", function (e) {
                if (e.button === 0) {
                    e.preventDefault()
                    callback(e)
                }
            })
            bind(el, "touchstart", function (e) {
                if (e.cancelable) {
                    e.preventDefault()
                }
                callback(e)
            }, {passive: false})
            bind(el, "keydown", function (e) {
                if ((e.keyCode === 32 || e.keyCode === 13) && !triggerKeyPressed) {
                    triggerKeyPressed = true
                    callback(e)
                }
            })
        }
    }
}
