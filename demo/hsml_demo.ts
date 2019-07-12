import { hsmls2idomPatch } from "../src/hsml-idom";
import { Hsmls, Hsml } from "../src/hsml";

type Component<Model> = (model: Model, dispatch: Dispatch) => Hsmls;

type Dispatch = (event: string, data?: any) => void;

function render<Model>(element: HTMLElement,
                       component: Component<Model>,
                       model: Model,
                       dispatch: Dispatch): void {
    (render as any).scheduled || ((render as any).scheduled = null);
    if (!model) return;
    if (!(render as any).scheduled) {
        (render as any).scheduled = setTimeout(() => {
            const hsml = component(model, dispatch);
            // console.log("render", hsml);
            hsmls2idomPatch(element, hsml);
            (render as any).scheduled = null;
        }, 0);
    }
}

// ----------------------------------------------------------------------------

const appModel = {
    title: "Counter",
    count: 0
};

type AppModel = typeof appModel;

function app(model: AppModel, dispatch: Dispatch): Hsmls {
    return [
        ["h2", [model.title]],
        ["p", [
            ["em", ["Count"]], ": ", model.count.toString(),
            " ",
            button("-", () =>  dispatch("dec", 1)),
            button("+", () => dispatch("inc", 2)),
            " ",
            button("xxx", () => dispatch("xxx")),
        ]],
    ];
}

function button(label: string, cb: (e: Event) => void): Hsml {
    return ["button", { click: cb }, [label]];
}

function action(event: string, data: any, model: AppModel, dispatch: Dispatch): AppModel {
    // console.log("reduce", event, data);
    switch (event) {
        case "inc":
            model.count += data;
            break;
        case "dec":
            model.count -= data;
            setTimeout(dispatch, 1e3, "dec_async", 1);
            break;
        case "dec_async":
            model.count -= data;
            break;
        default:
            console.warn("unhandled event", event, data);
    }
    return model;
}

const appElement = document.getElementById("app");

const dispatch = (event: string, data?: any): void => {
    // console.log("dispatch", event, data);
    const model = action(event, data, appModel, dispatch);
    // console.log("model", model);
    render(appElement!, app, model, dispatch);
};

render(appElement!, app, appModel, dispatch);

dispatch("event", {});
