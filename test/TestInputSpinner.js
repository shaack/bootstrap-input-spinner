/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/bootstrap-input-spinner
 * License: MIT, see file 'LICENSE'
 */
import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {InputSpinner} from "../src/InputSpinner.js"
import {RawEditor} from "../src/custom-editors.js"

const fixture = document.getElementById("fixture")

function createInput(attrs = {}) {
    const input = document.createElement("input")
    input.type = "number"
    for (const [k, v] of Object.entries(attrs)) {
        input.setAttribute(k, String(v))
    }
    fixture.appendChild(input)
    return input
}

function spin(attrs = {}, props) {
    const el = createInput(attrs)
    const spinner = new InputSpinner(el, props)
    return {el, spinner, group: el.nextElementSibling}
}

function clear() {
    fixture.innerHTML = ""
}

function wait(ms = 0) {
    return new Promise(r => setTimeout(r, ms))
}

function pressButton(btn) {
    btn.dispatchEvent(new MouseEvent("mousedown", {button: 0, cancelable: true, bubbles: true}))
    document.body.dispatchEvent(new MouseEvent("mouseup", {button: 0, bubbles: true}))
}

describe("InputSpinner construction", () => {
    it("inserts an input-group after the original element", () => {
        const {el, group} = spin({value: "5"})
        assert.true(group !== null)
        assert.true(group.classList.contains("input-group"))
        assert.equal(group.querySelectorAll("button").length, 2)
        assert.equal(group.querySelectorAll("input").length, 1)
        clear()
    })
    it("hides the original input", () => {
        const {el} = spin({value: "5"})
        assert.equal(el.style.display, "none")
        clear()
    })
    it("marks the original element as a spinner", () => {
        const {el} = spin({value: "5"})
        assert.equal(el["bootstrap-input-spinner"], true)
        assert.equal(typeof el.setValue, "function")
        assert.equal(typeof el.destroyInputSpinner, "function")
        clear()
    })
    it("sets the initial value from the value attribute", () => {
        const {el, group} = spin({value: "7"})
        assert.equal(el.value, "7")
        assert.equal(group.querySelector("input").value, "7")
        clear()
    })
    it("leaves value empty (NaN) when no value attribute is given", () => {
        const {el, group} = spin()
        assert.equal(el.value, "")
        assert.equal(group.querySelector("input").value, "")
        clear()
    })
})

describe("InputSpinner I18n rendering (default editor)", () => {
    it("renders with data-decimals", () => {
        const {group} = spin({value: "4.5", "data-decimals": "2"}, {locale: "en-US"})
        assert.equal(group.querySelector("input").value, "4.50")
        clear()
    })
    it("uses thousands grouping by default", () => {
        const {group} = spin({value: "12345"}, {locale: "en-US"})
        assert.equal(group.querySelector("input").value, "12,345")
        clear()
    })
    it("disables grouping when data-digit-grouping=false", () => {
        const {group} = spin({value: "12345", "data-digit-grouping": "false"}, {locale: "en-US"})
        assert.equal(group.querySelector("input").value, "12345")
        clear()
    })
    it("honors the German locale separators", () => {
        const {group} = spin({value: "1234.5", "data-decimals": "1"}, {locale: "de-DE"})
        // German: '.' thousands, ',' decimal
        assert.equal(group.querySelector("input").value, "1.234,5")
        clear()
    })
})

describe("InputSpinner setValue", () => {
    it("clamps above max", () => {
        const {el, group} = spin({value: "5", min: "0", max: "10"})
        el.setValue(99)
        assert.equal(el.value, "10")
        assert.equal(group.querySelector("input").value, "10")
        clear()
    })
    it("clamps below min", () => {
        const {el, group} = spin({value: "5", min: "0", max: "10"})
        el.setValue(-99)
        assert.equal(el.value, "0")
        assert.equal(group.querySelector("input").value, "0")
        clear()
    })
    it("accepts floats", () => {
        const {el} = spin({value: "0", "data-decimals": "2"}, {locale: "en-US"})
        el.setValue(3.14)
        assert.equal(el.value, "3.14")
        clear()
    })
    it("clears value on NaN", () => {
        const {el, group} = spin({value: "5"})
        el.setValue(NaN)
        assert.equal(el.value, "")
        assert.equal(group.querySelector("input").value, "")
        clear()
    })
    it("element.setValue updates both the original and the visible input", () => {
        const {el, group} = spin({value: "1", min: "0", max: "100"})
        el.setValue(42)
        assert.equal(el.value, "42")
        assert.equal(group.querySelector("input").value, "42")
        clear()
    })
})

