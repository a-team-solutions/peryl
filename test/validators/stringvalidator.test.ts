import "jasmine";
import { StringValidator } from "../../src/validators";

describe("StringValidator", () => {

    // it("shoudl test string validator without options", () => {
    //     const sv = new StringValidator();
    //     const result = sv.validate("Example");
    //     expect(result.err).toEqual("");
    // });


    // required

    it("should test required option", () => {
        const sv = new StringValidator({
            required: true
        });
        const result = sv.validate("x");
        expect(result.err).toEqual("");
    });

    it("should test required option with empty string [ERROR]", () => {
        const sv = new StringValidator({
            required: true
        });
        const result = sv.validate("");
        expect(result.err).toEqual("required");
    });

    // min

    it("should test min 5 option with string of length 6", () => {
        const sv = new StringValidator({
            min: 5
        });
        const result = sv.validate("abcdef");
        expect(result.err).toEqual("");
    });

    it("should test min 5 option with string of length 5", () => {
        const sv = new StringValidator({
            min: 5
        });
        const result = sv.validate("abcde");
        expect(result.err).toEqual("");
    });

    it("should test min 5 option with string of length 3 [ERROR]", () => {
        const sv = new StringValidator({
            min: 5
        });
        const result = sv.validate("def");
        expect(result.err).toEqual("not_in_range");
    });

    // max

    it("should test max 8 option with string of length 0", () => {
        const sv = new StringValidator({
            max: 8
        });
        const result = sv.validate("");
        expect(result.err).toEqual("");
    });

    it("should test max 8 option with string of length 7", () => {
        const sv = new StringValidator({
            max: 8
        });
        const result = sv.validate("testtes");
        expect(result.err).toEqual("");
    });

    it("should test max 8 option with string of length 8", () => {
        const sv = new StringValidator({
            max: 8
        });
        const result = sv.validate("testtes8");
        expect(result.err).toEqual("");
    });

    it("should test max 8 option with string of length 9 [ERROR]", () => {
        const sv = new StringValidator({
            max: 8
        });
        const result = sv.validate("testtes8z");
        expect(result.err).toEqual("not_in_range");
    });

    // min & max

    it("should test <min3, max7> with string of length 3", () => {
        const sv = new StringValidator({
            min: 3,
            max: 7
        });
        const result = sv.validate("cjs");
        expect(result.err).toEqual("");
    });

    it("should test <min3, max7> with string of length 5", () => {
        const sv = new StringValidator({
            min: 3,
            max: 7
        });
        const result = sv.validate("cjsts");
        expect(result.err).toEqual("");
    });

    it("should test <min3, max7> with string of length 7", () => {
        const sv = new StringValidator({
            min: 3,
            max: 7
        });
        const result = sv.validate("cjstsxh");
        expect(result.err).toEqual("");
    });

    it("should test <min3, max7> with string of length 8 [ERROR]", () => {
        const sv = new StringValidator({
            min: 3,
            max: 7
        });
        const result = sv.validate("cjstsxjs");
        expect(result.err).toEqual("not_in_range");
    });

    it("should test <min3, max7> with string of length 2 [ERROR]", () => {
        const sv = new StringValidator({
            min: 3,
            max: 7
        });
        const result = sv.validate("py");
        expect(result.err).toEqual("not_in_range");
    });

    // regexp

    it("should test only regexp digits", () => {
        const sv = new StringValidator({
            regexp: /[0123]+/
        });
        const result = sv.validate("3312");
        expect(result.err).toEqual("");
    });

    it("should test only regexp digits [ERROR]", () => {
        const sv = new StringValidator({
            regexp: /[0123]+/
        });
        const result = sv.validate("987a");
        expect(result.err).toEqual("invalid_format");
    });

    // min & max & regexp

    it("should test regexp digits with <min2, max8>", () => {
        const sv = new StringValidator({
            regexp: /[0123]+/,
            min: 2,
            max: 8
        });
        const result = sv.validate("01331");
        expect(result.err).toEqual("");
    });

    // it("should test regexp digits with <min2, max8> [ERROR]", () => {
    //     const sv = new StringValidator({
    //         regexp: /[0123]+/,
    //         min: 2,
    //         max: 8
    //     });
    //     const result = sv.validate("");
    //     expect(result.err).toEqual("invalid_format");
    // });

    // it("should test regexp digits with <min4, max7> [ERROR]", () => {
    //     const sv = new StringValidator({
    //         regexp: /[0123]+/,
    //         min: 4,
    //         max: 7
    //     });
    //     const result = sv.validate("8");
    //     expect(result.err).toEqual("invalid_format");
    // });

    // it("should test regexp digits with <min5, max9> [ERROR]", () => {
    //     const sv = new StringValidator({
    //         regexp: /[0123]+/,
    //         min: 5,
    //         max: 9
    //     });
    //     const result = sv.validate("888800001");
    //     expect(result.err).toEqual("");
    // });

    it("should test regexp digits with <min5, max9> [ERROR]", () => {
        const sv = new StringValidator({
            regexp: /[0123]+/,
            min: 5,
            max: 9
        });
        const result = sv.validate("8888000012");
        expect(result.err).toEqual("not_in_range");
    });

});
