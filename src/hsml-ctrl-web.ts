import { Hsml, Hsmls, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx, HsmlFnc } from "./hsml";
import { View, OnAction, Manage, ICtrl } from "./hsml-ctrl";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

const manage: Manage = <S>(state: S, view: View<S>, onAction: OnAction<S>, type?: string): HsmlFnc | Hsmls => {
    return (e: Element) => {
        if ((e as any).ctrl) {
            const w = (e as any).ctrl as Ctrl<S>;
            if (w.view === view) {
                if (state !== undefined) {
                    w.state = state;
                }
                w.update();
            } else {
                w.umount();
                const w1 = new Ctrl(state, view, onAction, type);
                if (state !== undefined) {
                    w1.state = state;
                }
                w1.mount(e);
            }
        } else {
            const w = new Ctrl(state, view, onAction, type);
            if (state !== undefined) {
                w.state = state;
            }
            w.mount(e);
        }
        return true;
    };
};

export function ctrlApp<S>(state: S, view: View<S>, onAction: OnAction<S>, type?: string): Ctrl<S> {
    return new Ctrl<S>(state, view, onAction, type);
}

export class Ctrl<S> implements ICtrl<S>, HsmlHandlerCtx {

    private static __count = 0;

    static readonly mounted: { [ctrl: string]: Ctrl<any> } = {};

    static onActionGlobal: OnAction<any> = (action: string, data: any, ctrl: ICtrl<any>): void => {
        console.log("action:", action, data, ctrl);
    }

    readonly type: string = "Ctrl";
    readonly id: string = this.type + "-" + Ctrl.__count++;
    readonly dom: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private __updateSched: number;

    state: S;
    view: View<S>;
    onAction: OnAction<S>;

    constructor(state: S, view: View<S>, onAction: OnAction<S>, type?: string) {
        this.state = state;
        this.view = view;
        this.onAction = onAction;
        type && (this.type = type);
    }

    action = (action: string, data?: any): void => {
        this.onAction(action, data, this);
    }

    actionGlobal = (action: string, data?: any): void => {
        Ctrl.onActionGlobal(action, data, this);
    }

    onActionGlobal(onAction: OnAction<S>): this {
        Ctrl.onActionGlobal = onAction;
        return this;
    }

    ctrls(): Ctrl<any>[] {
        return Object.values(Ctrl.mounted);
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
            if ("ctrl" in e) {
                const w = (e as any).ctrl as Ctrl<S>;
                w && w.umount();
            }
            if (!this.dom) {
                Ctrl.mounted[this.id] = this;
                (this as any).dom = e;
                (e as any).ctrl = this;
                const hsmls = (this as any).render();
                hsmls2idomPatch(e, hsmls, this);
                e.setAttribute("ctrl", this.type);
                this.action("_mount", this.dom);
            }
        }
        return this;
    }

    umount = (): this => {
        if (this.dom) {
            delete Ctrl.mounted[this.id];
            this.action("_umount", this.dom);
            if (this.dom.hasAttribute("ctrl")) {
                this.dom.removeAttribute("ctrl");
            }
            const wNodes = this.dom.querySelectorAll("[ctrl]");
            for (let i = 0; i < wNodes.length; i++) {
                const w = (wNodes[i] as any).ctrl as Ctrl<S>;
                w && w.umount();
            }
            while (this.dom.firstChild /*.hasChildNodes()*/) {
                this.dom.removeChild(this.dom.firstChild);
            }
            delete (this.dom as any).ctrl;
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
                            ctrl: this.type
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
                    (e as any).ctrl = this;
                    Ctrl.mounted[this.id] = this;
                    this.action("_mount", this.dom);
                }
            });
        return (
            ["div",
                {
                    _id: this.id,
                    _key: this.id,
                    ctrl: this.type
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
        if (node.nodeType === 1 && "ctrl" in node) {
            const w = (node as any).ctrl as Ctrl<any>;
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
