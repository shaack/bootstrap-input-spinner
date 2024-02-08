/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/bootstrap-input-spinner
 * License: MIT, see file 'LICENSE'
 */

// the default editor for parsing and rendering
const I18nEditor = function (props, element) {
        const locale = props.locale || "en-US"

        this.parse = function (customFormat) {
            const numberFormat = new Intl.NumberFormat(locale)
            const thousandSeparator = numberFormat.format(11111).replace(/1/g, '') || '.'
            const decimalSeparator = numberFormat.format(1.1).replace(/1/g, '')
            return parseFloat(customFormat
                .replace(new RegExp(' ', 'g'), '')
                .replace(new RegExp('\\' + thousandSeparator, 'g'), '')
                .replace(new RegExp('\\' + decimalSeparator), '.')
            )
        }

        this.render = function (number) {
            const decimals = parseInt(element.getAttribute("data-decimals")) || 0
            const digitGrouping = !(element.getAttribute("data-digit-grouping") === "false")
            const numberFormat = new Intl.NumberFormat(locale, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals,
                useGrouping: digitGrouping
            })
            return numberFormat.format(number)
        }
    }

let triggerKeyPressed = false
const originalVal = $.fn.val
$.fn.val = function (value) {
    if (arguments.length >= 1) {
        for (let i = 0; i < this.length; i++) {
            if (this[i]["bootstrap-input-spinner"] && this[i].setValue) {
                const element = this[i]
                setTimeout(function () {
                    element.setValue(value)
                })
            }
        }
    }
    return originalVal.apply(this, arguments)
}

export class InputSpinner {

