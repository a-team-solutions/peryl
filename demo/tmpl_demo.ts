import { tmpla, tmplo, tmpl } from "../src/tmpl";

const dataArray = ["A", "B"];
console.log("tmpla: ${0} ${1} ${0}", "|", tmpla("tmpla: ${0} ${1} ${0}", dataArray));

const dataObject = { a: "A", b: "B" };

console.log("tmplo: ${a} ${b} ${a}", "|", tmplo("tmplo: ${a} ${b} ${a}", dataObject));

const t = tmpl<typeof dataObject>("tmpl : ${a} ${b} ${a}");
console.log("tmpl : ${a} ${b} ${a}", "|", t(dataObject));
console.log("tmpl : ", t);

const tl = tmpl("1+2=${1 + 2} 3+x=${3 + x[1]}");
console.log("tmpl : 1+2=${1 + 2} 3+x=${3 + x[1]}", "|", tl({ x: [2] }));
console.log("tmpl : ", tl);
