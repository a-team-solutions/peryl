const requiredMsg = "required";
const notInRangeMsg = "not_in_range";
const invalidFormatMsg = "invalid_format";
const invalidOptionMsg = "invalid_option";
const invalidValueMsg = "invalid_value";

export abstract class Validator<T, O, M> {

    readonly opts: O;
    readonly msgs: M;

    readonly str?: string;
    readonly err?: string;
    readonly obj?: T;

    constructor(opts?: O, msgs?: M) {
        this.opts = opts || {} as O;
        this.msgs = msgs || {} as M;
    }

    protected abstract strToObj(str: string): { obj?: T, err?: string };

    protected abstract objCheck(obj: T): string;

    protected abstract objToStr(obj: T,
                                format?: string): { str?: string, err?: string };

    validate(value: string | T): { str?: string, obj?: T, err?: string } {
        if (typeof value === "string") {
            (this.str as any) = value;
            const sto = this.strToObj(value);
            (this.obj as any) = sto.obj;
            if (sto.err) {
                (this.err as any) = sto.err;
                return { str: value, obj: sto.obj, err: sto.err };
            }
            const err = this.objCheck(sto.obj!);
            (this.err as any) = err;
            return { str: value, obj: sto.obj, err };
        } else {
            (this.str as any) = value !== undefined ? ("" + value) : undefined;
            const err = this.objCheck(value);
            (this.err as any) = err;
            return { str: this.str, obj: value, err };
        }
    }

    format(obj: T, format?: string): { str?: string, err?: string } {
        const err = this.objCheck(obj);
        const ots = this.objToStr(obj, format);
        return { str: ots.str, err: ots.err ? ots.err : err };
    }

}

export function tpl(tmpl: string, data: { [k: string]: string }): string {
    return Object.keys(data)
        .map(k => [k, data[k]])
        .reduce((t, d) =>
            t.replace(new RegExp(`\\{\\{${d[0]}\\}\\}`, "g"), d[1]), tmpl);
}

export interface SelectValidatorOpts {
    required?: boolean;
    options?: string[];
}

export interface SelectValidatorMsgs {
    required?: string;
    invalid_option?: string;
}

