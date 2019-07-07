import { Hsmls, HsmlFnc } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";

export interface Widget<Model> {
    type: string;
    model: Model;
    view: View<Model>;
}

export type View<Model> = (model: Model, action: Action, manage: Manage) => Hsmls;

export type Action = (action: string, data?: any) => void;

export type Manage = <Model>(widget: Widget<Model>, model?: Model) => HsmlFnc | Hsmls;


// server

const actionHtml: Action = (action: string, data: any) => { };

const manageHtml: Manage = <Model>(widget: Widget<Model>, model?: Model): HsmlFnc | Hsmls => {
    return widget.view(model || widget.model, actionHtml, manageHtml);
};

export function html<Model>(widget: Widget<Model>, model: Model, onHtml: (html: string) => void, pretty = false): void {
    hsmls2html(widget.view(model, actionHtml, manageHtml), onHtml, pretty);
}

export function htmls<Model>(widget: Widget<Model>, model: Model, pretty = false): string {
    return hsmls2htmls(widget.view(model, actionHtml, manageHtml), pretty).join("");
}
