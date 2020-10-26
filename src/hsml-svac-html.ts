import { HElements, HFnc } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";
import { HAction, HMount, HComponent } from "./hsml-svac";

const actionHtml: HAction = (action: string | number, data: any, event?: Event) => { };

const mountHtml: HMount = <STATE>(component: HComponent<STATE>,
                                 state?: STATE): HFnc | HElements => {
    return component.view(state || component.state, actionHtml, mountHtml);
};

export function html<STATE>(component: HComponent<STATE>,
                            state: STATE,
                            onHtml: (html: string) => void,
                            pretty = false): void {
    hsmls2html(component.view(state, actionHtml, mountHtml), onHtml, pretty);
}

export function htmls<STATE>(component: HComponent<STATE>,
                             state: STATE,
                             pretty = false): string {
    return hsmls2htmls(component.view(state, actionHtml, mountHtml), pretty).join("");
}
