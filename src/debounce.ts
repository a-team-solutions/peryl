
type Fnc = (...args: any[]) => void;

export function debounce<F extends Fnc>(func: F, delay = 300) {
    type Args = F extends (...args: infer P) => void ? P : never;
    let timeout: number;
    return function (this: any, ...args: Args) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Decorator
export function Debounce(delay = 300) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const method = descriptor.value;
        descriptor.value = debounce(method, delay);
        return descriptor;
    };
}


// TEST

// const d = debounce(
//     function (this: any, x: string, y: number) {
//         console.log("debounce", x, y);
//     },
//     300);
// d("peter", 3);

// const o = {
//     x: "o.x",
//     m: function (y: number) {
//         console.log("o.m", this.x, y);
//     },
//     d: ({} as any)
// };
// o.d = debounce(o.m, 300);
// o.d("test");

// class O {
//     x: string = "O.x";

//     @Debounce(300)
//     m(y: string) {
//         console.log("O.m", this.x, y);
//     }
// }
// const obj = new O();
// // obj.m = debounce(obj.m, 300); // decorator equivalent
// obj.m("m(p)");

// setTimeout(() => obj.m("m(p) 200"), 200);
// setTimeout(() => obj.m("m(p) 1200"), 1200);
// setTimeout(() => obj.m("m(p) 1400"), 1400);
// setTimeout(() => obj.m("m(p) 2200"), 2200);
// setTimeout(() => obj.m("m(p) 2400"), 2400);
