
interface State {
    id: string;
    processor: string;
    processors: string[];
}

interface TicketState extends State {
    user: string;
    gass: number;
    ticket: string;
}

const states: TicketState[] = [];

abstract class Procesor<S extends State> {

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

class OrderTicket extends Procesor<TicketState> {

    private counter: number = 0;
    private count: number;

    constructor(states: TicketState[], interval: number, count: number) {
        super("OrderTicket", states, interval);
        this.count = count;
    }

    select(states: TicketState[]): TicketState[] {
        if (this.counter < this.count) {
            console.log(JSON.stringify(this.name));
            this.counter++;
            states.push({
                id: "" + this.counter,
                processor: "",
                processors: [this.name],
                user: `user-${this.counter}`,
                gass: 0,
                ticket: ""
            });
        }
        return [];
    }

    process(state: TicketState): void {
    }

}

class LoadGass extends Procesor<TicketState> {

    constructor(states: TicketState[], interval: number) {
        super("LoadGass", states, interval);
    }

    select(states: TicketState[]): TicketState[] {
        console.log(JSON.stringify(this.name));
        return states.filter(s => !s.gass);
    }

    process(state: TicketState): void {
        const gass = this.tryLoadGas(state.user);
        if (gass) {
            state.gass = gass;
        }
    }

    tryLoadGas(userId: string): number {
        const gass = random(3);
        return gass;
    }

}

class BuyTicket extends Procesor<TicketState> {

    constructor(states: TicketState[], interval: number) {
        super("BuyTicket", states, interval);
    }

    select(states: TicketState[]): TicketState[] {
        return states.filter(s => s.gass);
    }

    process(state: TicketState): void {
        const ticket = this.buyTicket(state.user);
        if (ticket) {
            state.ticket = ticket;
        }
    }

    buyTicket(user: string): string {
        if (random(3)) {
            return `${user}-ticket`;
        } else {
            return "";
        }
    }

}

class ConfirmTicket extends Procesor<TicketState> {

    constructor(states: TicketState[], interval: number) {
        super("ConfirmTicket", states, interval);
    }

    select(states: TicketState[]): TicketState[] {
        console.log(JSON.stringify(this.name));
        return states.filter(s => s.ticket);
    }

    process(state: TicketState): void {
        if (this.confirmTicket(state.user, state.ticket)) {
            this.states.splice(this.states.indexOf(state), 1);
        }
    }

    confirmTicket(user: string, ticket: string): boolean {
        if (!!random(5)) {
            console.log("mail confirmation:", user, ticket);
            return true;
        } else {
            return false;
        }
    }

}


class ViewTicketStates extends Procesor<TicketState> {

    constructor(states: TicketState[], interval: number) {
        super("", states, interval);
    }

    select(states: TicketState[]): TicketState[] {
        console.log(JSON.stringify(this.name));
        log(states.map(s => JSON.stringify(s)).join("\n"));
        return states;
    }

    process(state: TicketState): void {
    }

}

function random(max: number) {
    return Math.floor(Math.random() * Math.floor(max));
}


const out = document.getElementById("out");

function log(...msgs: any[]) {
    console.log(...msgs);
    out!.textContent = msgs.join(" ");
}

document.getElementById("start")!.addEventListener("click", () => run());

function run() {
    new OrderTicket(states, 300, 10e3).run();
    new LoadGass(states, 3e3).run();
    new BuyTicket(states, 5e3).run();
    new ConfirmTicket(states, 7e3).run();
    new ViewTicketStates(states, 1e3).run();
}
