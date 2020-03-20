import { html2hsmlStr, html2hsml } from "../src/hsml-convert";

const html = `<div>
    Hello
    <p>
        text
        <b>
            text
        </b>
    </p>
    <hr id="id1" class="c1 c2" data-x="dx" data-y="dy" />,
    <em name="world">
        world
    </em>
    !
</div>`;

const formEl = document.getElementById("form")! as HTMLFormElement;
const htmlEl = document.getElementById("html")! as HTMLTextAreaElement;
const hsmlEl = document.getElementById("hsml")! as HTMLTextAreaElement;

htmlEl.value = html;
hsmlEl.value = html2hsmlStr(html);

htmlEl.addEventListener("keyup", () => {
    const htmlIn = htmlEl.value;
    hsmlEl.value = html2hsmlStr(htmlIn);
});

formEl.addEventListener("submit", e => {
    e.preventDefault();
    const htmlIn = htmlEl.value;
    hsmlEl.value = html2hsmlStr(htmlIn);
});

htmlEl.focus();

const hsml = html2hsml(html);
console.log(JSON.stringify(hsml, undefined, 4));
