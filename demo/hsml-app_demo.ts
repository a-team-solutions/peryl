import { HView, HView1, HControl, HApp, HAppAction } from "../src/hsml-app";
import { HElements, HElement } from "../src/hsml";

interface CounterModel {
    count: number;
}

enum CounterAction {
    dec = "counter-dec",
    inc = "counter-inc"
}

const counterView: HView1<CounterModel> = (model: CounterModel): HElement => {
    return ["div", [
        ["h2", ["Counter"]],
        ["p", [
            ["em", ["Count"]], ": ", model.count,
            " ",
            ["button", { on: ["click", CounterAction.dec, 1] }, ["-"]],
            ["button", { on: ["click", CounterAction.inc, 2] }, ["+"]]
        ]]
    ]];
};

const counterControl: HControl<CounterModel> = (ctx, action) => {
    switch (action.type) {
        case CounterAction.inc:
            ctx.model.count = ctx.model.count + action.data as number;
            ctx.update();
            setTimeout(() => ctx.dispatch(CounterAction.dec, 1), 1e3); // async call
            break;
        case CounterAction.dec:
            ctx.model.count = ctx.model.count - action.data as number;
            ctx.update();
            break;
    }
};

interface Model {
    title: string;
    counter: CounterModel;
    x?: boolean | Boolean;
}

enum Action {
    title = "title",
    clear = "clear",
    formSubmit = "formSubmit",
    formChange = "formChange",
    xXx = "xXx"
}

const model: Model = {
    title: "Title",
    counter: {
        count: 77
    }
};

const view: HView<Model> = (model: Model): HElements => [
    ["h2", [model.title]],
    ["p", [
        "Title: ",
        ["input",
            {
                type: "text",
                // name: "title",
                value: new String(model.title),
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
    counterView(model.counter),
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
    ["h2", ["Action event"]],
    ["p", [
        ["button", { on: ["click", Action.xXx] }, ["xXx"]]
    ]],
    ["h2", ["Props update"]],
    ["input", { type: "checkbox", name: "x", on: ["change", "x"] }],
    ["input", { type: "checkbox", checked: model.x }],
    ["input", { type: "radio", name: "y", checked: model.x }],
    ["input", { type: "radio", name: "y", checked: !model.x }],
    ["input", { type: "button", value: "x", disabled: model.x }]
];

const control: HControl<Model> = ({ model, update, dispatch }, action): void => {
    console.log("action:", action);
    counterControl({ model: model.counter, update, dispatch }, action);
    switch (action.type) {
        case HAppAction._init:
        case HAppAction._mount:
        case HAppAction._umount:
            break;
        case Action.title:
            model.title = action.data;
            update();
            break;
        case Action.clear:
            model.title = "";
            update();
            break;
        case Action.formSubmit:
        case Action.formChange:
            break;
        case "x":
            console.log("data.x", typeof action.data.x, action.data.x);
            model.x = new Boolean(action.data.x === "true");
            // app.model.x = data.x === "true";
            // app.model.x = data.x;
            update();
            break;
        // default:
        //     console.warn("action unhandled:", action);
    }
};

// HApp.debug = true;
const app = new HApp(model, view, control).mount(document.getElementById("app"));

(self as any).app = app;


// const html = app.toHtml();
// console.log(html);
