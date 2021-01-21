import * as hash from "../src/hash";
import { select } from "../src/dom";

const out = select("#output");
out && (out.innerHTML = "test");

const emitWritten = false;

const h = new hash.Hash<any>(emitWritten)
    .coders(
        data => data ? JSON.stringify(data) : "",
        str => str ? JSON.parse(str) : undefined
    )
    .onChange(data => {
        console.log("hash:", data);
        out && (out.innerHTML += "<br/>" + "hash: " + JSON.stringify(data));
    })
    .listen()
    .write({ message: "hello" });

(self as any).h = h;

const el = select("#hash");
el && (el.onclick = (e: MouseEvent) => h.write({ time: new Date().getTime() }));
