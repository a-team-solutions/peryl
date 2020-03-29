import { HElement, HAttrs, HHead, HFnc, HChildren } from "./hsml";

export function h(tag: HHead): HElement;
export function h(tag: HHead, text: string): HElement;
export function h(tag: HHead, children: HChildren): HElement;
export function h(tag: HHead, fnc: HFnc): HElement;
export function h(tag: HHead, attrs: HAttrs): HElement;
export function h(tag: HHead, attrs: HAttrs, text: string): HElement;
export function h(tag: HHead, attrs: HAttrs, children: HElement[]): HElement;
export function h(tag: HHead, attrs: HAttrs, fnc: HFnc): HElement;
export function h(tag: HHead, second?: HAttrs | HChildren, third?: HAttrs | HChildren): HElement {
    const result: [string, ...any[]] = [tag];
    if (second) {
        if (typeof second === "string") {
            result.push([second]);
        } else if (Array.isArray(second) || typeof second === "function") {
            result.push(second);
        } else {
            // element has attributes
            result.push(second);
        }
    }
    if (third) {
        if (typeof third === "string") {
            result.push([third]);
        } else if (Array.isArray(third) || typeof third === "function") {
            result.push(third);
        }
    }
    return result as HElement;
}
