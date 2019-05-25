import { Hsmls, HsmlFnc, Hsml, HsmlAttrOnData } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";

export type Component<S> = [S, View<S>, OnAction<S>, string?];

export type View<S> = (state: S, action: Action, manage: Manage) => Hsmls;

export type OnAction<S> = (action: string, data: any, ctrl: Ctrl<S>) => void;

export type Action = (action: string, data?: any) => void;

export type Manage = <S>(state: S, view: View<S>, onAction: OnAction<S>, type?: string) => HsmlFnc | Hsmls;

export interface Ctrl<S> {
    type: string;
    id: string;
    dom: Element;
    refs: { [key: string]: HTMLElement };

    state: S;
    view: View<S>;
    onAction: OnAction<S>;

    action(action: string, data?: any): void;
    actionGlobal(action: string, data?: any): void;
    onActionGlobal(onAction: OnAction<S>): this;
    ctrls(): Ctrl<any>[];
    render(): Hsmls;
    onHsml(action: string, data: HsmlAttrOnData, e: Event): void;
    mount(e: Element): this;
    umount(): this;
    update(state?: Partial<S>): this;
    toHsml(): Hsml;
    toHtml(): string;
}

// server

const actionHtml: Action = (action: string, data: any) => { };

const manageHtml: Manage = <S>(state: S, view: View<S>, onAction: OnAction<S>): HsmlFnc | Hsmls => {
    return view(state, actionHtml, manageHtml);
};

export function svacHtml<S>(state: S, view: View<S>, onHtml: (html: string) => void, pretty = false): void {
    hsmls2html(view(state, actionHtml, manageHtml), onHtml, pretty);
}

export function svacHtmls<S>(state: S, view: View<S>, pretty = false): string {
    return hsmls2htmls(view(state, actionHtml, manageHtml), pretty).join("");
}
