import { Validator } from "./validators";

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
//         max: 500000
//     },
//     {
//         required: "required {{min}} {{max}}",
//         invalid_format: "invalid_format {{num}}",
//         not_in_range: "not_in_range {{min}} {{max}}"
//     });

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
