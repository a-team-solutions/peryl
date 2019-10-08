import { Mount, Action } from "./hsml-svac";
import { HsmlElement, HsmlFragment, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx, HsmlFnc } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export interface View<State extends { [k: string]: any }>  {
    (state: State, action: Action, mount: Mount): HsmlFragment;
    type: string;
    state: State;
    actions?: Actions<State>;
}

export type Actions<State extends { [k: string]: any }> = (
    action: string,
    data: any,
    ctrl: Ctrl<State>) => void;

const mount: Mount = <State extends { [k: string]: any }>(
    view: View<State>,
    state?: State,
    action?: Action): HsmlFnc | HsmlFragment =>
    (e: Element) => {
        if ((e as any).ctrl) {
            const c = (e as any).ctrl as Ctrl<State>;
            if (c.view === view) {
                if (state !== undefined) {
                    c.state = state;
                }
                c.update();
            } else {
                c.umount();
                const c1 = new Ctrl(view, action);
                if (state !== undefined) {
                    c1.state = state;
                }
                c1.mount(e);
            }
        } else {
            const c = new Ctrl(view, action);
            if (state !== undefined) {
                c.state = state;
            }
            c.mount(e);
        }
        return true;
    };

const ctrlAttr = "ctrl";

export class Ctrl<State extends { [k: string]: any }> implements HsmlHandlerCtx {

    static debug = false;

    static appActions?: Actions<any>;

    private static _count = 0;

    private static _ctrls: { [ctrl: string]: Ctrl<any> } = {};

    readonly type: string = "Ctrl";
    readonly id: string = this.type + "-" + Ctrl._count++;
    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    state: State;

    readonly view: View<State>;

    private _actions?: Actions<State>;
    private _extAction?: Action;

    private _updateSched?: number;

    constructor(view: View<State>, extAction?: Action) {
        this.view = view;
        this.type = view.type;
        this.state = view.state;
        this._actions = view.actions;
        this._extAction = extAction || this.appAction;
    }

    appAction = (action: string, data?: any): void => {
        Ctrl.debug && console.log("appAction", this.type, action, data);
        Ctrl.appActions && Ctrl.appActions(action, data, this);
    }

    appActions(actions: Actions<State>): this {
        Ctrl.appActions = actions;
        return this;
    }

    extAction = (action: string, data?: any): void => {
        Ctrl.debug && console.log("extAction", this.type, action, data);
        this._extAction && this._extAction(action, data);
    }

    action = (action: string, data?: any): void => {
        Ctrl.debug && console.log("action", this.type, action, data);
        this._actions && this._actions(action, data, this);
    }

    appCtrls(): Ctrl<any>[] {
        return Object.values(Ctrl._ctrls);
    }

    render = (): HsmlFragment => {
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
        const hsmls = this.render() as HsmlFragment;
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
