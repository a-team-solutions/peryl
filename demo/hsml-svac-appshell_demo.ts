import { Component, App, Ctrl } from "../src/hsml-svac";
import { AppShellState, AppShellActions, content, form, appShell } from "./hsml-svac-appshell-components_demo";
import { Hash } from "../src/hash";

function appOnAction(action: string, data: any, ctrl: Ctrl<AppShellState>) {
    // console.log("app action", action, data, ctrl);
    switch (action) {
        case "xXx":
            ctrl.update({ title: "xXx" });
            break;
    }
}

const app = new App<AppShellState>(appShell)
    .appOnAction(appOnAction)
    .mount(document.getElementById("app"));

setTimeout(() => {
    app.action(AppShellActions.snackbar, "Message");
}, 1e3);

const contents: { [k: string]: Component<any> } = {
    content: { ...content },
    form: { ...form }
};

new Hash<string>()
    .coders(
        data => encodeURIComponent(data),
        str => decodeURIComponent(str)
    )
    .onChange(data => {
        console.log("hash: " + JSON.stringify(data));
        app.action(AppShellActions.menu, false);
        app.action(AppShellActions.content, contents[data] || content);
    })
    .listen();

(self as any).app = app;
