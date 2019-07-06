import { Action, Manage, html, htmls } from "../src/hsml-sva";
import { Hsmls } from "../src/hsml";
import { OnAction, Ctrl, Component } from "../src/hsml-svac";

interface AppState {
    title: string;
    count: number;
}

enum AppActions {
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

    view: (state: AppState, action: Action, manage: Manage): Hsmls => {
        return [
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
            ["p", state.title ? manage<AppState>(Sub, state) : []]
        ];
    },

    onAction: (action: string, data: any, ctrl: Ctrl<AppState>): void => {
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
    }

};

enum SubAppActions {
    xXx = "xXx"
}

const Sub: Component<AppState> = {

    type: "Sub",

    state: App.state,

    view: (state: AppState, action: Action, manage: Manage): Hsmls => {
        return [
            ["h3", [state.title]],
            ["p", [
                ["em", ["Count"]], ": ", state.count,
                " ",
                ["button", { on: ["click", SubAppActions.xXx] }, [SubAppActions.xXx]]
            ]]
        ];
    },

    onAction: (action: string, data: any, ctrl: Ctrl<AppState>): void => {
        // console.log("action:", action, data);
        switch (action) {
            case SubAppActions.xXx:
                console.log(action);
                break;
            default:
                ctrl.appAction(action, data);
        }
    }

};


// Client side app rendering

const appOnAction: OnAction<AppState> = (action: string, data: any, ctrl: Ctrl<AppState>) => {
    console.log(action, data);
    switch (action) {
        case "xXx":
            ctrl.update({ title: "xXx" });
            break;
    }
};

const app = new Ctrl<AppState>(App)
    .appOnAction(appOnAction)
    .mount(document.getElementById("app"));

(self as any).app = app;


// Server side html rendering

html<AppState>(App, App.state, html => console.log(html), true);

const h = htmls<AppState>(App, App.state, true);
console.log(h);