    constructor(element, props) {

        const self = this
        this.element = element
        /*
        if (props === "destroy") { // todo replace with method
            this.each(function () {
                if (this["bootstrap-input-spinner"]) {
                    this.destroyInputSpinner()
                } else {
                    console.warn("element", this, "is no bootstrap-input-spinner")
                }
            })
            return this
        }
         */

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

        if (this.element["bootstrap-input-spinner"]) {
            console.warn("element", this.element, "is already a bootstrap-input-spinner")
        } else {

            this.$original = $(this.element)
            this.$original[0]["bootstrap-input-spinner"] = true
            this.$original.hide()
            this.$original[0].inputSpinnerEditor = new this.props.editor(this.props, this.element)

            this.autoDelayHandler = null
            this.autoIntervalHandler = null

            this.$inputGroup = $(html)
            this.$buttonDecrement = this.$inputGroup.find(".btn-decrement")
            this.$buttonIncrement = this.$inputGroup.find(".btn-increment")
            this.$input = this.$inputGroup.find("input")
            this.$label = $("label[for='" + this.$original.attr("id") + "']")
            if (!this.$label[0]) {
                this.$label = this.$original.closest("label")
            }

            this.min = null
            this.max = null
            this.step = null

            updateAttributes()

            this.value = parseFloat(this.$original[0].value)
            let pointerState = false

            const prefix = this.$original.attr("data-prefix") || ""
            const suffix = this.$original.attr("data-suffix") || ""

            if (prefix) {
                const prefixElement = $('<span class="input-group-text">' + prefix + '</span>')
                this.$inputGroup.find("input").before(prefixElement)
            }
            if (suffix) {
                const suffixElement = $('<span class="input-group-text">' + suffix + '</span>')
                this.$inputGroup.find("input").after(suffixElement)
            }

            this.$original[0].setValue = function (newValue) {
                setValue(newValue)
            }
            this.$original[0].destroyInputSpinner = function () {
                destroy()
            }

            this.observer = new MutationObserver(function () {
                updateAttributes()
                setValue(self.value, true)
            })
            this.observer.observe(this.$original[0], {attributes: true})

            this.$original.after(this.$inputGroup)

            setValue(this.value)

            this.$input.on("paste input change focusout", function (event) {
                let newValue = self.$input[0].value
                const focusOut = event.type === "focusout"
                if(!self.props.buttonsOnly) {
                    newValue = self.$original[0].inputSpinnerEditor.parse(newValue)
                    setValue(newValue, focusOut)
                    dispatchEvent(self.$original, event.type)
                }
                if (self.props.keyboardStepping && focusOut) { // stop stepping
                    resetTimer()
                }
            }).on("keydown", function (event) {
                if (self.props.keyboardStepping) {
                    if (event.which === 38) { // up arrow pressed
                        event.preventDefault()
                        if (!self.$buttonDecrement.prop("disabled")) {
                            stepHandling(self.step)
                        }
                    } else if (event.which === 40) { // down arrow pressed
                        event.preventDefault()
                        if (!self.$buttonIncrement.prop("disabled")) {
                            stepHandling(-self.step)
                        }
                    }
                }
            }).on("keyup", function (event) {
                // up/down arrow released
                if (self.props.keyboardStepping && (event.which === 38 || event.which === 40)) {
                    event.preventDefault()
                    resetTimer()
                }
            })

            // decrement button
            onPointerDown(self.$buttonDecrement[0], function () {
                if (!self.$buttonDecrement.prop("disabled")) {
                    pointerState = true
                    stepHandling(-self.step)
                }
            })
            // increment button
            onPointerDown(self.$buttonIncrement[0], function () {
                if (!self.$buttonIncrement.prop("disabled")) {
                    pointerState = true
                    stepHandling(self.step)
                }
            })
            onPointerUp(document.body, function () {
                if (pointerState === true) {
                    resetTimer()
                    dispatchEvent(self.$original, "change")
                    pointerState = false
                }
            })
        }

        function setValue(newValue, updateInput) {
            if (updateInput === undefined) {
                updateInput = true
            }
            if (isNaN(newValue) || newValue === "") {
                self.$original[0].value = ""
                if (updateInput) {
                    self.$input[0].value = ""
                }
                self.value = NaN
            } else {
                newValue = parseFloat(newValue)
                newValue = Math.min(Math.max(newValue, self.min), self.max)
                self.$original[0].value = newValue
                if (updateInput) {
                    self.$input[0].value = self.$original[0].inputSpinnerEditor.render(newValue)
                }
                self.value = newValue
            }
        }

        function destroy() {
            self.$original.prop("required", self.$input.prop("required"))
            self.observer.disconnect()
            resetTimer()
            self.$input.off("paste input change focusout")
            self.$inputGroup.remove()
            self.$original.show()
            self.$original[0]["bootstrap-input-spinner"] = undefined
            if (self.$label[0]) {
                self.$label.attr("for", self.$original.attr("id"))
            }
        }

        function dispatchEvent($element, type) {
            if (type) {
                setTimeout(function () {
                    let event
                    if (typeof (Event) === 'function') {
                        event = new Event(type, {bubbles: true})
                    } else { // IE todo remove
                        event = document.createEvent('Event')
                        event.initEvent(type, true, true)
                    }
                    $element[0].dispatchEvent(event)
                })
            }
        }

        function stepHandling(step) {
            calcStep(step)
            resetTimer()
            if (self.props.autoInterval !== undefined) {
                self.autoDelayHandler = setTimeout(function () {
                    self.autoIntervalHandler = setInterval(function () {
                        calcStep(step)
                    }, self.props.autoInterval)
                }, self.props.autoDelay)
            }
        }

        function calcStep(step) {
            if (isNaN(self.value)) {
                self.value = 0
            }
            setValue(Math.round(self.value / step) * step + step)
            dispatchEvent(self.$original, "input")
        }

        function resetTimer() {
            clearTimeout(self.autoDelayHandler)
            clearTimeout(self.autoIntervalHandler)
        }

        function updateAttributes() {
            // copy properties from original to the new input
            if (self.$original.prop("required")) {
                self.$input.prop("required", self.$original.prop("required"))
                self.$original.removeAttr('required')
            }
            self.$input.prop("placeholder", self.$original.prop("placeholder"))
            self.$input.attr("inputmode", self.$original.attr("inputmode") || "decimal")
            const disabled = self.$original.prop("disabled")
            const readonly = self.$original.prop("readonly")
            self.$input.prop("disabled", disabled)
            self.$input.prop("readonly", readonly || self.props.buttonsOnly)
            self.$buttonIncrement.prop("disabled", disabled || readonly)
            self.$buttonDecrement.prop("disabled", disabled || readonly)
            if (disabled || readonly) {
                resetTimer()
            }
            const originalClass = self.$original.prop("class")
            let groupClass = ""
            // sizing
            if (/form-control-sm/g.test(originalClass)) {
                groupClass = "input-group-sm"
            } else if (/form-control-lg/g.test(originalClass)) {
                groupClass = "input-group-lg"
            }
            const inputClass = originalClass.replace(/form-control(-(sm|lg))?/g, "")
            self.$inputGroup.prop("class", "input-group " + groupClass + " " + self.props.groupClass)
            self.$input.prop("class", "form-control " + inputClass)

            // update the main attributes
            self.min = isNaN(self.$original.prop("min")) || self.$original.prop("min") === "" ? -Infinity : parseFloat(self.$original.prop("min"))
            self.max = isNaN(self.$original.prop("max")) || self.$original.prop("max") === "" ? Infinity : parseFloat(self.$original.prop("max"))
            self.step = parseFloat(self.$original.prop("step")) || 1
            if (self.$original.attr("hidden")) {
                self.$inputGroup.attr("hidden", self.$original.attr("hidden"))
            } else {
                self.$inputGroup.removeAttr("hidden")
            }
            if (self.$original.attr("id")) {
                self.$input.attr("id", self.$original.attr("id") + ":input_spinner") // give the spinner a unique id...
                if (self.$label[0]) {
                    self.$label.attr("for", self.$input.attr("id")) // ...to rewire the label
                }
            }
        }

        function onPointerUp(element, callback) {
            element.addEventListener("mouseup", function (e) {
                callback(e)
            })
            element.addEventListener("touchend", function (e) {
                callback(e)
            })
            element.addEventListener("keyup", function (e) {
                if ((e.keyCode === 32 || e.keyCode === 13)) {
                    triggerKeyPressed = false
                    callback(e)
                }
            })
        }

        function onPointerDown(element, callback) {
            element.addEventListener("mousedown", function (e) {
                if (e.button === 0) {
                    e.preventDefault()
                    callback(e)
                }
            })
            element.addEventListener("touchstart", function (e) {
                if (e.cancelable) {
                    e.preventDefault()
                }
                callback(e)
            }, {passive: false})
            element.addEventListener("keydown", function (e) {
                if ((e.keyCode === 32 || e.keyCode === 13) && !triggerKeyPressed) {
                    triggerKeyPressed = true
                    callback(e)
                }
            })
        }
    }

}

