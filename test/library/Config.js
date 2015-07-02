import assert from "assert";
import Config from "../../src/library/Config";
import Model from "../../src/library/Model";

describe("Config", () => {
    class SampleModel {
        constructor(data) {
            assert.equal(data.foo, 1, "Incorrect data.");
            assert(!data.className, "className still present.");
            this.foo = 1;
            this.bar = 2;
        }
    }

    var config;
    describe("#constructor", () => {
        it("should create an example config", () => {

            config = new Config({
                SampleModel
            }, {
                item: {
                    className: "SampleModel",
                    foo: 1,
                    bar: 2
                }
            });

            assert(config.item instanceof SampleModel, "Instance of model.");
        });
    });

    var serialized;
    describe("toJSON()", () => {
        it("should correctly serialize", () => {
            serialized = config.toJSON();

            assert.equal(config.item.className, "SampleModel");
            assert.equal(config.item.foo, 1)
        });
    });

    describe("reserialization", () => {
        it("should reserialize correctly", () => {
            var newConfig = new Config({
                SampleModel
            }, serialized);

            assert(config.item instanceof SampleModel);
        });
    });
});