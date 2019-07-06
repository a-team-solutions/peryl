import { Component, App, Ctrl } from "../src/hsml-svac";
import { AppShellState, AppShellActions, Content, Form, AppShell } from "./hsml-svac-appshell-components_demo";
import { Hash } from "../src/hash";

const app = new App<AppShellState>(AppShell)
    .appOnAction((action: string, data: any, ctrl: Ctrl<AppShellState>) => {
        // console.log("app action", ctrl.type, action, data);
        switch (action) {
            case "xXx":
                ctrl.update({ title: "xXx" });
                break;
        }
    })
    .mount();

setTimeout(() => {
    app.action(AppShellActions.snackbar, "Message");
}, 1e3);

const contents: { [k: string]: Component<any> } = {
    content: Content,
    form: Form
};

new Hash<string>()
    .coders(
        data => encodeURIComponent(data),
        str => decodeURIComponent(str)
    )
    .onChange(data => {
        console.log("hash: " + JSON.stringify(data));
        app.action(AppShellActions.menu, false);
        app.action(AppShellActions.content, contents[data] || Content);
    })
    .listen();

(self as any).app = app;
