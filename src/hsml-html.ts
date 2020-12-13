import {
    hsml,
    HElement,
    HElements,
    HHead,
    HAttrs,
    HAttrClasses,
    HAttrData,
    HAttrStyles,
    HFnc,
    HObj,
    HHandler,
    HHandlerCtx
} from "./hsml";

class HsmlHtmlHandler implements HHandler<HHandlerCtx> {

    private static _pairTags = [
        "script", "iframe",
        "html", "head", "body", "title", "div",
        "h1", "h2", "h3", "h4", "h5", "h6",
        "p", "a", "pre", "blockquote", "i", "b", "em", "strong", "tt", "cite",
        "ol", "ul", "li", "dl", "dt", "dd", "table", "tr", "td",
        "textarea", "select", "option"];

    private _onHtml: (html: string) => void;
    private _pretty: boolean;
    private _indent: string;
    private _depth: number = 0;

    constructor(onHtml: (html: string) => void,
                pretty: boolean = false,
                indent: string = "    ") {
        this._onHtml = onHtml;
        this._pretty = pretty;
        this._indent = indent;
    }

    open(tag: HHead, attrs: HAttrs, children: HElements, ctx?: HHandlerCtx): boolean {
        const props: any[] = [];
        let id = attrs._id;
        let classes: string[] = attrs._classes ? attrs._classes : [];
        let hObj: any = attrs._hObj;
        for (const a in attrs) {
            if (attrs.hasOwnProperty(a)) {
                switch (a) {
                    case "_id":
                    case "_classes":
                    case "_ref":
                    case "_key":
                    case "_skip":
                    case "_hObj":
                        break;
                    case "id":
                        id = attrs[a] as string;
                        break;
                    case "classes":
                        const attrClasses = attrs[a] as HAttrClasses;
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
                        const attrData = attrs[a] as HAttrData;
                        for (const d in attrData) {
                            if (attrData.hasOwnProperty(d)) {
                                if (attrData[d].constructor === String) {
                                    props.push(["data-" + d, attrData[d]]);
                                } else {
                                    props.push(["data-" + d, JSON.stringify(attrData[d])]);
                                }
                            }
                        }
                        break;
                    case "styles":
                        const attrStyles = attrs[a] as HAttrStyles;
                        let style = "";
                        for (const d in attrStyles) {
                            if (attrStyles.hasOwnProperty(d)) {
                                const dd = d.replace(/([a-z])([A-Z])/g, "$1-$2").toLowerCase();
                                style += dd + ":" + attrStyles[d] + ";";
                            }
                        }
                        props.push(["style", style]);
                        break;
                    case "styles":
                        break;
                    case "on":
                        break;
                    default:
                        if (typeof attrs[a] === "function") {
                            // ignore
                        } else if (typeof attrs[a] === "boolean") {
                            attrs[a] && props.push([a, ""]);
                        } else {
                            props.push([a, attrs[a]]);
                        }
                }
            }
        }
        if (classes.length) {
            props.unshift(["class", classes.join(" ")]);
        }
        if (id) {
            props.unshift(["id", id]);
        }
        if (hObj && "type" in hObj) {
            props.unshift(["hObj", hObj.type]);
        }
        const args = props.map(p => `${p[0]}="${p[1]}"`).join(" ");
        let html = "";
        if (this._pretty) {
            html += this._mkIndent(this._depth);
            this._depth++;
        }
        const pairTag = (children.length || HsmlHtmlHandler._pairTags.indexOf(tag) !== -1);
        html += "<" + tag + (args ? " " + args : "") + (pairTag ? ">" : "/>");
        if (this._pretty) {
            html += "\n";
        }
        this._onHtml(html);
        if (hObj && "render" in hObj && hObj.render.constructor === Function) {
            const hsmls = hObj.render() as HElements;
            for (const hml of hsmls) {
                if (hml === undefined || hml === null) {
                    continue;
                }
                if (hml.constructor === String) {
                    this._onHtml(hml + (this._pretty ? "\n" : ""));
                } else if ("toHsml" in (hml as any)) {
                    const obj = hml as HObj;
                    obj.toHsml && hsml(obj.toHsml(), this);
                } else {
                    hsml(hml as HElement, this);
                }
            }
        }
        return false;
    }

