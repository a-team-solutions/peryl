import { AWidget, Action, Manage } from "../src/hsml-awidget";
import { Hsmls } from "../src/hsml";

interface AppModel {
    title: string;
    count: number;
}

enum AppActions {
    title = "title",
    dec = "dec",
    inc = "inc",
    xXx = "xXx"
}

class App extends AWidget<AppModel> {

    model = {
        title: "Counter",
        count: 77
    };

    view(model: AppModel, action: Action, manage: Manage): Hsmls {
        return [
            ["h2", [model.title]],
            ["p", [
                "Title: ",
                ["input",
                    {
                        type: "text",
                        value: model.title,
                        // on: ["input", e => action(AppActions.title, (e.target as HTMLInputElement).value)],
                        // on: ["input", Actions.title, e => (e.target as HTMLInputElement).value]
                        on: ["input", AppActions.title]
                    }
                ],
            ]],
            ["p", [
                ["em", ["Count"]], ": ", model.count,
                " ",
                ["button", { on: ["click", AppActions.dec, 1] }, ["-"]],
                ["button", { on: ["click", AppActions.inc, 2] }, ["+"]],
                ["button", { on: ["click", AppActions.xXx] }, ["xXx"]]
            ]],
            ["p", model.title ? manage<AppModel>(SubApp, model) : []]
        ];
    }

    onAction(action: string, data: any, widget: AWidget<AppModel>): void {
        // console.log("action:", action, data);
        switch (action) {
            case AppActions.title:
                // const title = data;
                const title = ((data as Event).target as HTMLInputElement).value;
                widget.update({ title });
                break;
            case AppActions.inc:
                widget.update({ count: widget.model.count + data as number });
                setTimeout(widget.action, 1e3, AppActions.dec, 1); // async call
                break;
            case AppActions.dec:
                widget.update({ count: widget.model.count - data as number });
                break;
            default:
                widget.appAction(action, data);
        }
    }
}


enum SubAppActions {
    xXx = "xXx"
}

class SubApp extends AWidget<AppModel> {

    model = {
        title: "Counter sec",
        count: 33
    };

    view(model: AppModel, action: Action, manage: Manage): Hsmls {
        return [
            ["h3", [model.title]],
            ["p", [
                ["em", ["Count"]], ": ", model.count,
                " ",
                ["button", { on: ["click", SubAppActions.xXx] }, [SubAppActions.xXx]]
            ]]
        ];
    }

    onAction(action: string, data: any, widget: AWidget<AppModel>): void {
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


function appOnAction(action: string, data: any, widget: AWidget<AppModel>) {
    console.log(action, data);
    switch (action) {
        case "xXx":
            widget.update({ title: "xXx" });
            break;
    }
}

const app = new App()
    .appOnAction(appOnAction)
    .mount(document.getElementById("app"));

(self as any).app = app;

const h = app.toHtml();
console.log(h);
