import { AWidget, Action, Mount } from "../src/hsml-awidget";
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

    view(state: AppState, action: Action, mount: Mount): Hsmls {
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
            ["p", state.title ? mount<AppState>(SubApp, state) : []]
        ];
    }

    actions(action: string, data: any, widget: AWidget<AppState>): void {
        // console.log("action:", action, data);
        switch (action) {
            case AppActions.title:
                // const title = data;
                const title = ((data as Event).target as HTMLInputElement).value;
                widget.update({ title });
                break;
            case AppActions.inc:
                widget.update({ count: widget.state.count + data as number });
                setTimeout(widget.action, 1e3, AppActions.dec, 1); // async call
                break;
            case AppActions.dec:
                widget.update({ count: widget.state.count - data as number });
                break;
            default:
                widget.appAction(action, data);
        }
    }
}


enum SubAppActions {
    xXx = "xXx"
}

class SubApp extends AWidget<AppState> {

    state = {
        title: "Counter sec",
        count: 33
    };

    view(state: AppState, action: Action, mount: Mount): Hsmls {
        return [
            ["h3", [state.title]],
            ["p", [
                ["em", ["Count"]], ": ", state.count,
                " ",
                ["button", { on: ["click", SubAppActions.xXx] }, [SubAppActions.xXx]]
            ]]
        ];
    }

    actions(action: string, data: any, widget: AWidget<AppState>): void {
        // console.log("action:", action, data);
        switch (action) {
            case SubAppActions.xXx:
                console.log(action);
                break;
            default:
                widget.appAction(action, data);
        }
    }

}


function appActions(action: string, data: any, widget: AWidget<AppState>) {
    console.log(action, data);
    switch (action) {
        case "xXx":
            widget.update({ title: "xXx" });
            break;
    }
}

const app = new App()
    .appActions(appActions)
    .mount(document.getElementById("app"));

(self as any).app = app;

const h = app.toHtml();
console.log(h);
