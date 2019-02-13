import * as numeral from "numeral";
import * as moment from "moment";
import { Moment } from "moment";

const requiredMsg = "required";
const notInRangeMsg = "not_in_range";
const invalidFormatMsg = "invalid_format";
const invalidOptionMsg = "invalid_option";
const localeDefault = "en";
const dateFormatFefault = "L";
const numFormatDefault = "0,0.[00]";

export abstract class Validator<T, O, M> {

    readonly opts: O;
    readonly msgs: M;

    readonly str: string;
    readonly err: string;
    readonly obj: T;

    constructor(opts?: O, msgs?: M) {
        this.opts = opts;
        this.msgs = msgs;
    }

    protected abstract strToObj(str: string): { obj?: T, err?: string };

    protected abstract objCheck(obj: T): string;

    protected abstract objToStr(obj: T, format?: string): { str?: string, err?: string };

    validate(str: string): { str?: string, obj?: T, err?: string } {
        (this.str as any) = str;
        const ots = this.strToObj(str);
        (this.obj as any) = ots.obj;
        if (ots.err) {
            (this.err as any) = ots.err;
            return { str, obj: ots.obj, err: ots.err };
        }
        const err = this.objCheck(ots.obj);
        (this.err as any) = err;
        return { str, obj: ots.obj, err };
    }

    format(obj: T, format?: string): { str?: string, err?: string } {
        const err = this.objCheck(obj);
        const ots = this.objToStr(obj, format);
        return { str: ots.str, err: ots.err ? ots.err : err };
    }

}

export interface SelectValidatorOpts {
    required?: boolean;
    options?: string[];
}

export interface SelectValidatorMsgs {
    required?: string;
    invalid_option?: string;
}

export class SelectValidator extends Validator<string, SelectValidatorOpts, SelectValidatorMsgs> {

    constructor(opts?: SelectValidatorOpts, msgs?: SelectValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: string, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs && msgs.required
                        ? tpl(msgs.required,
                            {
                                options: opts.options && opts.options.join(", ")
                            })
                        : requiredMsg
                };
            }
        }
        return { obj: str };
    }

    protected objCheck(obj: string): string {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("options" in opts) {
            if (opts.options.indexOf(obj) === -1) {
                return msgs && msgs.invalid_option
                    ? tpl(msgs.invalid_option,
                        {
                            option: obj,
                            options: opts.options && opts.options.join(", ")
                        })
                    : invalidOptionMsg;
            }
        }
        return "";
    }

    protected objToStr(obj: string, format?: string): { str?: string, err?: string } {
        return { str: obj };
    }

}

export interface StringValidatorOpts {
    required?: boolean;
    min?: number;
    max?: number;
    regexp?: RegExp;
}

export interface StringValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class StringValidator extends Validator<string, StringValidatorOpts, StringValidatorMsgs> {

    constructor(opts?: StringValidatorOpts, msgs?: StringValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: string, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs && msgs.required
                        ? tpl(msgs.required,
                            {
                                min: opts.min && ("" + opts.min),
                                max: opts.max && ("" + opts.max),
                                regexp: opts.regexp && ("" + opts.regexp)
                            })
                        : requiredMsg
                };
            }
        }
        if ("regexp" in opts) {
            if (!opts.regexp.test(str)) {
                return {
                    err: msgs && msgs.invalid_format
                        ? tpl(msgs.invalid_format,
                            {
                                regexp: opts.regexp && ("" + opts.regexp)
                            })
                        : invalidFormatMsg
                    };
            }
        }
        return { obj: str };
    }

    protected objCheck(obj: string): string {
        const opts = this.opts;
        const msgs = this.msgs;
        let err: boolean;
        if ("max" in opts) {
            if (obj.length > opts.max) {
                err = true;
            }
        }
        if ("min" in opts) {
            if (obj.length < opts.min) {
                err = true;
            }
        }
        if ("min" in opts && "max" in opts) {
            if (obj.length > opts.max && obj.length < opts.min) {
                err = true;
            }
        }
        if (err) {
            return msgs && msgs.not_in_range
                ? tpl(msgs.not_in_range,
                    {
                        min: opts.min && ("" + opts.min),
                        max: opts.max && ("" + opts.max)
                    })
                : notInRangeMsg;
        }
        return "";
    }

    protected objToStr(obj: string, format?: string): { str?: string, err?: string } {
        return { str: obj };
    }

}

export const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export interface NumberValidatorOpts {
    required?: boolean;
    min?: number;
    max?: number;
    locale?: string;
    format?: string;
    strict?: boolean;
}

export interface NumberValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class NumberValidator extends Validator<Numeral, NumberValidatorOpts, NumberValidatorMsgs> {

