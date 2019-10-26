
export type HsmlHead = string; // "tag#id.class1.class2~handler"

export type HsmlAttrClasses = Array<string | [string, boolean]>;

export type HsmlAttrStyles = { [key: string]: string };

export type HsmlAttrData = { [key: string]: string | number | Array<any> | Object };

export type HsmlAttrOnDataFnc = (e: Event) => any;

export type HsmlAttrOnData = string | number | Array<any> | Object | HsmlAttrOnDataFnc;

export type HsmlAttrOn =
    | [keyof HTMLElementEventMap, EventListener]
    | [keyof HTMLElementEventMap, string, HsmlAttrOnData?]
    | Array<
        | [keyof HTMLElementEventMap, EventListener]
        | [keyof HTMLElementEventMap, string, HsmlAttrOnData?]
    >;

export interface HsmlAttrs {
    readonly _id?: string;
    readonly _classes?: string[];
    readonly _ref?: string;
    readonly _key?: string;
    readonly _skip?: boolean;
    readonly _hsmlObj?: HsmlObj;
    readonly classes?: HsmlAttrClasses;
    readonly styles?: HsmlAttrStyles;
    readonly data?: HsmlAttrData;
    readonly on?: HsmlAttrOn;
    readonly [key: string]:
        | string
        | String
        | string[]
        | number
        | boolean
        | HsmlAttrClasses
        | HsmlAttrStyles
        // | HsmlAttrData
        | HsmlAttrOn
        | EventListener
        | HsmlObj
        | undefined;
}

export type HsmlFnc = (e: Element) => boolean | void;

export interface HsmlObj {
    toHsml?(): HsmlElement;
}

export interface HsmlFragment extends Array<HsmlElement> { }

export type HsmlChildren = HsmlFragment | HsmlFnc | HsmlObj;
// export type HsmlChildren = Hsmls | HsmlFnc | HsmlObj | string | boolean | number | Date;

export type HsmlTagNoAttr = [HsmlHead, HsmlChildren?];
export type HsmlTagAttr = [HsmlHead, HsmlAttrs, HsmlChildren?];

export type HsmlTag = HsmlTagNoAttr | HsmlTagAttr;
// export type HsmlTag = [HsmlTagHead, (HsmlTagAttrs | HsmlTagChildren)?, HsmlTagChildren?];

export type HsmlElement = string | boolean | number | Date | HsmlFnc | HsmlObj | HsmlTag;

export interface HsmlHandlerCtx extends HsmlObj {
    refs: { [name: string]: Element };
    onHsml(action: string, data: HsmlAttrOnData, e: Event): void;
}

export interface HsmlHandler<C extends HsmlHandlerCtx> {
    open(tag: HsmlHead, attrs: HsmlAttrs, children: HsmlFragment, ctx?: C): boolean;
    close(tag: HsmlHead, children: HsmlFragment, ctx?: C): void;
    text(text: string, ctx?: C): void;
    fnc(fnc: HsmlFnc, ctx?: C): void;
    obj(obj: HsmlObj, ctx?: C): void;
}

