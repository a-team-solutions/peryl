import { View, Actions, App } from "../src/hsml-app";
import { HsmlFragment } from "../src/hsml";

interface State {
    title: string;
    count: number;
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
        ["form",
            { on: ["submit", Action.form] },
            [
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
            ]
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
    ]]
];

const actions: Actions<State> = (app, action, data, event): void => {
    console.log("action:", Action[action as number], data, event);
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
        default:
            console.warn("action unhandled:", action, data, event);
    }
};

const app = new App(state, view, actions).mount("app");

(self as any).app = app;


const html = app.toHtml();
console.log(html);
