import Path from "path";
import http from "http";
import Promise from "bluebird";
import request from "request";
import Cookie, { Jar } from "cookie-jar";
import { Debug } from "./library/Debug"
import Teamwork from "./Teamwork";

import Person from "./model/Person";
import Project from "./model/Project";
import Tasklist from "./model/Tasklist";
import Task from "./model/Task";
import Installation from "./model/Installation";
import Log from "./model/Log";

// TODO: Account for empty results (where array expected)

const debug = Debug("teamwork:api");

export default class TeamworkAPI {
    /**
     * Create an authorized Teamwork API interface.
     * @param  {String} auth The auth key.
     */
    constructor(auth, installation) {
        this.auth = auth;
        this.installation = installation;
    }

    /**
     * Make an unauthenticated request to the Teamwork API.
     * @return {Promise} -> {Response}
     */
    static request(method, url, data, { headers } = {}) {
        debug("%s %s %j", method, url, data);
        return new Promise((resolve, reject) => {
            request({
                url, method,
                json: true,
                body: data,
                headers
            }, (err, response, body) => {
                if(err) throw err;
                else {
                    if(response.statusCode >= 200 && response.statusCode < 300) resolve({ body, response });
                    else reject(new HTTPError(response.statusCode));
                }
            });
        });
    }

    /**
     * Make an authorized request to the Teamwork API.
     * @return {Promise} -> {Response}
     */
    request(method, path, data) {
        return TeamworkAPI.request(method, `http://${this.installation.domain}${path}`, data, { 
            headers: {
                "Cookie": `tw-auth=${this.auth}`
            }
        });
    }

    /**
     * Login to an installation with an email and password.
     * @param  {String} email        Teamwork login email.
     * @param  {String} password     Teamwork login password.
     * @param  {String} installation Teamwork installation URL.
     * @return {Promise} -> {TeamworkAPI} Authenticated Teamwork API.
     */
    static login(email, password, installation) {
        return TeamworkAPI.request("POST", `http://${installation.domain}/launchpad/v1/login.json`, { 
            username: email, // TODO: Ask projects why this is like this
            password 
        }).then(({ response }) => {
            // Find the tw-auth cookie
            var authCookie = response.headers['set-cookie'].find((cookie) => {
                if(cookie.match(/tw-auth/)) return true
                else return false;
            });

            if(authCookie) {
                var auth = authCookie.match(/tw-auth=([a-zA-Z0-9\-]+)/)[1];

                debug("Successfully logged in Teamwork API on %s (%s).", installation, auth);
                return new TeamworkAPI(auth, installation);   
            } else throw new Error("Projects API did not return a tw-auth cookie. Something is very wrong. Let me get back to you on this one..");
        });
    }

    /**
     * Login with an auth key.
     * @param  {String} auth         Teamwork Auth key.
     * @param  {String} installation Teamwork installation URL.
     * @return {Promise} -> {TeamworkAPI} Authenticate Teamwork API.
     */
    static loginWithAuth(auth, installation) {
        // TODO: Test if auth key works.
        return Promise.resolve(new TeamworkAPI(auth, installation));
    }

    /**
     * Get accounts for an email and password.
     * @param  {String} email    Teamwork login email.
     * @param  {String} password Teamwork login password.
     * @return {Promise} -> {Array[Installations]}
     */
    static getAccounts(email, password) {
        return TeamworkAPI.request("POST", "http://authenticate.teamwork.com/accounts/search.json", {
            email, password
        }).then(({ body }) => {
            return body.accounts.map((account) => {
                return new Installation(account);
            });
        });
    }

    /**
     * Get the current logged in users profile.
     * @return {Promise} -> {Person}
     */
    getProfile() {
        return this.request("GET", "/me.json").then(({ body }) => {
            return new Person(body.person);
        });
    }

