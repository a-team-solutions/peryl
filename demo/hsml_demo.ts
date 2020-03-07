import { hsmls2idomPatch } from "../src/hsml-idom";
import { HElements, HElement } from "../src/hsml";

type View<State> = (state: State, dispatch: Dispatch) => HElements;

type Dispatch = (event: string, data?: any) => void;

function render<State>(element: HTMLElement,
                       view: View<State>,
                       state: State,
                       dispatch: Dispatch): void {
    (render as any).scheduled || ((render as any).scheduled = null);
    if (!state) {
        return;
    }
    if (!(render as any).scheduled) {
        (render as any).scheduled = setTimeout(() => {
            const hsml = view(state, dispatch);
            // console.log("render", hsml);
            hsmls2idomPatch(element, hsml);
            (render as any).scheduled = null;
        }, 0);
    }
}

// ----------------------------------------------------------------------------

const appState = {
    title: "Counter",
    count: 0
};

type AppState = typeof appState;

function app(state: AppState, dispatch: Dispatch): HElements {
    return [
        ["h2", [state.title]],
        ["p", [
            ["em", ["Count"]], ": ", state.count.toString(),
            " ",
            button("-", () =>  dispatch("dec", 1)),
            button("+", () => dispatch("inc", 2)),
            " ",
            button("xxx", () => dispatch("xxx")),
        ]],
    ];
}

function button(label: string, cb: (e: Event) => void): HElement {
    return ["button", { click: cb }, [label]];
}

function action(event: string, data: any, state: AppState, dispatch: Dispatch): AppState {
    // console.log("reduce", event, data);
    switch (event) {
        case "inc":
            state.count += data;
            break;
        case "dec":
            state.count -= data;
            setTimeout(dispatch, 1e3, "dec_async", 1);
            break;
        case "dec_async":
            state.count -= data;
            break;
        default:
            console.warn("unhandled event", event, data);
    }
    return state;
}

const appElement = document.getElementById("app");

const dispatch = (event: string, data?: any): void => {
    // console.log("dispatch", event, data);
    const state = action(event, data, appState, dispatch);
    // console.log("state", state);
    render(appElement!, app, state, dispatch);
};

render(appElement!, app, appState, dispatch);

dispatch("event", {});
