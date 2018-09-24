/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/bootstrap-input-spinner
 * License: MIT, see file 'LICENSE'
 */

(function ($) {
    "use strict"

    var spacePressed = false
    var originalVal = $.fn.val
    $.fn.val = function (value) {
        if (arguments.length >= 1) {
            if (this[0]["bootstrap-input-spinner"] && this[0].setValue) {
                this[0].setValue(value)
            }
        }
        return originalVal.apply(this, arguments)
    }

    $.fn.InputSpinner = $.fn.inputSpinner = function (options) {

        var config = {
            decrementButton: "<strong>-</strong>", // button text
            incrementButton: "<strong>+</strong>", // ..
            groupClass: "", // css class of the input-group (sizing with input-group-sm, input-group-lg)
            buttonsClass: "btn-outline-secondary",
            buttonsWidth: "2.5em",
            textAlign: "center",
            autoDelay: 500, // ms holding before auto value change
            autoInterval: 100, // speed of auto value change
            boostThreshold: 10, // boost after these steps
            boostMultiplier: "auto", // you can also set a constant number as multiplier
            locale: null // the locale for number rendering; if null, the browsers language is used
        }
        Object.assign(config, options)

        var html = '<div class="input-group ' + config.groupClass + '">' +
            '<div class="input-group-prepend">' +
            '<button style="min-width: ' + config.buttonsWidth + '" class="btn btn-decrement ' + config.buttonsClass + '" type="button">' + config.decrementButton + '</button>' +
            '</div>' +
            '<input type="text" style="text-align: ' + config.textAlign + '" class="form-control"/>' +
            '<div class="input-group-append">' +
            '<button style="min-width: ' + config.buttonsWidth + '" class="btn btn-increment ' + config.buttonsClass + '" type="button">' + config.incrementButton + '</button>' +
            '</div>' +
            '</div>'

        var locale = config.locale || navigator.language || "en-US"

        this.each(function () {

            var $original = $(this)
            $original[0]["bootstrap-input-spinner"] = true
            $original.hide()

            var autoDelayHandler = null
            var autoIntervalHandler = null
            var autoMultiplier = config.boostMultiplier === "auto"
            var boostMultiplier = autoMultiplier ? 1 : config.boostMultiplier

            var $inputGroup = $(html)
            var $buttonDecrement = $inputGroup.find(".btn-decrement")
            var $buttonIncrement = $inputGroup.find(".btn-increment")
            var $input = $inputGroup.find("input")

            var min = parseFloat($original.prop("min")) || 0
            var max = isNaN($original.prop("max")) || $original.prop("max") === "" ? Infinity : parseFloat($original.prop("max"))
            var step = parseFloat($original.prop("step")) || 1
            var decimals = parseInt($original.attr("data-decimals")) || 0

            var numberFormat = new Intl.NumberFormat(locale, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })
            var value = parseFloat($original[0].value)
            var boostStepsCount = 0

            $original[0].setValue = function (newValue) {
                setValue(newValue)
            }

            if ($original.prop("class").indexOf("is-invalid") !== -1) { // TODO dynamically copy all classes
                $input.addClass("is-invalid")
            }
            if ($original.prop("class").indexOf("is-valid") !== -1) {
                $input.addClass("is-valid")
            }
            if ($original.prop("required")) {
                $input.prop("required", true)
            }
            if ($original.prop("placeholder")) {
                $input.prop("placeholder", $original.prop("placeholder"))
            }

            $original.after($inputGroup)

            if (isNaN(value)) {
                $original[0].value = ""
                $input[0].value = ""
            } else {
                $original[0].value = value
                $input[0].value = numberFormat.format(value)
            }

            $input.on("paste keyup change", function () {
                var inputValue = $input[0].value
                if (locale === "en-US" || locale === "en-GB" || locale === "th-TH") {
                    value = parseFloat(inputValue)
                } else {
                    value = parseFloat(inputValue.replace(/[. ]/g, '').replace(/,/g, '.')) // i18n
                }
                if (isNaN(value)) {
                    $original[0].value = ""
                } else {
                    $original[0].value = value
                }
                dispatchChangeEvents($original)
            })

            onPointerDown($buttonDecrement[0], function () {
                stepHandling(-step)
            })
            onPointerDown($buttonIncrement[0], function () {
                stepHandling(step)
            })
            onPointerUp(document.body, function () {
                resetTimer()
            })

            function setValue(newValue) {
                if (isNaN(newValue) || newValue === "") {
                    $original[0].value = ""
                    $input[0].value = ""
                    value = 0.0
                } else {
                    $original[0].value = newValue
                    $input[0].value = numberFormat.format(newValue)
                    value = parseFloat(newValue)
                }
            }

            function dispatchChangeEvents($element) {
                setTimeout(function () {
                    var changeEvent = new Event("change", {bubbles: true})
                    var inputEvent = new Event("input", {bubbles: true})
                    $element[0].dispatchEvent(changeEvent)
                    $element[0].dispatchEvent(inputEvent)
                })
            }

            function stepHandling(step) {
                calcStep(step)
                resetTimer()
                autoDelayHandler = setTimeout(function () {
                    autoIntervalHandler = setInterval(function () {
                        if (boostStepsCount > config.boostThreshold) {
                            if (autoMultiplier) {
                                calcStep(step * parseInt(boostMultiplier, 10))
                                boostMultiplier = Math.min(1000000, boostMultiplier * 1.1)
                            } else {
                                calcStep(step * boostMultiplier)
                            }
                        } else {
                            calcStep(step)
                        }
                        boostStepsCount++
                    }, config.autoInterval)
                }, config.autoDelay)
            }

            function calcStep(step) {
                if (isNaN(value)) {
                    value = 0
                }
                value = Math.round(value / step) * step
                value = Math.min(Math.max(value + step, min), max)
                $input[0].value = numberFormat.format(value)
                $original[0].value = Math.round(value * Math.pow(10, decimals)) / Math.pow(10, decimals)
                dispatchChangeEvents($original)
            }

            function resetTimer() {
                boostStepsCount = 0
                boostMultiplier = boostMultiplier = autoMultiplier ? 1 : config.boostMultiplier
                clearTimeout(autoDelayHandler)
                clearTimeout(autoIntervalHandler)
            }

        })

    }

    function onPointerUp(element, callback) {
        element.addEventListener("mouseup", function (e) {
            callback(e)
        })
        element.addEventListener("touchend", function (e) {
            callback(e)
        })
        element.addEventListener("keyup", function (e) {
            if (e.keyCode === 32) {
                spacePressed = false
                callback(e)
            }
        })
    }

    function onPointerDown(element, callback) {
        element.addEventListener("mousedown", function (e) {
            e.preventDefault()
            callback(e)
        })
        element.addEventListener("touchstart", function (e) {
            e.preventDefault()
            callback(e)
        })
        element.addEventListener("keydown", function (e) {
            if (e.keyCode === 32 && !spacePressed) {
                spacePressed = true
                callback(e)
            }
        })
    }

}(jQuery))
