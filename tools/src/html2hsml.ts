import * as sax from "sax";

export function html2hsml(html: string): any {
    const strict = false; // set to false for html-mode
    const parser = sax.parser(strict, {});

    const root = [[]] as any;
    const nodePath = [] as any; // path that consist of previous hsml nodes
    let pointer = root;

    parser.onerror = error => {
        console.error("error:\t", error);
    };

    parser.ontext = text => {
        // console.log("text:\t", JSON.stringify(text));
        // console.log(hsml, hsmlNode, hsmlPath);
        const textTrimmed = text.trim().replace(/\s+/mg, " ");
        // console.log("text:\t", JSON.stringify(textTrimmed));
        if (textTrimmed) {
            pointer[pointer.length - 1].push(textTrimmed);
        }
    };

    parser.onopentag = node => {
        // console.log("open:\t", JSON.stringify(node));
        const attrKeys = Object.keys(node.attributes);
        let id;
        let classes = [] as string[];
        const attrs = {} as {[key: string]: any};
        const attrData = {} as {[key: string]: any};
        if (attrKeys.length) {
            attrKeys.forEach(key => {
                const value = node.attributes[key] as string;
                if (key === "ID") {
                    id = value;
                } else if (key === "CLASS") {
                    const clss = value.split(" ");
                    classes = classes.concat(clss);
                } else if (/DATA-.+/.test(key)) {
                    const g = /DATA-(.+)/.exec(key);
                    attrData[g[1].toLowerCase()] = value;
                } else {
                    attrs[key.toLowerCase()] = value;
                }
            });
        }
        let name = node.name.toLowerCase();
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

        pointer[pointer.length - 1].push(hsmlNode);
        nodePath.push(hsmlNode);
        pointer = hsmlNode;
        // console.log(">>>", hsmlPath.map(x => x[0]));
    };

    parser.onclosetag = tag => {
        // console.log("close:\t", JSON.stringify(tag));
        const currentNode = nodePath.pop();

        let children = currentNode[currentNode.length - 1];
        if (children.length === 0) {
            currentNode.pop(); // remove children
        // } else if (children.length === 1) {
        //     if (typeof children[0] === "string") {
        //         currentNode[currentNode.length - 1] = children[0];
        //     }
        }
        pointer = nodePath[nodePath.length - 1];
        // console.log(">>>", hsmlPath.map(x => x[0]));
    };
    // parser.onattribute = attr => {
    //     // console.log("attr:\t", attr);
    // };
    // parser.onend = () => {
    //     console.log("end:\t");
    // };

    parser.write(html.trim()).close();

    return root[0][0];
}

export function hsml2string(hsml: any): string {
    // return JSON.stringify(hsml, null, 4).replace(/\[\s+"/mg, `["`);
    return hsml2strArray(hsml).join("\n");
}

function hsml2strArray(hsml: any, out: string[] = [], depth = 0): string[] {
    switch (hsml.constructor) {
        case Array:
            out.push(mkIndent(depth) + "[" + JSON.stringify(hsml[0]) +
                (hsml.length > 1 ? "," : ""));
            for (let i = 1; i < hsml.length; i++) {
                hsml2strArray(hsml[i], out, depth + 1);
            }
            out.push(mkIndent(depth) + "]");
            break;
        // case Function:
        //     break;
        case String:
            out.push(mkIndent(depth) + JSON.stringify(hsml) +
                (hsml.length > 1 ? "," : ""));
            break;
        default: // Object
            out.push(mkIndent(depth) + JSON.stringify(hsml) +
                (hsml.length > 2 ? "," : ""));
    }
    return out;
}

function mkIndent(count: number) {
    let indent = "";
    for (let i = 0; i < count; i++) {
        indent += "    ";
    }
    return indent;
}

// Test -----------------------------------------------------------------------

// const html = `
//     <body>
//         Hello
//         <p>
//             text <b>text</b>
//         </p>
//         <hr id="id1" class="c1 c2" data-x="dx" data-y="dy" />,
//         <em name="world">world</em>!
//     </body>`;
// console.log(html, "\n");

// const hsml = html2hsml(html);

// console.log(hsml);
// // console.log(JSON.stringify(hsml));
// console.log(JSON.stringify(hsml, null, 4));

// const hsml = html2hsml(html);

// const hsmlStr = hsml2string(hsml);
// console.log(hsmlStr);
