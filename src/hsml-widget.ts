import { HsmlElement, HsmlFragment, HsmlAttrOnData, HsmlHandlerCtx, HsmlAttrOnDataFnc, HsmlObj } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export interface IWidget {
    render(): HsmlFragment;
    onMount(): void;
    onUmount(): void;
    actions(action: string, data?: HsmlAttrOnData): void;
}

const schedule = window.requestAnimationFrame ||
    // window.webkitRequestAnimationFrame ||
    // (window as any).mozRequestAnimationFrame ||
    // (window as any).oRequestAnimationFrame ||
    // (window as any).msRequestAnimationFrame ||
    function (callback) { window.setTimeout(callback, 1000 / 60); };

const unschedule = window.cancelAnimationFrame ||
    // window.webkitCancelAnimationFrame ||
    // (window as any).mozCancelAnimationFrame ||
    // (window as any).oCancelAnimationFrame ||
    // (window as any).msCancelAnimationFrame ||
    function (handle: number) { window.clearTimeout(handle); };

export abstract class Widget implements HsmlObj, HsmlHandlerCtx, IWidget {

    private static _count = 0;

    static readonly mounted: { [wid: string]: Widget } = {};

    readonly type: string = this.constructor.name; // "Widget"
    readonly id: string = this.type + "-" + Widget._count++;
    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched?: number;

    constructor(type?: string) {
        if (type) {
            this.type = type;
        }
    }

    abstract render(): HsmlFragment;

    onMount(): void {
        console.log("mount");
    }

    onUmount(): void {
        console.log("umount");
    }

    actions(action: string, data: any): void {
        console.log(action, data);
    }

    action(action: string, data?: any): void {
        this.actions(action, data);
    }

    onHsml(action: string, data: HsmlAttrOnData, e: Event) {
        data = (data && data.constructor === Function)
            ? (data as HsmlAttrOnDataFnc)(e)
            : data === undefined ? e : data;
        this.action(action, data);
    }

    mount(e?: string | Element | null): this {
        const el = typeof e === "string"
            ? document.getElementById(e) || document.body
            : e || document.body;
        if ("widget" in el) {
            const w = (el as any).widget as Widget;
            w && w.umount();
        }
        if (!this.dom) {
            Widget.mounted[this.id] = this;
            (this as any).dom = el;
            (el as any).widget = this;
            const hsmls = this.render();
            hsmls2idomPatch(el, hsmls, this);
            el.setAttribute("widget", this.type);
            if ((this as any).onMount) {
                (this as any).onMount();
            }
        }
        return this;
    }

    umount(): this {
        if (this.dom) {
            delete Widget.mounted[this.id];
            if ((this as any).onUmount) {
                (this as any).onUmount();
            }
            if (this.dom.hasAttribute("widget")) {
                this.dom.removeAttribute("widget");
            }
            const wNodes = this.dom.querySelectorAll("[widget]");
            for (let i = 0; i < wNodes.length; i++) {
                const w = (wNodes[i] as any).widget as Widget;
                w && w.umount();
            }
            while (this.dom.firstChild /*.hasChildNodes()*/) {
                this.dom.removeChild(this.dom.firstChild);
            }
            delete (this.dom as any).widget;
            (this as any).dom = undefined;
        }
        return this;
    }

    update(): this {
        if (this.dom && !this._updateSched) {
            this._updateSched = schedule(() => {
                if (this.dom) {
                    hsmls2idomPatch(this.dom, this.render(), this);
                }
                this._updateSched = undefined;
            });
        }
        return this;
    }

    toHsml(): HsmlElement {
        if (this.dom) {
            if (this._updateSched) {
                unschedule(this._updateSched);
                this._updateSched = undefined;
            } else {
                return (
                    ["div",
                        {
                            _skip: true,
                            _id: this.id,
                            _key: this.id,
                            widget: this.type
                        }
                    ]
                );
            }
        }
        const hsmls = (this as any).render() as HsmlFragment;
        hsmls.push(
            (e: Element) => {
                if (!this.dom) {
                    (this as any).dom = e;
                    (e as any).widget = this;
                    if ((this as any).onMount) {
                        (this as any).onMount();
                    }
                }
            });
        return (
            ["div",
                {
                    _id: this.id,
                    _key: this.id,
                    widget: this.type
                },
                hsmls
            ]
        );
    }

    toHtml = (): string => {
        return this.dom ? this.dom.outerHTML : "";
    }

}

(idom as any).notifications.nodesDeleted = (nodes: Node[]) => {
    nodes.forEach(node => {
        if (node.nodeType === 1 && "widget" in node) {
            const w = (node as any).widget as Widget;
            w && w.umount();
        }
    });
};
