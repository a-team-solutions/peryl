# PeRyL

TypeScript library and tools for rapid web development.

## HSML SPA example

- HSML - hyper script markup language
- SPA - single page web app

Try HSNL SPA [demo](https://peter-rybar.gitlab.io/peryl/demo/hsml-app-js_demo.html).

```javascript
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

        case Action.title:
            app.update(data);
            break;

        case Action.inc:
            app.update({ count: app.state.count + data });
            // async action call
            setTimeout(() => app.action(Action.dec, 1), 1e3);
            break;

        case Action.dec:
            app.update({ count: app.state.count - data });
            break;

        case Action.clear:
            app.update({ title: "" });
            break;

        default:
            console.warn("action unhandled:", action, data);
    }
};

app(state, view, actions, "app");
```