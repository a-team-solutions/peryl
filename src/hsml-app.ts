import { HElement, HElements, HAttrOnData, HAttrOnDataFnc, HHandlerCtx } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";

const log = console.log;

export type HView<STATE> = (state: STATE) => HElements;
export type HView1<STATE> = (state: STATE) => HElement;

export interface HAction {
    type: string;
    data?: any;
    event?: Event;
}

export type HDispatch = (type: HAction["type"],
                         data?: HAction["data"],
                         event?: HAction["event"]) => void;

export type HUpdate = () => void;

export type HDispatcher<STATE> = (app: HApp<STATE>, action: HAction) => void;

// export type Class<T = object> = new (...args: any[]) => T;

export function happ<STATE>(state: STATE,
                            view: HView<STATE>,
                            dispatcher?: HDispatcher<STATE>,
                            element: Element | string | null = document.body) {
    return new HApp<STATE>(state, view, dispatcher).mount(element);
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

export class HApp<STATE> implements HHandlerCtx {

    static debug = false;

    readonly state: STATE;
    readonly view: HView<STATE>;
    readonly dispatcher: HDispatcher<STATE>;

    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched?: number;

    private _onUpdate?: (app: HApp<STATE>) => void;

    constructor(state: STATE, view: HView<STATE>, dispatcher?: HDispatcher<STATE>) {
        this.state = state;
        this.view = view;
        this.dispatcher = dispatcher || ((_, a) => log("action:", a.type, a.data));
        this.dispatch(HAppAction._init);
    }

    dispatch: HDispatch = (type: string, data?: any, event?: Event): void => {
        HApp.debug && log("HApp action", { type, data, event });
        this.dispatcher(this, { type, data, event });
    }

    callDispatcher = <SUBSTATE>(dispatcher: HDispatcher<SUBSTATE>, state: SUBSTATE, action: HAction): void => {
        dispatcher({ ...this, state } as any, action);
    }

    render = (): HElements => {
        if (HApp.debug) {
            const t0 = performance.now();
            const hsml = this.view(this.state);
            const t1 = performance.now();
            HApp.debug && log("HApp render", `${t1 - t0} ms`, this.state);
            return hsml;
        } else {
            return this.view(this.state);
        }
    }

    actionCb = (action: string, data: HAttrOnData, event: Event): void => {
        data = (data && data.constructor === Function)
            ? (data as HAttrOnDataFnc)(event)
            : data;
        if (data === undefined && event) {
            data = formData(event);
        }
        this.dispatch(action, data, event);
    }

    mount = (e: Element | string | null = document.body): this => {
        const el = (typeof e === "string")
            ? document.getElementById(e) || document.body
            : e || document.body;
        if ((el as any).app) {
            const a = (el as any).app as HApp<STATE>;
            a.umount();
        }
        if (!this.dom) {
            (this as any).dom = el;
            (el as any).app = this;
            const hsmls = (this as any).render();
            updateDom(el, hsmls, this);
            this._onUpdate && this._onUpdate(this);
            this.dispatch(HAppAction._mount, this.dom);
        }
        return this;
    }

    umount = (): this => {
        if (this.dom) {
            this.dispatch(HAppAction._umount, this.dom);
            if (this.dom.hasAttribute("app")) {
                this.dom.removeAttribute("app");
            }
            const aNodes = this.dom.querySelectorAll("[app]");
            for (let i = 0; i < aNodes.length; i++) {
                const a = (aNodes[i] as any).app as HApp<STATE>;
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
                    updateDom(this.dom, this.render(), this);
                }
                this._updateSched = undefined;
                this._onUpdate && this._onUpdate(this);
            });
        }
        return this;
    }

    onUpdate = (cb: (app: HApp<STATE>) => void): this => {
        this._onUpdate = cb;
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
                    this.dispatch(HAppAction._mount, this.dom);
                }
            });
        return ["div", hsmls];
    }

    toHtml = (): string => {
        return this.dom ? this.dom.outerHTML : "";
    }

}

function updateDom(el: Element, hsml: HElements, ctx: HHandlerCtx): void {
    if (HApp.debug) {
        const t0 = performance.now();
        hsmls2idomPatch(el, hsml, ctx);
        const t1 = performance.now();
        HApp.debug && log("HApp update", `${t1 - t0} ms`, el);
    } else {
        hsmls2idomPatch(el, hsml, ctx);
    }
}

function formData(e: Event): { [k: string]: string | number | boolean | null | Array<string | null> } | string | number | boolean | null | Array<string | null> {
    const el = e.target as HTMLElement;
    switch (el.nodeName) {
        case "FORM":
            (e as Event).preventDefault();
            const els = (el as HTMLFormElement).elements;
            const data = {} as { [k: string]: string | null | Array<string | null> };
            for (let i = 0; i < els.length; i++) {
                const d = formInputData(els[i]);
                if (typeof d === "object") {
                    const names = Object.keys(d as object);
                    if (names.length) {
                        const name = names[0];
                        const value = (d as any)[name];
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
            }
            return data;
        default:
            return formInputData(el);
    }
}

function formInputData(el: Element): { [k: string]: string | string[] | null } | string | string[] | number | boolean | null {
    let data: { [k: string]: string | string[] | null }  | string | string[] | number | boolean | null = null;
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
                    if (iel.name) {
                        data = { [iel.name]: iel.value };
                    } else {
                        data = iel.value;
                    }
                    break;
                case "radio":
                    if (iel.name) {
                        data = { [iel.name]: iel.checked ? iel.value : null };
                    } else {
                        data = iel.checked ? iel.value : null;
                    }
                    break;
                case "checkbox":
                    if (iel.value === "on") { // value not set in element
                        if (iel.name) {
                            data = { [iel.name]: String(iel.checked) };
                        } else {
                            data = String(iel.checked);
                        }
                    } else {
                        if (iel.name) {
                            data = { [iel.name]: iel.checked
                                ? String(iel.value)
                                : null };
                        } else {
                            data = iel.checked
                                ? String(iel.value)
                                : null;
                        }
                    }
                    break;
            }
            break;
        case "SELECT":
            const sel = el as HTMLSelectElement;
            if (sel.multiple) {
                const values = Array.from(sel.selectedOptions).map(o => o.value);
                if (sel.name) {
                    data = { [sel.name]: values };
                } else {
                    data = values;
                }
            } else {
                if (sel.name) {
                    data = { [sel.name]: sel.value };
                } else {
                    data = sel.value;
                }
            }
            break;
        case "TEXTAREA":
            const tel = el as HTMLTextAreaElement;
            if (tel.name) {
                data = { [tel.name]: tel.value };
            } else {
                data = tel.value;
            }
            break;
        case "BUTTON":
            const bel = el as HTMLButtonElement;
            if (bel.name) {
                data = { [bel.name]: bel.value };
            } else {
                data = bel.value;
            }
            break;
    }
    return data;
}

// export const formInputData = <STATE>(dispatcher: Actions<STATE>): Actions<STATE> =>
//     (app: App<STATE>, action: string | number, data?: any, event?: Event): void => {
//         if (data === undefined && event) {
//             data = inputEventData(event);
//         }
//         dispatcher(app, action, data, event);
//     };

// // Decorator
// export function FormInputData() {
//     return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
//         const method = descriptor.value;
//         descriptor.value = formInputData(method);
//         return descriptor;
//     };
// }
