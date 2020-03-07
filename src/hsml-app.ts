import { HElement, HElements, HAttrOnData, HAttrOnDataFnc, HHandlerCtx } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";

export type HView<State> = (state: State) => HElements;

export type HAction = (action: string | number, data?: any, event?: Event) => void;

export type HActions<State> = (app: HApp<State>,
                               action: string | number,
                               data?: any,
                               event?: Event) => void;

export type Class<T = object> = new (...args: any[]) => T;

export function happ<State>(state: State,
                            view: HView<State>,
                            actions?: HActions<State>,
                            element: Element | string | null = document.body) {
    return new HApp<State>(state, view, actions).mount(element);
}

export enum HAppAction {
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

export class HApp<State> implements HHandlerCtx {

    state: State;

    readonly view: HView<State>;
    readonly actions: HActions<State>;

    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched?: number;

    constructor(state: State, view: HView<State>, actions?: HActions<State>) {
        this.state = state;
        this.view = view;
        this.actions = actions || ((_, a, d) => console.log("action:", a, d));
        this.action(HAppAction._init);
    }

    action: HAction = (action: string | number, data?: any, event?: Event): void => {
        this.actions(this, action, data, event);
    }

    render = (): HElements => this.view(this.state);

    onHsml = (action: string, data: HAttrOnData, event: Event): void => {
        data = (data && data.constructor === Function)
            ? (data as HAttrOnDataFnc)(event)
            : data;
        if (data === undefined && event) {
            data = formData(event);
        }
        this.action(action, data, event);
    }

    mount = (e: Element | string | null = document.body): this => {
        const el = (typeof e === "string")
            ? document.getElementById(e) || document.body
            : e || document.body;
        if ((el as any).app) {
            const a = (el as any).app as HApp<State>;
            a.umount();
        }
        if (!this.dom) {
            (this as any).dom = el;
            (el as any).app = this;
            const hsmls = (this as any).render();
            hsmls2idomPatch(el, hsmls, this);
            this.action(HAppAction._mount, this.dom);
        }
        return this;
    }

    umount = (): this => {
        if (this.dom) {
            this.action(HAppAction._umount, this.dom);
            if (this.dom.hasAttribute("app")) {
                this.dom.removeAttribute("app");
            }
            const aNodes = this.dom.querySelectorAll("[app]");
            for (let i = 0; i < aNodes.length; i++) {
                const a = (aNodes[i] as any).app as HApp<State>;
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
                return ["div", { _skip: true }];
            }
        }
        const hsmls = this.render() as HElements;
        hsmls.push(
            (e: Element) => {
                if (!this.dom) {
                    (this as any).dom = e;
                    (e as any).app = this;
                    this.action(HAppAction._mount, this.dom);
                }
            });
        return ["div", hsmls];
    }

    toHtml = (): string => {
        return this.dom ? this.dom.outerHTML : "";
    }

}

function formData(e: Event): { [k: string]: string | null | Array<string | null> } {
    const el = e.target as HTMLElement;
    const data = {} as { [k: string]: string | null | Array<string | null> };
    switch (el.nodeName) {
        case "FORM":
            (e as Event).preventDefault();
            const els = (el as HTMLFormElement).elements;
            for (let i = 0; i < els.length; i++) {
                const d = formInputData(els[i]);
                const names = Object.keys(d);
                if (names.length) {
                    const name = names[0];
                    const value = d[name];
                    if (data[name] === undefined) {
                        data[name] = value;
                    } else if (typeof data[name] === "string" || data[name] instanceof String) {
                        if (value instanceof Array) {
                            data[name] = [data[name] as string, ...value];
                        } else {
                            data[name] = [data[name] as string, value as string];
                        }
                    } else if (data[name] instanceof Array) {
                        if (value instanceof Array) {
                            data[name] = (data[name] as Array<string | null>).concat(value);
                        } else {
                            (data[name] as Array<string | null>).push(value);
                        }
                    } else {
                        if (value instanceof Array) {
                            data[name] = [data[name] as string, ...value];
                        } else {
                            data[name] = [data[name] as string, value];
                        }
                    }
                    if (data[name] instanceof Array) {
                        data[name] = (data[name] as Array<string | null>)
                            .filter(d => d !== null);
                        if ((els[i] as HTMLInputElement).type === "radio") {
                            data[name] = (data[name] as Array<string | null>).length
                                ? (data[name] as Array<string | null>)[0]
                                : null;
                        }
                    }
                }
            }
            break;
        default:
            const d = formInputData(el);
            Object.assign(data, d);
            break;
    }
    return data;
}

function formInputData(el: Element): { [k: string]: string | null | string[] } {
    const data = {} as { [k: string]: string | null | string[] };
    switch (el.nodeName) {
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
                case "submit":
                case "button":
                    iel.name && (data[iel.name] = iel.value);
                    break;
                case "radio":
                    iel.name && (data[iel.name] = iel.checked ? iel.value : null);
                    break;
                case "checkbox":
                    if (iel.name) {
                        if (iel.value === "on") { // value not set in element
                            data[iel.name] = String(iel.checked);
                        } else {
                            data[iel.name] = iel.checked
                                ? String(iel.value)
                                : null;
                        }
                    }
                    break;
            }
            break;
        case "SELECT":
            const sel = el as HTMLSelectElement;
            if (sel.name) {
                if (sel.multiple) {
                    const values = Array.from(sel.selectedOptions).map(o => o.value);
                    data[sel.name] = values;
                } else {
                    data[sel.name] = sel.value;
                }
            }
            break;
        case "TEXTAREA":
            const tel = el as HTMLTextAreaElement;
            tel.name && (data[tel.name] = tel.innerText);
            break;
        case "BUTTON":
            const bel = el as HTMLButtonElement;
            bel.name && (data[bel.name] = bel.value);
            break;
    }
    return data;
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
