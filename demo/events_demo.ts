import { Events } from "../src/events";

type Evts = {
    s: string;
    s1: string;
    s2: string;
    s3: string;
    sx1: string;
    sx2: string;
    n: number;
    o: { x: string };
};

const e = new Events<Evts, string>("ctx");

e.any((data, e, ctx) => console.log("any:", data, e, ctx));

e.emit("s", "data-eee1");
e.emit("s", "data-eee1");
e.on("s", (data, e, ctx) => console.log(data, ctx, e));
e.emit("s", "data-eee2");
e.off("s");
e.emit("s", "data-eee3");

e.off();

e.emit("s", "data-not-emitted");


e.emit("o", { x: "obj-1" });
e.once("o", (data, ctx, e) => console.log(data, ctx, e));
e.emit("o", { x: "obj-2" });
e.emit("o", { x: "obj-3" });

e.emit("s1", "data-all-s1");
e.emit("s2", "data-all-s2");
e.emit("s3", "data-all-s3");

e.emit("sx1", "data-ex1");
e.emit("sx2", "data-ex2");
