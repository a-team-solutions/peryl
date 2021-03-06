import "jasmine";
import { h } from "../src/hsml-h";
import { HsmlElement } from "../src/hsml";

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
                        todos.map<HsmlElement>(todo =>
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
                        todos.map<HsmlElement>(todo =>
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
