import assert from "assert";
import Teamwork from "../src/Teamwork";
import Task from "../src/model/Task";

describe("Teamwork", () => {
    describe(".parse('duration', content)", () => {
        it("should parse the duration", () => {
            var duration = Teamwork.parse("duration", "2h30m");

            assert(typeof duration === "object");
            assert.equal(duration.hours, 2);
            assert.equal(duration.minutes, 30);
        });

        it("should throw an error for an invalid duration", () => {
            assert.throws(() => {
                Teamwork.parse("duration", "20t80f");
            }, /Invalid duration/);
        });
    });

    describe(".parse('installation', content)", () => {
        it("should parse the installation", () => {
            assert.equal(Teamwork.parse("installation", "chattest.teamwork.com"), "chattest.teamwork.com", "Host");
            assert.equal(Teamwork.parse("installation", "chattest.teamwork.com/"), "chattest.teamwork.com", "Host with trailing slash");
            assert.equal(Teamwork.parse("installation", "http://chattest.teamwork.com/"), "chattest.teamwork.com", "Host with trailing slash and http");
            assert.equal(Teamwork.parse("installation", "https://chattest.teamwork.com/"), "chattest.teamwork.com", "Host with trailing slash and https");
            assert.equal(Teamwork.parse("installation", "https://chattest.teamwork.com/foo/bar"), "chattest.teamwork.com", "Host with trailing slash, https and path");
        });

        it("should throw an error for an invalid installation", () => {
            assert.throws(() => {
                Teamwork.parse("installation", "goobar.lol.com");
            }, /Invalid installation/);
        });
    });

    describe(".parse('task', content)", () => {
        it("should parse the task", () => {
            assert.equal(Teamwork.parse("task", "#124124"), 124124, "ID");
            assert.equal(Teamwork.parse("task", "chattest.teamwork.com/tasks/124124"), 124124, "URL");
            assert.equal(Teamwork.parse("task", "http://chattest.teamwork.com/tasks/124124"), 124124, "URL");
            assert.equal(Teamwork.parse("task", "https://chattest.teamwork.com/tasks/124124"), 124124, "URL");
        });

        it("should throw an error for an invalid task", () => {
            assert.throws(() => {
                Teamwork.parse("task", "#abcd");
            }, /Invalid task/);
        });
    });

    describe(".parse('progress', content)", () => {
        it("should parse the progress", () => {
            var progress = Teamwork.parse("progress", "30%");

            assert(typeof progress === "object");
            assert(!progress.relative);
            assert.equal(progress.percent, 30);

            progress = Teamwork.parse("progress", "-100%");

            assert(progress.relative);
            assert.equal(progress.percent, -100);

            progress = Teamwork.parse("progress", "+5%");

            assert(progress.relative);
            assert.equal(progress.percent, 5);
        });

        it("should throw an error for an invalid progress", () => {
            assert.throws(() => {
                Teamwork.parse("progress", "-ee%");
            }, /Invalid progress/);
        });
    });
});