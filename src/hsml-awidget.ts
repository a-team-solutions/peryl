import { HsmlElement, HsmlFragment, HsmlAttrOnData, HsmlAttrOnDataFnc, HsmlHandlerCtx, HsmlFnc } from "./hsml";
import { hsmls2idomPatch } from "./hsml-idom";
import * as idom from "incremental-dom";

export type View<State> = (state: State, action: Action, mount: Mount) => HsmlFragment;

export type Action = (action: string, data?: any) => void;

export type Actions<State> = (widget: AWidget<State>,
                              action: string,
                              data?: any,
                              event?: Event) => void;

export type Class<T = object> = new (...args: any[]) => T;

export type Mount = <State>(xwClass: Class<AWidget<State>>, state?: State) => HsmlFnc | HsmlFragment;

const mount: Mount = <State>(wClass: Class<AWidget<State>>, state?: State): HsmlFnc | HsmlFragment => {
    return (e: Element) => {
        if ((e as any).widget) {
            const w = (e as any).widget as AWidget<State>;
            if (w.type === wClass.name) {
                if (state !== undefined) {
                    w.state = state;
                }
                w.update();
            } else {
                w.umount();
                const w1 = new wClass();
                if (state !== undefined) {
                    w1.state = state;
                }
                w1.mount(e);
            }
        } else {
            const w = new wClass();
            if (state !== undefined) {
                w.state = state;
            }
            w.mount(e);
        }
        return true;
    };
};

export abstract class AWidget<State> implements HsmlHandlerCtx {

    private static _count = 0;

    static readonly mounted: { [wid: string]: AWidget<any> } = {};

    static appActions: Actions<any> = (widget: AWidget<any>,
                                       action: string,
                                       data?: any,
                                       event?: Event): void => {
        console.log("action:", widget, action, data, event);
    }

    readonly type: string = this.constructor.name; // "XWidget"
    readonly id: string = this.type + "-" + AWidget._count++;
    readonly dom?: Element;
    readonly refs: { [key: string]: HTMLElement } = {};

    private _updateSched?: number;

    abstract state: State;
    abstract view(state: State, action: Action, mount: Mount): HsmlFragment;
    abstract actions(widget: AWidget<State>, action: string, data?: any, event?: Event): void;

    action = (action: string, data?: any, event?: Event): void => {
        this.actions(this, action, data, event);
    }

    appAction = (action: string, data?: any, event?: Event): void => {
        AWidget.appActions(this, action, data, event);
    }

    appActions(actions: Actions<State>): this {
        AWidget.appActions = actions;
        return this;
    }

    get widgets(): AWidget<any>[] {
        return Object.values(AWidget.mounted);
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
        if ("widget" in el) {
            const w = (el as any).widget as AWidget<State>;
            w && w.umount();
        }
        if (!this.dom) {
            AWidget.mounted[this.id] = this;
            (this as any).dom = el;
            (el as any).widget = this;
            const hsmls = (this as any).render();
            hsmls2idomPatch(el, hsmls, this);
            el.setAttribute("widget", this.type);
            this.action("_mount", this.dom);
        }
        return this;
    }

    umount = (): this => {
        if (this.dom) {
            delete AWidget.mounted[this.id];
            this.action("_umount", this.dom);
            if (this.dom.hasAttribute("widget")) {
                this.dom.removeAttribute("widget");
            }
            const wNodes = this.dom.querySelectorAll("[widget]");
            for (let i = 0; i < wNodes.length; i++) {
                const w = (wNodes[i] as any).widget as AWidget<State>;
                w && w.umount();
            }
            while (this.dom.firstChild /*.hasChildNodes()*/) {
                this.dom.removeChild(this.dom.firstChild);
            }
            delete (this.dom as any).widget;
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
                            widget: this.type
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
                    (e as any).widget = this;
                    AWidget.mounted[this.id] = this;
                    this.action("_mount", this.dom);
                }
            });
        return (
            ["div",
                {
                    _id: this.id,
                    _key: this.id,
                    widget: this.type
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
        if (node.nodeType === 1 && "widget" in node) {
            const w = (node as any).widget as AWidget<any>;
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
