import TeamworkCLI from "../src/TeamworkCLI";

const EXAMPLE_COMMIT_MSG = 
`Log 2h to #2594400. Close https://chattest.teamwork.com/tasks/2298784. Other task #2298784.

# Please enter the commit message for your changes. Lines starting
# with '#' will be ignored, and an empty message aborts the commit.
# On branch master
# Your branch is up-to-date with 'origin/master'.
#
# Changes to be committed:
#   modified:   src/TeamworkCLI.js
#   modified:   src/hooks/commit-msg
#
# Untracked files:
#   test/TeamworkCLI.js
#
`

describe("TeamworkCLI", () => {
    describe(".expandCommitMessage(message)", () => {
        it("should expand commit message", () => {
            return TeamworkCLI.expandCommitMessage(EXAMPLE_COMMIT_MSG).then((message) => {
                console.log(message);
            });
        });
    });
});