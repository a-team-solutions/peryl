import { template, tmpl } from "../lib/template";
import { select } from "../lib/dom";

const results = select("#results");
if (results) {
    const data: any = {};
    data.from_user = "from_user";
    data.profile_image_url = "http://www.gettyimages.ca/gi-resources/images/Homepage/Hero/UK/CMS_Creative_164657191_Kingfisher.jpg";
    data.id = "id";
    data.text = "text";

    results.innerHTML = template("item-tmpl", data);

    results.innerHTML += "<hr />";

    const xusers = [
        {"url": "url", "name": "name"},
        {"url": "url1", "name": "name1"},
        {"url": "url2", "name": "name2"}
    ];

    const usersTemplate = template("user-tmpl");
    let html = "";
    for (let i = 0; i < xusers.length; i++) {
        html += usersTemplate({"users": [xusers[i]]});
    }
    results.innerHTML += html;

    results.innerHTML += "<hr />";

    results.innerHTML += template("user-tmpl", {"users": xusers});
}

// simple template

const container = select("#container");
if (container) {
    container.innerHTML += tmpl("test1 ${1 + 2} test2 ${3 + 4}", {});
    container.innerHTML += "<br/>";
    container.innerHTML += tmpl("Hello ${name}!", {name: "Andrea"});
    container.innerHTML += "<br/>";

    const helloTmpl = tmpl("hello-tmpl");
    container.innerHTML += helloTmpl({name: "Andrea"});
    container.innerHTML += "<br/>";
    container.innerHTML += helloTmpl({name: "Peter"});
}
