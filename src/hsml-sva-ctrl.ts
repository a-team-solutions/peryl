import { Mount, View } from "./hsml-sva";
import { Hsml, Hsmls, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx, HsmlFnc } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export interface Widget<State> {
    type: string;
    state: State;
    view: View<State>;
    actions?: Actions<State>;
}

export type Actions<State> = (action: string, data: any, widget: WidgetCtrl<State>) => void;

const mount: Mount = <State>(widget: Widget<State>, state?: State): HsmlFnc | Hsmls => {
    return (e: Element) => {
        if ((e as any).widget) {
            const c = (e as any).widget as WidgetCtrl<State>;
            if (c.view === widget.view) {
                if (state !== undefined) {
                    c.state = state;
                }
                c.update();
            } else {
                c.umount();
                const c1 = new WidgetCtrl(widget);
                if (state !== undefined) {
                    c1.state = state;
                }
                c1.mount(e);
            }
        } else {
            const c = new WidgetCtrl(widget);
            if (state !== undefined) {
                c.state = state;
            }
            c.mount(e);
        }
        return true;
    };
};

const wNodeAttr = "widget";

export class WidgetCtrl<State> implements HsmlHandlerCtx {

    private static _count = 0;

    private static _widgets: { [ctrl: string]: WidgetCtrl<any> } = {};

    static appActions: Actions<any> = (action: string, data: any, cw: WidgetCtrl<any>): void => {
        console.log("action:", action, data, cw);
    }

    readonly type: string = "Widget";
    readonly id: string = this.type + "-" + WidgetCtrl._count++;
    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched?: number;

    state: State;
    view: View<State>;
    actions?: Actions<State>;

    constructor(widget: Widget<State>, state?: State) {
        this.state = state || widget.state;
        this.view = widget.view;
        this.actions = widget.actions;
        widget.type && (this.type = widget.type);
    }

    appAction = (action: string, data?: any): void => {
        WidgetCtrl.appActions(action, data, this);
    }

    appActions(actions: Actions<State>): this {
        WidgetCtrl.appActions = actions;
        return this;
    }

    get appWidgets(): WidgetCtrl<any>[] {
        return Object.values(WidgetCtrl._widgets);
    }

    action = (action: string, data?: any): void => {
        this.actions && this.actions(action, data, this);
    }

    render = (): Hsmls => {
        return this.view(this.state, this.action, mount);
    }

    onHsml = (action: string, data: HsmlAttrOnData, e: Event): void => {
        data = (data && data.constructor === Function)
            ? (data as HsmlAttrOnDataFnc)(e)
            : data === undefined ? e : data;
        this.action(action, data);
    }

    mount = (e: Element | null = document.body): this => {
        if (e) {
            if ((e as any).widget) {
                const c = (e as any).widget as WidgetCtrl<State>;
                c && c.umount();
            }
            if (!this.dom) {
                WidgetCtrl._widgets[this.id] = this;
                (this as any).dom = e;
                (e as any).widget = this;
                const hsmls = (this as any).render();
                hsmls2idomPatch(e, hsmls, this);
                e.setAttribute(wNodeAttr, this.type);
                this.action("_mount", this.dom);
            }
        } else {
            console.warn("invalit element", e);
        }
        return this;
    }

    umount = (): this => {
        if (this.dom) {
            delete WidgetCtrl._widgets[this.id];
            this.action("_umount", this.dom);
            if (this.dom.hasAttribute(wNodeAttr)) {
                this.dom.removeAttribute(wNodeAttr);
            }
            const cNodes = this.dom.querySelectorAll(`[${wNodeAttr}]`);
            for (let i = 0; i < cNodes.length; i++) {
                const c = (cNodes[i] as any).widget as WidgetCtrl<State>;
                c && c.umount();
            }
            while (this.dom.firstChild) {
                this.dom.removeChild(this.dom.firstChild);
            }
            delete (this.dom as any).widget;
            (this as any).dom = undefined;
        }
        return this;
    }

    update = (state?: Partial<State>): this => {
        if (state) {
            this.state = merge(this.state, state);
        }
        if (this.dom && !this._updateSched) {
            this._updateSched = setTimeout(() => {
                if (this.dom) {
                    hsmls2idomPatch(this.dom, this.render(), this);
                }
                this._updateSched = undefined;
            }, 0);
        }
        return this;
    }

    toHsml = (): Hsml => {
        if (this.dom) {
            if (this._updateSched) {
                clearTimeout(this._updateSched);
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
        const hsmls = this.render() as Hsmls;
        hsmls.push(
            (e: Element) => {
                if (!this.dom) {
                    (this as any).dom = e;
                    (e as any).widget = this;
                    WidgetCtrl._widgets[this.id] = this;
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
        if (node.nodeType === 1 && (node as any).widget) {
            const c = (node as any).widget as WidgetCtrl<any>;
            c && c.umount();
        }
    });
};

const merge = <T extends { [k: string]: any }>(target: T, source: Partial<T>): T => {
    if (isMergeble(target) && isMergeble(source)) {
        Object.keys(source).forEach(key => {
            if (isMergeble(source[key] as object)) {
                if (!target[key]) {
                    (target as any)[key] = {};
                }
                merge(target[key], source[key] as Partial<T>);
            } else {
                (target as any)[key] = source[key];
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
