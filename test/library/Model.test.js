import assert from "assert";
import Model from "../../src/library/Model";

describe("Model", () => {
    describe("constructor", () => {
        var model = {
            foo: String,
            bar: [Number, Model.required],
            goose: String
        };

        it("should throw errors if required fields are missing", () => {
            assert.throws(() => { new Model(model, { foo: 1 }); }, /Required field "bar"/);
        });

        it("should coerce the type supplied", () => {
            var b = new Model(model, {
                foo: "root",
                bar: "1",
                goose: 2
            });

            assert.equal(b.foo, "root");
            assert.equal(b.bar, 1);
            assert.equal(b.goose, "2");
        });

        it("should coerce the types if the constructor passed in is not an instance of Model", () => {
            var d = new Model({
                a: [parseInt, Model.callable],
                b: [parseInt, Model.required | Model.callable]
            }, {
                a: "1",
                b: "2"
            });

            assert.equal(d.a, 1); 
            assert.equal(d.b, 2); 
        });

        it("should coerce types in an array", () => {
            var d = new Model({
                a: [parseInt, Model.callable]
            }, {
                a: ["1", "2", "3"]
            });

            assert.deepEqual([1, 2, 3], d.a);
        });
    });

    describe(".getFieldOptions", () => {
        it("should not pick out any options from 0", () => {
            assert.deepEqual(Model.getFieldOptions(0), {
                required: false,
                fn: false
            });
        });

        it("should pick out options", () => {
            assert.deepEqual(Model.getFieldOptions(Model.required), {
                required: true,
                fn: false
            });
        });
    });
});