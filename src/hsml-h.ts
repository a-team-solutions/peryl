import { HElement } from "./hsml";

export function h(tag: string): HElement;
export function h(tag: string, text: string): HElement;
export function h(tag: string, attrs: {}): HElement;
export function h(tag: string, attrs: {}, text: string): HElement;
export function h(tag: string, attrs: {}, childs: HElement[]): HElement;
export function h(tag: string, childs: HElement[]): HElement;
export function h(tag: string, second?: string | {} | HElement[], third?: string | {} | HElement[]): HElement {
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
