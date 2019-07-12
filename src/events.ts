export type Callback<C> = (data: any, e: string, ctx?: C) => void;

export class Events<C = any> {

    private _ctx?: C;
    private _cbs: { [e: string]: Array<Callback<C>> };
    private _cb: Array<Callback<C>>;

    constructor(ctx?: C) {
        this._cb = [];
        this._cbs = {};
        ctx && (this._ctx = ctx);
    }

    emit(e: string, data?: any): this {
        if (e in this._cbs) {
            for (let i = 0, l = this._cbs[e].length; i < l; i++) {
                this._cbs[e][i](data, e, this._ctx);
            }
        }
        if (this._cb) {
            for (let i = 0, l = this._cb.length; i < l; i++) {
                this._cb[i](data, e, this._ctx);
            }
        }
        return this;
    }

    on(ev: string | string[], cb: Callback<C>): this {
        if (ev.constructor === String) {
            const e = ev as string;
            if (!(e in this._cbs)) {
                this._cbs[e] = [];
            }
            if (this._cbs[e].indexOf(cb) === -1) {
                this._cbs[e].push(cb);
            }
        } else {
            (ev as string[]).forEach(e => this.on(e, cb));
        }
        return this;
    }

    any(cb: Callback<C>): this {
        if (!this._cb) {
            this._cb = [];
        }
        this._cb.push(cb);
        return this;
    }

    once(ev: string | string[], cb: Callback<C>): this {
        if (ev.constructor === String) {
            const e = ev as string;
            const wrap = (d: any, evt: string, c?: C) => {
                this.off(e, wrap);
                cb(d, evt, c);
            };
            this.on(ev, wrap);
        } else {
            (ev as string[]).forEach(e => this.once(e, cb));
        }
        return this;
    }

    off(e?: string, cb?: Callback<C>): this {
        if (e === undefined) {
            if (cb) {
                this._cb = this._cb.filter(c => c !== cb);
            } else {
                this._cb.length = 0;
                delete this._cb;
            }
        }
        if (e && e in this._cbs) {
            if (cb) {
                this._cbs[e].splice(this._cbs[e].indexOf(cb), 1);
            } else {
                this._cbs[e].length = 0;
                delete this._cbs[e];
            }
        }
        return this;
    }

    many(...cbs: { [e: string]: Callback<C> }[]): this {
        cbs.forEach(cb =>
            Object.keys(cb).forEach(e =>
                this.on(e, cb[e])));
        return this;
    }

}


// Test

// const e = new Events<string>("ctx");

// e.any((data, e, ctx) => console.log("any:", data, e, ctx));

// e.emit("e", "data-eee1");
// e.on("e", (data, ctx, e) => console.log(data, ctx, e));
// e.emit("e", "data-eee2");
// e.off("e");
// e.emit("e", "data-eee3");

// e.off();

// e.emit("e", "data-not-emitted");


// e.emit("o", "data-ooo1");
// e.once("o", (data, ctx, e) => console.log(data, ctx, e));
// e.emit("o", "data-ooo2");
// e.emit("o", "data-ooo3");

// e.on(["e1", "data-e3"], (data, ctx, e) => console.log(data, ctx, e));
// e.emit("e1", "data-all-e1");
// e.emit("e2", "data-all-e2");
// e.emit("e3", "data-all-e3");

// e.many(
//     {
//         ex1 : (data, e, ctx) => console.log("ex1-1:", data, e, ctx),
//         ex2 : (data, e, ctx) => console.log("ex2-1:", data, e, ctx)
//     },
//     {
//         ex1 : (data, e, ctx) => console.log("ex1-1:", data, e, ctx),
//         ex2 : (data, e, ctx) => console.log("ex2-2:", data, e, ctx)
//     }
// );
// e.emit("ex1", "data-ex1");
// e.emit("ex2", "data-ex2");
