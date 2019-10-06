import { Mount, View } from "./hsml-svac";
import { HsmlElement, HsmlFragmet, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx, HsmlFnc } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

const warn = console.warn;


export interface Component<State extends { [k: string]: any }> {
    type: string;
    state: State;
    view: View<State>;
    actions?: Actions<State>;
}

export type Actions<State extends { [k: string]: any }> = (action: string, data: any, ctrl: Ctrl<State>) => void;

const mount: Mount = <State extends { [k: string]: any }>(component: Component<State>, state?: State): HsmlFnc | HsmlFragmet => {
    return (e: Element) => {
        if ((e as any).ctrl) {
            const c = (e as any).ctrl as Ctrl<State>;
            if (c.view === component.view) {
                if (state !== undefined) {
                    c.state = state;
                }
                c.update();
            } else {
                c.umount();
                const c1 = new Ctrl(component);
                if (state !== undefined) {
                    c1.state = state;
                }
                c1.mount(e);
            }
        } else {
            const c = new Ctrl(component);
            if (state !== undefined) {
                c.state = state;
            }
            c.mount(e);
        }
        return true;
    };
};

const ctrlAttr = "ctrl";

export class Ctrl<State extends { [k: string]: any }> implements HsmlHandlerCtx {

    private static _count = 0;

    private static _ctrls: { [ctrl: string]: Ctrl<any> } = {};

    static appActions?: Actions<any>;

    readonly type: string = "Ctrl";
    readonly id: string = this.type + "-" + Ctrl._count++;
    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched?: number;

    view: View<State>;
    state: State;
    actions?: Actions<State>;

    constructor(component: Component<State>, state?: State) {
        this.view = component.view;
        this.type = component.type;
        this.state = state || component.state;
        this.actions = component.actions;
    }

    appAction = (action: string, data?: any): void => {
        if (Ctrl.appActions) {
            Ctrl.appActions(action, data, this);
        } else {
            warn("Ctrl.appActions undefined:", action, data, this);
        }
    }

    appActions(actions: Actions<State>): this {
        Ctrl.appActions = actions;
        return this;
    }

    action = (action: string, data?: any): void => {
        if (this.actions) {
            this.actions(action, data, this);
        } else {
            warn("View.actions undefined:", action, data, this);
        }
    }

    get appCtrls(): Ctrl<any>[] {
        return Object.values(Ctrl._ctrls);
    }

    render = (): HsmlFragmet => {
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
            if ((e as any).ctrl) {
                const c = (e as any).ctrl as Ctrl<State>;
                c && c.umount();
            }
            if (!this.dom) {
                Ctrl._ctrls[this.id] = this;
                (this as any).dom = e;
                (e as any).ctrl = this;
                const hsmls = (this as any).render();
                hsmls2idomPatch(e, hsmls, this);
                e.setAttribute(ctrlAttr, this.type);
                this.action("_mount", this.dom);
            }
        } else {
            console.warn("invalit element", e);
        }
        return this;
    }

    umount = (): this => {
        if (this.dom) {
            delete Ctrl._ctrls[this.id];
            this.action("_umount", this.dom);
            if (this.dom.hasAttribute(ctrlAttr)) {
                this.dom.removeAttribute(ctrlAttr);
            }
            const cNodes = this.dom.querySelectorAll(`[${ctrlAttr}]`);
            for (let i = 0; i < cNodes.length; i++) {
                const c = (cNodes[i] as any).ctrl as Ctrl<State>;
                c && c.umount();
            }
            while (this.dom.firstChild) {
                this.dom.removeChild(this.dom.firstChild);
            }
            delete (this.dom as any).ctrl;
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

    toHsml = (): HsmlElement => {
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
                            ctrl: this.type
                        }
                    ]
                );
            }
        }
        const hsmls = this.render() as HsmlFragmet;
        hsmls.push(
            (e: Element) => {
                if (!this.dom) {
                    (this as any).dom = e;
                    (e as any).ctrl = this;
                    Ctrl._ctrls[this.id] = this;
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
        if (node.nodeType === 1 && (node as any).ctrl) {
            const c = (node as any).ctrl as Ctrl<any>;
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
