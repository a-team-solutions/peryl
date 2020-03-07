# PeRyL

TypeScript library and tools for rapid web development.

## HSML App (SPA) example

- HSML - hyper script markup language
- SPA - single page web app

Try HSML App [demo](https://peryl.gitlab.io/peryl/demo/hsml-app-js_demo.html).

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PeRyL hsml app demo</title>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
</head>

<body>
    <div class="w3-container">
        <h1>PeRyL hsml app demo</h1>
        <div id="app"></div>
    </div>
    <script src="https://peryl.gitlab.io/peryl/incremental-dom/dist/umd/incremental-dom.js"></script>
    <script src="https://peryl.gitlab.io/peryl/dist/umd/hsml-app.js"></script>
    <script>

        const state = {
            title: "Counter",
            count: 77
        };

        const Action = {
            title: "title",
            dec: "dec",
            inc: "inc",
            clear: "clear"
        }

        function view(state) {
            return [
                ["h2", { classes: [["w3-text-light-grey", !state.title]] }, [
                    state.title || "No title"
                ]],
                ["p", [
                    ["label", ["Title:"]],
                    ["input.w3-input.w3-border", {
                        type: "text",
                        name: "title",
                        value: new String(state.title),
                        on: ["input", Action.title]
                    }]
                ]],
                ["p", [
                    ["button.w3-button.w3-blue",
                        { on: ["click", Action.clear] },
                        ["Clear title"]
                    ]
                ]],
                ["hr"],
                ["p", [
                    ["h2", [
                        "Count: ",
                        ["strong", {
                            classes: [ // conditional classes
                                ["w3-text-red", state.count < 77],
                                ["w3-text-green", state.count > 77],
                            ]},
                            [state.count]
                        ]
                    ]],
                    ["button.w3-button.w3-blue", { on: ["click", Action.dec, 1] }, ["<"]],
                    " ",
                    ["button.w3-button.w3-blue", { on: ["click", Action.inc, 2] }, [">"]]
                ]]
            ]
        };

        function actions(app, action, data, event) {
            console.log("action:", action, data, event);

            switch (action) {
                case HAppAction._init:
                case HAppAction._mount:
                case HAppAction._umount:
                    break;

                case Action.title:
                    app.state.title = data.title;
                    app.update(data);
                    break;

                case Action.inc:
                    app.state.count = app.state.count + data;
                    app.update();
                    // async action call
                    setTimeout(() => app.action(Action.dec, 1), 1e3);
                    break;

                case Action.dec:
                    app.state.count = app.state.count - data;
                    app.update();
                    break;

                case Action.clear:
                    app.state.title = "";
                    app.update();
                    break;

                default:
                    console.warn("action unhandled:", action, data, event);
            }
        };

        happ(state, view, actions, document.getElementById("app");

    </script>
</body>

</html>
```
