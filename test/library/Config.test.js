import assert from "assert";
import Config from "../../src/library/Config";
import Model from "../../src/library/Model";

describe("Config", () => {
    class SampleModel {
        constructor(data) {
            assert(!data.className, "className still present.");
            this.foo = data.foo;
            this.bar = data.bar;
        }
    }

    class ExampleModel {
        constructor({ root, items, boot }) {
            assert(items.every((item) => { return item instanceof SampleModel; }));
            this.root = root;
            this.items  = items;
            this.boof = "foobar";
            this.boot = boot;
        }
    }

    class Foobar {}

    var config, example, packed;

    describe("#constructor", () => {
        it("should correctly register the types correctly", () => {
            config = new Config({ SampleModel, ExampleModel, 
                "Foobar": {
                    serialize(object) {
                        assert(object instanceof Foobar)
                        return { foo: "bar" }
                    },

                    deserialize(object) {
                        return new Foobar();
                    }
                } 
            });

            assert.equal(config.types.SampleModel, SampleModel);
            assert.equal(config.types.ExampleModel, ExampleModel);
        });
    });
        
    describe("#pack", () => {
        it("should correctly pack an instance", () => {
            example = new ExampleModel({
                root: new SampleModel({
                    foo: 1,
                    bar: 2
                }),

                items: [new SampleModel({
                    foo: 1,
                    bar: 2
                }), new SampleModel({
                    foo: 1,
                    bar: 2
                })],

                boot: new Foobar()
            });

            packed = config.pack(example);

            assert.deepEqual(packed, {
                root: {
                    foo: 1,
                    bar: 2,
                    className: "SampleModel"
                },

                items: [{
                    className: "SampleModel",
                    foo: 1,
                    bar: 2
                }, {
                    className: "SampleModel",
                    foo: 1,
                    bar: 2
                }],

                className: "ExampleModel",
                boof: "foobar",
                boot: {
                    serialized: { foo: "bar" },
                    className: "Foobar"
                }
            })
        });
    });

    describe("#unpack", () => {
        it("should unpack a packed config", () => {
            var unpacked = config.unpack(packed);

            assert.deepEqual(unpacked, example);
        });
    });

    describe("Serializing and deserializing built-in types", () => {
        it("should serialize and deserialize regex correctly", () => {
            var unpacked = config.unpack(config.pack({
                foo: /12345/,
                bar: /12456/g
            }));

            assert(unpacked.foo instanceof RegExp);
            assert(unpacked.bar instanceof RegExp);
        });

        it("should serialize and deserialize date correctly", () => {
            var d = new Date()
            var unpacked = config.unpack(config.pack({
                foo: d
            }));

            assert(unpacked.foo instanceof Date);
            assert.equal(unpacked.foo.toJSON(), d.toJSON());
        });
    });
});