import {
    hsml,
    HsmlElement,
    HsmlFragment,
    HsmlHead,
    HsmlAttrs,
    HsmlAttrClasses,
    HsmlAttrData,
    HsmlAttrStyles,
    HsmlAttrOn,
    HsmlAttrOnAction,
    HsmlAttrOnData,
    HsmlFnc,
    HsmlObj,
    HsmlHandler,
    HsmlHandlerCtx
} from "./hsml";

class HsmlDomHandler implements HsmlHandler<HsmlHandlerCtx> {

    element?: HTMLElement;

    private _current?: HTMLElement;

    open(tag: HsmlHead, attrs: HsmlAttrs, children: HsmlFragment, ctx?: HsmlHandlerCtx): boolean {
        const e = document.createElement(tag);
        let id = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        let ref = attrs._ref;
        let hsmlObj: any = attrs._hsmlObj;
        for (const a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                switch (a) {
                    case "_id":
                    case "_classes":
                    case "_ref":
                    case "_key":
                    case "_skip":
                    case "_hsmlObj":
                        break;
                    case "id":
                        id = attrs[a] as string;
                        break;
                    case "classes":
                        const attrClasses = attrs[a] as HsmlAttrClasses;
                        classes = classes.concat(attrClasses
                            ? attrClasses
                                .map(c =>
                                    c.constructor === String
                                        ? c as string
                                        : (c[1] ? c[0] as string : undefined))
                                .filter((c): c is string => c !== undefined)
                            : [] as string[]);
                        break;
                    case "class":
                        classes = classes.concat((attrs[a] as string).split(" "));
                        break;
                    case "data":
                        const attrData = attrs[a] as HsmlAttrData;
                        for (const d in attrData) {
                            if (attrData.hasOwnProperty(d)) {
                                if (attrData[d].constructor === String) {
                                    e.dataset[d] = attrData[d] as string;
                                } else {
                                    e.dataset[d] = JSON.stringify(attrData[d]);
                                }
                            }
                        }
                        break;
                    case "styles":
                        const attrStyles = attrs[a] as HsmlAttrStyles;
                        for (const d in attrStyles) {
                            if (attrStyles.hasOwnProperty(d)) {
                                (e.style as any)[d] = attrStyles[d];
                            }
                        }
                        break;
                    case "on":
                        const attrOn = attrs[a] as HsmlAttrOn;
                        if (typeof attrOn[1] === "function") {
                            e.addEventListener(attrOn[0] as string, attrOn[1] as (e: Event) => void);
                        } else {
                            e.addEventListener(attrOn[0] as string, (e: Event) => {
                                ctx && ctx.onHsml &&
                                typeof ctx.onHsml === "function" &&
                                ctx.onHsml(attrOn[1] as HsmlAttrOnAction,
                                           attrOn[2] as HsmlAttrOnData,
                                           e);
                            });
                        }
                        break;
                    default:
                        if (typeof attrs[a] === "function") {
                            e.addEventListener(a, attrs[a] as (e: Event) => void);
                        } else if (typeof attrs[a] === "boolean") {
                            attrs[a] && e.setAttribute(a, "");
                        } else {
                            e.setAttribute(a, attrs[a] as string);
                        }
                }
            }
        }
        if (id) {
            e.setAttribute("id", id);
        }
        if (classes.length) {
            e.classList.add(...classes);
        }
        if (this._current) {
            this._current.appendChild(e);
            this._current = e;
        } else {
            this.element = e;
            this._current = e;
        }
        if (ctx && ref) {
            ctx.refs[ref] = this._current;
        }
        if (hsmlObj && hsmlObj.mount && hsmlObj.mount.constructor === Function) {
            hsmlObj.mount(e);
        }
        return attrs._skip ? true : false;
    }

    close(tag: HsmlHead, children: HsmlFragment, ctx?: HsmlHandlerCtx): void {
        if (this._current !== this.element) {
            this._current && (this._current = this._current.parentElement || undefined);
        }
    }

    text(text: string, ctx?: HsmlHandlerCtx): void {
        this._current && this._current.appendChild(document.createTextNode(text));
    }

    fnc(fnc: HsmlFnc, ctx?: HsmlHandlerCtx): void {
        this._current && fnc(this._current);
    }

    obj(obj: HsmlObj, ctx?: HsmlHandlerCtx): void {
        if ("toHsml" in obj) {
            obj.toHsml && hsml(obj.toHsml(), this, obj as HsmlHandlerCtx);
        } else {
            this.text("" + obj, ctx);
        }
    }

}

export function hsml2dom(hml: HsmlElement, ctx?: HsmlHandlerCtx): HTMLElement | undefined {
    const handler = new HsmlDomHandler();
    hsml(hml, handler, ctx);
    return handler.element;
}

export function hsmls2dom(hmls: HsmlFragment, ctx?: HsmlHandlerCtx): Node[] {
    const elems: Node[] = [];
    for (const hml of hmls) {
        if (hml.constructor === String) {
            elems.push(document.createTextNode(hml as string));
        } else if ("toHsml" in (hml as object)) {
            const obj = hml as HsmlHandlerCtx;
            if (obj.toHsml) {
                elems.push(hsml2dom(obj.toHsml(), obj)!);
            }
        } else {
            elems.push(hsml2dom(hml, ctx)!);
        }
    }
    return elems;
}
