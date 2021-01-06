import { Validator, tpl } from "./validators";
import * as numeral from "numeral";

const requiredMsg = "required";
const notInRangeMsg = "not_in_range";
const invalidFormatMsg = "invalid_format";

const localeDefault = "en";
const numFormatDefault = "0,0.[00]";


export interface NumeralValidatorOpts {
    required?: boolean;
    min?: number;
    max?: number;
    locale?: string;
    format?: string;
    strict?: boolean;
}

export interface NumeralValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class NumeralValidator
    extends Validator<Numeral, NumeralValidatorOpts, NumeralValidatorMsgs> {

    constructor(opts?: NumeralValidatorOpts, msgs?: NumeralValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str?: string | null): { obj: Numeral | null, err: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    obj: null,
                    err: msgs.required
                        ? tpl(msgs.required,
                            {
                                min: ("min" in opts) ? ("" + opts.min) : "",
                                max: ("max" in opts) ? ("" + opts.max) : "",
                                locale: ("locale" in opts)
                                    ? opts.locale!
                                    : localeDefault,
                                format: ("format" in opts)
                                    ? opts.format!
                                    : numFormatDefault
                            })
                        : requiredMsg
                };
            }
        }
        if (str) {
            numeral.locale(opts.locale || localeDefault);
            const n = numeral(str);
            let err: boolean = false;
            if (n.value() === null) {
                err = true;
            }
            if ("strict" in opts) {
                if (opts.strict && (str !== this.objToStr(n).str)) {
                    err = true;
                }
            }
            if (err) {
                const num = (n.value() !== null) ? n : numeral(1234.45);
                return {
                    obj: (n.value() !== null) ? n : null,
                    err: msgs.invalid_format
                        ? tpl(msgs.invalid_format,
                            {
                                num: this.objToStr(num).str || "",
                                locale: ("locale" in opts)
                                    ? opts.locale!
                                    : localeDefault,
                                format: ("format" in opts)
                                    ? opts.format!
                                    : numFormatDefault
                            })
                        : invalidFormatMsg
                };
            }
            return { obj: n, err: "" };
        } else {
            return { obj: null, err: "" };
        }
    }

    protected objCheck(obj?: Numeral | null): string {
        if (obj === undefined || obj === null) {
            return "";
        }
        // if (obj.constructor === Number) {
        //     obj = numeral(obj);
        // }
        const opts = this.opts;
        const msgs = this.msgs;
        let err: boolean = false;
        if ("max" in opts) {
            if (obj.value() > opts.max!) {
                err = true;
            }
        }
        if ("min" in opts) {
            if (obj.value() < opts.min!) {
                err = true;
            }
        }
        if (err) {
            return msgs.not_in_range
                ? tpl(msgs.not_in_range,
                    {
                        min: ("min" in opts) ? ("" + opts.min) : "",
                        max: ("max" in opts) ? ("" + opts.max) : "",
                        locale: ("locale" in opts)
                            ? opts.locale!
                            : localeDefault,
                        format: ("format" in opts)
                            ? opts.format!
                            : numFormatDefault
                    })
                : notInRangeMsg;
        }
        return "";
    }

    protected objToStr(obj?: Numeral | null,
                       format?: string): { str: string, err: string } {
        // if (obj && obj.constructor === Number) {
        //     obj = numeral(obj);
        // }
        numeral.locale(this.opts.locale || localeDefault);
        return {
            str: (obj === undefined || obj === null)
                ? ""
                : obj.format(format
                    ? format
                    : this.opts.format || numFormatDefault),
            err: ""
        };
    }

}

export class NumeralNumberValidator
    extends Validator<number, NumeralValidatorOpts, NumeralValidatorMsgs> {

    nv: NumeralValidator;

    constructor(opts?: NumeralValidatorOpts, msgs?: NumeralValidatorMsgs) {
        super(opts, msgs);
        this.nv = new NumeralValidator(opts, msgs);
    }

    protected strToObj(str?: string | null): { obj: number | null, err: string } {
        const res = (this.nv as any).strToObj(str);
        if (res.obj) {
            res.obj = res.obj.value();
        }
        return res;
    }

    protected objCheck(obj?: number | null): string {
        const mObj = typeof obj === "number" ? numeral(obj) : obj;
        return (this.nv as any).objCheck(mObj);
    }

    protected objToStr(obj?: number | null,
                       format?: string): { str: string, err: string } {
        const mObj = typeof obj === "number" ? numeral(obj) : obj;
        return (this.nv as any).objToStr(mObj, format);
    }

}

// TEST

// import "numeral/locales";

// // const nv = new NumeralValidator(
// const nv = new NumeralNumberValidator(
//     {
//         required: true,
//         min: 3,
//         max: 5000,
//         locale: "sk",
//         format: "0,0.0[00]",
//         strict: true
//     },
//     {
//         required: "required {{min}} {{max}} {{locale}} {{format}}",
//         invalid_format: "invalid_format {{num}} {{locale}} {{format}}",
//         not_in_range: "not_in_range {{min}} {{max}}"
//     });

// [
//     "1234,56",
//     "1 234,56",
//     "1 234,56y",
//     "xy"
// ].forEach(v => {
//     console.log();
//     console.log(v);
//     const r = nv.validate(v);
//     console.log(r);
//     if (r.obj) {
//         const f = nv.format(r.obj);
//         console.log(f);
//     }
// });