    close(tag: HHead, children: HElements, ctx?: HHandlerCtx): void {
        let html = "";
        const pairTag = (children.length || HsmlHtmlHandler._pairTags.indexOf(tag) !== -1);
        if (this._pretty) {
            this._depth--;
            if (pairTag) {
                html += this._mkIndent(this._depth);
            }
        }
        if (pairTag) {
            html += "</" + tag + ">";
            if (this._pretty) {
                html += "\n";
            }
            this._onHtml(html);
        }
    }

    text(text: string, ctx?: HHandlerCtx): void {
        let html = "";
        if (this._pretty) {
            html += this._mkIndent(this._depth);
        }
        html += (text as any) instanceof String
            ? text
            : escapeHtml(text);
        if (this._pretty) {
            html += "\n";
        }
        this._onHtml(html);
    }

    fnc(fnc: HFnc, ctx?: HHandlerCtx): void {
    }

    obj(obj: HObj, ctx?: HHandlerCtx): void {
        if ("toHsml" in obj) {
            obj.toHsml && hsml(obj.toHsml(), this, obj as HHandlerCtx);
        } else {
            this.text("" + obj, ctx);
        }
    }

    private _mkIndent(count: number): string {
        let indent = "";
        for (let i = 0; i < count; i++) {
            indent += this._indent;
        }
        return indent;
    }

}

export function hsml2html(hsmlEl: HElement, onHtml: (html: string) => void, pretty = false): void {
    const handler = new HsmlHtmlHandler(onHtml, pretty);
    hsml(hsmlEl, handler);
}

export function hsmls2html(hsmls: HElements, onHtml: (html: string) => void, pretty = false): void {
    for (const hml of hsmls) {
        if (hml === undefined || hml === null) {
            continue;
        }
        if (hml.constructor === String) {
            onHtml(hml + (pretty ? "\n" : ""));
        } else if ("toHsml" in (hml as any)) {
            const obj = hml as HObj;
            obj.toHsml && hsml2html(obj.toHsml(), onHtml, pretty);
        } else {
            hsml2html(hml as HElement, onHtml, pretty);
        }
    }
}

export function hsml2htmls(hsml: HElement, pretty = false): string[] {
    const htmls: string[] = [];
    hsml2html(hsml, html => htmls.push(html), pretty);
    return htmls;
}

export function hsmls2htmls(hsmls: HElements, pretty = false): string[] {
    const htmls: string[] = [];
    hsmls2html(hsmls, html => htmls.push(html), pretty);
    return htmls;
}

const escapeHtmlRegExp = /["'&<>]/;

function escapeHtml(html: string): string {
    const str = "" + html;
    const m = escapeHtmlRegExp.exec(str);
    if (!m) {
        return str;
    }
    let esc;
    let escHtml = "";
    let idx = 0;
    let lastIdx = 0;
    for (idx = m.index; idx < str.length; idx++) {
        switch (str.charCodeAt(idx)) {
            case 34: // "
                esc = "&quot;";
                break;
            case 38: // &
                esc = "&amp;";
                break;
            case 39: // '
                esc = "&#39;";
                break;
            case 60: // <
                esc = "&lt;";
                break;
            case 62: // >
                esc = "&gt;";
                break;
            default:
                continue;
        }
        if (lastIdx !== idx) {
            escHtml += str.substring(lastIdx, idx);
        }
        lastIdx = idx + 1;
        escHtml += esc;
    }
    return lastIdx !== idx
        ? escHtml + str.substring(lastIdx, idx)
        : escHtml;
}

// Test

// const hsmls: HElements = [
//     "text",
//     ["tag", [
//         "d",
//         [""]
//     ]],
//     ["taga", { attr: "attr", classes: ["class"] }, [
//         "text",
//         "escape html entities: \" ' & < >",
//         new String("escape html entities: \" ' & < >"),
//         123,
//         true
//     ]]
// ];

// const hml: HElement = ["xxx", {}, [
//         "types", " ", 1235.456, " ", new Date(), " ",
//         ...hsmls,
//         ["t", ["t", "a", ""]],
//         ["t", {}, ["t", "a", ""]],
//         ["a", { href: "url", onclick: "return confirm('Confirm please')" }, "link"]
//     ]];

// console.log(hsmls, hml);

// const html = hsml2htmls(hml, true);
// console.log(html.join(""));
