import { HsmlElement } from "./hsml";

export function h(tag: string): HsmlElement;
export function h(tag: string, text: string): HsmlElement;
export function h(tag: string, attrs: {}): HsmlElement;
export function h(tag: string, attrs: {}, text: string): HsmlElement;
export function h(tag: string, attrs: {}, childs: HsmlElement[]): HsmlElement;
export function h(tag: string, childs: HsmlElement[]): HsmlElement;
export function h(tag: string, second?: string | {} | HsmlElement[], third?: string | {} | HsmlElement[]): HsmlElement {
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

    return result as HsmlElement;
}
