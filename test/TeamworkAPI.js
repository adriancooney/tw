import assert from "assert";
import moment from "moment";
import TeamworkAPI, { HTTPError } from "../src/TeamworkAPI";
import config from "./config.json";

import {
    Log,
    Task,
    Person,
    Project,
    Tasklist,
    Installation
} from "../src/model";

describe("TeamworkAPI", () => {
    describe("Authentication", () => {
        var authKey;

        describe(".login(email, password, installation)", () => {
            it("should login to the API successfully", () => {
                return TeamworkAPI.login(config.email, config.password, config.installation).then((api) => {
                    assert(api instanceof TeamworkAPI, "Object returned from .login is not an instanceof TeamworkAPI.");
                    assert(api.auth, "TeamworkAPI instance does not have an auth key.");
                    assert(api.installation, "TeamworkAPI instance does not have an installation.");

                    // Save the auth key for usage with loginWithAuth
                    authKey = api.auth;
                });
            });

            it("should not login to the API with dodgy credentials", (done) => {
                return TeamworkAPI.login("foo", "bar", "chattest.teamwork.com").then(() => {
                    done(new Error("Successfully logged in with bad credentials. Wut."));
                }).catch((err) => {
                    assert(err instanceof HTTPError, "Login failure error is not instance of LoginError");
                    assert.equal(err.code, 401);
                    done();
                });
            });
        });

        describe(".loginWithAuth(auth, installation)", () => {
            it("should successfully login with an auth key", () => {
                return TeamworkAPI.loginWithAuth(authKey, config.installation).then((api) => {
                    assert(api instanceof TeamworkAPI, "Object returned from .loginWithAuth is not an instanceof TeamworkAPI.");
                    assert(api.auth, "TeamworkAPI instance does not have an auth key.");
                    assert(api.installation, "TeamworkAPI instance does not have an installation.");
                });
            });

            it("should not login with a dodgy API key", (done) => {
                return TeamworkAPI.loginWithAuth("foobar", config.installation).then((api) => {
                    done(new Error("Successfully logged in with bad API key."));
                }).catch((err) => {
                    done();
                });
            });
        });
    });

    describe("User API", () => {
        describe(".getAccounts(email, password)", () => {
            it("should get accounts for an email and password", () => {
                return TeamworkAPI.getAccounts(config.email, config.password).then((installations) => {
                    assert(installations.every((installation) => { return installation instanceof Installation; }));
                });
            });
        });
    });

    describe.only("Projects", () => {
        var api, data = {};

        before(() => {
            return TeamworkAPI.login(config.email, config.password, config.installation).then((_api) => {
                api = _api;
            });
        });

        describe("#getProfile()", () => {
            it("should correctly get a user's profile", () => {
                return api.getProfile().then((user) => {
                    data.user = user;
                    assert(user instanceof Person);
                });
            });
        });

        describe("#getProjects()", () => {
            it("should get projects for an installation", () => {
                return api.getProjects().then((projects) => {
                    data.projects = projects;
                    assert(projects.every((project) => { return project instanceof Project; }));
                });
            });
        });

        describe("#getTasklists(project)", () => {
            it("should get tasklists for a project", () => {
                return api.getTasklists(data.projects[0]).then((tasklists) => {
                    data.tasklists = tasklists;
                    assert(tasklists.every((tasklist) => { return tasklist instanceof Tasklist; }));
                });
            });
        });

        describe("#getTasks(scope)", () => {
            it("should get tasks with a tasklist", () => {
                return api.getTasks(data.tasklists[0]).then((tasks) => {
                    data.tasks = tasks;
                    assert(tasks.every((task) => { return task instanceof Task; }));
                });
            });
        });

        describe("#getTaskByID(taskID)", () => {
            it("should ge a task by ID", () => {
                return api.getTaskByID(data.tasks[0].id).then((task) => {
                    assert(task instanceof Task);
                });
            });
        });

        describe("#getLogs(task)", () => {
            it("should get logs for a task", () => {
                return api.getLogs(data.tasks[0]).then((logs) => {
                    assert(logs.every((log) => { return log instanceof Log; }));
                });
            });
        });

        describe("#log(scope, user, log)", () => {
            it("should log time to a task", () => {
                var duration = moment.duration(30, "m"),
                    offset = moment().subtract(duration);

                return api.log(data.tasks[0], data.user, Log.create(duration, offset, "foo")).then(() => {

                });
            });
        });
    });
});