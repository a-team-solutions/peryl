import { Hsmls, HsmlFnc } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";

export interface Component<S> {
    type: string;
    state: S;
    view: View<S>;
}

export type View<S> = (state: S, action: Action, manage: Manage) => Hsmls;

export type Action = (action: string, data?: any) => void;

export type Manage = <S>(component: Component<S>, state?: S) => HsmlFnc | Hsmls;


// server

const actionHtml: Action = (action: string, data: any) => { };

const manageHtml: Manage = <S>(component: Component<S>, state?: S): HsmlFnc | Hsmls => {
    return component.view(state || component.state, actionHtml, manageHtml);
};

export function html<S>(component: Component<S>, state: S, onHtml: (html: string) => void, pretty = false): void {
    hsmls2html(component.view(state, actionHtml, manageHtml), onHtml, pretty);
}

export function htmls<S>(component: Component<S>, state: S, pretty = false): string {
    return hsmls2htmls(component.view(state, actionHtml, manageHtml), pretty).join("");
}
