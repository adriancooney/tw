import sinon from "sinon";
import { expect } from "chai";
import { Log, Task } from "../../src/model";
import LogCommand from "../../bin/tw-log";
import { execute, api, match, data } from "./";

describe("tw-log", () => {
    it.only("-d 2h -t 42144 -m 'Hello world!'", () => {
        const task = 42144;
        const duration = "2h";
        const message = "Hello world!";

        const mock = sinon.mock(api);

        // GET /tasks/42144.json
        // Get's the item
        mock.expects("getTaskByID")
            .once()
            .withExactArgs(task)
            .resolves(data.task(task));

        // POST /tasks/42144/time_entries.json
        // Log the time.
        const expectation = mock.expects("logToTask")
            .withExactArgs(
                // Ensure task object has the same ID
                sinon.match.has("id", task),

                // Make sure the message is passed and duration is correct
                sinon.match.has("duration")
            ).resolves(data.log(1));

        return execute(LogCommand, {
            duration, task, message
        });
    });
});