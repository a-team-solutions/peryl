import { AWidget, Action, Manage } from "../src/hsml-awidget";
import { Hsmls } from "../src/hsml";

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

class App extends AWidget<AppState> {

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
                ["button", { on: ["click", AppActions.inc, 2] }, ["+"]],
                ["button", { on: ["click", AppActions.xXx] }, [AppActions.xXx]]
            ]],
            ["p", state.title ? manage<AppState>(App1, state) : []]
        ];
    }

    onAction(action: string, data: any, aWidget: AWidget<AppState>): void {
        // console.log("action:", action, data);
        switch (action) {
            case AppActions.title:
                const title = ((data as Event).target as HTMLInputElement).value;
                aWidget.update({ title });
                break;
            case AppActions.inc:
                aWidget.update({ count: aWidget.state.count + data as number });
                setTimeout(aWidget.action, 1e3, AppActions.dec, 1); // async call
                break;
            case AppActions.dec:
                aWidget.update({ count: aWidget.state.count - data as number });
                break;
            default:
                aWidget.actionGlobal(action, data);
                break;
        }
    }
}


enum App1Actions {
    xXx = "xXx"
}

class App1 extends AWidget<AppState> {

    state = {
        title: "Counter sec",
        count: 33
    };

    view(state: AppState, action: Action, manage: Manage): Hsmls {
        return [
            ["h3", [state.title]],
            ["p", [
                ["em", ["Count"]], ": ", state.count,
                " ",
                ["button", { on: ["click", App1Actions.xXx] }, [App1Actions.xXx]]
            ]]
        ];
    }

    onAction(action: string, data: any, { actionGlobal }: AWidget<AppState>): void {
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

AWidget.onActionGlobal = (action: string, data: any,
                          { update }: AWidget<AppState>): void => {
    console.log(action, data);
    switch (action) {
        case "xXx": update({ title: "xXx" }); break;
        default: break;
    }
};

const app = new App().mount(document.getElementById("app"));

(self as any).app = app;
