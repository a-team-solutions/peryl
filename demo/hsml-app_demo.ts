import { View, Actions, App } from "../src/hsml-app";
import { HsmlFragment, HsmlElement } from "../src/hsml";

interface State {
    title: string;
    count: number;
    x?: boolean | Boolean;
}

enum Action {
    title,
    dec,
    inc,
    clear,
    form,
    xXx
}

const state: State = {
    title: "Counter",
    count: 77
};

const view: View<State> = (state: State): HsmlFragment => [
    ["h2", [state.title]],
    ["p", [
        "Title: ",
        ["input",
            {
                type: "text",
                name: "title",
                value: new String(state.title),
                on: ["input", Action.title]
            }
        ], " ",
        ["button.w3-button.w3-blue",
            {
                type: "button",
                on: ["click", Action.clear]
            },
            ["Clear title"]
        ]
    ]],
    ["p", [
        ["em", ["Count"]], ": ", state.count,
        " ",
        ["button", { on: ["click", Action.dec, 1] }, ["-"]],
        ["button", { on: ["click", Action.inc, 2] }, ["+"]]
    ]],
    ["p", [
        ["button", { on: ["click", Action.xXx] }, ["xXx"]]
    ]],
    ["h2", ["Form"]],
    ["form",
        { on: ["submit", Action.form] },
        [
            "xy ",
            ["input",
                {
                    type: "text",
                    name: "xy",
                    value: "x"
                }
            ],
            ["input",
                {
                    type: "text",
                    name: "xy",
                    value: "y"
                }
            ],
            ["br"],
            "a ",
            ["input", {type: "checkbox", name: "a"}],
            ["br"],
            "b ",
            ["input", {type: "checkbox", name: "b", value: "b"}],
            ["br"],
            "c ",
            ["input", {type: "checkbox", name: "c"}],
            ["input", {type: "checkbox", name: "c"}],
            ["br"],
            "d ",
            ["input", {type: "checkbox", name: "d", value: "d1"}],
            ["input", {type: "checkbox", name: "d", value: "d2"}],
            ["br"],
            "r ",
            ["input", {type: "radio", name: "r", value: "r1"}],
            ["input", {type: "radio", name: "r", value: "r2"}],
            ["br"],
            "s ",
            ["select", { name: "s" },
                ["s1", "s2", "s3"]
                    .map<HsmlElement>(l => ["option", { value: l }, [l]])
            ],
            ["br"],
            "sm ",
            ["select", { name: "sm", multiple: true },
                ["sm1", "sm2", "sm3"]
                    .map<HsmlElement>(l => ["option", { value: l }, [l]])
            ],
            ["br"],
            ["button.w3-button.w3-blue",
                ["submit"]
            ]
        ]
    ],
    ["h2", ["Props update"]],
    ["input", { type: "checkbox", name: "x", on: ["change", "x"] }],
    ["input", {type: "checkbox", name: "xxxx", checked: state.x }],
    ["input", { type: "button", value: "x", disabled: state.x }]
];

const actions: Actions<State> = (app, action, data, event): void => {
    console.log("action:", Action[action as number], data);
    switch (action) {
        case Action.title:
            app.update(data);
            break;
        case Action.inc:
            app.update({ count: app.state.count + data as number });
            setTimeout(() => app.action(Action.dec, 1), 1e3); // async call
            break;
        case Action.dec:
            app.update({ count: app.state.count - data as number });
            break;
        case Action.clear:
            app.update({ title: "" });
            break;
        case Action.form:
            break;
        case "x":
            console.log("data.x", typeof data.x, data.x);
            app.state.x = new Boolean(data.x === "true");
            // app.state.x = data.x === "true";
            // app.state.x = data.x;
            app.update();
            // app.update({ x: new Boolean(data.x === "true") });
            // app.update({ x: data.x === "true" });
            // app.update({ x: data.x });
            console.log(app.state.x);
            break;
        default:
            console.warn("action unhandled:", action, data, event);
    }
};

const app = new App(state, view, actions).mount("app");

(self as any).app = app;


const html = app.toHtml();
console.log(html);