export function hsml<C extends HsmlHandlerCtx>(hml: HsmlElement, handler: HsmlHandler<C>, ctx?: C): void {
    // console.log("hsml", hsml);
    if (hml === undefined) {
        return;
    }
    switch (hml.constructor) {
        case Array:
            // const tag = hml as HsmlTag;
            // if (
            //     (
            //         tag.length === 1 &&
            //         tag[0].constructor === String
            //     ) ||
            //     (
            //         tag.length === 2 &&
            //         (
            //             tag[0].constructor === String &&
            //             (tag[1]!.constructor === Array || tag[1]!.constructor === Function)
            //         ) ||
            //         (
            //             tag[0].constructor === String &&
            //             tag[1]!.constructor === Object
            //         )
            //     ) ||
            //     (
            //         tag.length === 3 &&
            //         tag[0].constructor === String &&
            //         tag[1].constructor === Object &&
            //         tag[2]!.constructor === Array
            //     )
            // ) {
            //     hsmlTag(hml as HsmlTag, handler, ctx);
            // } else {
            //     console.error("hsml parse error:", hml);
            //     // console.error("hsml parse error:", JSON.stringify(hml, null, 4));
            //     // throw Error(`hsml parse error: ${JSON.stringify(hml)}`);
            // }
            hsmlTag(hml as HsmlTag, handler, ctx);
            break;
        case Function:
            handler.fnc(hml as HsmlFnc, ctx);
            break;
        case String:
            handler.text(hml as string, ctx);
            break;
        case Boolean:
            handler.text("" + hml, ctx);
            break;
        case Number:
            const n = hml as number;
            const ns = n.toLocaleString ? n.toLocaleString() : n.toString();
            handler.text(ns, ctx);
            break;
        case Date:
            const d = hml as Date;
            const ds = d.toLocaleString ? d.toLocaleString() : d.toString();
            handler.text(ds, ctx);
            break;
        default:
            handler.obj(hml as HsmlObj, ctx);
    }

    function hsmlTag(hmlTag: HsmlTag, handler: HsmlHandler<C>, ctx?: C): void {
        // console.log("hsml tag", hmlTag);

        if (typeof hmlTag[0] !== "string") {
            console.error("hsml tag head not string:", hmlTag);
            return;
        }

        const head = hmlTag[0] as HsmlHead;
        const attrsObj = hmlTag[1] as any;
        const hasAttrs = attrsObj && attrsObj.constructor === Object;
        const childIdx = hasAttrs ? 2 : 1;

        let children: HsmlFragment = [];
        let hsmlFnc: HsmlFnc | undefined;
        let hsmlObj: HsmlObj | undefined;

        const htc = hmlTag[childIdx];
        switch (htc && htc.constructor) {
            case Array:
                children = htc as HsmlFragment;
                break;
            case Function:
                hsmlFnc = htc as HsmlFnc;
                break;
            // case String:
            // case Boolean:
            // case Number:
            // case Date:
            //     children = [htc as Hsml];
            //     break;
            default: // HsmlObj
                hsmlObj = htc as HsmlObj;
                break;
        }

        const refSplit = head.split("~");
        const ref = refSplit[1];
        const dotSplit = refSplit[0].split(".");
        const hashSplit = dotSplit[0].split("#");
        const tag = hashSplit[0] || "div";
        const id = hashSplit[1];
        const classes = dotSplit.slice(1);

        let attrs: HsmlAttrs;
        if (hasAttrs) {
            attrs = attrsObj as HsmlAttrs;
        } else {
            attrs = {} as HsmlAttrs;
        }

        if (id) {
            (attrs as any)._id = id;
        }
        if (classes.length) {
            (attrs as any)._classes = classes;
        }
        if (ref) {
            (attrs as any)._ref = ref;
        }
        if (hsmlObj) {
            (attrs as any)._hsmlObj = hsmlObj;
        }

        const skip = handler.open(tag, attrs, children, ctx);

        if (hsmlFnc) {
            handler.fnc(hsmlFnc, ctx);
        }

        if (!skip) {
            children.forEach(jml => hsml(jml, handler, ctx));
        }

        handler.close(tag, children, ctx);
    }
}

export function join(hsmls: HsmlFragment, sep: string | HsmlElement): HsmlFragment {
    const r = hsmls.reduce<HsmlFragment>((p, c) => (p.push(c, sep), p), [] as HsmlFragment);
    r.splice(-1);
    return r;
}

// Test

// const hsmls: Hsmls = [
//     "text",
//     ["tag", [
//         "d",
//         [""]
//     ]],
//     ["taga", { attr: "attr", classes: ["class"] }, [
//         "text",
//         123,
//         true
//     ]]
// ];

// const hml: Hsml = ["xxx", {}, [
//         "types", " ", 1235.456, " ", new Date(), " ",
//         ...hsmls,
//         ["t", ["t", "a", ""]],
//         ["t", {}, ["t", "a", ""]],
//         ["t"]
//     ]];

// console.log(hsmls, hml);

// const hml1: Hsml = ["div", null, [
//     ["span", null, [
//         ["a",
//             {
//                 href: "https://gitlab.com/peter-rybar/diasheet",
//                 title: "GitLab",
//                 target: "_blank"
//             },
//             [["i.fa.fa-gitlab"]]
//         ]
//     ]],
//     ["span"]
// ]];
// console.log(hml1);

// const hml2: Hsml = ["div", [
//     ["h2", ["title"]],
//     ["div.w3-card-12", [
//         ["header.w3-container w3-light-grey", [
//             ["h3", ["Account: ", "User"]]
//         ]],
//         ["div.w3-container.w3-light-grey", [
//             ["p", ["Balance: 4 DCT"]],
//             ["br"]
//         ]],
//         ["h4", ["Your account spending"]],
//         ["div#piechart"],
//         ["h4", ["Your account balance"]],
//         ["div#linechart"],
//         ["button.w3-button.w3-block.w3-dark-grey", ["Refresh"]]
//     ]],
//     ["br"]
// ]];
// console.log(hml2);

// TEST

// import { hsmls2htmls } from "./hsml-html";
// import { Action } from "./hsml-xwidget";

// const action: Action = (name: string, data: any) => {
//     console.log("action:", name, data);
// };

// const data = { attr: "action-data" };

// const hmls: Hsmls = [
//     ["button",
//         { on: ["click", "action", data] },
//         ["send"]
//     ],
//     ["input",
//         {
//             on: [
//                 ["mouseover", "hover-action", data],
//                 ["change", "click-action", e => (e.target as HTMLInputElement).value],
//                 ["click", () => action("action-name", data)],
//             ],
//             click: e => action("action-name", data)
//         }
//     ],
//     ["button",
//         {
//             on: ["click", () => action("action-name", data)],
//             click: e => action("action-name", data)
//         },
//         ["send"]
//     ]
// ];

// console.log(hsmls2htmls(hmls).join("\n"));
