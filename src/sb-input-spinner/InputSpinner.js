/**
 * Author: shaack
 * Date: 14.03.2018
 */

(function ($) {
    "use strict";
    $.fn.InputSpinner = function (options) {

        const config = {
            decrementHtml: "<strong>-</strong>",
            incrementHtml: "<strong>+</strong>",
            buttonClass: "btn-outline-secondary",
            buttonWidth: "2.5em",
            textAlign: "center",

        };
        Object.assign(config, options);

        const html = '<div class="input-group input-spinner">' +
            '<div class="input-group-prepend">' +
            '<button style="min-width: ' + config.buttonWidth + '" class="btn btn-decrement ' + config.buttonClass + '" type="button">' + config.decrementHtml + '</button>' +
            '</div>' +
            '<input style="text-align: ' + config.textAlign + '" class="input"/>' +
            '<div class="input-group-append">' +
            '<button style="min-width: ' + config.buttonWidth + '" class="btn btn-increment ' + config.buttonClass + '" type="button">' + config.incrementHtml + '</button>' +
            '</div>' +
            '</div>';

        this.each(function () {

            const $original = $(this);
            const originalWidth = $original.outerWidth();
            $original.hide();

            const $inputGroup = $(html);
            const $buttonDecrement = $inputGroup.find(".btn-decrement");
            const $buttonIncrement = $inputGroup.find(".btn-increment");
            const $input = $inputGroup.find("input");

            const min = parseFloat($original.prop("min"));
            const max = parseFloat($original.prop("max"));
            const step = parseFloat($original.prop("step"));
            const decimals = parseInt($original.attr("data-decimals") | 0);

            const numberFormat = new Intl.NumberFormat(getLang(), {minimumFractionDigits: decimals});
            console.log(getLang());

            var value = parseFloat($original.val());

            $original.after($inputGroup);

            $input.css("width", originalWidth + (decimals * 9) + "px");
            $input.val(numberFormat.format(value));

            onPointerDown($buttonDecrement[0], function () {
                onDecrement();
            });

            onPointerDown($buttonIncrement[0], function () {
                onIncrement();
            });

            function onDecrement() {
                value = Math.max(value - step, min);
                $input.val(numberFormat.format(value));
            }

            function onIncrement() {
                value = Math.min(value + step, max);
                $input.val(numberFormat.format(value));
            }

        });

    };

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

    function getLang() {
        if (navigator.languages !== undefined) {
            return navigator.languages[0];
        } else {
            return navigator.language;
        }
    }
}(jQuery));