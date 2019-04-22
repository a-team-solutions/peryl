import { Component, ICtrl } from "../src/hsml-ctrl";
import { ctrlApp } from "../src/hsml-ctrl-web";
import { AppShellState, AppShellActions, content, sidebar, appShell } from "./hsml-ctrl-appshell-components_demo";
import { Hash } from "../src/hash";

function onActionGlobal(action: string, data: any, ctrl: ICtrl<AppShellState>) {
    console.log(action, data, ctrl);
    switch (action) {
        case "xXx":
            ctrl.update({ title: "xXx" });
            break;
    }
}

const app = ctrlApp(...appShell)
    .onActionGlobal(onActionGlobal)
    .mount(document.getElementById("app"));

setTimeout(() => {
    app.action(AppShellActions.snackbar, "Message");
}, 1e3);

const contents: { [k: string]: Component<any> } = {
    Content: content,
    Sidebar: sidebar
};

new Hash<string>()
    .coders(
        data => encodeURIComponent(data),
        str => decodeURIComponent(str)
    )
    .onChange(data => {
        console.log("hash: " + JSON.stringify(data));
        app.action(AppShellActions.menu, false);
        if (data) {
            app.action(AppShellActions.content, contents[data]);
        } else {
            app.action(AppShellActions.content, contents.Content);
        }
    })
    .listen();

(self as any).app = app;
