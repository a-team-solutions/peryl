/**
 * ```
 * const dataStrObject = { a: "A", b: "B" };
 * console.log("tmpls: {{a}} {{b}} {{a}}", "|", tmpls("tmpls: {{a}} {{b}} {{a}}", dataStrObject));
 *
 * const dataStrArray = ["A", "B"];
 * console.log("tmpls: {{0}} {{1}} {{0}}", "|", tmpls("tmpla: {{0}} {{1}} {{0}}", dataStrArray));
 * ```
 *
 * @param tmpl Template string
 * @param data Template data
 */
export function tmpls(tmpl: string, data: { [k: string]: any }): string {
    return Object.keys(data)
        .map(k => [k, data[k]])
        .reduce((t, d) =>
            t.replace(new RegExp(`\\{\\{${d[0]}\\}\\}`, "g"), String(d[1])), tmpl);
}

/**
 * ```
 * const dataArray = ["A", "B"];
 * console.log("tmpla: ${0} ${1} ${0}", "|", tmpla("tmpla: ${0} ${1} ${0}", dataArray));
 * ```
 *
 * @param tmpl Template string
 * @param data Template data
 */
export function tmpla(tmpl: string, data: string[]): string {
    return data.reduce((t, d, i) => t.replace(new RegExp(`\\$\\{${i}\\}`, "g"), d), tmpl);
}

/**
 * ```
 * const dataObject = { a: "A", b: "B" };
 * console.log("tmplo: ${a} ${b} ${a}", "|", tmplo("tmplo: ${a} ${b} ${a}", dataObject));
 * ```
 *
 * @param tmpl Template string
 * @param data Template data
 */
export function tmplo(tmpl: string, data: { [k: string]: string }): string {
    return Object.keys(data)
        .map(k => [k, data[k]])
        .reduce((t, d) => t.replace(new RegExp(`\\$\\{${d[0]}\\}`, "g"), d[1]), tmpl);
}

/**
 * const t = tmpl<typeof dataObject>("tmpl : ${a} ${b} ${a}");
 * console.log("tmpl : ${a} ${b} ${a}", "|", t(dataObject));
 * console.log("tmpl : ", t);
 *
 * const tl = tmpl("1+2=${1 + 2} 3+x=${3 + x[1]}");
 * console.log("tmpl : 1+2=${1 + 2} 3+x=${3 + x[1]}", "|", tl({ x: [2] }));
 * console.log("tmpl : ", tl);
 *
 * @param template Template string
 */
export function tmpl<T = any>(template: string): (data: { [key in keyof T]: any }) => string {
    const stringify = JSON.stringify;
    const re = /\$\{([\S\s]*?)\}/g;
    const strings: string[] = [];
    let m: RegExpExecArray | null;
    let i = 0;
    let str: string;
    while ((m = re.exec(template))) {
        str = template.slice(i, m.index);
        strings.push(stringify(str), "(" + m[1] + ")");
        i = re.lastIndex;
    }
    str = template.slice(i);
    strings.push(stringify(str));
    const fn = new Function("obj", "with(obj)return " + strings.join("+"));
    return fn as (data: Object) => string;
}

// TEST

// const dataStrObject = { a: "A", b: "B" };
// console.log("tmpls: {{a}} {{b}} {{a}}", "|", tmpls("tmpls: {{a}} {{b}} {{a}}", dataStrObject));

// const dataStrArray = ["A", "B"];
// console.log("tmpls: {{0}} {{1}} {{0}}", "|", tmpls("tmpla: {{0}} {{1}} {{0}}", dataStrArray));

// const dataArray = ["A", "B"];
// console.log("tmpla: ${0} ${1} ${0}", "|", tmpla("tmpla: ${0} ${1} ${0}", dataArray));

// const dataObject = { a: "A", b: "B" };
// console.log("tmplo: ${a} ${b} ${a}", "|", tmplo("tmplo: ${a} ${b} ${a}", dataObject));

// const t = tmpl<typeof dataObject>("tmpl : ${a} ${b} ${a}");
// console.log("tmpl : ${a} ${b} ${a}", "|", t(dataObject));
// console.log("tmpl : ", t);

// const tl = tmpl("1+2=${1 + 2} 3+x=${3 + x[1]}");
// console.log("tmpl : 1+2=${1 + 2} 3+x=${3 + x[1]}", "|", tl({ x: [2] }));
// console.log("tmpl : ", tl);
