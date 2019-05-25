import { View, OnAction, Manage, Ctrl } from "./hsml-svac";
import { Hsml, Hsmls, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx, HsmlFnc } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

const manage: Manage = <S>(state: S, view: View<S>, onAction: OnAction<S>, type?: string): HsmlFnc | Hsmls => {
    return (e: Element) => {
        if ((e as any).ctrl) {
            const c = (e as any).ctrl as SvaCtrl<S>;
            if (c.view === view) {
                if (state !== undefined) {
                    c.state = state;
                }
                c.update();
            } else {
                c.umount();
                const c1 = new SvaCtrl(state, view, onAction, type);
                if (state !== undefined) {
                    c1.state = state;
                }
                c1.mount(e);
            }
        } else {
            const c = new SvaCtrl(state, view, onAction, type);
            if (state !== undefined) {
                c.state = state;
            }
            c.mount(e);
        }
        return true;
    };
};

export class SvaCtrl<S> implements Ctrl<S>, HsmlHandlerCtx {

    private static __count = 0;

    static readonly mounted: { [ctrl: string]: SvaCtrl<any> } = {};

    static onActionGlobal: OnAction<any> = (action: string, data: any, ctrl: Ctrl<any>): void => {
        console.log("action:", action, data, ctrl);
    }

    readonly type: string = "Ctrl";
    readonly id: string = this.type + "-" + SvaCtrl.__count++;
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
        SvaCtrl.onActionGlobal(action, data, this);
    }

    onActionGlobal(onAction: OnAction<S>): this {
        SvaCtrl.onActionGlobal = onAction;
        return this;
    }

    ctrls(): SvaCtrl<any>[] {
        return Object.values(SvaCtrl.mounted);
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
                const c = (e as any).ctrl as SvaCtrl<S>;
                c && c.umount();
            }
            if (!this.dom) {
                SvaCtrl.mounted[this.id] = this;
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
            delete SvaCtrl.mounted[this.id];
            this.action("_umount", this.dom);
            if (this.dom.hasAttribute("ctrl")) {
                this.dom.removeAttribute("ctrl");
            }
            const cNodes = this.dom.querySelectorAll("[ctrl]");
            for (let i = 0; i < cNodes.length; i++) {
                const c = (cNodes[i] as any).ctrl as SvaCtrl<S>;
                c && c.umount();
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
                    SvaCtrl.mounted[this.id] = this;
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
            const c = (node as any).ctrl as SvaCtrl<any>;
            c && c.umount();
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
