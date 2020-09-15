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

    protected strToObj(str: string): { obj?: Numeral, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
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
                    obj: (n.value() !== null) ? n : undefined,
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
            return { obj: n };
        } else {
            return { obj: undefined };
        }
    }

    protected objCheck(obj: Numeral): string {
        if (obj.constructor === Number) {
            obj = numeral(obj);
        }
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

    protected objToStr(obj: Numeral,
        format?: string): { str?: string, err?: string } {
        if (obj.constructor === Number) {
            obj = numeral(obj);
        }
        numeral.locale(this.opts.locale || localeDefault);
        return {
            str: obj
                ? obj.format(format
                    ? format
                    : this.opts.format || numFormatDefault)
                : undefined
        };
    }

}


// TEST

// import "numeral/locales";

// const nv = new NumeralValidator(
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
