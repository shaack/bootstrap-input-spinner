/**
 * Author and copyright: Stefan Haack (https://shaack.com)
 * Repository: https://github.com/shaack/bootstrap-input-spinner
 * License: MIT, see file 'LICENSE'
 */
import {describe, it, assert} from "../node_modules/teevi/src/teevi.js"
import {RawEditor, TimeEditor} from "../src/custom-editors.js"

describe("RawEditor", () => {
    it("parses input unchanged", () => {
        const editor = new RawEditor({}, document.createElement("input"))
        assert.equal(editor.parse("42"), "42")
        assert.equal(editor.parse("abc"), "abc")
    })
    it("renders number unchanged", () => {
        const editor = new RawEditor({}, document.createElement("input"))
        assert.equal(editor.render(3.14), 3.14)
        assert.equal(editor.render(0), 0)
    })
})

describe("TimeEditor", () => {
    const editor = new TimeEditor({}, document.createElement("input"))

    it("parses H:MM into total minutes", () => {
        assert.equal(editor.parse("1:30"), 90)
        assert.equal(editor.parse("0:05"), 5)
        assert.equal(editor.parse("10:00"), 600)
    })
    it("parses bare minutes", () => {
        assert.equal(editor.parse("45"), 45)
    })
    it("parses negative times", () => {
        assert.equal(editor.parse("-1:30"), -90)
        assert.equal(editor.parse("-0:15"), -15)
    })
    it("renders positive total minutes as H:MM", () => {
        assert.equal(editor.render(90), "1:30")
        assert.equal(editor.render(5), "0:05")
        assert.equal(editor.render(600), "10:00")
    })
    it("renders zero", () => {
        assert.equal(editor.render(0), "0:00")
    })
    it("renders negative total minutes with leading minus", () => {
        assert.equal(editor.render(-90), "-1:30")
        assert.equal(editor.render(-15), "-0:15")
    })
    it("is round-trip stable for positive values", () => {
        for (const v of [0, 5, 59, 60, 61, 125, 600]) {
            assert.equal(editor.parse(editor.render(v)), v)
        }
    })
})
