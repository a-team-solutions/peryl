import { Ctrl, Component } from "../src/hsml-svac-ctrl";
import { AppShellState, AppShellActions, Content, Form, AppShell, FormActions } from "./hsml-svac-appshell-components_demo";
import { Hash } from "../src/hash";

const app = new Ctrl<AppShellState>(AppShell)
    .appActions((ctrl, action, data, event) => {
        console.log("app action", ctrl.type, action, data, event);
        switch (action) {
            case FormActions.submit:
                alert(`Form submit: \n${JSON.stringify(data, null, 4)}`);
                break;
        }
    })
    .mount();

setTimeout(() => {
    app.action(AppShellActions.snackbar, "Message");
}, 1e3);

const components: { [k: string]: Component<any> } = {
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
        app.action(AppShellActions.content, components[module] || Content);
    })
    .listen();

(self as any).app = app;
