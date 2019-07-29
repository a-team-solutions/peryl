import "jasmine";
import { div, a, ul, li, input, h2, button } from "../src/hyperscript";

const todo = (text: string) => li([
    a({ href: "#" }, [text])

]);

describe("hypescript", () => {

    it("should be equal with hsml", () => {
        expect(div("#todo-app", [
            h2(["Todo App"]),
            div(".main", [
                input(".input-text", { type: "checkbox" }, ["placeholder"]),
                button({ onclick: ["click"] }),
                ul(".todos", ["first", "second", "third"].map(txt => todo(txt)))
            ])
        ])).toEqual(["div#todo-app", [
            ["h2", "Todo App"],
            ["div.main", [
                ["input.input-text", { type: "checkbox" }, "placeholder"],
                ["button", { onclick: ["click"] }],
                ["ul.todos", [
                    ["li",
                        [["a", { href: "#" }, "first"]]],
                    ["li",
                        [["a", { href: "#" }, "second"]]],
                    ["li",
                        [["a", { href: "#" }, "third"]]]
                ]]
            ]]]] as any);
    });

});

