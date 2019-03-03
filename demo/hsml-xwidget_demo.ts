import { Widget, Action, Manage, XWidget } from "../src/hsml-xwidget";
import { xWidget } from "../src/hsml-xwidget-web";
import { Hsmls } from "../src/hsml";

interface AppState {
    title: string;
    count: number;
}

enum AppActions {
    title = "title",
    dec = "dec",
    inc = "inc"
}

class App implements Widget<AppState> {

    state = {
        title: "Counter",
        count: 77
    };

    view(state: AppState, action: Action, manage: Manage): Hsmls {
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
                ["button", { on: ["click", AppActions.inc, 2] }, ["+"]]
            ]],
            state.title
                ? ["div", state.title ? manage<AppState>(SubApp, state) : ["app"]]
                : ""
            // ["div", state.title ? XWidget.hsml<AppState>(SubApp, state) : ["app"]]
        ];
    }

    onAction(action: string, data: any,
             { state, update, action: actionLocal, actionGlobal }: XWidget<AppState>): void {
        // console.log("action:", action, data);
        switch (action) {
            case AppActions.title:
                update({ title: ((data as Event).target as HTMLInputElement).value });
                break;
            case AppActions.inc:
                update({ count: state.count + data as number });
                setTimeout(actionLocal, 1e3, AppActions.dec, 1); // async call
                break;
            case AppActions.dec:
                update({ count: state.count - data as number });
                break;
            default:
                actionGlobal(action, data);
        }
    }
}

enum SubAppActions {
    xXx = "xXx"
}

class SubApp implements Widget<AppState> {

    state = {
        title: "Counter sec",
        count: 33
    };

    view(state: AppState, action: Action): Hsmls {
        return [
            ["h3", [state.title]],
            ["p", [
                ["em", ["Count"]], ": ", state.count,
                " ",
                ["button", { on: ["click", SubAppActions.xXx] }, [SubAppActions.xXx]]
            ]]
        ];
    }

    onAction(action: string, data: any, { actionGlobal }: XWidget<AppState>): void {
        // console.log("action:", action, data);
        switch (action) {
            case SubAppActions.xXx:
                console.log(SubAppActions.xXx);
                break;
            default:
                actionGlobal(action, data);
        }
    }

}


function onActionGlobal(action: string, data: any, xWidget: XWidget<any>) {
    console.log("action >", action, data, xWidget);
    switch (xWidget.type) {
        case "App":
            onAppAction(action, data, xWidget);
            break;
    }
}

function onAppAction(action: string, data: any, xWidget: XWidget<AppState>): void {
    switch (action) {
        case "xXx":
            break;
    }
}

const app = xWidget<AppState>(App)
    .onActionGlobal(onActionGlobal)
    .mount(document.getElementById("app"));


(self as any).app = app;
