const dataRegex = /data-(.+)/;

export function dom2hsml(node: Node, indent = 0): string {
    let out = "";
    if (node.nodeType === Node.TEXT_NODE) {
        const t = node?.textContent?.trim();
        out += `${indentStr(indent)}"${t}"`;
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
        out += `${indentStr(indent)}["${name.toLowerCase()}"`;
        if (Object.keys(attrs).length) {
            out += `,\n${indentStr(indent + 1)}${JSON.stringify(attrs)}`;
        }
        if (element.hasChildNodes()) {
            out += `,\n${indentStr(indent + 1)}[`;
        }
    }
    let i = 0;
    if (node.hasChildNodes()) {
        let child = node.firstChild;
        while (child) {
            out += `${i ? "," : ""}\n${dom2hsml(child, indent + 2)}`;
            child = child.nextSibling;
            i++;
        }
    }
    if (node.nodeType === Node.ELEMENT_NODE) {
        const element = node as HTMLElement;
        if (element.hasChildNodes()) {
            out += `\n${indentStr(indent + 1)}]`;
        }
        out += `\n${indentStr(indent)}]`;
    }
    return out;
}

function indentStr(count: number): string {
    let indent = "";
    for (let i = 0; i < count; i++) {
        indent += "    ";
    }
    return indent;
}

export function html2hsml(html: string): string {
    const node = new DOMParser()
        .parseFromString(html, "text/html")
        .getElementsByTagName("body")[0]
        .firstChild;
    return node ? dom2hsml(node) : "";
}
