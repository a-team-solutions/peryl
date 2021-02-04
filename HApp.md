# HApp - HSML Application

`HApp` - HSML App, Javascript/Typescript Web UI framework for rapid SPA web applications development.

- `HSML` - hyper script markup language
- `SPA` - single page web app

## HApp prototyping

HApp can be used as Javascript included in HTML to avoid build process for simple cases and quick prototyping.
[See live demo](https://peryl.gitlab.io/peryl/demo/hsml-app-js_demo.html).

## HApp Concept

Concept is based on:

- `state` - Represent application data state
- `view` - Template function rendering app UI as HSML markup. To convert HTML into HSML you can use [online converter](https://peryl.gitlab.io/peryl/demo/html-convert_demo.html);
- `dispatcher` - Action dispatcher covering app logic, change state base on actions and request application update UI.

Basic HApp skeleton with `state`, `actions`, `view` template function and `actions` `dispatcher`:

```html
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PeRyL HSML App</title>
</head>
<body>
    <div id="app"></div>

    <script src="https://unpkg.com/peryl@1.4.41/incremental-dom/dist/umd/incremental-dom.js"></script>
    <script src="https://unpkg.com/peryl@1.4.41/dist/umd/hsml-app.js"></script>

    <script>
        // App state definition and initialization
        const state = {
            message: ""
        };

        // Actions definition
        const Action = {
            say: "say"
        }

        // Template function, returns HSML markup generated from app state
        function view(state) {
            return [
                ["p", [
                    "Message: ", state.message
                ]],
                ["p", [
                    ["button", { on: ["click", Action.say, "Hello"] }, "Say Hello"],
                    " ",
                    ["button", { on: ["click", Action.say, "Hi"] }, "Say Hi"],
                ]]
            ];
        }

        // Action dispatcher, app logic
        function dispatcher(app, action) {
            switch (action.type) {
                // Dispatch action "say"
                case Action.say:
                    // Change app state by action data (3. parameter of on click action)
                    app.state.message = action.data;
                    // Ask app to update view with new state
                    app.update();
                    break;
            }
        }

        // Debug mode logging HApp actions, rendering, dispatching info
        HApp.debug = true;

        // Create app
        var app = new HApp(state, view, dispatcher);

        // Run application - Mount HTML element (placeholder)
        app.mount(document.getElementById("app"))

    </script>
</body>
</html>
```

## HApp with Typescript

```sh
npm i peryl
```