    /**
     * Return an array of all projects.
     * @return {Promise} -> {Array[Project]}
     */
    getProjects() {
        return this.request("GET", "/projects.json").then(({ body }) => {
            return body.projects.map((project) => {
                return new Project(project);
            });
        });
    }

    /**
     * Get an array of taskslist from a project.
     * @param  {Project} project 
     * @return {Promise} -> {Array[Tasklist]}
     */
    getTasklists(project) {
        return this.request("GET", `/projects/${project.id}/tasklists.json`).then(({ body }) => {
            return body.tasklists.map((tasklist) => {
                return new Tasklist(tasklist);
            });
        });
    }

    /**
     * Get tasks for in a particular scope.
     * @param  {Tasklist|Project} scope Tasklist or project.
     * @return {Promise} -> {Array[Task]}
     */
    getTasks(scope) {
        if(scope instanceof Tasklist) return this.getTasksForTasklist(scope);
    }

    /**
     * Get a task by ID.
     * @param  {Number} task Task ID.
     * @return {Promise} -> {Task}
     */
    getTaskByID(task) {
        return this.request("GET", `/tasks/${task}.json`).then(({ body }) => {
            return new Task(body["todo-item"]);
        })
    }

    /**
     * Get tasks for a specific tasklist.
     * @param  {Tasklist} tasklist The tasklist to get the tasks for.
     * @return {Promise} -> {Array[Task]}
     */
    getTasksForTasklist(tasklist) {
        return this.request("GET", `/tasklists/${tasklist.id}/tasks.json`).then(({ body }) => {
            return body["todo-items"].map((task) => {
                return new Task(task);
            });
        });
    }

    /**
     * Log time to a scope (project or task).
     * @param  {Project|Task} scope    The project or task to log time to.
     * @param {User} user The user to log the time to.
     * @param  {Moment.duration} duration The duration of the timelog.
     * @param  {Moment} offset   The time when the log started.
     * @param  {String} comment  The message to log with.
     * @return {Promise}
     */
    log(scope, user, duration, offset, comment) {
        if(scope instanceof Task) return this.logToTask(scope, user, duration, offset, comment);
    }

    /**
     * Log time to a task.
     * @param  {Task} task    The task to log time to.
     * @param {User} user The user to log the time to.
     * @param  {Moment.duration} duration The duration of the timelog.
     * @param  {Moment} offset   The time when the log started.
     * @param  {String} comment  The message to log with.
     * @return {Promise}
     */
    logToTask(task, user, duration, offset, comment) {
        // It's a pity moment doesn't have a good API for this
        var minutes = duration.asMinutes(),
            hours = Math.floor(minutes / 60);

        minutes = minutes - (hours * 60);

        return this.request("POST", `/tasks/${task.id}/time_entries.json`, {
            "time-entry": {
                description: comment || "",
                "person-id": user.id,
                "date": offset.format("YYYYMMDD"),
                "time": offset.format("HH:mm"),
                "hours": hours,
                "minutes": minutes,
                "isBillable": false
            }
        });
    }

    /**
     * Get time logs for a task.
     * @param  {Task} task 
     * @return {Promise} -> {Array[Log]}
     */
    getLogs(task) {
        return this.request("GET", `/todo_items/${task.id}/time_entries.json`).then(({body}) => {
            return (body["time-entries"] || []).map((entry) => {
                return new Log(entry);
            });
        });
    }

    /**
     * Convert the API to a JSON object.
     * @return {Object} 
     */
    toJSON() {
        return {
            auth: this.auth,
            installation: this.installation
        }
    }
}

export class HTTPError extends Error {
    constructor(code, message) {
        super();

        var statusMessage = http.STATUS_CODES[code];
        this.message = `HTTP Error ${code}: ${message || statusMessage}`
        this.code = this.statusCode = code;
        this.statusMessage = statusMessage;
    }
}

export class LoginError extends HTTPError {
    constructor(email) { 
        super(401); 
        this.message = `Login failed: Invalid credentials. (${email})`;
    }
}