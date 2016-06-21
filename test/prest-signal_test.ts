///<reference path="../src/prest/prest-signal.ts" />

import Signal = prest.signal.Signal;


var s:Signal<string> = new Signal<string>();

var id:number = s.connect((data) => {
    console.log("data: " + data);
});
// ES5
//s.slot = (data) => {
//    console.log("slot data: " + data);
//};

s.emit("emittt");

s.disconnect(id);

s.emit("emittt");

console.log("-------------------------------------");


class A {
    private a = "A.a";

    signalNum = new Signal<number>();
    signalStr = new Signal<string>();

    slot(data) {
        console.log("A.slot() data: '" + this.a + "' " + " " + data);
    }
}

class B {
    private a = "B.a";

    slot = (data) => {
        console.log("B.slot() data: '" + this.a + "' " + " " + data);
    }
}

function slot(data) {
    console.log("slot() data: '" + this.a + "' " + " " + data);
}

var a = new A();

var b = new B();

a.signalNum.connect(a.slot);
a.signalNum.connect(a.slot, a);
a.signalNum.connect(a.slot, b);
a.signalNum.connect(b.slot);
a.signalNum.connect(b.slot, b);
a.signalNum.connect(b.slot, a);
a.signalNum.connect(slot);
a.signalNum.connect(slot, a);
a.signalNum.connect(slot, b);
a.signalNum.emit(5);

console.log("-------------------------------------");

a.signalStr.connect(a.slot, a);
//a.signalStr.slot = slot; // ES5

a.signalStr.emit("str");