
export class GA {

    static ga: GA;

    private _trackingId: string;

    constructor(trackingId: string, dimensions?: Object) {
        this._trackingId = trackingId;
        this._load();
    }

    pageview(path: string): void {
        if (this._trackingId) {
            (self as any).gtag("config", this._trackingId, { page_path: path });
        }
    }

    event(eventName: string, eventParameters: { [k: string]: string }): void {
        if (this._trackingId) {
            (self as any).gtag("event", eventName, eventParameters);
        }
    }

    private _load(): void {
        if (this._trackingId) {
            const script = <HTMLScriptElement> document.createElement("script");
            script.async = true;
            script.src = `https://www.googletagmanager.com/gtag/js?id=${this._trackingId}`;
            document.getElementsByTagName("head")[0].appendChild(script);

            const script1 = <HTMLScriptElement> document.createElement("script");
            script1.textContent = `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', '${this._trackingId}');
            `;
            document.getElementsByTagName("head")[0].appendChild(script1);
        }
    }

}

// const ga = new GA("track-id");
// GA.ga = ga;
// ga.pageview("my-page");
