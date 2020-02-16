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
    HsmlAttrOnCb,
    HsmlAttrOnAct,
    HsmlAttrOnAction,
    HsmlAttrOnData,
    HsmlFnc,
    HsmlObj,
    HsmlHandler,
    HsmlHandlerCtx
} from "./hsml";
import * as idom from "incremental-dom";

// function setBoolAttrProp(el: any, attr: string, value: any) {
//     // console.log("idom.attributes", attr, value, typeof value, el);
//     if (typeof value === "string") {
//         let b;
//         switch (value) {
//             case "true":
//             case "1":
//             case "on":
//             case "yes":
//                 b = true;
//                 break;
//             default:
//                 b = false;
//         }
//         if (b) {
//             el.setAttribute(attr, value);
//         } else {
//             el.removeAttribute(attr);
//         }
//         el[attr] = b;
//     } else if (typeof value === "boolean") {
//         if (value) {
//             el.setAttribute(attr, "");
//         } else {
//             el.removeAttribute(attr);
//         }
//         el[attr] = value;
//     } else {
//         if (value) {
//             el.setAttribute(attr, value ? value : "");
//         } else {
//             el.removeAttribute(attr);
//         }
//     }
// }

// const boolAttrProps = [
//     "readonly",
//     "disabled",
//     "checked",
//     "value"
// ];

// boolAttrProps.forEach(a => idom.attributes[a] = setBoolAttrProp);

class HsmlIDomHandler implements HsmlHandler<HsmlHandlerCtx> {

    open(tag: HsmlHead, attrs: HsmlAttrs, children: HsmlFragment, ctx?: HsmlHandlerCtx): boolean {
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
                        props.push("style", attrs[a] as HsmlAttrStyles);
                        break;
                    case "on":
                        const attrOn = attrs[a] as HsmlAttrOn;
                        if (typeof attrOn[0] === "string") {
                            if (typeof attrOn[1] === "function") {
                                props.push("on" + attrOn[0], attrOn[1]);
                            } else {
                                props.push("on" + attrOn[0], (e: Event) => {
                                    ctx && ctx.onHsml &&
                                    typeof ctx.onHsml === "function" &&
                                    ctx.onHsml(attrOn[1] as HsmlAttrOnAction,
                                            attrOn[2] as HsmlAttrOnData,
                                            e);
                                });
                            }
                        } else {
                            (attrOn as Array<HsmlAttrOnCb | HsmlAttrOnAct>)
                                .forEach(attr => {
                                    if (typeof attr[1] === "function") {
                                        props.push("on" + attr[0], attr[1]);
                                    } else {
                                        props.push("on" + attr[0], (e: Event) => {
                                            ctx && ctx.onHsml &&
                                            typeof ctx.onHsml === "function" &&
                                            ctx.onHsml(attr[1] as HsmlAttrOnAction,
                                                    attr[2] as HsmlAttrOnData,
                                                    e);
                                        });
                                    }
                                });
                        }
                        break;
                    default:
                        // http://google.github.io/incremental-dom/#attributes-and-properties
                        switch (typeof attrs[a]) {
                            case "function":
                                props.push("on" + a, attrs[a]);
                                break;
                            case "object":
                                // console.log("---", a, typeof attrs[a], attrs[a]);
                                // console.log("---String ", attrs[a] instanceof String);
                                // console.log("---Boolean", attrs[a] instanceof Boolean);
                                // console.log("---Number ", attrs[a] instanceof Number);
                                props.push(a, attrs[a]);
                                break;
                            // case "boolean":
                            //     if (boolAttrProps.includes(a)) {
                            //         props.push(a, attrs[a]);
                            //     } else {
                            //         attrs[a] && props.push(a, "");
                            //     }
                            //     break;
                            case "boolean":
                                attrs[a] && props.push(a, "");
                                break;
                            default:
                                props.push(a, attrs[a]);
                                break;
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

    close(tag: HsmlHead, children: HsmlFragment, ctx?: HsmlHandlerCtx): void {
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

function hsml2idom(hml: HsmlElement, ctx?: HsmlHandlerCtx): void {
    hsml(hml, new HsmlIDomHandler(), ctx);
}


function hsmls2idom(hmls: HsmlFragment, ctx?: HsmlHandlerCtx): void {
    for (const hml of hmls) {
        if (hml.constructor === String) {
            idom.text(hml as string);
        } else if ("toHsml" in (hml as any)) {
            const obj = hml as HsmlHandlerCtx;
            obj.toHsml && hsml2idom(obj.toHsml(), obj);
        } else {
            hsml2idom(hml as HsmlElement, ctx);
        }
    }
}


export function hsml2idomPatch(node: Element, hsmlEl: HsmlElement, ctx?: HsmlHandlerCtx): void {
    idom.patch(node,
        (data?: HsmlElement) => (data && hsml2idom(data, ctx)), hsmlEl);
}

export function hsmls2idomPatch(node: Element, hsmlFr: HsmlFragment, ctx?: HsmlHandlerCtx): void {
    idom.patch(node,
        (data?: HsmlFragment) => (data && hsmls2idom(data, ctx)), hsmlFr);
}