describe("InputSpinner stepping", () => {
    it("increments on the plus button", () => {
        const {el, group} = spin({value: "5", min: "0", max: "100", step: "1"})
        pressButton(group.querySelector(".btn-increment"))
        assert.equal(el.value, "6")
        clear()
    })
    it("decrements on the minus button", () => {
        const {el, group} = spin({value: "5", min: "0", max: "100", step: "1"})
        pressButton(group.querySelector(".btn-decrement"))
        assert.equal(el.value, "4")
        clear()
    })
    it("honors a custom step size", () => {
        const {el, group} = spin({value: "0", min: "0", max: "100", step: "10"})
        pressButton(group.querySelector(".btn-increment"))
        assert.equal(el.value, "10")
        pressButton(group.querySelector(".btn-increment"))
        assert.equal(el.value, "20")
        clear()
    })
    it("does not step past max", () => {
        const {el, group} = spin({value: "9", min: "0", max: "10", step: "1"})
        pressButton(group.querySelector(".btn-increment"))
        pressButton(group.querySelector(".btn-increment"))
        assert.equal(el.value, "10")
        clear()
    })
    it("does not step below min", () => {
        const {el, group} = spin({value: "1", min: "0", max: "10", step: "1"})
        pressButton(group.querySelector(".btn-decrement"))
        pressButton(group.querySelector(".btn-decrement"))
        assert.equal(el.value, "0")
        clear()
    })
    it("arrow-up key steps the value", () => {
        const {el, group} = spin({value: "5", min: "0", max: "10", step: "1"})
        group.querySelector("input").dispatchEvent(
            new KeyboardEvent("keydown", {key: "ArrowUp", bubbles: true, cancelable: true})
        )
        assert.equal(el.value, "6")
        clear()
    })
    it("arrow-down key steps the value", () => {
        const {el, group} = spin({value: "5", min: "0", max: "10", step: "1"})
        group.querySelector("input").dispatchEvent(
            new KeyboardEvent("keydown", {key: "ArrowDown", bubbles: true, cancelable: true})
        )
        assert.equal(el.value, "4")
        clear()
    })
})

describe("InputSpinner events", () => {
    it("dispatches 'input' when stepping", async () => {
        const {el, group} = spin({value: "5", min: "0", max: "10"})
        let fired = 0
        el.addEventListener("input", () => fired++)
        pressButton(group.querySelector(".btn-increment"))
        await wait()
        assert.true(fired >= 1)
        clear()
    })
    it("dispatches 'change' on pointer release", async () => {
        const {el, group} = spin({value: "5", min: "0", max: "10"})
        let fired = 0
        el.addEventListener("change", () => fired++)
        pressButton(group.querySelector(".btn-increment"))
        await wait()
        assert.equal(fired, 1)
        clear()
    })
})

describe("InputSpinner attribute observation", () => {
    it("reflects min/max changes", async () => {
        const {el} = spin({value: "5", min: "0", max: "10"})
        el.setAttribute("max", "7")
        await wait()
        el.setValue(99)
        assert.equal(el.value, "7")
        clear()
    })
    it("reflects disabled attribute", async () => {
        const {el, group} = spin({value: "5"})
        el.setAttribute("disabled", "disabled")
        await wait()
        assert.true(group.querySelector(".btn-increment").disabled)
        assert.true(group.querySelector(".btn-decrement").disabled)
        assert.true(group.querySelector("input").disabled)
        clear()
    })
    it("reflects readonly attribute on visible input", async () => {
        const {el, group} = spin({value: "5"})
        el.setAttribute("readonly", "readonly")
        await wait()
        assert.true(group.querySelector("input").readOnly)
        assert.true(group.querySelector(".btn-increment").disabled)
        clear()
    })
    it("maps form-control-sm to input-group-sm", async () => {
        const el = createInput({value: "5"})
        el.className = "form-control form-control-sm"
        new InputSpinner(el)
        await wait()
        assert.true(el.nextElementSibling.classList.contains("input-group-sm"))
        clear()
    })
    it("maps form-control-lg to input-group-lg", async () => {
        const el = createInput({value: "5"})
        el.className = "form-control form-control-lg"
        new InputSpinner(el)
        await wait()
        assert.true(el.nextElementSibling.classList.contains("input-group-lg"))
        clear()
    })
})

describe("InputSpinner prefix/suffix", () => {
    it("renders a prefix element", () => {
        const {group} = spin({value: "5", "data-prefix": "$"})
        const prefix = group.querySelector(".input-group-text")
        assert.true(prefix !== null)
        assert.equal(prefix.textContent, "$")
        clear()
    })
    it("renders a suffix element", () => {
        const {group} = spin({value: "5", "data-suffix": "kg"})
        const suffix = group.querySelector(".input-group-text")
        assert.true(suffix !== null)
        assert.equal(suffix.textContent, "kg")
        clear()
    })
})

describe("InputSpinner buttonsOnly mode", () => {
    it("makes the input readonly", () => {
        const {group} = spin({value: "5"}, {buttonsOnly: true})
        assert.true(group.querySelector("input").readOnly)
        clear()
    })
    it("still allows button stepping", () => {
        const {el, group} = spin({value: "5", min: "0", max: "10"}, {buttonsOnly: true})
        pressButton(group.querySelector(".btn-increment"))
        assert.equal(el.value, "6")
        clear()
    })
})

describe("InputSpinner custom editor", () => {
    it("uses the supplied editor for rendering", () => {
        const {group} = spin({value: "3.14159"}, {editor: RawEditor})
        assert.equal(group.querySelector("input").value, "3.14159")
        clear()
    })
})

describe("InputSpinner destroy", () => {
    it("removes the input-group and un-hides the original", () => {
        const {el, group} = spin({value: "5"})
        assert.true(group.isConnected)
        el.destroyInputSpinner()
        assert.false(group.isConnected)
        assert.notEqual(el.style.display, "none")
        assert.equal(el["bootstrap-input-spinner"], undefined)
        clear()
    })
})
