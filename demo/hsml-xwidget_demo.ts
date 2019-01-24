import { XWidget, Action } from "../src/hsml-xwidget";
import { Hsmls, HsmlAttrOnData } from "../src/hsml";

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

class App extends XWidget<AppState> {

    constructor() {
        super("App");
    }

    state = {
        title: "Counter",
        count: 77
    };

    view(state: AppState, action: Action): Hsmls {
        return [
            ["h2", state.title],
            ["p", [
                "Title: ",
                ["input",
                    {
                        type: "text",
                        value: state.title,
                        on: ["input", Actions.title, e => (e.target as HTMLInputElement).value]
                    }
                ],
            ]],
            ["p", [
                ["em", "Count"], ": ", state.count,
                " ",
                ["button", { on: ["click", Actions.dec, 1] }, "-"],
                ["button", { on: ["click", Actions.inc, 2] }, "+"]
            ]],
            state.title
                ? ["div", state.title ? XWidget.hsml<AppState>(App1, state) : "app"]
                : ""
            // ["div",
            //     // { _widget: this.app1 }
            //     // this.app1
            //     // YWidget.hsml(App1)
            //     state.title ? YWidget.hsml<AppState>(App1, state) : "app"
            // ]
        ];
    }

    onMount(): void {
        console.log("mount", this.type, XWidget.mounted);
    }

    onUmount(): void {
        console.log("umount", this.type, XWidget.mounted);
    }

    onAction(action: string, data: HsmlAttrOnData, widget: XWidget<AppState>): void {
        console.log("action:", action, data);
        switch (action) {

            case Actions.title:
                widget.state.title = data as string;
                widget.update();
                break;

            case Actions.inc:
                widget.state.count += data as number;
                widget.update();
                // async call
                setTimeout(() => this.action(Actions.dec, 1), 1e3);
                break;

            case Actions.dec:
                const s = widget.state;
                s.count -= data as number;
                widget.update();
                break;

            default:
                this.actionGlobal(action, data);
                break;
        }
    }
}

class App1 extends XWidget<AppState> {

    constructor() {
        super("App1");
    }

    state = {
        title: "Counter sec",
        count: 33
    };

    view(state: AppState, action: Action): Hsmls {
        return [
            ["h3", state.title],
            ["p", [
                ["em", "Count"], ": ", state.count,
                " ",
                ["button", { on: ["click", Actions.xXx] }, Actions.xXx]
            ]]
        ];
    }

    onMount(): void {
        console.log("mount", this.type, XWidget.mounted);
    }

    onUmount(): void {
        console.log("umount", this.type, XWidget.mounted);
    }

    onAction(action: string, data?: HsmlAttrOnData): void {
        console.log("action:", action, data);
        switch (action) {

            case Actions.xXx:
                console.log(Actions.xXx);
                break;

            default:
                this.actionGlobal(action, data);
                break;
        }
    }
}

const app = new App().mount(document.getElementById("app"));

(self as any).app = app;