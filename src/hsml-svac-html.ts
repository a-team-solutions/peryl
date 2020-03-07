import { HElements, HFnc } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";
import { HAction, HMount, HComponent } from "./hsml-svac";

const actionHtml: HAction = (action: string | number, data: any, event?: Event) => { };

const mountHtml: HMount = <State>(component: HComponent<State>,
                                 state?: State): HFnc | HElements => {
    return component.view(state || component.state, actionHtml, mountHtml);
};

export function html<State>(component: HComponent<State>,
                            state: State,
                            onHtml: (html: string) => void,
                            pretty = false): void {
    hsmls2html(component.view(state, actionHtml, mountHtml), onHtml, pretty);
}

export function htmls<State>(component: HComponent<State>,
                             state: State,
                             pretty = false): string {
    return hsmls2htmls(component.view(state, actionHtml, mountHtml), pretty).join("");
}
