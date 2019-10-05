import "jasmine";
import { StringValidator, ObjectValidator, NumberValidator } from "../../src/validators";

describe("ObjectValidator", () => {

    // shallow

    it("should validate object with one string param", () => {
        const sv = new StringValidator({ required: true });
        const ov = new ObjectValidator<{ name: string }>()
            .addValidator("name", sv);
        ov.validate({
            name: "john"
        });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({ name: "" });
    });

    it("should validate object with one string param, uses default", () => {
        const sv = new StringValidator({ required: true });
        const ov = new ObjectValidator<{ name: string }>()
            .addValidator("name", sv);
        ov.validate({}, { name: "john" });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({ name: "" });
    });

    it("should validate object with one string param [ERROR]", () => {
        const sv = new StringValidator({ required: true });
        const ov = new ObjectValidator<{ name: string }>()
            .addValidator("name", sv);
        ov.validate({});
        expect(ov.valid).toEqual(false);
        expect(ov.err).toEqual({ name: "required" });
    });

    it("should validate object with one string param and one number", () => {
        const sv = new StringValidator({ required: true });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ name: string; age: number }>()
            .addValidator("name", sv)
            .addValidator("age", nv);
        ov.validate({
            name: "john",
            age: "20"
        });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({ name: "", age: "" });
    });

    it("should validate object with one string param and one number, uses defaults", () => {
        const sv = new StringValidator({ required: true });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ name: string; age: number }>()
            .addValidator("name", sv)
            .addValidator("age", nv);
        ov.validate({}, { name: "John", age: "20" });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({ name: "", age: "" });
    });

    it("should validate object with one optional string param and one number", () => {
        const sv = new StringValidator({ required: false });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ name: string; age: number }>()
            .addValidator("name", sv)
            .addValidator("age", nv);
        ov.validate({
            age: "20"
        });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({ name: "", age: "" });
    });

    it("should validate object with one optional string param and one number, combines with defaults", () => {
        const sv = new StringValidator({ required: true });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ name: string; age: number }>()
            .addValidator("name", sv)
            .addValidator("age", nv);
        ov.validate({
            age: "20"
        }, {
            name: "John",
            age: "33"
        });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({ name: "", age: "" });
    });

    it("should validate object with one string param and one number [ERROR]", () => {
        const sv = new StringValidator({ required: true });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ name: string; age: number }>()
            .addValidator("name", sv)
            .addValidator("age", nv);
        ov.validate({
            name: "john",
            age: "xsac"
        });
        expect(ov.valid).toEqual(false);
        expect(ov.err).toEqual({ name: "", age: "invalid_format" });
    });

    it("should validate object with one string param and one number [ERROR]", () => {
        const sv = new StringValidator({ required: true });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ name: string; age: number }>()
            .addValidator("name", sv)
            .addValidator("age", nv);
        ov.validate({});
        expect(ov.valid).toEqual(false);
        expect(ov.err).toEqual({ name: "required", age: "required" });
    });

    // deep

    it("should validate deep object", () => {
        const sv = new StringValidator({ required: true });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ id: string; created: number; user: { name: string; } }>()
            .addValidator("id", sv)
            .addValidator("created", nv)
            .addValidator("user", new ObjectValidator()
                .addValidator("name", sv));
        ov.validate({
            id: "87990-fds907a-c9s88v768-asf8989",
            created: "32589090",
            user: {
                name: "John"
            }
        });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({ id: "", created: "", user: { name: "" } });
    });

    it("should validate deep object, with empty object [ERROR]", () => {
        const sv = new StringValidator({ required: true });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ id: string; created: number; user: { name: string; } }>()
            .addValidator("id", sv)
            .addValidator("created", nv)
            .addValidator("user", new ObjectValidator()
                .addValidator("name", sv));
        ov.validate({
            id: "87990-fds907a-c9s88v768-asf8989",
            created: "32589090",
            user: { }
        });
        expect(ov.valid).toEqual(false);
        expect(ov.err).toEqual({ id: "", created: "", user: { name: "required" } });
    });

    it("should validate deep object, with non-existing object [ERROR]", () => {
        const sv = new StringValidator({ required: true });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ id: string; created: number; user: { name: string; } }>()
            .addValidator("id", sv)
            .addValidator("created", nv)
            .addValidator("user", new ObjectValidator()
                .addValidator("name", sv));
        ov.validate({
            id: "87990-fds907a-c9s88v768-asf8989",
            created: "32589090"
        });
        expect(ov.valid).toEqual(false);
        expect(ov.err).toEqual({ id: "", created: "", user: { name: "required" } });
    });

    it("should validate deep object, with defaults", () => {
        const sv = new StringValidator({ required: true });
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ id: string; created: number; user: { name: string; } }>()
            .addValidator("id", sv)
            .addValidator("created", nv)
            .addValidator("user", new ObjectValidator()
                .addValidator("name", sv));
        ov.validate({
            id: "87990-fds907a-c9s88v768-asf8989",
        }, {
            id: "78gdc-gds2034-99scfg710-dee0001",
            created: "3825832692",
            user: {
                name: "Kyle"
            }
        });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({ id: "", created: "", user: { name: "" } });
    });

    // multiple deep objects

    it("should validate multiple deep objects", () => {
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ user1: { id: number; }; user2: { id: number; } }>()
            .addValidator("user1", new ObjectValidator()
                .addValidator("id", nv))
            .addValidator("user2", new ObjectValidator()
                .addValidator("id", nv));
        ov.validate({
            user1: { id: "5690901" },
            user2: { id: "3920423" }
        });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({ user1: { id: ""}, user2: { id: "" } });
    });

    it("should validate multiple deep objects, [ERROR]", () => {
        const nv = new NumberValidator({ required: true });
        const ov = new ObjectValidator<{ user1: { id: number; }; user2: { id: number; } }>()
            .addValidator("user1", new ObjectValidator()
                .addValidator("id", nv))
            .addValidator("user2", new ObjectValidator()
                .addValidator("id", nv));
        ov.validate({
            user1: { }
        });
        expect(ov.valid).toEqual(false);
        expect(ov.err).toEqual({ user1: { id: "required" }, user2: { id: "required" } });
    });

    it("should validate deep objects while adding validators to constructor", () => {
        const nv = new NumberValidator({ required: true });
        const sv = new StringValidator({ required: true });
        const ov = new ObjectValidator<{ name: string; profile: { email: string; created: number; } }>({
            profile: new ObjectValidator<{ email: string; created: number}>({
                email: sv,
                created: nv
            })
        }).addValidator("name", sv);
        ov.validate({
            name: "John",
            profile: {
                created: "3214125",
                email: "john.doe@testmail.com"
            }
        });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({
            name: "",
            profile: {
                created: "",
                email: ""
            }
        });
    });

    // extensive tests

    it("should validate deep object with multiple ObjectValidators", () => {
        type UserModel = {
            id: string;
            created: number;
            profile: {
                id: string;
                email: string;
                github: {
                    name: string;
                    email: string;
                };
            };
            tokens: {
                refresh: string;
                access: string;
            };
        };
        const nv = new NumberValidator({ required: true });
        const sv = new StringValidator({ required: true });
        const ov = new ObjectValidator<UserModel>()
            .addValidator("id", sv)
            .addValidator("created", nv)
            .addValidator("profile", new ObjectValidator<UserModel["profile"]>()
                .addValidator("id", sv)
                .addValidator("email", sv)
                .addValidator("github", new ObjectValidator<UserModel["profile"]["github"]>()
                    .addValidator("name", sv)
                    .addValidator("email", sv)))
            .addValidator("tokens", new ObjectValidator<UserModel["tokens"]>()
                .addValidator("refresh", sv)
                .addValidator("access", sv));
        ov.validate({
            id: "324743-543990-64300",
            created: "438690000",
            profile: {
                id: "985449-4298535-00011",
                email: "john.doe@mai.com",
                github: {
                    name: "johndoe",
                    email: "john.doe@gmail.com"
                },
            },
            tokens: {
                refresh: "g8a9df8h72092tg32422",
                access: "8fa9g7db0a7bg08n70gz"
            }
        });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({
            id: "",
            created: "",
            profile: {
                email: "",
                id: "",
                github: {
                    email: "",
                    name: ""
                }
            },
            tokens: {
                access: "",
                refresh: ""
            }
         });
    });

    it("should validate deep object with multiple ObjectValidators, [ERROR]", () => {
        type UserModel = {
            id: string;
            created: number;
            profile: {
                id: string;
                email: string;
                github: {
                    name: string;
                    email: string;
                };
            };
            tokens: {
                refresh: string;
                access: string;
            };
        };
        const nv = new NumberValidator({ required: true });
        const sv = new StringValidator({ required: true });
        const ov = new ObjectValidator<UserModel>()
            .addValidator("id", sv)
            .addValidator("created", nv)
            .addValidator("profile", new ObjectValidator<UserModel["profile"]>()
                .addValidator("id", sv)
                .addValidator("email", sv)
                .addValidator("github", new ObjectValidator<UserModel["profile"]["github"]>()
                    .addValidator("name", sv)
                    .addValidator("email", sv)))
            .addValidator("tokens", new ObjectValidator<UserModel["tokens"]>()
                .addValidator("refresh", sv)
                .addValidator("access", sv));
        ov.validate({
            id: "324743-543990-64300",
            profile: {
                id: "985449-4298535-00011",
                github: {
                    name: "johndoe",
                },
            },
            tokens: {
                access: "8fa9g7db0a7bg08n70gz"
            }
        });
        expect(ov.valid).toEqual(false);
        expect(ov.err).toEqual({
            id: "",
            created: "required",
            profile: {
                email: "required",
                id: "",
                github: {
                    email: "required",
                    name: ""
                }
            },
            tokens: {
                access: "",
                refresh: "required"
            }
         });
    });

    it("should validate deep object with multiple ObjectValidators with defaults", () => {
        type UserModel = {
            id: string;
            created: number;
            profile: {
                id: string;
                email: string;
                github: {
                    name: string;
                    email: string;
                };
            };
            tokens: {
                refresh: string;
                access: string;
            };
        };
        const nv = new NumberValidator({ required: true });
        const sv = new StringValidator({ required: true });
        const ov = new ObjectValidator<UserModel>()
            .addValidator("id", sv)
            .addValidator("created", nv)
            .addValidator("profile", new ObjectValidator<UserModel["profile"]>()
                .addValidator("id", sv)
                .addValidator("email", sv)
                .addValidator("github", new ObjectValidator<UserModel["profile"]["github"]>()
                    .addValidator("name", sv)
                    .addValidator("email", sv)))
            .addValidator("tokens", new ObjectValidator<UserModel["tokens"]>()
                .addValidator("refresh", sv)
                .addValidator("access", sv));
        ov.validate({
            id: "324743-543990-64300",
            profile: {
                id: "985449-4298535-00011",
                github: {
                    name: "johndoe",
                },
            },
            tokens: {
                access: "8fa9g7db0a7bg08n70gz"
            }}, {
                id: "943690-2128492-120913",
                created: "2498529001",
                profile: {
                    id: "23124124-543916-23190412",
                    email: "luke.skywalker@starwars.com",
                    github: {
                        name: "luke",
                        email: "luke.skywaler@darkhero.com"
                    },
                },
                tokens: {
                    access: "none",
                    refresh: "e12903905901354350"
                }
            });
        expect(ov.valid).toEqual(true);
        expect(ov.err).toEqual({
            id: "",
            created: "",
            profile: {
                email: "",
                id: "",
                github: {
                    email: "",
                    name: ""
                }
            },
            tokens: {
                access: "",
                refresh: ""
            }
         });
    });

});
