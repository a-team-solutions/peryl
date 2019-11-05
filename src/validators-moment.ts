import { Validator, tpl } from "./validators";
import * as moment from "moment";
import { Moment } from "moment";

const requiredMsg = "required";
const notInRangeMsg = "not_in_range";
const invalidFormatMsg = "invalid_format";

const localeDefault = "en";
const dateFormatFefault = "L";
const numFormatDefault = "0,0.[00]";

export interface MomentValidatorOpts {
    required?: boolean;
    min?: moment.Moment;
    max?: moment.Moment;
    locale?: string;
    format?: string;
    strict?: boolean;
}

export interface MomentValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class MomentValidator
    extends Validator<Moment, MomentValidatorOpts, MomentValidatorMsgs> {

    constructor(opts?: MomentValidatorOpts, msgs?: MomentValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: Moment, err?: string } {
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
        const d = moment(str,
            opts.format || dateFormatFefault,
            opts.locale || localeDefault,
            opts.strict || false);
        let err: boolean = false;
        if (!d.isValid()) {
            err = true;
        }
        if (opts.strict && (str !== this.objToStr(d).str)) {
            err = true;
        }
        if (err) {
            const date = d.isValid() ? d : moment(new Date());
            return {
                obj: d.isValid() ? d : undefined,
                err: msgs.invalid_format
                    ? tpl(msgs.invalid_format,
                        {
                            date: this.objToStr(date).str || "",
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
        return { obj: d };
    }

    protected objCheck(obj: Moment): string {
        if (obj.constructor === Date) {
            obj = moment(obj);
        }
        const opts = this.opts;
        const msgs = this.msgs;
        let err: boolean = false;
        if ("max" in opts) {
            if (obj.isAfter(opts.max)) {
                err = true;
            }
        }
        if ("min" in opts) {
            if (obj.isBefore(opts.min)) {
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

    protected objToStr(obj: Moment,
        format?: string): { str?: string, err?: string } {
        if (obj.constructor === Date) {
            obj = moment(obj);
        }
        return {
            str: obj
                ? obj
                    .locale(this.opts.locale || localeDefault)
                    .format(format
                        ? format
                        : this.opts.format || dateFormatFefault)
                : undefined
        };
    }

}


// TEST

// const dv = new MomentValidator(
//     {
//         required: true,
//         locale: "sk",
//         format: "l LT",
//         min: moment("03/01/2017", "L", "en"),
//         max: moment("03/01/2020", "L", "en"),
//         strict: true
//     },
//     {
//         required: "required {{min}} {{max}} {{locale}} {{format}}",
//         invalid_format: "invalid_format {{date}} {{locale}}",
//         not_in_range: "not_in_range {{min}} {{max}} {{locale}} {{format}}"
//     });

// [
//     "01.03.2018 5:35",
//     "1.3.2018 5:35",
//     "5:35",
//     "01.13.2018",
//     "1.13.2018",
//     "03/01/2018",
//     "3/1/2018"
// ].forEach(v => {
//     console.log();
//     console.log(v);
//     const r = dv.validate(v);
//     console.log(r);
//     if (r.obj) {
//         const f = dv.format(r.obj);
//         console.log(f);
//     }
// });
