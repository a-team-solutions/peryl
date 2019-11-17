
// DATASET https://data.gov.sk/dataset


// http://www.posta.sk/sluzby/postove-smerovacie-cisla - xls

// zdroj: https://data.gov.sk/dataset/register-adries-register-obci/resource/15262453-4a0f-4cce-a9e4-7709e135e4b8

import { get } from "../../../src/http";
import { html, select } from "../../../src/dom";

// "https://data.gov.sk/api/action/datastore_search?resource_id=15262453-4a0f-4cce-a9e4-7709e135e4b8&q=rajec"
// "https://data.gov.sk/api/action/datastore_search?resource_id=15262453-4a0f-4cce-a9e4-7709e135e4b8&limit=5"
// "https://data.gov.sk/api/action/datastore_search_sql?sql=SELECT%20*%20from%20%2215262453-4a0f-4cce-a9e4-7709e135e4b8%22%20WHERE%20title%20LIKE%20%27jones%27"

// ulice "https://data.gov.sk/api/action/datastore_search?resource_id=47f0e853-3a67-487e-b45f-3f5d099105cf&limit=5"


// new HttpRequest()
//     .get("https://data.gov.sk/api/action/datastore_search", {
//         resource_id: "15262453-4a0f-4cce-a9e4-7709e135e4b8",
//         q: "bratislava",
//         limit: 20
//     })
//     .onResponse(r => {
//         console.log(r.getJson().result.records.length);
//         r.getJson().result.records.forEach((i: any) => {
//             console.log(i.municipalityName);
//             console.log(i);
//         });
//         // console.log(r.getJson().result.records.municipalityName);
//     })
//     .onError(e => console.error(e))
//     .send();

const ol = html(`<ol></ol>`);
select("#obce")!.appendChild(ol);

get("https://data.gov.sk/api/action/datastore_search",
    {
        resource_id: "15262453-4a0f-4cce-a9e4-7709e135e4b8", // obce
        limit: 5000
    })
    .onProgress(p => console.log("progress", p))
    .onResponse(r => {
        console.log(r.getJson().result.records.length);
        r.getJson().result.records.forEach((i: any) => {
            // console.log(i.municipalityName, i.status, i.municipalityCode);
            // console.log(i);
            ol.appendChild(html(`
                <li>
                    ${i.objectId}
                    ${i.municipalityName}
                    ${i.status}
                    ${i.municipalityCode}
                </li>`));
        });
    })
    .onError(e => console.error(e))
    .send();

// get("https://data.gov.sk/api/action/datastore_search",
//     {
//         resource_id: "cc20ba54-79e5-4232-a129-6af5e75e3d85", // casti obci
//         // q: "29.augusta",
//         // q: "*:3004", // stare mesto
//         limit: 10000
//     })
//     .onProgress(p => console.log("progress", p))
//     .onResponse(r => {
//         console.log(r.getJson().result.records.length);
//         r.getJson().result.records.forEach((i: any) => {
//             console.log(i.districtCode, i.districtName);
//             // console.log(i);
//         });
//     })
//     .onError(e => console.error(e))
//     .send();

// get("https://data.gov.sk/api/action/datastore_search",
//     {
//         resource_id: "0e9caa22-f5c0-4513-b6ce-88198b664b14", // ulice
//         // q: "29.augusta",
//         // q: "*:3004", // stare mesto
//         limit: 100
//     })
//     .onProgress(p => console.log("progress", p))
//     .onResponse(r => {
//         console.log(r.getJson().result.records.length);
//         r.getJson().result.records.forEach((i: any) => {
//             console.log(i.municipalityIdentifiers, i.streetName);
//             // console.log(i);
//         });
//     })
//     .onError(e => console.error(e))
//     .send();
