import {
    hsml,
    Hsml,
    Hsmls,
    HsmlHead,
    HsmlAttrs,
    HsmlAttrClasses,
    HsmlAttrData,
    HsmlAttrOn,
    HsmlAttrOnData,
    HsmlFnc,
    HsmlObj,
    HsmlHandler,
    HsmlHandlerCtx
} from "./hsml";
import * as idom from "incremental-dom";

class HsmlIDomHandler implements HsmlHandler<HsmlHandlerCtx> {

    open(tag: HsmlHead, attrs: HsmlAttrs, children: Hsmls, ctx?: HsmlHandlerCtx): boolean {
        const props: any[] = [];
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
                                    props.push("data-" + d, attrData[d]);
                                } else {
                                    props.push("data-" + d, JSON.stringify(attrData[d]));
                                }
                            }
                        }
                        break;
                    case "styles":
                        props.push("style", attrs[a]);
                        break;
                    case "on":
                        const attrOn = attrs[a] as HsmlAttrOn;
                        if (typeof attrOn[1] === "function") {
                            props.push("on" + attrOn[0], attrOn[1]);
                        } else if (typeof attrOn[1] === "string") {
                            props.push("on" + attrOn[0], (e: Event) => {
                                ctx && ctx.onHsml &&
                                typeof ctx.onHsml === "function" &&
                                ctx.onHsml(attrOn[1] as string,
                                           attrOn[2] as HsmlAttrOnData,
                                           e);
                            });
                        }
                        break;
                    default:
                        if (typeof attrs[a] === "function") {
                            props.push("on" + a, attrs[a]);
                        } else if (typeof attrs[a] === "boolean") {
                            attrs[a] && props.push(a, "");
                        } else {
                            props.push(a, attrs[a]);
                        }
                }
            }
        }
        if (classes.length) {
            props.unshift("class", classes.join(" "));
        }
        if (id) {
            props.unshift("id", id);
        }
        idom.elementOpen(tag, attrs._key, undefined, ...props);
        if (attrs._skip) {
            idom.skip();
        }
        if (ctx && ref) {
            ctx.refs[ref] = idom.currentElement();
        }
        if (hsmlObj && hsmlObj.mount && hsmlObj.mount.constructor === Function) {
            hsmlObj.mount(idom.currentElement());
            idom.skip();
        }
        return attrs._skip ? true : false;
    }

    close(tag: HsmlHead, children: Hsmls, ctx?: HsmlHandlerCtx): void {
        idom.elementClose(tag);
    }

    text(text: string, ctx?: HsmlHandlerCtx): void {
        idom.text(text);
    }

    fnc(fnc: HsmlFnc, ctx?: HsmlHandlerCtx): void {
        const skip = fnc(idom.currentElement());
        skip && idom.skip();
    }

    obj(obj: HsmlObj, ctx?: HsmlHandlerCtx): void {
        if ("toHsml" in obj) {
            obj.toHsml && hsml(obj.toHsml(), this, obj as HsmlHandlerCtx);
        } else {
            this.text("" + obj, ctx);
        }
    }

}

function hsml2idom(hml: Hsml, ctx?: HsmlHandlerCtx): void {
    hsml(hml, new HsmlIDomHandler(), ctx);
}


function hsmls2idom(hmls: Hsmls, ctx?: HsmlHandlerCtx): void {
    for (const hml of hmls) {
        if (hml.constructor === String) {
            idom.text(hml as string);
        } else if ("toHsml" in (hml as any)) {
            const obj = hml as HsmlHandlerCtx;
            obj.toHsml && hsml2idom(obj.toHsml(), obj);
        } else {
            hsml2idom(hml as Hsml, ctx);
        }
    }
}


export function hsml2idomPatch(node: Element, hml: Hsml, ctx?: HsmlHandlerCtx): void {
    idom.patch(node,
        (data: Hsml) => hsml2idom(data, ctx), hml);
}

export function hsmls2idomPatch(node: Element, hmls: Hsmls, ctx?: HsmlHandlerCtx): void {
    idom.patch(node,
        (data: Hsmls) => hsmls2idom(data, ctx), hmls);
}
