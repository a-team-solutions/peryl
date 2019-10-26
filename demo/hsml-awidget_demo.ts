import { AWidget, Action, Mount } from "../src/hsml-awidget";
import { HsmlFragment } from "../src/hsml";

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

    view(state: AppState, action: Action, mount: Mount): HsmlFragment {
        return [
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
            ["p", state.title ? mount<AppState>(SubApp, state) : []]
        ];
    }

    actions(widget: AWidget<AppState>, action: string, data?: any, event?: Event): void {
        // console.log("action:", action, data);
        switch (action) {
            case AppActions.title:
                widget.update(data);
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

    view(state: AppState, action: Action, mount: Mount): HsmlFragment {
        return [
            ["h3", [state.title]],
            ["p", [
                ["em", ["Count"]], ": ", state.count,
                " ",
                ["button",
                    { on: ["click", SubAppActions.xXx] },
                    [SubAppActions.xXx]
                ]
            ]]
        ];
    }

    actions(widget: AWidget<AppState>, action: string, data?: any, event?: Event): void {
        // console.log("action:", action, data, event);
        switch (action) {
            case SubAppActions.xXx:
                console.log(action);
                break;
            default:
                widget.appAction(action, data);
        }
    }

}


function appActions(widget: AWidget<AppState>, action: string, data?: any, event?: Event) {
    console.log(action, data, event);
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

const html = app.toHtml();
console.log(html);
