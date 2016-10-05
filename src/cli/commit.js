import moment from "moment";

/**
 * Expand tasks IDs with title in a commit message.
 * @param  {String} message Commit message.
 * @return {Promise} -> {String}
 */
export function expandCommitMessage(message) {
    var tasks = [];

    // Find all the task ID's or URL
    message = message.replace(/\#(\d+)|(?:https?:\/\/)?\w+\.teamwork\.com\/tasks\/(\d+)(?:\.json)?/g, (match, id1, id2) => {
        var id = parseInt(id1 || id2, 10);
        tasks.push(id);
        return "#" + id;
    });

    // Remove any duplicates
    tasks = tasks.reduce((flattened, id) => {
        if(flattened.indexOf(id) === -1) flattened.push(id);
        return flattened;
    }, []);

    if(tasks.length) {
        return TeamworkCLI.getAPI().then((api) => {
            // Get all the tasks
            return Promise.map(tasks, api.getTaskByID.bind(api), { concurrency: 1 });
        }).catch((err) => {
            if(err.code === 404) {
                var installation = TeamworkCLI.getCurrent("installation");
                throw new CLIError(`Task #${err.id} not found in ${installation.print()}.`);
            } else throw err;
        }).then((tasks) => {
            // Generate the task index
            tasks = "\n" + tasks.map((task) => {
                return task.toString() + "\n" + task.getURL();
            }).join("\n\n");

            // Add it to the commit
            var standardCommit = /# Please enter the commit/;

            if(message.match(standardCommit)) message = message.replace(standardCommit, tasks+ "\n\n# Please enter the commit");
            else message += tasks;

            return message;
        });
    } else return Promise.resolve(message);
}

/**
 * Process commit messages and generate actions. See parser/TeamworkParser.pegjs
 *         
 * @param  {String} message Commit message.
 * @return {Promise} -> {Array[Action]}
 */
export function processCommitMessage(message) {
    // This is just the most awesome thing ever. PEGjs, everyone.
    return Promise.try(() => {
        // Parse the actions from the commit message
        var actions = Teamwork.parse("commit", message);

        // Execute them
        if(actions.length) {
            return TeamworkCLI.getAPI().then((api) => {
                return Promise.map(actions, (action) => {
                    switch(action.name) {
                    case "Log": 
                        // Gather all the information required for the action
                        var user = TeamworkCLI.getCurrent("user");

                        // Get the task detail
                        return api.getTaskByID(action.task).then((task) => {
                            var duration = moment.duration(action.duration);

                            // And log to Teamwork
                            return api.log(task, user, Log.create(duration, moment().subtract(duration), message));
                        });
                    }
                });
            });
        }
    });
}