export class SelectValidator
    extends Validator<string, SelectValidatorOpts, SelectValidatorMsgs> {

    constructor(opts?: SelectValidatorOpts, msgs?: SelectValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: string, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs.required
                        ? tpl(msgs.required,
                            {
                                options: ("options" in opts)
                                    ? opts.options!.join(", ")
                                    : ""
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
            if (opts.options!.indexOf(obj) === -1) {
                return msgs.invalid_option
                    ? tpl(msgs.invalid_option,
                        {
                            option: obj,
                            options: ("options" in opts)
                                ? opts.options!.join(", ")
                                : ""
                        })
                    : invalidOptionMsg;
            }
        }
        return "";
    }

    protected objToStr(obj: string,
                       format?: string): { str?: string, err?: string } {
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

export class StringValidator
    extends Validator<string, StringValidatorOpts, StringValidatorMsgs> {

    constructor(opts?: StringValidatorOpts, msgs?: StringValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: string, err?: string } {
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
                                regexp: ("regexp" in opts)
                                    ? ("" + opts.regexp)
                                    : ""
                            })
                        : requiredMsg
                };
            }
        }
        if ("regexp" in opts) {
            if (!opts.regexp!.test(str)) {
                return {
                    err: msgs.invalid_format
                        ? tpl(msgs.invalid_format,
                            {
                                regexp: ("regexp" in opts)
                                    ? ("" + opts.regexp)
                                    : ""
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
        let err: boolean = false;
        if ("max" in opts) {
            if (obj.length > opts.max!) {
                err = true;
            }
        }
        if ("min" in opts) {
            if (obj.length < opts.min!) {
                err = true;
            }
        }
        if (("min" in opts) && ("max" in opts)) {
            if (obj.length > opts.max! && obj.length < opts.min!) {
                err = true;
            }
        }
        if (err) {
            return msgs.not_in_range
                ? tpl(msgs.not_in_range,
                    {
                        min: ("min" in opts) ? ("" + opts.min) : "",
                        max: ("max" in opts) ? ("" + opts.max) : "",
                    })
                : notInRangeMsg;
        }
        return "";
    }

    protected objToStr(obj: string,
                       format?: string): { str?: string, err?: string } {
        return { str: obj };
    }

}

export const emailRegex = /[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*@(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?/;

export interface NumberValidatorOpts {
    required?: boolean;
    min?: number;
    max?: number;
}

export interface NumberValidatorMsgs {
    required?: string;
    invalid_format?: string;
    not_in_range?: string;
}

export class NumberValidator
    extends Validator<number, NumberValidatorOpts, NumberValidatorMsgs> {

    constructor(opts?: NumberValidatorOpts, msgs?: NumberValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: number, err?: string } {
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
                            })
                        : requiredMsg
                };
            }
        }
        const n = Number(str);
        let err: boolean = false;
        if (str !== this.objToStr(n).str) {
            err = true;
        }
        if (err) {
            const num = isNaN(n) ? 1234.45 : n;
            return {
                obj: isNaN(n) ? undefined : n,
                err: msgs.invalid_format
                    ? tpl(msgs.invalid_format,
                        {
                            num: this.objToStr(num).str || ""
                        })
                    : invalidFormatMsg
            };
        }
        return { obj: n };
    }

    protected objCheck(obj: number): string {
        const opts = this.opts;
        const msgs = this.msgs;
        let err: boolean = false;
        if ("max" in opts) {
            if (obj > opts.max!) {
                err = true;
            }
        }
        if ("min" in opts) {
            if (obj < opts.min!) {
                err = true;
            }
        }
        if (err) {
            return msgs.not_in_range
                ? tpl(msgs.not_in_range,
                    {
                        min: ("min" in opts) ? ("" + opts.min) : "",
                        max: ("max" in opts) ? ("" + opts.max) : "",
                    })
                : notInRangeMsg;
        }
        return "";
    }

    protected objToStr(obj: number,
                       format?: string): { str?: string, err?: string } {
        return {
            str: obj !== undefined ? ("" + obj) : undefined
        };
    }

}

export interface BooleanValidatorOpts {
    required?: boolean;
    value?: boolean;
}

export interface BooleanValidatorMsgs {
    required?: string;
    invalid_value?: string;
}

