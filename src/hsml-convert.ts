import { HElement, HElements } from "./hsml";

const dataRegex = /data-(.+)/;

export function dom2hsmlStr(node: Node, depth = 0): string {
    let out = "";
    if (node.nodeType === Node.TEXT_NODE) {
        const t = node?.textContent?.trim();
        out += `${indent(depth)}${JSON.stringify(t)}`;
        return out;
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const attributes = Array.from(element.attributes)
            .reduce((a, v, i) => (a[v.nodeName] = v.nodeValue, a), {} as any);
        const attrKeys = Object.keys(attributes);
        let id;
        let classes = [] as string[];
        const attrs = {} as {[key: string]: any};
        const attrData = {} as {[key: string]: any};
        if (attrKeys.length) {
            attrKeys.forEach(key => {
                const value = attributes[key] as string;
                if (key.toLowerCase() === "id") {
                    id = value;
                } else if (key.toLowerCase() === "class") {
                    const clss = value.split(" ");
                    classes = classes.concat(clss);
                } else if (dataRegex.test(key.toLowerCase())) {
                    const g = dataRegex.exec(key);
                    attrData[g![1].toLowerCase()] = value;
                } else {
                    attrs[key.toLowerCase()] = value;
                }
            });
        }
        let name = element.tagName.toLowerCase();
        if (id) {
            name += "#" + id;
        }
        if (classes.length) {
            name += "." + classes.join(".");
        }
        if (Object.keys(attrData).length) {
            attrs["data"] = attrData;
        }
        out += `${indent(depth)}["${name.toLowerCase()}"`;
        if (Object.keys(attrs).length) {
            out += `,\n${indent(depth + 1)}${attrsFormat(attrs)}`;
        }
        if (element.hasChildNodes()) {
            out += `,\n${indent(depth + 1)}[`;
        }
    }
    let i = 0;
    if (node.hasChildNodes()) {
        let child = node.firstChild;
        while (child) {
            out += `${i ? "," : ""}\n${dom2hsmlStr(child, depth + 2)}`;
            child = child.nextSibling;
            i++;
        }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.hasChildNodes()) {
            out += `\n${indent(depth + 1)}]`;
        }
        out += `\n${indent(depth)}]`;
    }
    if (!depth) {
        // condense
        out = out.replace(/\[\s+\"\"\s+\]$/mg, "[]");
        out = out.replace(/\[\s+\"\",?$/mg, "[");
        out = out.replace(/,\s+\"\"(,?)$/mg, "$1");
        out = out.replace(/,\s+\[\](\s+],?)$/mg, "$1");
        out = out.replace(/(},\s+)\[\s+(\".+\")\s+\](,?)$/mg, "$1$2$3");
        out = out.replace(/(\[\"[a-zA-Z0-9_\#\.-]+\",)\s+\[\s+(\".+\")\s+\]\s+(\],?)$/mg, "$1 $2$3");
        out = out.replace(/(\[\"[a-zA-Z0-9_\#\.-]+\")\s+(\],?)$/mg, "$1$2");
    }
    return out;
}

function indent(count: number): string {
    let indent = "";
    for (let i = 0; i < count; i++) {
        indent += "    ";
    }
    return indent;
}

function attrsFormat(o: any): string {
    if (typeof o !== "object" || Array.isArray(o)) {
        return JSON.stringify(o);
    }
    let props = Object
        .keys(o)
        .map(k => `${k}: ${attrsFormat(o[k])}`)
        .join(", ");
    return `{ ${props} }`;
}

export function html2hsmlStr(html: string): string {
    const node = new DOMParser()
        .parseFromString(html, "text/html")
        .getElementsByTagName("body")[0]
        .firstChild;
    return node ? dom2hsmlStr(node) : "";
}

interface Handler {
    text(text: string): void;
    open(node: { name: string; attributes: any }): void;
    close(tag: string): void;
}

class HsmlHandler implements Handler {

    private _root = [[]] as HElements[];
    private _nodePath = [] as any; // path that consist of previous hsml nodes
    private _pointer = this._root;
    private _dataRegex = /data-(.+)/;

    root(): HElement {
        return this._root[0][0];
    }

    text(text: string): void {
        // console.log("text:\t", JSON.stringify(text));
        // console.log(hsml, hsmlNode, hsmlPath);
        const textTrimmed = text.trim().replace(/\s+/mg, " ");
        // console.log("text:\t", JSON.stringify(textTrimmed));
        if (textTrimmed) {
            this._pointer[this._pointer.length - 1].push(textTrimmed);
        }
    }

    open(node: { name: string; attributes: any }): void {
        // console.log("open:\t", JSON.stringify(node));
        const attrKeys = Object.keys(node.attributes);
        let id;
        let classes = [] as string[];
        const attrs = {} as {[key: string]: any};
        const attrData = {} as {[key: string]: any};
        if (attrKeys.length) {
            attrKeys.forEach(key => {
                const value = node.attributes[key] as string;
                if (key === "id") {
                    id = value;
                } else if (key === "class") {
                    const clss = value.split(" ");
                    classes = classes.concat(clss);
                } else if (this._dataRegex.test(key)) {
                    const g = this._dataRegex.exec(key);
                    attrData[g![1]] = value;
                } else {
                    attrs[key] = value;
                }
            });
        }
        let name = node.name;
        if (id) {
            name += "#" + id;
        }
        if (classes.length) {
            name += "." + classes.join(".");
        }
        if (Object.keys(attrData).length) {
            attrs["data"] = attrData;
        }
        const hsmlNode = [name] as any[];
        if (Object.keys(attrs).length) {
            hsmlNode.push(attrs);
        }
        const children: any[] = [];
        hsmlNode.push(children);

        this._pointer[this._pointer.length - 1].push(hsmlNode as HElement);
        this._nodePath.push(hsmlNode);
        this._pointer = hsmlNode;
        // console.log(">>>", hsmlPath.map(x => x[0]));
    }

    close(tag: string): void {
        // console.log("close:\t", JSON.stringify(tag));
        const currentNode = this._nodePath.pop();

        let children = currentNode[currentNode.length - 1];
        if (children.length === 0) {
            currentNode.pop(); // remove children
        // } else if (children.length === 1) {
        //     if (typeof children[0] === "string") {
        //         currentNode[currentNode.length - 1] = children[0];
        //     }
        }
        this._pointer = this._nodePath[this._nodePath.length - 1];
        // console.log(">>>", hsmlPath.map(x => x[0]));
    }
}

function domTraverse(node: Node, handler: Handler ): void {
    if (node.nodeType === Node.TEXT_NODE) {
        const t = node?.textContent?.trim();
        t && handler.text(t);
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        const attributes = Array.from(element.attributes)
            .reduce((a, v, i) => (a[v.nodeName] = v.nodeValue, a), {} as any);
        handler.open({ name: element.tagName.toLowerCase(), attributes });
    }
    if (node.hasChildNodes()) {
        let child = node.firstChild;
        while (child) {
            domTraverse(child, handler);
            child = child.nextSibling;
        }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        handler.close(element.tagName);
    }
}

export function dom2hsml(node: Node): HElement {
    const h = new HsmlHandler();
    node && domTraverse(node, h);
    return h.root();
}

export function html2hsml(html: string): HElement {
    const node = new DOMParser()
        .parseFromString(html, "text/html")
        .getElementsByTagName("body")[0]
        .firstChild;
    return node && dom2hsml(node);
}

export function hsml2str(hsml: HElement, condense = true): HElement {
    let str = JSON.stringify(hsml, undefined, 4);
    if (condense) {
        str = str.replace(/(\[)\s+(\"[a-zA-Z0-9_\#\.-]+\")\s+(\],?)$/mg, "$1$2$3");
        str = str.replace(/(\[)\s+(\"[a-zA-Z0-9_\#\.-]+\",\s+(\[|{),?)$/mg, "$1$2");
        str = str.replace(/(\[)\s+(\"[a-zA-Z0-9_\#\.-]+\",)\s+(\[\s*\".+\"\s*\])\s+(\],?)$/mg, "$1$2 $3$4");
        str = str.replace(/(\[\"[a-zA-Z0-9_\#\.-]+\",\s+)({\s+(.*)\s+})(,?)$/mg,
            (a, b, c, d, e) => b + attrsFormat(JSON.parse(c)) + e);
        str = str.replace(/(},\s+)\[\s+(\".+\")\s+\](,?)$/mg, "$1$2$3");
    }
    return str;
}
