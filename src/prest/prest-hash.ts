module prest.hash {

    export class Hash<T> {

        private _listenIntervalId:any;

        private _encoder = (data:T) => { return JSON.stringify(data); };
        private _decoder = (string:string) => { return JSON.parse(string); };

        /**
         * Listen on URL hash fragment changes
         */
        onChange(callback:(hashData:T) => void) {
            if ('onhashchange' in window) {
                window.onhashchange = () => {
                    callback(this.read());
                };
            } else {
                //prest.log.warning('browser "window.onhashchange" not implemented, running emulation');
                var prevHash = window.location.hash;
                if (this._listenIntervalId) {
                    window.clearInterval(this._listenIntervalId);
                }
                this._listenIntervalId = window.setInterval(() => {
                    if (window.location.hash != prevHash) {
                        prevHash = window.location.hash;
                        callback(this.read());
                    }
                }, 500);
            }
        }

        setEncoder(encoder:(data:T) => string) {
            this._encoder = encoder;
        }

        setDecoder(decoder:(string:string) => T) {
            this._decoder = decoder;
        }

        /**
         * Returns decoded window.location.hash data
         */
        read():T {
            var str = window.location.hash.slice(1);
            return this._decoder(str);
        }

        /**
         * Encode data and sets window.location.hash fragment
         */
        write(hashData:T) {
            var str = this._encoder(hashData);
            window.location.hash = '#' + str;
        }

    }

}