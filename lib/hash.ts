
export class Hash<T> {

    private _cb?: (data: T) => void;
    private _iId: any;

    private _encode = (data: T) => encodeURIComponent(JSON.stringify(data));
    private _decode = (data: string) => data ? JSON.parse(decodeURIComponent(data)) : undefined;

    onChange(cb: (data: T) => void): this {
        this._cb = cb;
        if ("onhashchange" in window) {
            onhashchange = () => cb(this.read());
        } else {
            // prest.log.warning('browser "window.onhashchange" not implemented, running emulation');
            let prevHash = location.hash;
            if (this._iId) {
                clearInterval(this._iId);
            }
            this._iId = setInterval(() => {
                if (location.hash !== prevHash) {
                    prevHash = location.hash;
                    cb(this.read());
                }
            }, 500);
        }
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
        return this;
    }

    read(): T {
        return this._decode(location.hash.slice(1));
    }

    write(hashData: T): this {
        location.hash = "#" + this._encode(hashData);
        return this;
    }

}
