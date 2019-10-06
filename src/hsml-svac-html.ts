import { HsmlFragmet, HsmlFnc } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";
import { Action, Mount, Component } from "./hsml-svac";

const actionHtml: Action = (action: string, data: any) => { };

const mountHtml: Mount = <State>(component: Component<State>,
                                 state?: State): HsmlFnc | HsmlFragmet => {
    return component.view(state || component.state, actionHtml, mountHtml);
};

export function html<State>(component: Component<State>,
                            state: State,
                            onHtml: (html: string) => void,
                            pretty = false): void {
    hsmls2html(component.view(state, actionHtml, mountHtml), onHtml, pretty);
}

export function htmls<State>(component: Component<State>,
                             state: State,
                             pretty = false): string {
    return hsmls2htmls(component.view(state, actionHtml, mountHtml), pretty).join("");
}
