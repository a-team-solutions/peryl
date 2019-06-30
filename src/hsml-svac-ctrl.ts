import { Manage, Action } from "./hsml-svac";
import { Hsml, Hsmls, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx, HsmlFnc } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export interface View<S> {
    (state: S, action: Action, manage: Manage): Hsmls;
    svac_type?: string;
    svac_state?: S;
    svac_onAction?: OnAction<S>;
}

export type Component<S> = [S, View<S>, OnAction<S>, string?];

export type OnAction<S> = (action: string, data: any, ctrl: Ctrl<S>) => void;

const manage: Manage = <S>(view: View<S>, state?: S): HsmlFnc | Hsmls => {
    return (e: Element) => {
        const type = (view as any).svac_type;
        const onAction = view.svac_onAction;
        if ((e as any).ctrl) {
            const c = (e as any).ctrl as Ctrl<S>;
            if (c.view === view) {
                if (state !== undefined) {
                    c.state = state;
                }
                c.update();
            } else {
                c.umount();
                const c1 = new Ctrl(state, view, onAction, type);
                if (state !== undefined) {
                    c1.state = state;
                }
                c1.mount(e);
            }
        } else {
            const c = new Ctrl(state, view, onAction, type);
            if (state !== undefined) {
                c.state = (view as any).svac_state;
            }
            c.mount(e);
        }
        return true;
    };
};

export function svacApp<S>(view: View<S>, state?: S): Ctrl<S> {
    return new Ctrl<S>(view.svac_state, view, view.svac_onAction, view.svac_type);
}

export function svacDef<S>(state: S,
                           view: View<S>,
                           onAction: OnAction<S>,
                           type?: string): void {
    view.svac_type = type || view.name;
    view.svac_state = state;
    view.svac_onAction = onAction;
}

export class Ctrl<S> implements HsmlHandlerCtx {

    private static __count = 0;

    static readonly mounted: { [ctrl: string]: Ctrl<any> } = {};

    static onActionGlobal: OnAction<any> = (action: string, data: any, ctrl: Ctrl<any>): void => {
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
                const c = (e as any).ctrl as Ctrl<S>;
                c && c.umount();
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
            const cNodes = this.dom.querySelectorAll("[ctrl]");
            for (let i = 0; i < cNodes.length; i++) {
                const c = (cNodes[i] as any).ctrl as Ctrl<S>;
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
            const c = (node as any).ctrl as Ctrl<any>;
            c && c.umount();
        }
    });
};

const merge = <T extends { [k: string]: any }>(target: T, source: Partial<T>): T => {
    if (isMergeble(target) && isMergeble(source)) {
        Object.keys(source).forEach(key => {
            if (isMergeble(source[key])) {
                if (!target[key]) {
                    (target as any)[key] = {};
                }
                merge(target[key], source[key]);
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
