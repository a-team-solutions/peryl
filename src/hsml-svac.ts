import { Hsmls, HsmlFnc/*, Hsml, HsmlAttrOnData*/ } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";

export interface View<S> {
    (state: S, action: Action, manage: Manage): Hsmls;
    svac_type?: string;
    svac_state?: S;
}

export type Action = (action: string, data?: any) => void;

export type Manage = <S>(view: View<S>, state?: S) => HsmlFnc | Hsmls;


// server

const actionHtml: Action = (action: string, data: any) => { };

const manageHtml: Manage = <S>(view: View<S>, state: S): HsmlFnc | Hsmls => {
    return view(state, actionHtml, manageHtml);
};

export function svacHtml<S>(state: S, view: View<S>, onHtml: (html: string) => void, pretty = false): void {
    hsmls2html(view(state, actionHtml, manageHtml), onHtml, pretty);
}

export function svacHtmls<S>(state: S, view: View<S>, pretty = false): string {
    return hsmls2htmls(view(state, actionHtml, manageHtml), pretty).join("");
}
