import { HView, HActions, HApp, HAppAction } from "../src/hsml-app";
import { HElements, HElement } from "../src/hsml";

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
    formSubmit,
    formChange,
    xXx
}

const state: State = {
    title: "Counter",
    count: 77
};

const view: HView<State> = (state: State): HElements => [
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
        {
            on: [
                ["submit", Action.formSubmit],
                ["change", Action.formChange]
            ]
        },
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
                    .map<HElement>(l => ["option", { value: l }, [l]])
            ],
            ["br"],
            "sm ",
            ["select", { name: "sm", multiple: true },
                ["sm1", "sm2", "sm3"]
                    .map<HElement>(l => ["option", { value: l }, [l]])
            ],
            ["br"],
            ["button.w3-button.w3-blue",
                ["submit"]
            ]
        ]
    ],
    ["h2", ["Props update"]],
    ["input", { type: "checkbox", name: "x", on: ["change", "x"] }],
    ["input", { type: "checkbox", checked: state.x }],
    ["input", { type: "radio", name: "y", checked: state.x }],
    ["input", { type: "radio", name: "y", checked: !state.x }],
    ["input", { type: "button", value: "x", disabled: state.x }]
];

const actions: HActions<State> = (app, action, data, event): void => {
    console.log("action:", Action[action as number] || action, data);
    switch (action) {
        case HAppAction._init:
        case HAppAction._mount:
        case HAppAction._umount:
            break;
        case Action.title:
            app.state = data;
            app.update();
            break;
        case Action.inc:
            app.state.count = app.state.count + data as number;
            app.update();
            setTimeout(() => app.action(Action.dec, 1), 1e3); // async call
            break;
        case Action.dec:
            app.state.count = app.state.count - data as number;
            app.update();
            break;
        case Action.clear:
            app.state.title = "";
            app.update();
            break;
        case Action.formSubmit:
        case Action.formChange:
            break;
        case "x":
            console.log("data.x", typeof data.x, data.x);
            app.state.x = new Boolean(data.x === "true");
            // app.state.x = data.x === "true";
            // app.state.x = data.x;
            app.update();
            break;
        default:
            console.warn("action unhandled:", action, data, event);
    }
};

// HApp.debug = true;
const app = new HApp(state, view, actions).mount(document.getElementById("app"));

(self as any).app = app;


// const html = app.toHtml();
// console.log(html);
