import "jasmine";
import { div, span, a, ul, li, h2, input, button } from "../src/hyperscript";

const todo = (text: string) => li([
    a({ href: "#" }, [text])
]);

describe("hypescript", () => {

    it("basic elements", () => {
        expect(div("")).toEqual(["div"]);
        expect(span("#app.body")).toEqual(["span#app.body"]);
    });

    it("element with props", () => {
        expect(div({ click: "special" })).toEqual(["div", { click: "special" }]);
        expect(div(".app", { onInput: "z" })).toEqual(["div.app", { onInput: "z" }]);
    });

    it("nested elements", () => {
        expect(ul([
            li(["1. line"]),
            li(["2. line"]),
            li(["3. line"])
        ])).toEqual(["ul", [
            ["li", ["1. line"]],
            ["li", ["2. line"]],
            ["li", ["3. line"]]
        ]]);
    });

    it("deeply nested", () => {
        expect(
            div("#app", [
                span(["body"]),
                ul([
                    li(["1. line"]),
                    li(["2. line"]),
                    li(["3. line"])
                ])
            ])
        ).toEqual(
            ["div#app", [
                ["span", ["body"]],
                ["ul", [
                    ["li", ["1. line"]],
                    ["li", ["2. line"]],
                    ["li", ["3. line"]]
                ]]
            ]]
        );
    });

    it("should be equal with hsml", () => {
        expect(
            div("#todo-app", [
                h2(["Todo App"]),
                div(".main", [
                    input(".input-text", { type: "checkbox" }, ["placeholder"]),
                    button({ onclick: ["click"] }),
                    ul(".todos", ["first", "second", "third"].map(txt => todo(txt)))
                ])
            ]))
            .toEqual(
                ["div#todo-app", [
                    ["h2", ["Todo App"]],
                    ["div.main", [
                        ["input.input-text", { type: "checkbox" }, ["placeholder"]],
                        ["button", { onclick: ["click"] }],
                        ["ul.todos", [
                            ["li", [
                                ["a", { href: "#" }, ["first"]]
                            ]],
                            ["li", [
                                ["a", { href: "#" }, ["second"]]
                            ]],
                            ["li", [
                                ["a", { href: "#" }, ["third"]]
                            ]]
                        ]]
                    ]]
                ]]);
    });

});
