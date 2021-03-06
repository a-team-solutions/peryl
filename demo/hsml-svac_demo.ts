import { Action, Mount } from "../src/hsml-svac";
import { HsmlFragment } from "../src/hsml";
import { Component, Actions, Ctrl } from "../src/hsml-svac-ctrl";

interface AppState {
    title: string;
    count: number;
}

const enum AppActions {
    title = "title",
    dec = "dec",
    inc = "inc",
    xXx = "xXx"
}

const App: Component<AppState> = {

    type: "App",

    state: {
        title: "Counter",
        count: 77
    },

    view: (state: AppState, action: Action, mount: Mount): HsmlFragment => [
        ["h2", [state.title]],
        ["p", [
            "Title: ",
            ["input",
                {
                    type: "text",
                    name: "title",
                    value: state.title,
                    // on: ["input", e => action(AppActions.title, (e.target as HTMLInputElement).value)],
                    // on: ["input", Actions.title, e => (e.target as HTMLInputElement).value]
                    on: ["input", AppActions.title]
                }
            ],
        ]],
        ["p", [
            ["em", ["Count"]], ": ", state.count,
            " ",
            ["button", { on: ["click", AppActions.dec, 1] }, ["-"]],
            ["button", { on: ["click", AppActions.inc, 2] }, ["+"]],
            ["button", { on: ["click", AppActions.xXx] }, ["xXx"]]
        ]],
        ["p", state.title ? mount<AppState>(Sub, state, action) : []]
    ],

    actions: (ctrl: Ctrl<AppState>, action: string | number, data?: any, event?: Event): void => {
        // console.log("action:", action, data, event);
        switch (action) {
            case AppActions.title:
                ctrl.update(data);
                break;
            case AppActions.inc:
                ctrl.update({ count: ctrl.state.count + data as number });
                setTimeout(ctrl.action, 1e3, AppActions.dec, 1); // async call
                break;
            case AppActions.dec:
                ctrl.update({ count: ctrl.state.count - data as number });
                break;
            default:
                ctrl.extAction(action, data, event);
        }
    }
};

const enum SubAppActions {
    xXx = "xXx"
}

const Sub: Component<AppState> = {

    type: "Sub",

    state: App.state,

    view: (state: AppState, action: Action, mount: Mount): HsmlFragment => [
        ["h3", [state.title]],
        ["p", [
            ["em", ["Count"]], ": ", state.count,
            " ",
            ["button", { on: ["click", SubAppActions.xXx] }, [SubAppActions.xXx]]
        ]]
    ],

    actions: (ctrl: Ctrl<AppState>, action: string | number, data?: any, event?: Event): void => {
        // console.log("action:", action, data, event);
        switch (action) {
            case SubAppActions.xXx:
                ctrl.extAction(action, data, event);
                break;
            default:
                ctrl.appAction(action, data, event);
        }
    }
};

const appActions: Actions<AppState> =
    (ctrl: Ctrl<AppState>, action: string | number, data: any, event?: Event) => {
        console.log(action, data);
        switch (action) {
            case "xXx":
                ctrl.update({ title: "xXx" });
                break;
        }
    };

Ctrl.debug = true;

const app = new Ctrl<AppState>(App)
    .appActions(appActions)
    .mount(document.getElementById("app"));

(self as any).app = app;
