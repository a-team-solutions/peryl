import { HsmlElement } from "./hsml";

declare function htagt(tags: string): HsmlElement;
declare function htagt(hsmls: HsmlElement[]): HsmlElement;
declare function htagt(tags: string, hsmls: HsmlElement[]): HsmlElement;
declare function htagt(attr: {}): HsmlElement;
declare function htagt(attr: {}, hsmls: HsmlElement[]): HsmlElement;
declare function htagt(tags: string, attr: {}): HsmlElement;
declare function htagt(tags: string, attr: {}, hsmls: HsmlElement[]): HsmlElement;

function h(tag: string, second?: HsmlElement[], third?: HsmlElement | HsmlElement[], fourth?: HsmlElement[]): HsmlElement {
    const result = [tag] as any[];
    if (second) {
        if (typeof second === "string") {
            // additional tags
            result[0] += second;
        } else if (Array.isArray(second) && (second.length === 1) && (typeof second[0] === "string")) {
            result.push([second[0]]);
        } else {
            // attr or hsmls
            result.push(second);
        }
    }
    if (third) {
        if (Array.isArray(third) && (third.length === 1) && (typeof third[0] === "string")) {
            // hsmls with text only
            result.push([third[0]]);
        } else {
            // attr of hsmls
            result.push(third);
        }
    }
    if (fourth) {
        if (Array.isArray(fourth) && (fourth.length === 1) && (typeof fourth[0] === "string")) {
            result.push([fourth[0]]);
        } else {
            result.push(fourth);
        }
    }
    return result as HsmlElement;
}

function htag(tag: string) {
    return h.bind(null, tag) as typeof htagt;
}

export const a = htag("a");
export const abbr = htag("abbr");
export const address = htag("address");
export const area = htag("area");
export const article = htag("article");
export const aside = htag("aside");
export const audio = htag("audio");
export const b = htag("b");
export const base = htag("base");
export const bdi = htag("bdi");
export const bdo = htag("bdo");
export const blockquote = htag("blockquote");
export const body = htag("body");
export const br = htag("br");
export const button = htag("button");
export const canvas = htag("canvas");
export const caption = htag("caption");
export const cite = htag("cite");
export const code = htag("code");
export const col = htag("col");
export const colgroup = htag("colgroup");
export const dd = htag("dd");
export const del = htag("del");
export const details = htag("details");
export const dfn = htag("dfn");
export const dir = htag("dir");
export const div = htag("div");
export const dl = htag("dl");
export const dt = htag("dt");
export const em = htag("em");
export const embed = htag("embed");
export const fieldset = htag("fieldset");
export const figcaption = htag("figcaption");
export const figure = htag("figure");
export const footer = htag("footer");
export const form = htag("form");
export const h1 = htag("h1");
export const h2 = htag("h2");
export const h3 = htag("h3");
export const h4 = htag("h4");
export const h5 = htag("h5");
export const h6 = htag("h6");
export const head = htag("head");
export const header = htag("header");
export const hgroup = htag("hgroup");
export const hr = htag("hr");
export const html = htag("html");
export const i = htag("i");
export const iframe = htag("iframe");
export const img = htag("img");
export const input = htag("input");
export const ins = htag("ins");
export const kbd = htag("kbd");
export const keygen = htag("keygen");
export const label = htag("label");
export const legend = htag("legend");
export const li = htag("li");
export const link = htag("link");
export const main = htag("main");
export const map = htag("map");
export const mark = htag("mark");
export const menu = htag("menu");
export const meta = htag("meta");
export const nav = htag("nav");
export const noscript = htag("noscript");
export const object = htag("object");
export const ol = htag("ol");
export const optgroup = htag("optgroup");
export const option = htag("option");
export const p = htag("p");
export const param = htag("param");
export const pre = htag("pre");
export const progress = htag("progress");
export const q = htag("q");
export const rp = htag("rp");
export const rt = htag("rt");
export const ruby = htag("ruby");
export const s = htag("s");
export const samp = htag("samp");
export const script = htag("script");
export const section = htag("section");
export const select = htag("select");
export const small = htag("small");
export const source = htag("source");
export const span = htag("span");
export const strong = htag("strong");
export const style = htag("style");
export const sub = htag("sub");
export const summary = htag("summary");
export const sup = htag("sup");
export const table = htag("table");
export const tbody = htag("tbody");
export const td = htag("td");
export const textarea = htag("textarea");
export const tfoot = htag("tfoot");
export const th = htag("th");
export const thead = htag("thead");
export const time = htag("time");
export const title = htag("title");
export const tr = htag("tr");
export const u = htag("u");
export const ul = htag("ul");
export const video = htag("video");
