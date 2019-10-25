import { HsmlElement, HsmlFragment, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export type View<State> = (state: State) => HsmlFragment;

export type Action = (action: string, data?: any) => void;

export type Actions<State> = (action: [string, any?, Event?], app: App<State>) => void;

export type Class<T = object> = new (...args: any[]) => T;

export function app<State>(state: State,
                           view: View<State>,
                           actions: Actions<State>,
                           element?: string | Element | null) {
    return new App<State>(state, view, actions).mount(element);
}

export class App<State> implements HsmlHandlerCtx {

    state: State;

    readonly view: View<State>;
    readonly actions: Actions<State>;

    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched?: number;

    constructor(state: State, view: View<State>, actions: Actions<State>) {
        this.state = state;
        this.view = view;
        this.actions = actions;
        this.action("_init");
    }

    action = (action: string, data?: any, e?: Event): void => {
        this.actions([action, data, e], this);
    }

    render = (): HsmlFragment => this.view(this.state);

    onHsml = (action: string, data: HsmlAttrOnData, e: Event): void => {
        data = (data && data.constructor === Function)
            ? (data as HsmlAttrOnDataFnc)(e)
            : data;
        if (data === undefined && e) {
            data = formInputData(e);
        }
        this.action(action, data, e);
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
            this.action("_mount", this.dom);
        }
        return this;
    }

    umount = (): this => {
        if (this.dom) {
            this.action("_umount", this.dom);
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
                return ["div", { _skip: true }];
            }
        }
        const hsmls = this.render() as HsmlFragment;
        hsmls.push(
            (e: Element) => {
                if (!this.dom) {
                    (this as any).dom = e;
                    (e as any).app = this;
                    this.action("_mount", this.dom);
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
        case "BUTTON":
            const bel = (el as HTMLButtonElement);
            value[bel.name] = bel.value;
            break;
        case "TEXTAREA":
            const tel = (el as HTMLTextAreaElement);
            value[tel.name] = tel.innerText;
            break;
    }
    return value;
}