export class BooleanValidator
    extends Validator<boolean, BooleanValidatorOpts, BooleanValidatorMsgs> {

    constructor(opts?: BooleanValidatorOpts, msgs?: BooleanValidatorMsgs) {
        super(opts, msgs);
    }

    protected strToObj(str: string): { obj?: boolean, err?: string } {
        const opts = this.opts;
        const msgs = this.msgs;
        if ("required" in opts) {
            if (opts.required && !str) {
                return {
                    err: msgs.required
                        ? tpl(msgs.required, {})
                        : requiredMsg
                };
            }
        }
        let b;
        switch (str) {
            case "true":
            case "1":
            case "on":
            case "yes":
                b = true;
                break;
            default:
                b = false;
        }
        return { obj: b };
    }

    protected objCheck(obj: boolean): string {
        const opts = this.opts;
        const msgs = this.msgs;
        let err = false;
        if ("value" in opts) {
            if (obj !== opts.value) {
                err = true;
            }
        }
        if (err) {
            return msgs.invalid_value
                ? tpl(msgs.invalid_value,
                    {
                        value: ("value" in opts) ? ("" + opts.value) : "",
                    })
                : invalidValueMsg;
        }
        return "";
    }

    protected objToStr(obj: boolean,
                       format?: string): { str?: string, err?: string } {
        return {
            str: "" + obj
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

export interface ArrayValidatorOpts {
    required?: boolean;
    min?: number;
    max?: number;
}

export interface ArrayValidatorMsgs {
    required?: string;
    not_in_range?: string;
    invalid_format?: string;
}

export class ArrayValidator<T = any> {

    readonly validator: Validator<T, any, any> | ObjectValidator<T>;
    readonly opts: ArrayValidatorOpts;

    readonly str?: string[] | StrDict<T>[];
    readonly obj?: T[] | { [key in keyof T]: any }[];
    readonly err?: string[] | StrDict<T>[];

    readonly valid?: boolean;

    constructor(validator: Validator<T, any, any> | ObjectValidator<T>,
                opts?: ArrayValidatorOpts) {
        this.validator = validator;
        this.opts = opts || {};
    }

    validate(data: string[] | T[]): this {
        (this.str as any) = [];
        (this.obj as any) = [];
        (this.err as any) = [];
        (this.valid as any) = true;

        const validator = this.validator;

        if (validator instanceof ObjectValidator) {
            (data as any).forEach((d: any) => {
                const r = (validator as ObjectValidator<T>).validate(d);
                (this.str as StrDict<T>[]).push(r.str!);
                (this.obj as { [key in keyof T]: any }[]).push(r.obj!);
                (this.err as StrDict<T>[]).push(r.err!);
                !r.valid && ((this.valid as any) = false);
            });
        } else { // Validator<T, any, any>
            (data as any).forEach((d: any) => {
                const r = (validator as Validator<T, any, any>).validate(d);
                this.str!.push(r.str as any);
                this.obj!.push(r.obj!);
                this.err!.push(r.err as any);
                r.err && ((this.valid as any) = false);
            });
        }
        return this;
    }

}

type FormValidators<T> = { [key in keyof T]: Validator<any, any, any> };

export type Str<T> = { [key in keyof T]: string };
export type Obj<T> = { [key in keyof T]: any };
export type Err<T> = { [key in keyof T]: string };

export interface FormValidatorData<T> {
    str: Str<T>;
    obj: Obj<T>;
    err: Err<T>;
    valid: boolean;
}

export class FormValidator<T = any> {

    readonly validators: FormValidators<T> = {} as FormValidators<T>;

    readonly str?: Str<T>;
    readonly obj?: Obj<T>;
    readonly err?: Err<T>;

    readonly valid?: boolean;

    addValidator(field: keyof T, validator: Validator<any, any, any>): this {
        this.validators[field] = validator;
        return this;
    }

    validate(data: { [key in keyof T]: string },
             defaults?: { [key in keyof T]: string }): this {
        const d = {
            ...defaults || Object.getOwnPropertyNames(this.validators)
                .reduce<any>(
                    (a, v) => { if (a[v] === undefined) a[v] = ""; return a; },
                    {}),
            ...data as object
        };
        const res = Object.keys(this.validators)
            .reduce(
                (a, k) => {
                    const v = (d as any)[k];
                    const r = (this.validators as any)[k].validate(v);
                    (a.str as any)[k] = r.str;
                    (a.obj as any)[k] = r.obj;
                    (a.err as any)[k] = r.err;
                    r.err && (a.valid = false);
                    return a;
                },
                { str: {}, obj: {}, err: {}, valid: true });
        (this.str as any) = res.str;
        (this.obj as any) = res.obj;
        (this.err as any) = res.err;
        (this.valid as any) = res.valid;
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
                    r.err && (a.valid = false);
                    return a;
                },
                { str: {}, obj: {}, err: {}, valid: true });
        (this.str as any) = res.str;
        (this.obj as any) = res.obj;
        (this.err as any) = res.err;
        (this.valid as any) = res.valid;
        return this;
    }

    data(): FormValidatorData<T> {
        return {
            str: this.str!,
            obj: this.obj!,
            err: this.err!,
            valid: this.valid!
        };
    }

}

type ObjectValidators<T> = {
    [key in keyof T]?: Validator<any, any, any> |
    ObjectValidator<any> |
    ArrayValidator<any> };

export class ObjectValidator<T = any> {

    readonly validators: ObjectValidators<T> = {} as any;

    readonly str?: StrDict<T>;
    readonly obj?: { [key in keyof T]: any };
    readonly err?: StrDict<T>;

    readonly valid?: boolean;

    constructor(validators?: ObjectValidators<T>) {
        if (validators) {
            this.validators = validators;
        }
    }

    addValidator(field: keyof T,
                 validator: Validator<any, any, any>
                     | ObjectValidator<any>
                     | ArrayValidator<any>): this {
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
                    const value = (d as any)[k] === undefined ? "" : (d as any)[k];
                    const validator = (this.validators as any)[k];

                    let res: any;
                    if (validator instanceof ObjectValidator) {
                        res = validator.validate(value, (defaults as any)[k] || {});
                        !res.valid && (acc.valid = false);
                    } else if (validator instanceof ArrayValidator) {
                        res = validator.validate(value);
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
        res.valid = !Object
            .keys(res.err)
            .filter(x => !!(res.err as any)[x]).length;
        (this.str as any) = res.str;
        (this.obj as any) = res.obj;
        (this.err as any) = res.err;
        (this.valid as any) = res.valid;
        return this;
    }

}


// TEST

// const sv = new StringValidator(
//     {
//         required: true,
//         min: 3,
//         max: 5
//         // regexp: /^[0123]+$/
//     },
//     {
//         required: "required {{min}} {{max}} {{regexp}}",
//         invalid_format: "invalid_format {{regexp}}",
//         not_in_range: "not_in_range {{min}} {{max}}"
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
//         max: 5000
//     },
//     {
//         required: "required {{min}} {{max}} {{locale}} {{format}}",
//         invalid_format: "invalid_format {{num}} {{locale}} {{format}}",
//         not_in_range: "not_in_range {{min}} {{max}}"
//     });

// // const dv = new DateValidator(
// //     {
// //         required: true,
// //         strict: true
// //     },
// //     {
// //         required: "required {{min}} {{max}} {{locale}} {{format}}",
// //         invalid_format: "invalid_format {{date}} {{locale}}",
// //         not_in_range: "not_in_range {{min}} {{max}} {{locale}} {{format}}"
// //     });

// const fvData = { str: "123a", num: "123.45", date: "02.01.2019 12:12" };

// const fv = new FormValidator<typeof fvData>()
//     .addValidator("str", sv)
//     .addValidator("num", nv)
//     // .addValidator("date", dv)
//     .validate(fvData);

// console.log(fv);

// fv.format(fv.obj!);
// console.log(fv);

// const ovData = { str: "123a", num: "123.45", date: "02.01.2019 12:12" };

// const ov = new ObjectValidator<typeof ovData>()
//     .addValidator("str", sv)
//     .addValidator("num", nv)
//     // .addValidator("date", dv)
//     .validate(ovData);

// // console.log(ov);

// ov.format(ov.obj!);
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

// const avn = new ArrayValidator<number>(new NumberValidator());
// const rn = avn.validate([345, 123]);
// console.log(rn);


// interface D {
//     a: number;
//     b?: string;
// }

// const av = new ArrayValidator<D>(new ObjectValidator<D>()
//     .addValidator("a", new NumberValidator())
//     .addValidator("b", new StringValidator({ required: true }))
// );

// const d: D[] = [
//     { a: 123, b: "text" },
//     // { a: 5.6, b: "" },
//     { a: 5.6 }
// ];

// const r = av.validate(d);
// console.log(r);

// const ro = new ObjectValidator<D>()
//     .addValidator("a", new NumberValidator())
//     .addValidator("b", new StringValidator({ required: true }))
//     .validate({
//         a: "5.6",
//         b: undefined
//         // b: "text"
//     });
// console.log("---", ro);

// const v = new StringValidator({ required: true });
// const str = undefined;
// const sr = v.validate(str!);
// console.log(sr);
