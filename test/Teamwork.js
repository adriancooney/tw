import assert from "assert";
import Teamwork from "../src/Teamwork";

describe("Teamwork", () => {
    describe(".parseCommit", () => {
        it("should parse commit messages and extract the correct intentions", () => {
            var intentions = Teamwork.parseCommit("foo bar, Log 2h to #4124124");

            assert(Array.isArray(intentions));
            assert.equal(intentions[0].action, "log");
            assert.equal(intentions[0].data.duration, "2h");
            assert.equal(intentions[0].data.task, "4124124");

            intentions = Teamwork.parseCommit("foo bar, close #4124124");

            assert.equal(intentions[0].action, "close");
            assert.equal(intentions[0].data.task, '4124124');

            intentions = Teamwork.parseCommit("foo bar, log 2h to #124124 and close #124124, foo bar");

            assert.equal(intentions.length, 2);
            assert.equal(intentions[0].action, "log")
            assert.equal(intentions[1].action, "close")
        });
    });
});