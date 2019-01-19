import { WidgetA } from "../src/widgeta";
import { JsonMLs, JsonML } from "../src/jsonml";

interface AppState {
    title: string;
    count: number;
}

interface AppActions {
    inc(n: number): void;
    dec(n: number): void;
}

class AppWidget extends WidgetA<AppState, AppActions> {

    constructor(state?: AppState) {
        super("AppWidget", state);
    }

    render(): JsonMLs {
        return [
            ["h2", this._state.title],
            ["p", this._state.count.toString()],
            button("-", this.dec),
            button("+", this.inc)
        ];
    }

    private dec = () => {
        this._actions.dec(2);
    }

    private inc = () => {
        this._actions.inc(2);
    }

}

function button(label: string, onClick: (e: Event) => void): JsonML {
    return ["button", { click: onClick }, label];
}

const app = new AppWidget()
    .setState({
        title: "Counter",
        count: 77
    })
    .setActions({
        inc: (n: number) => {
            console.log("inc", n);
            const s = app.getState();
            s.count += n;
            app.setState(s);
        },
        dec: (n: number) => {
            console.log("dec", n);
            app.getState().count -= n;
            app.update();
        }
    })
    .mount(document.getElementById("app"));

(self as any).app = app;
