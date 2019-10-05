import { Events } from "../src/events";

const e = new Events<string>("ctx");

e.any((data, e, ctx) => console.log("any:", data, e, ctx));

e.emit("e", "data-eee1");
e.on("e", (data, ctx, e) => console.log(data, ctx, e));
e.emit("e", "data-eee2");
e.off("e");
e.emit("e", "data-eee3");

e.off();

e.emit("e", "data-not-emitted");


e.emit("o", "data-ooo1");
e.once("o", (data, ctx, e) => console.log(data, ctx, e));
e.emit("o", "data-ooo2");
e.emit("o", "data-ooo3");

e.on(["e1", "data-e3"], (data, ctx, e) => console.log(data, ctx, e));
e.emit("e1", "data-all-e1");
e.emit("e2", "data-all-e2");
e.emit("e3", "data-all-e3");

e.many(
    {
        ex1 : (data, e, ctx) => console.log("ex1-1:", data, e, ctx),
        ex2 : (data, e, ctx) => console.log("ex2-1:", data, e, ctx)
    },
    {
        ex1 : (data, e, ctx) => console.log("ex1-1:", data, e, ctx),
        ex2 : (data, e, ctx) => console.log("ex2-2:", data, e, ctx)
    }
);
e.emit("ex1", "data-ex1");
e.emit("ex2", "data-ex2");
