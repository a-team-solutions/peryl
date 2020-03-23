import { HElement, HAttrs, HHead, HChildren } from "./hsml";

export function h(tag: HHead): HElement;
export function h(tag: HHead, text: string): HElement;
export function h(tag: HHead, attrs: HAttrs): HElement;
export function h(tag: HHead, attrs: HAttrs, text: string): HElement;
export function h(tag: HHead, attrs: HAttrs, children: string | HChildren): HElement;
export function h(tag: HHead, children: string | HChildren): HElement;
export function h(tag: HHead, second?: string | HAttrs | HChildren, third?: string | HChildren): HElement {
    const result: [string, ...any[]] = [tag];
    if (second) {
        if (typeof second === "string") {
            result.push([second]);
        } else if (Array.isArray(second)) {
            result.push(second);
        } else {
            // element has attributes
            result.push(second);
        }
    }
    if (third) {
        if (typeof third === "string") {
            result.push([third]);
        } else if (Array.isArray(third)) {
            result.push(third);
        }
    }
    return result as HElement;
}
