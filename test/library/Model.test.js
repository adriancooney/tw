import assert from "assert";
import Model from "../../src/library/Model";

describe("Model", () => {
    describe("constructor", () => {
        var model = {
            foo: true,
            bar: false,
            goose: String,
            duck: [false, String],
            bat: [true, String]
        };

        it("should throw errors if required fields are missing", () => {
            assert.throws(() => { new Model(model, {}); }, /Required field "foo"/);
            assert.throws(() => { new Model(model, { foo: 1 }); }, /Required field "bat"/);
        });

        it("should call the functions supplied", () => {
            var b = new Model(model, {
                foo: 1,
                bat: 2,
                goose: 3
            });

            assert.equal(b.foo, 1);
            assert.equal(b.bat, "2");
            assert.equal(b.goose, "3");
        });

        it("should save the model descriptor", () => {
            var d = new Model(model, { foo: 1, bat: 2 });
        });

        it("should coerce the types if the constructor passed in is not an instance of Model", () => {
            var d = new Model({
                a: parseInt,
                b: [true, parseInt]
            }, {
                a: "1",
                b: "2"
            });

            assert.equal(d.a, 1); 
            assert.equal(d.b, 2); 
        });

        it("should coerce types in an array", () => {
            var d = new Model({
                a: parseInt
            }, {
                a: ["1", "2", "3"]
            });

            assert.deepEqual([1, 2, 3], d.a);
        });
    });
});