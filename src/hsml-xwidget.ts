import { Hsml, Hsmls, HsmlFnc, HsmlHandlerCtx } from "./hsml";

export type Class<T = object> = new (...args: any[]) => T;

export type Manage = <S>(xwClass: Class<Widget<S>>, state?: S) => HsmlFnc | Hsmls;

export type View<S> = (state: S, action: Action, manage: Manage) => Hsmls;

export type Action = (action: string, data?: any) => void;

export type OnAction<S> = (action: string, data: any, xwidget: XWidget<S>) => void;

export interface Widget<S> {
    state: S;
    view(state: S, action: Action, manage: Manage): Hsmls;
    onAction(action: string, data: any, widget: Widget<S>): void;
}

export interface XWidget<S> extends HsmlHandlerCtx, Widget<S> {
    widgets: Widgets;
    type: string;
    id: string;
    dom: Element;
    state: S;
    action: Action;
    actionGlobal: Action;
    onActionGlobal: (onAction: OnAction<S>) => this;
    render: () => Hsmls;
    mount: (e: Element) => this;
    umount: () => this;
    update: (state?: Partial<S>) => this;
    toHsml: () => Hsml;
    toHtml: (pretty?: boolean) => string;
}

export interface Widgets {
    readonly mounted: { [wid: string]: XWidget<any> };
    onActionGlobal: OnAction<any>;
}