    constructor(opts?: NumberValidatorOpts, msgs?: NumberValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: Numeral, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs && msgs.required
                        ? tpl(msgs.required,
                            {
                                min: opts.min && ("" + opts.min),
                                max: opts.max && ("" + opts.max),
                                locale: opts.locale || localeDefault,
                                format: opts.format || numFormatDefault
                            })
                        : requiredMsg
                };
            }
        }
        numeral.locale(opts.locale || localeDefault);
        const n = numeral(str);
        let err: boolean;
        if (n.value() === null) {
            err = true;
        }
        if (opts.strict && (str !== this.objToStr(n).str)) {
            err = true;
        }
        if (err) {
            const num = (n.value() !== null) ? n : numeral(1234.45);
            return {
                obj: (n.value() !== null) ? n : undefined,
                err: msgs && msgs.invalid_format
                    ? tpl(msgs.invalid_format,
                        {
                            num: this.objToStr(num).str,
                            locale: opts.locale || localeDefault,
                            format: opts.format || numFormatDefault
                        })
                    : invalidFormatMsg
                };
        }
        return { obj: n };
    }

    protected objCheck(obj: Numeral): string {
        if (obj.constructor === Number) {
            obj = numeral(obj);
        }
        const opts = this.opts;
        const msgs = this.msgs;
        let err: boolean;
        if ("max" in opts) {
            if (obj.value() > opts.max) {
                err = true;
            }
        }
        if ("min" in opts) {
            if (obj.value() < opts.min) {
                err = true;
            }
        }
        if (err) {
            return msgs && msgs.not_in_range
                ? tpl(msgs.not_in_range,
                    {
                        min: opts.min && ("" + opts.min),
                        max: opts.max && ("" + opts.max),
                        locale: opts.locale || localeDefault,
                        format: opts.format || numFormatDefault
                    })
                : notInRangeMsg;
        }
        return "";
    }

    protected objToStr(obj: Numeral, format?: string): { str?: string, err?: string } {
        if (obj.constructor === Number) {
            obj = numeral(obj);
        }
        numeral.locale(this.opts.locale || localeDefault);
        return {
            str: obj
                ? obj.format(format ? format : this.opts.format || numFormatDefault)
                : undefined
        };
    }

}

export interface DateTimeValidatorOpts {
    required?: boolean;
    min?: moment.Moment;
    max?: moment.Moment;
    locale?: string;
    format?: string;
    strict?: boolean;
}

export interface DateTimeValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class DateTimeValidator extends Validator<Moment, DateTimeValidatorOpts, DateTimeValidatorMsgs> {

    constructor(opts?: DateTimeValidatorOpts, msgs?: DateTimeValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: Moment, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs && msgs.required
                        ? tpl(msgs.required,
                            {
                                min: opts.min && ("" + opts.min),
                                max: opts.max && ("" + opts.max),
                                locale: opts.locale || localeDefault,
                                format: opts.format && opts.format
                            })
                        : requiredMsg
                };
            }
        }
        const d = moment(str,
            opts && (opts.format || dateFormatFefault),
            opts && (opts.locale || localeDefault),
            opts.strict || false);
        let err: boolean;
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
                err: msgs && msgs.invalid_format
                    ? tpl(msgs.invalid_format,
                        {
                            date: this.objToStr(date).str,
                            locale: opts.locale || localeDefault,
                            format: opts.format && opts.format
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
        let err: boolean;
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
            return msgs && msgs.not_in_range
                ? tpl(msgs.not_in_range,
                    {
                        min: opts.min && ("" + opts.min),
                        max: opts.max && ("" + opts.max),
                        locale: opts.locale && opts.locale,
                        format: opts.format && opts.format
                    })
                : notInRangeMsg;
        }
        return "";
    }

    protected objToStr(obj: Moment, format?: string): { str?: string, err?: string } {
        if (obj.constructor === Date) {
            obj = moment(obj);
        }
        return {
            str: obj
                ? obj
                    .locale(this.opts.locale || localeDefault)
                    .format(format ? format : this.opts.format || dateFormatFefault)
                : undefined
        };
    }

}

type StrDict<O, Optional extends (true | false) = false> = {
    0: string,
    1: string[],
    2: Optional extends true
        ? { [prop in keyof O]+?: StrDict<O[prop], true> }
        : { [prop in keyof O]: StrDict<O[prop], false> }
}[O extends (string | number | boolean)
    ? 0
    : O extends string[]
        ? 1
        : O extends { [prop: string]: any }
            ? 2
            : never];

export class ObjectValidator<T = any> {

    readonly validators: { [key in keyof T]?: Validator<any, any, any> | ObjectValidator<any>} = {} as any;

    readonly str: StrDict<T>;
    readonly obj: { [key in keyof T]: any };
    readonly err: StrDict<T>;
    readonly valid: boolean;

    constructor(validators?: { [key in keyof T]?: Validator<any, any, any> | ObjectValidator<any>}) {
        if (validators) {
            this.validators = validators;
        }
    }

    addValidator(field: keyof T, validator: Validator<any, any, any> | ObjectValidator<any>): this {
        this.validators[field] = validator;
        return this;
    }

