import { HsmlFragmet, HsmlFnc } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";
import { Action, Mount, View } from "./hsml-svac";

const actionHtml: Action = (action: string, data: any) => { };

const mountHtml: Mount = <State>(view: View<State>,
                                 state?: State): HsmlFnc | HsmlFragmet => {
    return view(state || view.state, actionHtml, mountHtml);
};

export function html<State>(view: View<State>,
                            state: State,
                            onHtml: (html: string) => void,
                            pretty = false): void {
    hsmls2html(view(state, actionHtml, mountHtml), onHtml, pretty);
}

export function htmls<State>(view: View<State>,
                             state: State,
                             pretty = false): string {
    return hsmls2htmls(view(state, actionHtml, mountHtml), pretty).join("");
}
