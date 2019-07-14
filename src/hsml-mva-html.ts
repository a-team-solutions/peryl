import { Hsmls, HsmlFnc } from "./hsml";
import { hsmls2htmls, hsmls2html } from "./hsml-html";
import { Action, Mount, Widget } from "./hsml-mva";

const actionHtml: Action = (action: string, data: any) => { };

const mountHtml: Mount = <Model>(widget: Widget<Model>, model?: Model): HsmlFnc | Hsmls => {
    return widget.view(model || widget.model, actionHtml, mountHtml);
};

export function html<Model>(widget: Widget<Model>, model: Model, onHtml: (html: string) => void, pretty = false): void {
    hsmls2html(widget.view(model, actionHtml, mountHtml), onHtml, pretty);
}

export function htmls<Model>(widget: Widget<Model>, model: Model, pretty = false): string {
    return hsmls2htmls(widget.view(model, actionHtml, mountHtml), pretty).join("");
}
