import { Action, Manage } from "../src/hsml-mva";
import { Hsmls } from "../src/hsml";
import { Actions, CWidget, Widget } from "../src/hsml-mva-cwidget";

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

const App: Widget<AppModel> = {

    type: "App",

    model: {
        title: "Counter",
        count: 77
    },

    view: (model: AppModel, action: Action, manage: Manage): Hsmls => {
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
            ["p", model.title ? manage<AppModel>(Sub, model) : []]
        ];
    },

    actions: (action: string, data: any, widget: CWidget<AppModel>): void => {
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

};

enum SubAppActions {
    xXx = "xXx"
}

const Sub: Widget<AppModel> = {

    type: "Sub",

    model: App.model,

    view: (model: AppModel, action: Action, manage: Manage): Hsmls => {
        return [
            ["h3", [model.title]],
            ["p", [
                ["em", ["Count"]], ": ", model.count,
                " ",
                ["button", { on: ["click", SubAppActions.xXx] }, [SubAppActions.xXx]]
            ]]
        ];
    },

    actions: (action: string, data: any, widget: CWidget<AppModel>): void => {
        // console.log("action:", action, data);
        switch (action) {
            case SubAppActions.xXx:
                console.log(action);
                break;
            default:
                widget.appAction(action, data);
        }
    }

};


// Client side app rendering

const appActions: Actions<AppModel> = (action: string, data: any, widget: CWidget<AppModel>) => {
    console.log(action, data);
    switch (action) {
        case "xXx":
            widget.update({ title: "xXx" });
            break;
    }
};

const app = new CWidget<AppModel>(App)
    .appActions(appActions)
    .mount(document.getElementById("app"));

(self as any).app = app;
