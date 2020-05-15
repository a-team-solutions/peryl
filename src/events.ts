export type Callback<Ctx, E, Data> = (data: Data, e: E, ctx?: Ctx) => void;

export class Events<Evt extends { [e: string]: any } = any, Ctx = undefined> {

    private _ctx?: Ctx;
    private _cb: Array<Function> = [];
    private _cbs: { [e: string]: Array<Function> } = {};

    constructor(ctx?: Ctx) {
        ctx && (this._ctx = ctx);
    }

    emit<E extends keyof Evt>(e: E, data?: Evt[E]): this {
        if (e in this._cbs) {
            for (let i = 0, l = this._cbs[e as string].length; i < l; i++) {
                this._cbs[e as string][i](data, e, this._ctx);
            }
        }
        for (let i = 0, l = this._cb.length; i < l; i++) {
            this._cb[i](data, e, this._ctx);
        }
        return this;
    }

    on<E extends keyof Evt>(ev: E, cb: Callback<Ctx, E, Evt[E]>): this {
        const e = ev as string;
        if (!(e in this._cbs)) {
            this._cbs[e] = [];
        }
        if (this._cbs[e].indexOf(cb) === -1) {
            this._cbs[e].push(cb);
        }
        return this;
    }

    any<E extends keyof Evt>(cb: Callback<Ctx, E, Evt[E]>): this {
        this._cb.push(cb);
        return this;
    }

    once<E extends keyof Evt>(ev: E, cb: Callback<Ctx, E, Evt[E]>): this {
        const e = ev;
        const wrap = (d: Evt[E], evt: E, c?: Ctx) => {
            this.off(e, wrap);
            cb(d, evt, c);
        };
        this.on(ev, wrap);
        return this;
    }

    off<E extends keyof Evt>(e?: E, cb?: Callback<Ctx, E, Evt[E]>): this {
        if (e === undefined) {
            if (cb) {
                this._cb = this._cb.filter(c => c !== cb);
            } else {
                this._cb.length = 0;
            }
        }
        if (e && e in this._cbs) {
            if (cb) {
                this._cbs[e as string].splice(this._cbs[e as string].indexOf(cb), 1);
            } else {
                this._cbs[e as string].length = 0;
                delete this._cbs[e as string];
            }
        }
        return this;
    }

}


// Test

// type Evts = {
//     s: string;
//     s1: string;
//     s2: string;
//     s3: string;
//     sx1: string;
//     sx2: string;
//     n: number;
//     o: { x: string };
// };

// const e = new Events<Evts, string>("ctx");

// e.any((data, e, ctx) => console.log("any:", data, e, ctx));

// e.emit("s", "data-eee1");
// e.emit("s", "data-eee1");
// e.on("s", (data, e, ctx) => console.log(data, ctx, e));
// e.emit("s", "data-eee2");
// e.off("s");
// e.emit("s", "data-eee3");

// e.off();

// e.emit("s", "data-not-emitted");


// e.emit("o", { x: "obj-1" });
// e.once("o", (data, ctx, e) => console.log(data, ctx, e));
// e.emit("o", { x: "obj-2" });
// e.emit("o", { x: "obj-3" });

// e.emit("s1", "data-all-s1");
// e.emit("s2", "data-all-s2");
// e.emit("s3", "data-all-s3");

// e.emit("sx1", "data-ex1");
// e.emit("sx2", "data-ex2");
