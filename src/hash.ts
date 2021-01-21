
export class Hash<T = string> {

    private _cb?: (data: T) => void;
    private _iId: any;

    private _emitWritten: boolean;
    private _hash?: string;

    private _encode = (data: T) => String(data);
    private _decode = (str: string) => str as any as T;

    constructor(emitWritten = true) {
        this._emitWritten = emitWritten;
    }

    onChange(cb: (data: T) => void): this {
        this._cb = cb;
        return this;
    }

    coders(encode: (data: T) => string,
           decode: (data: string) => T): this {
        this._encode = encode;
        this._decode = decode;
        return this;
    }

    listen(): this {
        this._cb && this._cb(this.read());
        if ("onhashchange" in window) {
            onhashchange = () => {
                const written = this._hash === location.hash;
                this._hash = undefined;
                if (this._emitWritten || !written) {
                    this._cb && this._cb(this.read());
                }
            };
        } else {
            console.warn(`browser "window.onhashchange" not implemented, running emulation`);
            let prevHash = location.hash;
            if (this._iId) {
                clearInterval(this._iId);
            }
            this._iId = setInterval(() => {
                if (location.hash !== prevHash) {
                    prevHash = location.hash;
                    const written = this._hash === location.hash;
                    this._hash = undefined;
                    if (this._emitWritten || !written) {
                        this._cb && this._cb(this.read());
                    }
                }
            }, 500);
        }
        return this;
    }

    read(): T {
        return this._decode(decodeURIComponent(location.hash.slice(1)));
    }

    write(data: T): this {
        location.hash = "#" + encodeURIComponent(this._encode(data));
        this._hash = location.hash;
        return this;
    }

}
