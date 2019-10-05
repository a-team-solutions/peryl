
export function objPaths(obj: object): string[][] {
    const valPaths = objValuePaths(obj);
    return Object.keys(valPaths)
        .map(val => valPaths[val])
        .reduce((a, paths) => a.concat(paths));
}

export function objValuePaths(obj: any, root: string[] = [], result: object = {}): any {
    const ok = Object.keys(obj);
    return ok.reduce<any>((res, key) => {
        const path = root.concat(key);
        typeof obj[key] === "object" && obj[key] !== null
            ? objValuePaths(obj[key], path, res)
            : res[obj[key]] === 0 || res[obj[key]]
                ? res[obj[key]].push(path)
                : (res[obj[key]] = [path]);
        return res;
    }, result);
}


// TEST

// const obj = {
//     obj1: {
//         obj2: {
//             data1: 213,
//             data2: "1231",
//             obj3: {
//                 data: "milf"
//             }
//         }
//     },
//     obj4: {
//         description: "toto",
//         cougars: "Jodi",
//         category: "milf"
//     }
// };

// const vpaths = objValuePaths(obj);
// const paths = objPaths(obj);
// const strPaths = paths.map(p => p.join("."));

// console.log(JSON.stringify(obj, null, 4));
// console.log(JSON.stringify(vpaths, null, 4));
// console.log(JSON.stringify(paths, null, 4));
// console.log(JSON.stringify(strPaths, null, 4));
