import { HMount, HAction, HView, HComponent as SvacComponent } from "./hsml-svac";
import { HElement, HElements, HAttrOnData, HAttrOnDataFnc, HHandlerCtx, HFnc } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export interface HComponent<State> extends SvacComponent<State> {
    actions?: HActions<State>;
}

export type HActions<State> = (ctrl: HCtrl<State>,
                               action: string | number,
                               data?: any,
                               event?: Event) => void;

const mount: HMount = <State>(
    component: HComponent<State>,
    state?: State,
    action?: HAction): HFnc | HElements =>
    (e: Element) => {
        if ((e as any).ctrl) {
            const c = (e as any).ctrl as HCtrl<State>;
            if (c.view === component.view) {
                if (state !== undefined) {
                    c.state = state;
                }
                c.update();
            } else {
                c.umount();
                const c1 = new HCtrl<State>(component, action);
                if (state !== undefined) {
                    c1.state = state;
                }
                c1.mount(e);
            }
        } else {
            const c = new HCtrl<State>(component, action);
            if (state !== undefined) {
                c.state = state;
            }
            c.mount(e);
        }
        return true;
    };

const schedule = window.requestAnimationFrame ||
    // window.webkitRequestAnimationFrame ||
    // (window as any).mozRequestAnimationFrame ||
    // (window as any).oRequestAnimationFrame ||
    // (window as any).msRequestAnimationFrame ||
    function (handler: Function) { window.setTimeout(handler, 1000 / 60); };

const unschedule = window.cancelAnimationFrame ||
    // window.webkitCancelAnimationFrame ||
    // (window as any).mozCancelAnimationFrame ||
    // (window as any).oCancelAnimationFrame ||
    // (window as any).msCancelAnimationFrame ||
    function (handle: number) { window.clearTimeout(handle); };

const ctrlAttr = "ctrl";

export class HCtrl<State> implements HHandlerCtx {

    static debug = false;

    static appActions?: HActions<any>;

    private static _count = 0;

    private static _ctrls: { [ctrl: string]: HCtrl<any> } = {};

    readonly type: string = "Ctrl";
    readonly id: string = this.type + "-" + HCtrl._count++;
    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    state: State;

    readonly view: HView<State>;

    private _actions?: HActions<State>;
    private _extAction?: HAction;

    private _updateSched?: number;

    constructor(component: HComponent<State>, extAction?: HAction) {
        this.view = component.view;
        this.type = component.type;
        this.state = component.state;
        this._actions = component.actions;
        this._extAction = extAction || this.appAction;
        this.action("_init");
    }

    appAction = (action: string | number, data?: any, event?: Event): void => {
        HCtrl.debug && console.log("appAction", this.type, action, data, event);
        HCtrl.appActions && HCtrl.appActions(this, action, data, event);
    }

    appActions(actions: HActions<State>): this {
        HCtrl.appActions = actions;
        return this;
    }

    extAction = (action: string | number, data?: any, event?: Event): void => {
        HCtrl.debug && console.log("extAction", this.type, action, data, event);
        this._extAction && this._extAction(action, data, event);
    }

    action = (action: string | number, data?: any, event?: Event): void => {
        HCtrl.debug && console.log("action", this.type, action, data, event);
        this._actions && this._actions(this, action, data, event);
    }

    appCtrls(): HCtrl<any>[] {
        return Object.values(HCtrl._ctrls);
    }

    render = (): HElements => {
        return this.view(this.state, this.action, mount);
    }

    actionCb = (action: string, data: HAttrOnData, event: Event): void => {
        data = (data && data.constructor === Function)
            ? (data as HAttrOnDataFnc)(event)
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
            const c = (el as any).ctrl as HCtrl<State>;
            c && c.umount();
        }
        if (!this.dom) {
            HCtrl._ctrls[this.id] = this;
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
            delete HCtrl._ctrls[this.id];
            this.action("_umount", this.dom);
            if (this.dom.hasAttribute(ctrlAttr)) {
                this.dom.removeAttribute(ctrlAttr);
            }
            const cNodes = this.dom.querySelectorAll(`[${ctrlAttr}]`);
            for (let i = 0; i < cNodes.length; i++) {
                const c = (cNodes[i] as any).ctrl as HCtrl<State>;
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

    update = (): this => {
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

    toHsml = (): HElement => {
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
                            ctrl: this.type
                        }
                    ]
                );
            }
        }
        const hsmls = this.render() as HElements;
        hsmls.push(
            (e: Element) => {
                if (!this.dom) {
                    (this as any).dom = e;
                    (e as any).ctrl = this;
                    HCtrl._ctrls[this.id] = this;
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
            const c = (node as any).ctrl as HCtrl<any>;
            c && c.umount();
        }
    });
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
