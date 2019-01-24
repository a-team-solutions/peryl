import * as hash from "../src/hash";
// import * as encode from "../src/encode";
import { select } from "../src/dom";

const out = select("#output");
out.innerHTML = "test";

const h = new hash.Hash<any>()
    // .coders(
    //     data => {
    //         return encode.UrlEncodedData.encode(data);
    //         // return encode.Base64.encode(
    //         //    encode.UrlEncodedData.encode(data));
    //     },
    //     str => {
    //         return encode.UrlEncodedData.decode(str);
    //         // return encode.UrlEncodedData.decode(
    //         //    encode.Base64.decode(str));
    //     }
    // )
    .onChange(data => {
        console.log("hash: " + JSON.stringify(data));
        out.innerHTML += "<br/>" + "hash: " + JSON.stringify(data);
    })
    .listen()
    .write({ message: "hello" });

select("#hash").onclick = (e: MouseEvent) => {
    h.write({ time: new Date().getTime() });
};
