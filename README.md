# PeRyL

TypeScript library and tools for rapid web development.

## HApp - PeRyL HSML App

`HApp` - HSML App, Javascript/Typescript Web UI framework for rapid SPA web applications development.

Read [Tutorial](HApp.md) to learn how to write HApp.

HSML App [demo](https://peryl.gitlab.io/peryl/demo/hsml-app-js_demo.html), source code:

```html
<!DOCTYPE html>
<html lang="en">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <title>PeRyL HSML App demo</title>
    <link rel="stylesheet" href="https://www.w3schools.com/w3css/4/w3.css">
    <link rel="stylesheet" href="https://fonts.googleapis.com/css?family=Raleway">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
</head>

<body>
    <div class="w3-container">
        <h1>PeRyL HSML App demo</h1>
        <div id="app"></div>
    </div>
    <script src="https://unpkg.com/peryl@1.4.41/incremental-dom/dist/umd/incremental-dom.js"></script>
    <script src="https://unpkg.com/peryl@1.4.41/dist/umd/hsml-app.js"></script>
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
                ["h2",
                    { classes: [["w3-text-light-grey", !state.title]] },
                    state.title || "No title"
                ],
                ["p", [
                    ["label", "Title:"],
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
                        "Clear title"
                    ]
                ]],
                ["hr"],
                ["p", [
                    ["h2", [
                        "Count: ",
                        ["strong",
                            {
                                classes: [ // conditional classes
                                    ["w3-text-red", state.count < 77],
                                    ["w3-text-green", state.count > 77],
                                ]
                            },
                            state.count
                        ]
                    ]],
                    ["button.w3-button.w3-blue",
                        { on: ["click", Action.dec, 1] },
                        [["i.fa.fa-chevron-left"]]
                    ],
                    " ",
                    ["button.w3-button.w3-blue",
                        { on: ["click", Action.inc, 2] },
                        [["i.fa.fa-chevron-right"]]
                    ]
                ]]
            ]
        };

        function dispatcher(app, action) {
            console.log("action:", action);

            switch (action.type) {
                case HAppAction._init:
                case HAppAction._mount:
                case HAppAction._umount:
                    break;

                case Action.title:
                    app.state.title = action.data.title;
                    app.update();
                    break;

                case Action.inc:
                    app.state.count = app.state.count + action.data;
                    app.update();
                    // async action call
                    setTimeout(() => app.dispatch(Action.dec, 1), 1e3);
                    break;

                case Action.dec:
                    app.state.count = app.state.count - action.data;
                    app.update();
                    break;

                case Action.clear:
                    app.state.title = "";
                    app.update();
                    break;

                default:
                    console.warn("unhandled action:", action);
            }
        };

        // HApp.debug = true;

        new HApp(state, view, dispatcher).mount(document.getElementById("app"));

    </script>
</body>

</html>
```

