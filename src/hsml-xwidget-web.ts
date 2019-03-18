import { Hsml, Hsmls, HsmlFnc, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx } from "./hsml";
import { Class, Widget, OnAction, XWidget, Manage } from "./hsml-xwidget";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";


export function xWidgetApp<S>(wClass: Class<Widget<S>>,
                              e: Element = document.body,
                              onActionGlobal?: OnAction<S>): XWidget<S> {
    onActionGlobal && (widgets.onActionGlobal = onActionGlobal);
    return xWidget<S>(wClass).mount(e);
}

export interface Widgets {
    readonly mounted: { [wid: string]: XWidget<any> };
    onActionGlobal: OnAction<any>;
}

const widgets: Widgets = {
    mounted: {},
    onActionGlobal: (action: string, data: any, widget: XWidget<any>): void => {
        console.log("action:", action, data, widget);
    }
};

let __count = 0;

const manage: Manage = <S>(wClass: Class<Widget<S>>, state?: S): HsmlFnc | Hsmls  => {
    return (e: Element) => {
        if ((e as any).widget) {
            const w = (e as any).widget as XWidget<S>;
            if (w.type === wClass.name) {
                if (state !== undefined) {
                    w.state = state;
                }
                w.update();
            } else {
                w.umount();
                const w1 = xWidget<S>(wClass);
                if (state !== undefined) {
                    w1.state = state;
                }
                w1.mount(e);
            }
        } else {
            const w = xWidget<S>(wClass);
            if (state !== undefined) {
                w.state = state;
            }
            w.mount(e);
        }
        return true;
    };
};

export function xWidget<S>(wClass: Class<Widget<S>>): XWidget<S> {

    class XW extends wClass implements HsmlHandlerCtx, Widget<S> {

        readonly widgets = widgets;

        readonly type: string = this.constructor.name; // "XWidget"
        readonly id: string = this.type + "-" + __count++;
        readonly dom: Element;
        readonly refs: { [key: string]: HTMLElement } = {};

        private __updateSched: number;

        action = (action: string, data?: any): void => {
            this.onAction(action, data, this);
        }

        actionGlobal = (action: string, data?: any): void => {
            this.widgets.onActionGlobal(action, data, this);
        }

        onActionGlobal(onAction: OnAction<S>): this {
            this.widgets.onActionGlobal = onAction;
            return this;
        }

        render = (): Hsmls => {
            return this.view(this.state, this.action, manage);
        }

        onHsml = (action: string, data: HsmlAttrOnData, e: Event): void => {
            data = (data && data.constructor === Function)
                ? (data as HsmlAttrOnDataFnc)(e)
                : data === undefined ? e : data;
            this.action(action, data);
        }

        mount = (e: Element = document.body): this => {
            !e && console.warn("invalit element", e);
            if (e) {
                if ("widget" in e) {
                    const w = (e as any).widget as XWidget<S>;
                    w && w.umount();
                }
                if (!this.dom) {
                    this.widgets.mounted[this.id] = this;
                    (this as any).dom = e;
                    (e as any).widget = this;
                    const hsmls = (this as any).render();
                    hsmls2idomPatch(e, hsmls, this);
                    e.setAttribute("widget", this.type);
                    this.action("_mount", this.dom);
                }
            }
            return this;
        }

        umount = (): this => {
            if (this.dom) {
                delete this.widgets.mounted[this.id];
                this.action("_umount", this.dom);
                if (this.dom.hasAttribute("widget")) {
                    this.dom.removeAttribute("widget");
                }
                const wNodes = this.dom.querySelectorAll("[widget]");
                for (let i = 0; i < wNodes.length; i++) {
                    const w = (wNodes[i] as any).widget as XWidget<S>;
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

        update = (state?: Partial<S>): this => {
            if (state) {
                this.state = merge(this.state, state);
            }
            if (this.dom && !this.__updateSched) {
                this.__updateSched = setTimeout(() => {
                    if (this.dom) {
                        hsmls2idomPatch(this.dom, this.render(), this);
                    }
                    this.__updateSched = null;
                }, 0);
            }
            return this;
        }

        toHsml = (): Hsml => {
            if (this.dom) {
                if (this.__updateSched) {
                    clearTimeout(this.__updateSched);
                    this.__updateSched = undefined;
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
            const hsmls = this.render() as Hsmls;
            hsmls.push(
                (e: Element) => {
                    if (!this.dom) {
                        (this as any).dom = e;
                        (e as any).widget = this;
                        this.widgets.mounted[this.id] = this;
                        this.action("_mount", this.dom);
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

        toHtml = (pretty?: boolean): string => {
            return this.dom ? this.dom.outerHTML : "";
        }

    }

    const w = new XW();
    (w as any).type = wClass.name;
    return w;
}

(idom as any).notifications.nodesDeleted = (nodes: Node[]) => {
    nodes.forEach(node => {
        if (node.nodeType === 1 && "widget" in node) {
            const w = (node as any).widget as XWidget<any>;
            w && w.umount();
        }
    });
};

const merge = <T extends { [k: string]: any }>(target: T, source: Partial<T>): T => {
    if (isMergeble(target) && isMergeble(source)) {
        Object.keys(source).forEach(key => {
            if (isMergeble(source[key])) {
                if (!target[key]) {
                    target[key] = {};
                }
                merge(target[key], source[key]);
            } else {
                target[key] = source[key];
            }
        });
    } else {
        console.warn("unable merge", target, source);
    }
    return target;
};

const isObject = (item: any): boolean => {
    return item !== null && typeof item === "object";
};

const isMergeble = (item: object): boolean => {
    return isObject(item) && !Array.isArray(item);
};
