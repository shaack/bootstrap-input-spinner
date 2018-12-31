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
            buttonsWidth: "2.5rem",
            textAlign: "center",
            autoDelay: 500, // ms holding before auto value change
            autoInterval: 100, // speed of auto value change
            boostThreshold: 10, // boost after these steps
            boostMultiplier: "auto", // you can also set a constant number as multiplier
            locale: null // the locale for number rendering; if null, the browsers language is used
        }
        for (var option in options) {
            config[option] = options[option]
        }

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
            var stepMax = parseInt($original.attr("data-step-max")) || 0
            var decimals = parseInt($original.attr("data-decimals")) || 0

            var numberFormat = new Intl.NumberFormat(locale, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })
            var value = parseFloat($original[0].value)
            var boostStepsCount = 0

            var prefix = $original.attr("data-prefix") || ""
            var suffix = $original.attr("data-suffix") || ""

            if (prefix) {
                var prefixElement = $('<span class="input-group-text">' + prefix + '</span>')
                $inputGroup.find(".input-group-prepend").append(prefixElement)
            }
            if (suffix) {
                var suffixElement = $('<span class="input-group-text">' + suffix + '</span>')
                $inputGroup.find(".input-group-append").prepend(suffixElement)
            }

            $original[0].setValue = function (newValue) {
                setValue(newValue)
            }

            var observer = new MutationObserver(function () {
                copyAttributes()
            })
            observer.observe($original[0], {attributes: true})
            copyAttributes()

            $original.after($inputGroup)

            setValue(value)

            $input.on("paste input change focusout", function (event) {
                var newValue = $input[0].value
                var focusOut = event.type === "focusout"
                if (!(locale === "en-US" || locale === "en-GB" || locale === "th-TH")) {
                    newValue = newValue.replace(/[. ]/g, '').replace(/,/g, '.')
                }
                setValue(newValue, focusOut)
                dispatchEvent($original, event.type)
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

            function setValue(newValue, updateInput) {
                if(updateInput === undefined) {
                    updateInput = true
                }
                if (isNaN(newValue) || newValue === "") {
                    $original[0].value = ""
                    if (updateInput) {
                        $input[0].value = ""
                    }
                    value = 0
                } else {
                    newValue = parseFloat(newValue)
                    newValue = Math.min(Math.max(newValue, min), max)
                    newValue = Math.round(newValue * Math.pow(10, decimals)) / Math.pow(10, decimals)
                    $original[0].value = newValue
                    if (updateInput) {
                        $input[0].value = numberFormat.format(newValue)
                    }
                    value = newValue
                }
            }

            function dispatchEvent($element, type) {
                if (type) {
                    setTimeout(function () {
                        var event;
                        if(typeof(Event) === 'function') {
                            event = new Event(type, {bubbles: true})
                        } else { // IE
                            event = document.createEvent('Event');
                            event.initEvent(type, true, true);
                        }
                        $element[0].dispatchEvent(event)
                    })
                }
            }

            function stepHandling(step) {
                if(!$input[0].disabled) {
                    calcStep(step)
                    resetTimer()
                    autoDelayHandler = setTimeout(function () {
                        autoIntervalHandler = setInterval(function () {
                            if (boostStepsCount > config.boostThreshold) {
                                if (autoMultiplier) {
                                    calcStep(step * parseInt(boostMultiplier, 10))
                                    boostMultiplier = Math.min(1000000, boostMultiplier * 1.1)
                                    if (stepMax) {
                                        boostMultiplier = Math.min(stepMax, boostMultiplier)
                                    }
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
            }

            function calcStep(step) {
                if (isNaN(value)) {
                    value = 0
                }
                setValue(Math.round(value / step) * step + step)
                dispatchEvent($original, "input")
                dispatchEvent($original, "change")
            }

            function resetTimer() {
                boostStepsCount = 0
                boostMultiplier = boostMultiplier = autoMultiplier ? 1 : config.boostMultiplier
                clearTimeout(autoDelayHandler)
                clearTimeout(autoIntervalHandler)
            }

            function copyAttributes() {
                $input.prop("required", $original.prop("required"))
                $input.prop("placeholder", $original.prop("placeholder"))
                var disabled = $original.prop("disabled")
                $input.prop("disabled", disabled)
                $buttonIncrement.prop("disabled", disabled)
                $buttonDecrement.prop("disabled", disabled)
                $input.prop("class", "form-control " + $original.prop("class"))
                $inputGroup.prop("class", "input-group " + $original.prop("class") + " " + config.groupClass)
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
            if(e.cancelable) {
                e.preventDefault()
            }
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
