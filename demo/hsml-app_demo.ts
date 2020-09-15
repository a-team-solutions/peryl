import { HView, HView1, HDispatcher, HApp, HAppAction } from "../src/hsml-app";
import { HElements, HElement } from "../src/hsml";

interface CounterState {
    count: number;
}

enum CounterAction {
    dec = "counter-dec",
    inc = "counter-inc"
}

const counterView: HView1<CounterState> = (state: CounterState): HElement => {
    return ["div", [
        ["h2", ["Counter"]],
        ["p", [
            ["em", ["Count"]], ": ", state.count,
            " ",
            ["button", { on: ["click", CounterAction.dec, 1] }, ["-"]],
            ["button", { on: ["click", CounterAction.inc, 2] }, ["+"]]
        ]]
    ]];
};

const counterDispatcher: HDispatcher<CounterState> = (app, action) => {
    switch (action.type) {
        case CounterAction.inc:
            app.state.count = app.state.count + action.data as number;
            app.update();
            setTimeout(() => app.dispatch(CounterAction.dec, 1), 1e3); // async call
            break;
        case CounterAction.dec:
            app.state.count = app.state.count - action.data as number;
            app.update();
            break;
    }
};

interface State {
    title: string;
    counter: CounterState;
    x?: boolean | Boolean;
}

enum Action {
    title = "title",
    clear = "clear",
    formSubmit = "formSubmit",
    formChange = "formChange",
    xXx = "xXx",
    x = "x"
}

const state: State = {
    title: "Title",
    counter: {
        count: 77
    }
};

const view: HView<State> = (state: State): HElements => [
    ["h2", [state.title]],
    ["p", [
        "Title: ",
        ["input",
            {
                type: "text",
                // name: "title",
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
    counterView(state.counter),
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
    ["input", { type: "checkbox", name: "x", on: ["change", Action.x] }],
    ["input", { type: "checkbox", checked: state.x }],
    ["input", { type: "radio", name: "y", checked: state.x }],
    ["input", { type: "radio", name: "y", checked: !state.x }],
    ["input", { type: "button", value: "x", disabled: state.x }]
];

const dispatcher: HDispatcher<State> = (app, action): void => {
    console.log("action:", action);
    app.callDispatcher<CounterState>(counterDispatcher, state.counter, action);
    switch (action.type) {
        case HAppAction._init:
        case HAppAction._mount:
        case HAppAction._umount:
            break;
        case Action.title:
            app.state.title = action.data;
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
            console.log("data.x", typeof action.data.x, action.data.x);
            app.state.x = new Boolean(action.data.x === "true");
            // app.app.state.x = data.x === "true";
            // app.app.state.x = data.x;
            app.update();
            break;
        // default:
        //     console.warn("action unhandled:", action);
    }
};

// HApp.debug = true;

const app = new HApp(state, view, dispatcher)
    .onUpdate(a => console.log("state:", JSON.stringify(a.state, null, 4)))
    .mount(document.getElementById("app"));

// // Controller Dispatcher Demo

// type HController<State> = (this: HApp<State>,
//                            data?: HAction["data"],
//                            event?: HAction["event"]) => void;

// type HControllers<State, Actions> = { [actionType in keyof Actions]?: HController<State> };

// const controllersDdispatcher =
//     <State, Action>(controllers: HControllers<State, Action>): HDispatcher<State> =>
//         (app, action): void => {
//             if (controllers[action.type]) {
//                 controllers[action.type].apply<HApp<State>>(app, action.data, action.event);
//                 app.update();
//             } else {
//                 console.warn("no controller for action", action);
//             }
//         };


// const controllers: HControllers<State, { [actionType in keyof typeof Action | HAppAction]: string }> = {
//     _init: () => {
//     },
//     _mount: () => {
//     },
//     _umount: () => {
//     },
//     title: data => {
//         state.title = data;
//     },
//     clear: () => {
//         state.title = "";
//     },
//     x: data => {
//         console.log("data.x", typeof data.x, data.x);
//         state.x = new Boolean(data.x === "true");
//         // app.state.x = data.x === "true";
//         // app.state.x = data.x;
//     },
//     formChange: data => {},
//     formSubmit: data => {},
//     xXx: data => {}
// };

// // HApp.debug = true;
// const app = new HApp(state, view, controllersDdispatcher(controllers))
//     .mount(document.getElementById("app"));

(self as any).app = app;


// const html = app.toHtml();
// console.log(html);
