
export type HHead = keyof HTMLElementTagNameMap | string; // "tag#id.class1.class2~handler"

export type HAttrClasses = Array<string | [string, boolean]>;

export type HAttrStyles = { [key: string]: string };

export type HAttrData = { [key: string]: string | number | Array<any> | Object };

export type HAttrOnAction = string | number;

export type HAttrOnDataFnc = (e: Event) => any;

export type HAttrOnData = string | number | Array<any> | Object | HAttrOnDataFnc | null;

export type HAttrOnCb = [keyof HTMLElementEventMap, EventListener];

export type HAttrOnAct = [keyof HTMLElementEventMap, HAttrOnAction, HAttrOnData?];

export type HAttrOn = HAttrOnCb | HAttrOnAct | Array<HAttrOnCb | HAttrOnAct>;

export interface HAttrs {
    readonly _id?: string;
    readonly _classes?: string[];
    readonly _ref?: string;
    readonly _key?: string;
    readonly _skip?: boolean;
    readonly _hObj?: HObj;
    readonly classes?: HAttrClasses;
    readonly styles?: HAttrStyles;
    readonly data?: HAttrData;
    readonly on?: HAttrOn;
    readonly [key: string]:
        | string
        | String
        | string[]
        | String[]
        | number
        | Number
        | boolean
        | Boolean
        | HAttrClasses
        | HAttrStyles
        // | HsmlAttrData
        | HAttrOn
        | EventListener
        | HObj
        | undefined;
}

export type HFnc = (e: Element) => boolean | void;

export interface HObj {
    toHsml?(): HElement;
}

export interface HElements extends Array<HElement> { }

export type HChildren = HElements | HFnc | HObj | string | boolean | number | Date | undefined | null;
// export type HChildren = Hs | HFnc | HObj | string | boolean | number | Date;

export type HTagNoAttr = [HHead, HChildren?];
export type HTagAttr = [HHead, HAttrs, HChildren?];

export type HTag = HTagNoAttr | HTagAttr;
// export type HTag = [HTagHead, (HTagAttrs | HTagChildren)?, HTagChildren?];

export type HElement = HFnc | HObj | HTag | string | boolean | number | Date | undefined | null;

export interface HHandlerCtx extends HObj {
    refs: { [name: string]: Element };
    onHsml(action: HAttrOnAction, data: HAttrOnData, e: Event): void;
}

export interface HHandler<C extends HHandlerCtx> {
    open(tag: HHead, attrs: HAttrs, children: HElements, ctx?: C): boolean;
    close(tag: HHead, children: HElements, ctx?: C): void;
    text(text: string, ctx?: C): void;
    fnc(fnc: HFnc, ctx?: C): void;
    obj(obj: HObj, ctx?: C): void;
}

export function hsml<C extends HHandlerCtx>(hml: HElement, handler: HHandler<C>, ctx?: C): void {
    // console.log("hsml", hsml);
    if (hml === undefined || hml === null) {
        return;
    }
    switch (hml.constructor) {
        case Array:
            // const tag = hml as HTag;
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
            //     hsmlTag(hml as HTag, handler, ctx);
            // } else {
            //     console.error("hsml parse error:", hml);
            //     // console.error("hsml parse error:", JSON.stringify(hml, null, 4));
            //     // throw Error(`hsml parse error: ${JSON.stringify(hml)}`);
            // }
            hsmlTag(hml as HTag, handler, ctx);
            break;
        case Function:
            handler.fnc(hml as HFnc, ctx);
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
        default: // HObj
            handler.obj(hml as HObj, ctx);
    }

    function hsmlTag(hmlTag: HTag, handler: HHandler<C>, ctx?: C): void {
        // console.log("hsml tag", hmlTag);

        if (typeof hmlTag[0] !== "string") {
            console.error("hsml tag head not string:", hmlTag);
            return;
        }

        const head = hmlTag[0] as HHead;
        const attrsObj = hmlTag[1] as any;
        const hasAttrs = attrsObj && attrsObj.constructor === Object;
        const childIdx = hasAttrs ? 2 : 1;

        let children: HElements = [];
        let hFnc: HFnc | undefined;
        let hObj: HObj | undefined;

        const htc = hmlTag[childIdx];
        switch (htc && htc.constructor) {
            case Array:
                children = htc as HElements;
                break;
            case Function:
                hFnc = htc as HFnc;
                break;
            case String:
            case Boolean:
            case Number:
            case Date:
                children = [htc as string | boolean | number | Date];
                break;
            default: // HObj
                hObj = htc as HObj;
                break;
        }

        const refSplit = head.split("~");
        const ref = refSplit[1];
        const dotSplit = refSplit[0].split(".");
        const hashSplit = dotSplit[0].split("#");
        const tag = hashSplit[0] || "div";
        const id = hashSplit[1];
        const classes = dotSplit.slice(1);

        let attrs: HAttrs;
        if (hasAttrs) {
            attrs = attrsObj as HAttrs;
        } else {
            attrs = {} as HAttrs;
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
        if (hObj) {
            (attrs as any)._hObj = hObj;
        }

        const skip = handler.open(tag, attrs, children, ctx);

        if (hFnc) {
            handler.fnc(hFnc, ctx);
        }

        if (!skip) {
            children.forEach(jml => hsml(jml, handler, ctx));
        }

        handler.close(tag, children, ctx);
    }
}

export function hjoin(hsmls: HElements, sep: string | HElement): HElements {
    const r = hsmls.reduce<HElements>((p, c) => (p.push(c, sep), p), [] as HElements);
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
// import { HDispatch } from "./hsml-app";

// const dispatch: HDispatch = (type: string, data?: any, event?: Event): void => {
//     console.log("action:", type, data, event);
// };

// const data = { attr: "action-data" };

// const hmls: HElements = [
//     ["button", { on: ["click", "action", data] }, "send"],
//     ["h1", "aaa"],
//     ["input",
//         {
//             type: "text",
//             on: [
//                 ["mouseover", "hover-action", data],
//                 ["change", "click-action", e => (e.target as HTMLInputElement).value],
//                 ["click", e => dispatch("action", data, e)],
//             ],
//             click: e => dispatch("action", data, e)
//         }
//     ],
//     ["button",
//         {
//             on: ["click", e => dispatch("action", data, e)],
//             click: e => dispatch("action", data, e)
//         },
//         ["Send"]
//     ]
// ];

// console.log(hsmls2htmls(hmls, true).join(""));
