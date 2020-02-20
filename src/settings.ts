export class Settings<T extends { [key: string]: any }> {

    readonly name: string;
    readonly props: T;

    private _onChange?: (props: Partial<T>) => void;

    constructor(props: T, name: string = "settings") {
        this.props = props;
        this.name = name;
    }

    getProps(): T {
        return this.props;
    }

    setProps(props: Partial<T>): this {
        Object.keys(props).forEach(p => ((this.props as any)[p] = props[p]));
        this._onChange && this._onChange(props);
        return this;
    }

    getProp<P extends T, K extends keyof P>(key: K): P[K] {
        return (this.props as P)[key];
    }

    setProp<P extends T, K extends keyof P>(key: K, value: P[K]): this {
        (this.props as any)[key] = value;
        const props = {} as Partial<P>;
        props[key] = value;
        this._onChange && this._onChange(props);
        return this;
    }

    onChange(callback: (props: Partial<T>) => void): this {
        this._onChange = callback;
        return this;
    }

}

// Test

// const x = { n: 2, s: "s" };
// const s = new Settings<typeof x>(x);

// console.log(typeof s.getProp("n")); // number
// console.log(typeof s.getProp("s")); // string

// s.setProps(JSON.parse(window.localStorage[s.name]));
// s.onChange(() => (window.localStorage[s.name] = JSON.stringify(s.props)));
