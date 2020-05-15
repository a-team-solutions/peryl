import { Events } from "./events";

export class Settings<T extends { [key: string]: any }> {

    readonly name: string;
    readonly props: T;

    readonly events = new Events<T & { "": Partial<T> }, Settings<T>>();

    constructor(props: T, name: string = "settings") {
        this.props = props;
        this.name = name;
    }

    getProps(): T {
        return this.props;
    }

    setProps(props: Partial<T>): this {
        Object.keys(props).forEach(p => ((this.props as any)[p] = props[p]));
        this.events.emit("", props);
        return this;
    }

    getProp<K extends keyof T>(key: K): T[K] {
        return (this.props)[key];
    }

    setProp<K extends keyof T>(key: K, value: T[K]): this {
        (this.props)[key] = value;
        const props: Partial<T> = {};
        props[key] = value;
        this.events.emit(key as string, value);
        return this;
    }

}

// Test

// const x = { n: 2, s: "s" };
// const s = new Settings<typeof x>(x);

// s.setProps({ n: 3 });

// console.log(typeof s.getProp("n")); // number
// console.log(typeof s.getProp("s")); // string

// s.setProps(JSON.parse(window.localStorage[s.name]));
// s.events.any(data => (window.localStorage[s.name] = JSON.stringify(s.props)));
