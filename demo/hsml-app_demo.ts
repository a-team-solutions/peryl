import { View, Actions, App } from "../src/hsml-app";
import { HsmlFragment } from "../src/hsml";

interface State {
    title: string;
    count: number;
}

enum Action {
    title = "title",
    dec = "dec",
    inc = "inc",
    xXx = "xXx"
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
                value: state.title,
                on: ["input", Action.title]
            }
        ],
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

const actions: Actions<State> = (action: string, data: any, app: App<State>): void => {
    console.log("action:", action, data);
    switch (action) {
        case Action.title:
            // const title = data;
            const title = ((data as Event).target as HTMLInputElement).value;
            app.update({ title });
            break;
        case Action.inc:
            app.update({ count: app.state.count + data as number });
            setTimeout(() => app.action(Action.dec, 1), 1e3); // async call
            break;
        case Action.dec:
            app.update({ count: app.state.count - data as number });
            break;
        default:
            console.warn("action unhandled:", action, data);
    }
};

const app = new App(state, view, actions)
    .mount(document.getElementById("app"));

(self as any).app = app;


const html = app.toHtml();
console.log(html);
