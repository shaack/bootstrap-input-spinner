/**
 * Author: shaack
 * Date: 14.03.2018
 */

(function ($) {
    "use strict";
    $.fn.InputSpinner = function (options) {

        const config = {
            decrementButton: "<strong>-</strong>", // button text
            incrementButton: "<strong>+</strong>", // ..
            groupClass: "input-group-spinner", // css class of the input-group
            buttonsClass: "btn-outline-secondary",
            buttonsWidth: "2.5em",
            textAlign: "center",
            autoDelay: 500, // ms holding before auto value change
            autoInterval: 100, // speed of auto value change
            boostThreshold: 15, // boost after these steps
            boostMultiplier: 2,
            locale: null // the locale for number rendering; if null, the browsers language is used
        };
        Object.assign(config, options);

        const html = '<div class="input-group ' + config.groupClass + '">' +
            '<div class="input-group-prepend">' +
            '<button style="min-width: ' + config.buttonsWidth + '" class="btn btn-decrement ' + config.buttonsClass + '" type="button">' + config.decrementButton + '</button>' +
            '</div>' +
            '<input style="text-align: ' + config.textAlign + '" class="input form-control"/>' +
            '<div class="input-group-append">' +
            '<button style="min-width: ' + config.buttonsWidth + '" class="btn btn-increment ' + config.buttonsClass + '" type="button">' + config.incrementButton + '</button>' +
            '</div>' +
            '</div>';

        this.each(function () {

            const $original = $(this);
            $original.hide();

            var autoDelayHandler = null;
            var autoIntervalHandler = null;

            const $inputGroup = $(html);
            const $buttonDecrement = $inputGroup.find(".btn-decrement");
            const $buttonIncrement = $inputGroup.find(".btn-increment");
            const $input = $inputGroup.find("input");

            const min = parseFloat($original.prop("min")) || 0;
            const max = parseFloat($original.prop("max")) || Infinity;
            const step = parseFloat($original.prop("step")) || 1;
            const decimals = parseInt($original.attr("data-decimals")) || 0;

            const locale = config.locale || navigator.language || "en-US";

            const numberFormat = new Intl.NumberFormat(locale, {minimumFractionDigits: decimals});

            var value = parseFloat($original.val());

            if (decimals === 0) {
                $input.attr("inputmode", "numeric").attr("pattern", "[0-9]*"); // ios numpad
            }

            $original.after($inputGroup);
            $input.val(numberFormat.format(value));

            var boostCount = 0;

            $input.on("paste keyup change", function () {
                if (locale !== "en-US" && locale !== "en-GB" && locale !== "th-TH") { // these locales use '.' for decimals
                    value = parseFloat($input.val().replace(/[. ]/g, '').replace(/[,]/g, '.'), 10); // i18n
                }
                value = Math.round(value / step) * step;
            });

            onPointerDown($buttonDecrement[0], function () {
                stepHandling(-step);
            });

            onPointerDown($buttonIncrement[0], function () {
                stepHandling(step);
            });

            onPointerUp(document.body, function () {
                resetTimer();
            });

            function stepHandling(step) {
                calcStep(step);
                resetTimer();
                autoDelayHandler = setTimeout(function () {
                    autoIntervalHandler = setInterval(function () {
                        if (boostCount > config.boostThreshold) {
                            calcStep(step * config.boostMultiplier);
                        } else {
                            calcStep(step);
                        }
                        boostCount++;
                    }, config.autoInterval);
                }, config.autoDelay);
            }

            function calcStep(step) {
                value = Math.min(Math.max(value + step, min), max);
                $input.val(numberFormat.format(value));
            }

            function resetTimer() {
                boostCount = 0;
                clearTimeout(autoDelayHandler);
                clearTimeout(autoIntervalHandler);
            }

        });

    };

    function onPointerUp(element, callback) {
        element.addEventListener("mouseup", function (e) {
            callback(e);
        });
        element.addEventListener("touchend", function (e) {
            callback(e);
        });
    }

    function onPointerDown(element, callback) {
        element.addEventListener("mousedown", function (e) {
            e.preventDefault();
            callback(e);
        });
        element.addEventListener("touchstart", function (e) {
            e.preventDefault();
            callback(e);
        });
    }

}(jQuery));