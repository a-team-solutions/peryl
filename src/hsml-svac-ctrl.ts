import { Mount, Action, View, Component as SvacComponent, MergebleState } from "./hsml-svac";
import { HsmlElement, HsmlFragment, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx, HsmlFnc } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export interface Component<State extends MergebleState> extends SvacComponent<State> {
    actions?: Actions<State>;
}

export type Actions<State extends MergebleState> = (ctrl: Ctrl<State>,
                                                    action: string | number,
                                                    data?: any,
                                                    event?: Event) => void;

const mount: Mount = <State extends MergebleState>(
    component: Component<State>,
    state?: State,
    action?: Action): HsmlFnc | HsmlFragment =>
    (e: Element) => {
        if ((e as any).ctrl) {
            const c = (e as any).ctrl as Ctrl<State>;
            if (c.view === component.view) {
                if (state !== undefined) {
                    c.state = state;
                }
                c.update();
            } else {
                c.umount();
                const c1 = new Ctrl<State>(component, action);
                if (state !== undefined) {
                    c1.state = state;
                }
                c1.mount(e);
            }
        } else {
            const c = new Ctrl<State>(component, action);
            if (state !== undefined) {
                c.state = state;
            }
            c.mount(e);
        }
        return true;
    };

const ctrlAttr = "ctrl";

export class Ctrl<State extends MergebleState> implements HsmlHandlerCtx {

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

    constructor(component: Component<State>, extAction?: Action) {
        this.view = component.view;
        this.type = component.type;
        this.state = component.state;
        this._actions = component.actions;
        this._extAction = extAction || this.appAction;
        this.action("_init");
    }

    appAction = (action: string | number, data?: any, event?: Event): void => {
        Ctrl.debug && console.log("appAction", this.type, action, data, event);
        Ctrl.appActions && Ctrl.appActions(this, action, data, event);
    }

    appActions(actions: Actions<State>): this {
        Ctrl.appActions = actions;
        return this;
    }

    extAction = (action: string | number, data?: any, event?: Event): void => {
        Ctrl.debug && console.log("extAction", this.type, action, data, event);
        this._extAction && this._extAction(action, data, event);
    }

    action = (action: string | number, data?: any, event?: Event): void => {
        Ctrl.debug && console.log("action", this.type, action, data, event);
        this._actions && this._actions(this, action, data, event);
    }

    appCtrls(): Ctrl<any>[] {
        return Object.values(Ctrl._ctrls);
    }

    render = (): HsmlFragment => {
        return this.view(this.state, this.action, mount);
    }

    onHsml = (action: string, data: HsmlAttrOnData, event: Event): void => {
        data = (data && data.constructor === Function)
            ? (data as HsmlAttrOnDataFnc)(event)
            : data;
        if (data === undefined && event) {
            data = formInputData(event);
        }
        this.action(action, data, event);
    }

    mount = (e?: string | Element | null): this => {
        const el = typeof e === "string"
            ? document.getElementById(e) || document.body
            : e || document.body;
        if ((el as any).ctrl) {
            const c = (el as any).ctrl as Ctrl<State>;
            c && c.umount();
        }
        if (!this.dom) {
            Ctrl._ctrls[this.id] = this;
            (this as any).dom = el;
            (el as any).ctrl = this;
            const hsmls = (this as any).render();
            hsmls2idomPatch(el, hsmls, this);
            el.setAttribute(ctrlAttr, this.type);
            this.action("_mount", this.dom);
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

const merge = <T extends MergebleState>(target: T, source: Partial<T>): T => {
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

function formInputData(e: Event): { [k: string]: string } {
    const value = {} as { [k: string]: string };
    const el = (e.target as HTMLElement);
    switch (el.nodeName) {
        case "INPUT":
            const iel = (el as HTMLInputElement);
            switch (iel.type) {
                case "text":
                case "radio":
                    value[iel.name] = iel.value;
                    break;
                case "number":
                    value[iel.name] = iel.value;
                    break;
                case "checkbox":
                    value[iel.name] = "" + iel.checked;
                    break;
            }
            break;
        case "SELECT":
            const sel = (el as HTMLSelectElement);
            value[sel.name] = sel.value;
            break;
        case "TEXTAREA":
            const tel = (el as HTMLTextAreaElement);
            value[tel.name] = tel.innerText;
            break;
        case "BUTTON":
            const bel = (el as HTMLButtonElement);
            value[bel.name] = bel.value;
            break;
    }
    return value;
}
