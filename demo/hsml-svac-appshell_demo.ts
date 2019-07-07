import { Widget, CWidget } from "../src/hsml-svac";
import { AppShellModel, AppShellActions, Content, Form, AppShell } from "./hsml-svac-appshell-components_demo";
import { Hash } from "../src/hash";

const app = new CWidget<AppShellModel>(AppShell)
    .appOnAction((action: string, data: any, widget: CWidget<AppShellModel>) => {
        // console.log("app action", widget.type, action, data);
        switch (action) {
            case "xXx":
                widget.update({ title: "xXx" });
                break;
        }
    })
    .mount();

setTimeout(() => {
    app.action(AppShellActions.snackbar, "Message");
}, 1e3);

const widgets: { [k: string]: Widget<any> } = {
    content: Content,
    form: Form
};

new Hash<string>()
    .coders(
        data => encodeURIComponent(data),
        str => decodeURIComponent(str)
    )
    .onChange(module => {
        console.log("hash: " + JSON.stringify(module));
        app.action(AppShellActions.menu, false);
        app.action(AppShellActions.content, widgets[module] || Content);
    })
    .listen();

(self as any).app = app;
