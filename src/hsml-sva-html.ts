import { Hsmls, HsmlFnc } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";
import { Action, Mount, Widget } from "./hsml-sva";

const actionHtml: Action = (action: string, data: any) => { };

const mountHtml: Mount = <State>(widget: Widget<State>, state?: State): HsmlFnc | Hsmls => {
    return widget.view(state || widget.state, actionHtml, mountHtml);
};

export function html<State>(widget: Widget<State>, state: State, onHtml: (html: string) => void, pretty = false): void {
    hsmls2html(widget.view(state, actionHtml, mountHtml), onHtml, pretty);
}

export function htmls<State>(widget: Widget<State>, state: State, pretty = false): string {
    return hsmls2htmls(widget.view(state, actionHtml, mountHtml), pretty).join("");
}
