import { Action, Mount } from "../src/hsml-svac";
import { Hsmls } from "../src/hsml";
import { View, Actions, Ctrl } from "../src/hsml-svac-ctrl";

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

const App: View<AppState> =
    (state: AppState, action: Action, mount: Mount): Hsmls => [
        ["h2", [state.title]],
        ["p", [
            "Title: ",
            ["input",
                {
                    type: "text",
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
        ["p", state.title ? mount<AppState>(Sub, state) : []]
    ];
App.type = "App";
App.state = {
    title: "Counter",
    count: 77
};
App.actions = (action: string, data: any, ctrl: Ctrl<AppState>): void => {
    // console.log("action:", action, data);
    switch (action) {
        case AppActions.title:
            // const title = data;
            const title = ((data as Event).target as HTMLInputElement).value;
            ctrl.update({ title });
            break;
        case AppActions.inc:
            ctrl.update({ count: ctrl.state.count + data as number });
            setTimeout(ctrl.action, 1e3, AppActions.dec, 1); // async call
            break;
        case AppActions.dec:
            ctrl.update({ count: ctrl.state.count - data as number });
            break;
        default:
            ctrl.appAction(action, data);
    }
};

const enum SubAppActions {
    xXx = "xXx"
}

const Sub: View<AppState> =
    (state: AppState, action: Action, mount: Mount): Hsmls => [
        ["h3", [state.title]],
        ["p", [
            ["em", ["Count"]], ": ", state.count,
            " ",
            ["button", { on: ["click", SubAppActions.xXx] }, [SubAppActions.xXx]]
        ]]
    ];
Sub.type = "Sub";
Sub.state = App.state;
Sub.actions = (action: string, data: any, ctrl: Ctrl<AppState>): void => {
    // console.log("action:", action, data);
    switch (action) {
        case SubAppActions.xXx:
            console.log(action);
            break;
        default:
            ctrl.appAction(action, data);
    }
};

const appActions: Actions<AppState> =
    (action: string, data: any, ctrl: Ctrl<AppState>) => {
        console.log(action, data);
        switch (action) {
            case "xXx":
                ctrl.update({ title: "xXx" });
                break;
        }
    };

const app = new Ctrl<AppState>(App)
    .appActions(appActions)
    .mount(document.getElementById("app"));

(self as any).app = app;
