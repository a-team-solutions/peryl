import { HsmlElement, HsmlFragment, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export type View<State> = (state: State) => HsmlFragment;

export type Action = (action: string, data?: any) => void;

export type Actions<State> = (action: string, data: any, app: App<State>) => void;

export type Class<T = object> = new (...args: any[]) => T;

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

    action = (action: string, data?: any): void => {
        this.actions(action, data, this);
    }

    render = (): HsmlFragment => this.view(this.state);

    onHsml = (action: string, data: HsmlAttrOnData, e: Event): void => {
        data = (data && data.constructor === Function)
            ? (data as HsmlAttrOnDataFnc)(e)
            : data === undefined ? e : data;
        this.action(action, data);
    }

    mount = (e: Element | null = document.body): this => {
        if (e) {
            if ("app" in e) {
                const w = (e as any).app as App<State>;
                w && w.umount();
            }
            if (!this.dom) {
                (this as any).dom = e;
                (e as any).app = this;
                const hsmls = (this as any).render();
                hsmls2idomPatch(e, hsmls, this);
                this.action("_mount", this.dom);
            }
        } else {
            console.warn("invalit element", e);
        }
        return this;
    }

    umount = (): this => {
        if (this.dom) {
            this.action("_umount", this.dom);
            if (this.dom.hasAttribute("app")) {
                this.dom.removeAttribute("app");
            }
            const wNodes = this.dom.querySelectorAll("[app]");
            for (let i = 0; i < wNodes.length; i++) {
                const w = (wNodes[i] as any).app as App<State>;
                w && w.umount();
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
            const w = (node as any).app as App<any>;
            w && w.umount();
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
