import "jasmine";
import { h } from "../src/hsml-h";
import { HElement } from "../src/hsml";

describe("hypescript", () => {

    it("basic elements", () => {
        expect(
            h("div")
        )
        .toEqual(
            ["div"]
        );
        expect(
            h("span#app.body")
        )
        .toEqual(
            ["span#app.body"]
        );
    });

    it("element with props", () => {
        expect(
            h("div", { click: "special" })
        )
        .toEqual(
            ["div", { click: "special" }]);
        expect(
            h("div.app", { title: "z" })
        )
        .toEqual(
            ["div.app", { title: "z" }]
        );
    });

    it("nested elements", () => {
        expect(
            h("ul", [
                h("li", "1. line"),
                h("li", "2. line"),
                h("li", "3. line")
            ])
        )
        .toEqual(["ul", [
            ["li", ["1. line"]],
            ["li", ["2. line"]],
            ["li", ["3. line"]]
        ]]);
    });

    it("nested elements with function", () => {
        const focusFnc = (e: any) => (e && e.focus && e.focus());
        expect(
            h("div", [
                h("input", { type: "text", value: "1." }, focusFnc),
                h("input", { type: "text", value: "2." })
            ])
        )
        .toEqual(["div", [
            ["input", { type: "text", value: "1." }, focusFnc],
            ["input", { type: "text", value: "2." }]
        ]]);
    });

    it("nested elements with ternary operator", () => {
        const alwaysTrue: boolean = true;
        expect(
            h("div", [
                h("section", [
                    h("div", "Hello"),
                    h("div", alwaysTrue
                        ? [h("div", "body")]
                        : "body")
                ]),
                h("footer", "Footer")
            ])
        )
        .toEqual(["div", [
            ["section", [
                ["div", ["Hello"]],
                ["div", alwaysTrue
                    ? [["div", ["body"]]]
                    : "body"]
            ]],
            ["footer", ["Footer"]]
        ]]);
    });

    it("deeply nested", () => {
        expect(
            h("div#app", [
                h("span", "body"),
                h("ul", [
                    h("li", "1. line"),
                    h("li", "2. line"),
                    h("li", "3. line")
                ])
            ])
        )
        .toEqual(
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
        const todos = ["first", "second", "third"];
        expect(
            h("div#todo-app", [
                h("h2", "Todo App"),
                h("div.main", [
                    h("input.input-text", { type: "checkbox" }, "placeholder"),
                    h("button", { onclick: ["click"] }),
                    h("ul.todos",
                        todos.map<HElement>(todo =>
                            h("li", [
                                h("a", { href: "#" }, todo)
                            ])
                        )
                    )
                ])
            ])
        )
        .toEqual(
            ["div#todo-app", [
                ["h2", ["Todo App"]],
                ["div.main", [
                    ["input.input-text", { type: "checkbox" }, ["placeholder"]],
                    ["button", { onclick: ["click"] }],
                    ["ul.todos",
                        todos.map<HElement>(todo =>
                            ["li", [
                                ["a", { href: "#" }, [todo]]
                            ]]
                        )
                    ]
                ]]
            ]]
        );
    });

});
