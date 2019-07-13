
interface BaseState {
    id: string;
    processor: string;
    processors: string[];
}

interface State extends BaseState {
    data: string;
}

const states = [] as State[];

abstract class Procesor<S extends BaseState> {

    readonly name: string;
    readonly states: S[] = [];
    readonly interval: number;

    constructor(name: string, states: S[], interval = 1e3) {
        this.name = name;
        this.states = states;
        this.interval = interval;
    }

    abstract select(states: S[]): S[];

    abstract process(state: S): void;

    private _process(state: S) {
        this.name && (state.processor = this.name);
        this.name && state.processors.push(this.name);
        this.process(state);
        // state.processor = "";
    }

    run() {
        setInterval(
            () => {
                this
                    .select(this.states)
                    .forEach(s => this._process(s));
            },
            this.interval);
    }

}

class Producer extends Procesor<State> {

    private counter: number = 0;
    private count: number;

    constructor(states: State[], interval: number, count: number) {
        super("p", states, interval);
        this.count = count;
    }

    select(states: State[]): State[] {
        if (this.counter < this.count) {
            console.log(JSON.stringify(this.name));
            this.counter++;
            states.push({
                id: "" + this.counter,
                processor: "",
                processors: [this.name],
                data: ""
            });
        }
        return [];
    }

    process(state: State): void {
    }

}

class DataX extends Procesor<State> {

    constructor(states: State[], interval: number) {
        super("x", states, interval);
    }

    select(states: State[]): State[] {
        console.log(JSON.stringify(this.name));
        return states.filter(s => !s.data);
    }

    process(state: State): void {
        state.data = "x";
    }

}

class DataY extends Procesor<State> {

    constructor(states: State[], interval: number) {
        super("y", states, interval);
    }

    select(states: State[]): State[] {
        console.log(JSON.stringify(this.name));
        return states.filter(s => s.data === "x");
    }

    process(state: State): void {
        state.data = "y";
    }

}

class Deleter extends Procesor<State> {

    constructor(states: State[], interval: number) {
        super("d", states, interval);
    }

    select(states: State[]): State[] {
        console.log(JSON.stringify(this.name));
        return states.filter(s => s.data === "y");
    }

    process(state: State): void {
        this.states.splice(this.states.indexOf(state), 1);
    }

}


class Viewer extends Procesor<State> {

    constructor(states: State[], interval: number) {
        super("", states, interval);
    }

    select(states: State[]): State[] {
        console.log(JSON.stringify(this.name));
        log(states.map(s => JSON.stringify(s)).join("\n"));
        return states;
    }

    process(state: State): void {
    }

}


const out = document.getElementById("out");

function log(...msgs: any[]) {
    console.log(...msgs);
    out!.textContent = msgs.join(" ");
}

document.getElementById("start")!.addEventListener("click", e => start());

function start() {
    new Producer(states, 300, 10e3).run();
    new DataX(states, 3e3).run();
    new DataY(states, 5e3).run();
    new Deleter(states, 7e3).run();
    new Viewer(states, 1e3).run();
}
