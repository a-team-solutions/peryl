
export function debounce<F extends (...args: any[]) => void>(func: F, delay: number = 300) {
    type Params = F extends (...args: infer P) => void ? P : never;
    let timeout: number;
    return function (this: any, ...args: Params) {
        clearTimeout(timeout);
        timeout = setTimeout(() => {
            func.apply(this, args);
        }, delay);
    };
}

// Decorator
export function debounceFnc(delay: number = 300) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = debounce(originalMethod, delay);
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

//     @debounceFnc(300)
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
