
type Fnc<R> = (this: any, ...args: any[]) => R;

export function cache<R, F extends Fnc<R>>(func: F, delay = 300) {
    type Args = F extends (...args: infer P) => R ? P : never;
    let expire = Date.now() + delay;
    let data: R;
    return async function (this: any, ...args: Args): Promise<R> {
        if (!data || Date.now() > expire) {
            expire = Date.now() + delay;
            data = await func.apply(this, args);
        }
        return data;
    };
}

// Decorator
export function Cache(delay = 300) {
    return function (target: any, propertyKey: string, descriptor: PropertyDescriptor) {
        const originalMethod = descriptor.value;
        descriptor.value = cache(originalMethod, delay);
        return descriptor;
    };
}


// TEST

// const d = cache(
//     function async (this: any, x: string, y: number): string {
//         console.log("cache", x, y);
//         return `cache ${x}, ${y} - ${Date.now()}`;
//     },
//     300);

// d("peter", 3).then(console.log);
// setTimeout(() => d("peter", 3).then(console.log), 200);
// setTimeout(() => d("peter", 3).then(console.log), 500);
// setTimeout(() => d("peter", 3).then(console.log), 700);

// const o = {
//     x: "o.x",
//     m: async function (y: number) {
//         console.log("o.m", this.x, y);
//         return `o.m ${this.x}, ${y} - ${Date.now()}`;
//     },
//     d: ({} as any)
// };
// o.d = cache(o.m, 300);
// o.d("test", 3).then(console.log);
// setTimeout(() => o.d("test", 3).then(console.log), 200);
// setTimeout(() => o.d("test", 3).then(console.log), 500);
// setTimeout(() => o.d("test", 3).then(console.log), 700);

// class O {
//     x: string = "O.x";

//     @Cache(300)
//     async m(y: string) {
//         console.log("O.m", this.x, y);
//         return `O.m ${this.x}, ${y} - ${Date.now()}`;
//     }
// }
// const obj = new O();
// // obj.m = cache(obj.m, 300); // decorator equivalent
// obj.m("m(p)");

// obj.m("m(p)").then(console.log);
// setTimeout(() => obj.m("m(p)").then(console.log), 200);
// setTimeout(() => obj.m("m(p)").then(console.log), 500);
// setTimeout(() => obj.m("m(p)").then(console.log), 700);
