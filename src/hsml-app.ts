import { HsmlElement, HsmlFragment, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export type MergebleState = { [k: string]: any };

export type View<State extends MergebleState> = (state: State) => HsmlFragment;

export type Action = (action: string | number, data?: any, event?: Event) => void;

export type Actions<State extends MergebleState> = (app: App<State>,
                                                    action: string | number,
                                                    data?: any,
                                                    event?: Event) => void;

export type Class<T = object> = new (...args: any[]) => T;

export function app<State extends MergebleState>(state: State,
                                                 view: View<State>,
                                                 actions?: Actions<State>,
                                                 element?: string | Element | null) {
    return new App<State>(state, view, actions).mount(element);
}

export enum AppAction {
    _init = "_init",
    _mount = "_mount",
    _umount = "_umount",
}

const schedule = window.requestAnimationFrame ||
    // window.webkitRequestAnimationFrame ||
    // (window as any).mozRequestAnimationFrame ||
    // (window as any).oRequestAnimationFrame ||
    // (window as any).msRequestAnimationFrame ||
    function (callback: Function) { window.setTimeout(callback, 1000 / 60); };

const unschedule = window.cancelAnimationFrame ||
    // window.webkitCancelAnimationFrame ||
    // (window as any).mozCancelAnimationFrame ||
    // (window as any).oCancelAnimationFrame ||
    // (window as any).msCancelAnimationFrame ||
    function (handle: number) { window.clearTimeout(handle); };

export class App<State extends MergebleState> implements HsmlHandlerCtx {

    state: State;

    readonly view: View<State>;
    readonly actions: Actions<State>;

    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched?: number;

    constructor(state: State, view: View<State>, actions?: Actions<State>) {
        this.state = state;
        this.view = view;
        this.actions = actions || ((_, a, d) => console.log("action:", a, d));
        this.action(AppAction._init);
    }

    action: Action = (action: string | number, data?: any, event?: Event): void => {
        this.actions(this, action, data, event);
    }

    render = (): HsmlFragment => this.view(this.state);

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
        if ((el as any).app) {
            const a = (el as any).app as App<State>;
            a && a.umount();
        }
        if (!this.dom) {
            (this as any).dom = el;
            (el as any).app = this;
            const hsmls = (this as any).render();
            hsmls2idomPatch(el, hsmls, this);
            this.action(AppAction._mount, this.dom);
        }
        return this;
    }

    umount = (): this => {
        if (this.dom) {
            this.action(AppAction._umount, this.dom);
            if (this.dom.hasAttribute("app")) {
                this.dom.removeAttribute("app");
            }
            const aNodes = this.dom.querySelectorAll("[app]");
            for (let i = 0; i < aNodes.length; i++) {
                const a = (aNodes[i] as any).app as App<State>;
                a && a.umount();
            }
            while (this.dom.firstChild /*.hasChildNodes()*/) {
                this.dom.removeChild(this.dom.firstChild);
            }
            delete (this.dom as any).app;
            (this as any).dom = undefined;
        }
        return this;
    }

    update = (state?: Partial<State>): this => {
        if (state) {
            this.state = merge(this.state, state);
        }
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

    toHsml = (): HsmlElement => {
        if (this.dom) {
            if (this._updateSched) {
                unschedule(this._updateSched);
                this._updateSched = undefined;
            } else {
                return ["div", { _skip: true }];
            }
        }
        const hsmls = this.render() as HsmlFragment;
        hsmls.push(
            (e: Element) => {
                if (!this.dom) {
                    (this as any).dom = e;
                    (e as any).app = this;
                    this.action(AppAction._mount, this.dom);
                }
            });
        return ["div", hsmls];
    }

    toHtml = (): string => {
        return this.dom ? this.dom.outerHTML : "";
    }

}

(idom as any).notifications.nodesDeleted = (nodes: Node[]) => {
    nodes.forEach(node => {
        if (node.nodeType === 1 && "app" in node) {
            const a = (node as any).app as App<any>;
            a && a.umount();
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

function formInputData(e: Event | Element): { [k: string]: string } {
    const el = e instanceof Event ? e.target as HTMLElement : e;
    const value = {} as { [k: string]: string };
    switch (el.nodeName) {
        case "FORM":
            (e as Event).preventDefault();
            const els = (el as HTMLFormElement).elements;
            for (let i = 0; i < els.length; i++) {
                const v = formInputData(els[i]);
                Object.assign(value, v);
            }
            break;
        case "INPUT":
            const iel = el as HTMLInputElement;
            switch (iel.type) {
                case "text":
                case "password":
                case "email":
                case "number":
                case "search":
                case "url":
                case "tel":
                case "color":
                case "date":
                case "datetime-local":
                case "month":
                case "range":
                case "time":
                case "week":
                case "radio":
                    iel.name && (value[iel.name] = iel.value);
                    break;
                case "checkbox":
                    iel.name && (value[iel.name] = "" + iel.checked);
                    break;
            }
            break;
        case "SELECT":
            const sel = el as HTMLSelectElement;
            sel.name && (value[sel.name] = sel.value);
            break;
        case "TEXTAREA":
            const tel = el as HTMLTextAreaElement;
            tel.name && (value[tel.name] = tel.innerText);
            break;
        case "BUTTON":
            const bel = el as HTMLButtonElement;
            bel.name && (value[bel.name] = bel.value);
            break;
    }
    return value;
}

// export const formInputData = <State>(actions: Actions<State>): Actions<State> =>
//     (app: App<State>, action: string | number, data?: any, event?: Event): void => {
//         if (data === undefined && event) {
//             data = inputEventData(event);
//         }
//         actions(app, action, data, event);
//     };

// // Decorator
// export function FormInputData() {
//     return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//         const method = descriptor.value;
//         descriptor.value = formInputData(method);
//         return descriptor;
//     };
// }
