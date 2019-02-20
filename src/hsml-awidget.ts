import { Hsml, Hsmls, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx, HsmlFnc } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export type View<S> = (state: S, action: Action) => Hsmls;

export type Action = (action: string, data?: any) => void;

export type OnAction<S> = (action: string, data: any, widget: AWidget<S>) => void;

export type Class<T = object> = new (...args: any[]) => T;

export type Manage = <S>(xwClass: Class<AWidget<S>>, state?: S) => HsmlFnc | Hsmls;

const manage: Manage = <S>(wClass: Class<AWidget<S>>, state?: S): HsmlFnc | Hsmls  => {
    return (e: Element) => {
        if ((e as any).widget) {
            const w = (e as any).widget as AWidget<S>;
            if (state !== undefined) {
                w.state = state;
            }
            w.update();
        } else {
            const w = new wClass();
            if (state !== undefined) {
                w.state = state;
            }
            w.mount(e);
        }
        return true;
    };
};

export abstract class AWidget<S> implements HsmlHandlerCtx {

    private static __count = 0;

    static readonly mounted: { [wid: string]: AWidget<any> } = {};

    static onActionGlobal: OnAction<any> = (action: string, data: any, widget: AWidget<any>): void => {
        console.log("action:", action, data, widget);
    }

    readonly type: string = this.constructor.name; // "XWidget"
    readonly id: string = this.type + "-" + AWidget.__count++;
    readonly dom: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private __updateSched: number;

    abstract state: S;
    abstract view(state: S, action: Action, manage: Manage): Hsmls;
    abstract onAction(action: string, data: any, widget: AWidget<S>): void;

    action = (action: string, data?: any): void => {
        this.onAction(action, data, this);
    }

    actionGlobal = (action: string, data?: any): void => {
        AWidget.onActionGlobal(action, data, this);
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
                const w = (e as any).widget as AWidget<S>;
                w && w.umount();
            }
            if (!this.dom) {
                AWidget.mounted[this.id] = this;
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
            delete AWidget.mounted[this.id];
            this.action("_umount", this.dom);
            if (this.dom.hasAttribute("widget")) {
                this.dom.removeAttribute("widget");
            }
            const wNodes = this.dom.querySelectorAll("[widget]");
            for (let i = 0; i < wNodes.length; i++) {
                const w = (wNodes[i] as any).widget as AWidget<S>;
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
                    AWidget.mounted[this.id] = this;
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

    toHtml = (): string => {
        return this.dom ? this.dom.outerHTML : "";
    }

}

(idom as any).notifications.nodesDeleted = (nodes: Node[]) => {
    nodes.forEach(node => {
        if (node.nodeType === 1 && "widget" in node) {
            const w = (node as any).widget as AWidget<any>;
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
