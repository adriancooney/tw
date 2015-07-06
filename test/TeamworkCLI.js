import TeamworkCLI from "../src/TeamworkCLI";
import { Person } from "../src/model";

describe("TeamworkCLI", () => {
    before(() => TeamworkCLI.config.set({
        user: new Person({
            id: 1234,
            firstName: "Adrian",
            lastName: "Teamwork"
        });
    }));

    describe(".expandCommitMessage(message)", () => {
        it("should expand commit message", () => {
            return TeamworkCLI.processCommitMessage("Log 2h to #212412").then((message) => {
                console.log(message);
            });
        });
    });
});