    validate(data: StrDict<T, true>,
             defaults: StrDict<T> = {} as any): this {
        const d = { ...defaults as object, ...data as object };
        (this as any).valid = true;
        const result = Object.keys(this.validators)
            .reduce(
                (acc, k) => {
                    const value = (d as any)[k];
                    const validator = (this.validators as any)[k];

                    let res: any;
                    if (validator instanceof ObjectValidator) {
                        res = validator.validate(value, (defaults as any)[k] || {});
                        !res.valid && (acc.valid = false);
                    } else {
                        res = validator.validate(value);
                        res.err && (acc.valid = false);
                    }

                    (acc.str as any)[k] = res.str;
                    (acc.obj as any)[k] = res.obj;
                    (acc.err as any)[k] = res.err;
                    return acc;
                },
                { str: {}, obj: {}, err: {}, valid: true });

        (this.str as any) = result.str;
        (this.obj as any) = result.obj;
        (this.err as any) = result.err;
        (this.valid as any) = result.valid;
        return this;
    }

    format(data: { [key in keyof T]: any }): this {
        const res = Object.keys(this.validators)
            .reduce(
                (a, k) => {
                    const v = (data as any)[k];
                    const r = (this.validators as any)[k].format(v);
                    (a.str as any)[k] = r.str;
                    (a.obj as any)[k] = v;
                    (a.err as any)[k] = r.err;
                    return a;
                },
                { str: {}, obj: {}, err: {}, valid: false });
        res.valid = !Object.keys(res.err).filter(x => !!(res.err as any)[x]).length;
        (this.str as any) = res.str;
        (this.obj as any) = res.obj;
        (this.err as any) = res.err;
        (this.valid as any) = res.valid;
        return this;
    }

}

function tpl(tmpl: string, data: { [k: string]: string }): string {
    return Object.keys(data)
        .map(k => [k, data[k]])
        .reduce((t, d) => t.replace(new RegExp(`\\$\\{${d[0]}\\}`, "g"), d[1]), tmpl);
}

// TEST

// import "numeral/locales";

// const sv = new StringValidator(
//     {
//         required: true,
//         min: 3,
//         max: 5
//         // regexp: /^[0123]+$/
//     },
//     {
//         required: "required ${min} ${max} ${regexp}",
//         invalid_format: "invalid_format ${regexp}",
//         not_in_range: "not_in_range ${min} ${max}"
//     });

// [
//     "x1234",
//     "x1234y",
//     "xy"
// ].forEach(v => {
//     console.log();
//     console.log(v);
//     const r = sv.validate(v);
//     console.log(r);
//     if (r.obj) {
//         const f = sv.format(r.obj);
//         console.log(f);
//     }
// });

// console.log();

// const nv = new NumberValidator(
//     {
//         required: true,
//         min: 3,
//         max: 5000,
//         locale: "sk",
//         format: "0,0.0[00]",
//         strict: true
//     },
//     {
//         required: "required ${min} ${max} ${locale} ${format}",
//         invalid_format: "invalid_format ${num} ${locale} ${format}",
//         not_in_range: "not_in_range ${min} ${max} ${locale}"
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

// console.log();

// const dv = new DateTimeValidator(
//     {
//         required: true,
//         locale: "sk",
//         format: "l LT",
//         min: moment("03/01/2017", "L", "en"),
//         max: moment("03/01/2020", "L", "en"),
//         strict: true
//     },
//     {
//         required: "required ${min} ${max} ${locale} ${format}",
//         invalid_format: "invalid_format ${date} ${locale}",
//         not_in_range: "not_in_range ${min} ${max} ${locale} ${format}"
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

// console.log();

// const data = { str: "123a", num: "123.45", date: "02.01.2019 12:12" };

// const ov = new ObjectValidator<typeof data>()
//     .addValidator("str", sv)
//     .addValidator("num", nv)
//     .addValidator("date", dv)
//     .validate(data);

// // console.log(ov);

// ov.format(ov.obj);
// console.log(ov);

// console.log();

// interface ReportFormData {
//     spz: string;
//     tachometer: string;
//     dateCreated: string;
//     user: {
//         // name: string[];
//         email: string;
//     };
// }

// const dov = new ObjectValidator<ReportFormData>()
//             .addValidator("spz", new StringValidator({ required: true }))
//             .addValidator("tachometer", new NumberValidator({ required: true, min: 1 } ))
//             .addValidator("dateCreated", new StringValidator({ required: true }))
//             .addValidator("user", new ObjectValidator<ReportFormData["user"]>()
//                 .addValidator("email", new StringValidator({ required: true}))
//                 // .addValidator("name", { })
//                 // new ArrayValidator({
//                 //     required: true,
//                 //     validator: new StringValidator({ required: true })
//                 // })
//             );

// dov.validate(
//     {
//         spz: "dasdas",
//         tachometer: "111222",
//         // dateCreated: "10.02.2019",
//         user: {
//             // email: "dsafasdf",
//         }
//     },
//     {
//         dateCreated: "01.03.2011",
//         spz: "32ds9f0f",
//         tachometer: "3213214214",
//         user: {
//             email: "sadmaskdmk2@dsadsamkl.com"
//         }
//     });
