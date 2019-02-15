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
                ? ["div", state.title ? manage<AppState>(App1, state) : ["app"]]
                : ""
            // ["div",
            //     // { _widget: this.app1 }
            //     // this.app1
            //     // XWidget.hsml(App1)
            //     state.title ? XWidget.hsml<AppState>(App1, state) : "app"
            // ]
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
                break;
        }
    }
}

enum App1Actions {
    xXx = "xXx"
}

class App1 implements Widget<AppState> {

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
                ["button", { on: ["click", App1Actions.xXx] }, [App1Actions.xXx]]
            ]]
        ];
    }

    onAction(action: string, data: any, { actionGlobal }: XWidget<AppState>): void {
        // console.log("action:", action, data);
        switch (action) {
            case App1Actions.xXx:
                console.log(App1Actions.xXx);
                break;
            default:
                actionGlobal(action, data);
                break;
        }
    }

}

const app = xWidget<AppState>(App);

app.widgets.onActionGlobal = (action: string, data: any, xWidget: XWidget<any>) => {
    console.log("action >", action, data, xWidget);
    switch (xWidget.type) {
        case "App":
            onAppAction(action, data, xWidget);
            break;
        default:
            break;
    }
};

function onAppAction(action: string, data: any, xWidget: XWidget<AppState>): void {
    switch (action) {
        case "xXx":
            break;
        default:
            break;
    }
}

app.mount(document.getElementById("app"));

(self as any).app = app;
