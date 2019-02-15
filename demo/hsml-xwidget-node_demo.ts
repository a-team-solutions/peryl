import { Widget, XWidget, Action, Manage } from "../src/hsml-xwidget";
import { Hsmls } from "../src/hsml";
import { xWidget } from "../src/hsml-xwidget-node";

interface AppState {
    title: string;
    count: number;
}

enum Actions {
    title = "title",
    dec = "dec",
    inc = "inc",
    xXx = "xXx"
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
                        on: ["input", Actions.title]
                    }
                ],
            ]],
            ["p", [
                ["em", ["Count"]], ": ", state.count,
                " ",
                ["button", { on: ["click", Actions.dec, 1] }, ["-"]],
                ["button", { on: ["click", Actions.inc, 2] }, ["+"]]
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

            case Actions.title:
                update({ title: ((data as Event).target as HTMLInputElement).value });
                break;

            case Actions.inc:
                update({ count: state.count + data as number });
                setTimeout(actionLocal, 1e3, Actions.dec, 1); // async call
                break;

            case Actions.dec:
                update({ count: state.count - data as number });
                break;

            default:
                actionGlobal(action, data);
                break;
        }
    }
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
                ["button", { on: ["click", Actions.xXx] }, [Actions.xXx]]
            ]]
        ];
    }

    onAction(action: string, data: any, xWidget: XWidget<AppState>): void {
        // console.log("action:", action, data);
        switch (action) {

            case Actions.xXx:
                console.log(Actions.xXx);
                break;

            default:
                xWidget.actionGlobal(action, data);
                break;
        }
    }

}

const html = xWidget(App).toHtml(true);
console.log(html);
