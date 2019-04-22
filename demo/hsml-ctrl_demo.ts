import { ICtrl, Action, Manage, View, OnAction, ctrlHtml, ctrlHtmls } from "../src/hsml-ctrl";
import { Hsmls } from "../src/hsml";
import { ctrlApp } from "../src/hsml-ctrl-web";

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

const appState: AppState = {
    title: "Counter",
    count: 77
};

const appView: View<AppState> = (state: AppState, action: Action, manage: Manage): Hsmls => {
    return [
        ["h2", [state.title]],
        ["p", [
            "Title: ",
            ["input",
                {
                    type: "text",
                    value: state.title,
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
        ["p", state.title ? manage<AppState>(state, subView, subOnAction) : []]
    ];
};

const appOnAction: OnAction<AppState> = (action: string, data: any, ctrl: ICtrl<AppState>): void => {
    // console.log("action:", action, data);
    switch (action) {
        case AppActions.title:
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
            ctrl.actionGlobal(action, data);
    }
};


enum SubAppActions {
    xXx = "xXx"
}

const subView: View<AppState> = (state: AppState, action: Action, manage: Manage): Hsmls => {
    return [
        ["h3", [state.title]],
        ["p", [
            ["em", ["Count"]], ": ", state.count,
            " ",
            ["button", { on: ["click", SubAppActions.xXx] }, [SubAppActions.xXx]]
        ]]
    ];
};

const subOnAction: OnAction<AppState> = (action: string, data: any, ctrl: ICtrl<AppState>): void => {
    // console.log("action:", action, data);
    switch (action) {
        case SubAppActions.xXx:
            console.log(action);
            break;
        default:
            ctrl.actionGlobal(action, data);
    }
};


// Client side app rendering

const onActionGlobal: OnAction<AppState> = (action: string, data: any, ctrl: ICtrl<AppState>) => {
    console.log(action, data);
    switch (action) {
        case "xXx":
            ctrl.update({ title: "xXx" });
            break;
    }
};

const a = ctrlApp<AppState>(appState, appView, appOnAction, "app")
    .onActionGlobal(onActionGlobal)
    .mount(document.getElementById("app"));

(self as any).app = a;


// Server side html rendering

ctrlHtml<AppState>(appState, appView, html => console.log(html), true);

const h = ctrlHtmls<AppState>(appState, appView, true);
console.log(h);
