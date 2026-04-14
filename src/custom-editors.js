/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/bootstrap-input-spinner
 * License: MIT, see file 'LICENSE'
 */

export const RawEditor = function (props, element) {
    this.parse = function (customFormat) {
        // parse nothing
        return customFormat
    }
    this.render = function (number) {
        // render raw
        return number
    }
}

export const TimeEditor = function (props, element) {
    // could be implemented more elegant maybe, but works
    this.parse = function (customFormat) {
        let trimmed = customFormat.trim()
        let sign = 1
        if (trimmed.charAt(0) === "-") {
            sign = -1
            trimmed = trimmed.replace("-", "")
        }
        const parts = trimmed.split(":")
        let hours = 0, minutes
        if (parts[1]) {
            hours = parseInt(parts[0], 10)
            minutes = parseInt(parts[1], 10)
        } else {
            minutes = parseInt(parts[0], 10)
        }
        return (hours * 60 + minutes) * sign
    }
    this.render = function (number) {
        let minutes = Math.abs(number % 60)
        if (minutes < 10) {
            minutes = "0" + minutes
        }
        let hours
        if (number >= 0) {
            hours = Math.floor(number / 60)
            return hours + ":" + minutes
        } else {
            hours = Math.ceil(number / 60)
            return "-" + Math.abs(hours) + ":" + minutes
        }
    }
}

// Deprecated: global `window.customEditors` is kept for backwards compatibility
// with users who load this file via a classic <script> tag. Prefer the named
// ES module exports above.
if (typeof window !== "undefined") {
    let warned = false
    const editors = {RawEditor, TimeEditor}
    window.customEditors = new Proxy(editors, {
        get(target, prop) {
            if (!warned && prop in target) {
                warned = true
                console.warn(
                    "bootstrap-input-spinner: window.customEditors is deprecated, " +
                    "import {RawEditor, TimeEditor} from 'bootstrap-input-spinner/src/custom-editors.js' instead."
                )
            }
            return target[prop]
        }
    })
}
