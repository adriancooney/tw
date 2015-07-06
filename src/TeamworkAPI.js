import Path from "path";
import http from "http";
import url from "url";
import assert from "assert";
import Promise from "bluebird";
import request from "request";
import Cookie, { Jar } from "cookie-jar";
import { Debug } from "./library/Debug"
import Teamwork from "./Teamwork";

import {
    Log,
    Task,
    User,
    Person,
    Project,
    Tasklist,
    Installation,
} from "./model";

const debug = Debug("tw:api");

export default class TeamworkAPI {
    /**
     * Create an authorized Teamwork API interface.
     * @param  {String} auth The auth key.
     */
    constructor(auth, installation) {
        this.auth = auth;
        this.installation = installation;
        this.actions = [];
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
                    if(response.statusCode >= 200 && response.statusCode < 300) resolve({ body, response, url });
                    else {
                        debug("%s Error %j", response.statusCode, body);
                        reject(new HTTPError(response.statusCode, null, url));
                    }
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
    static login(email, password, installation, api = TeamworkAPI) {
        // Allow passing on Installation object.
        if(typeof installation === "string") installation = Installation.parse(installation);
        else if(!(installation instanceof Installation)) throw new Error("Installation parameter must be a String or an Installation object.");

        return TeamworkAPI.request("POST", `https://${installation.domain}/launchpad/v1/login.json`, { 
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
                return new api(auth, installation);   
            } else throw new HTTPError(500, "Projects API did not return a tw-auth cookie. Something is very wrong. Let me get back to you on this one..");
        });
    }

    /**
     * Login with an auth key.
     * @param  {String} auth         Teamwork Auth key.
     * @param  {String} installation Teamwork installation URL.
     * @return {Promise} -> {TeamworkAPI} Authenticate Teamwork API.
     */
    static loginWithAuth(auth, installation, api = TeamworkAPI) {
        if(typeof installation === "string") installation = Installation.parse(installation);
        else if(!(installation instanceof Installation)) throw new Error("installation parameter must be a String or an Installation object.");

        // Create the installation
        var api = new api(auth, installation);

        // Test the auth key.
        return api.getProfile().catch(HTTPError, (err) => {
            throw new Error(`Unable to authorize with key "${auth}".`);
        }).then(() => {
            debug("Successfully logged in with auth key (%s).", auth);
            return api;
        });
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
            var person = body.person;

            return new Person({
                id: parseInt(person['id']),
                firstName: person['first-name'],
                lastName: person['last-name'],
                username: person['user-name'],
                avatar: person['avatar-url']
            });
        });
    }

    /**
     * Return an array of all projects.
     * @return {Promise} -> {Array[Project]}
     */
    getProjects() {
        return this.request("GET", "/projects.json").then(({ body }) => {
            return body.projects.map((project) => {
                return new Project({
                    id: parseInt(project.id),
                    company: project.company,
                    name: project.name,
                    description: project.description,
                    status: project.status,
                    tags: project.tags,
                    createdAt: project['created-on'],
                    logo: project.logo || null
                });
            });
        });
    }

    /**
     * Get a project by ID.
     * @param  {Number} project Project Id.
     * @return {Promise} -> {Project}
     */
    getProjectByID(project) {
        return this.request("GET", `/projects/${project}.json`).then(({ body, url }) => {
            var project = body.project;
            return new Project({
                id: parseInt(project.id),
                name: project.name,
                domain: this.installation.domain,
                createdAt: project['created-on'],
                status: project.status,
                description: project.description,
                category: {
                    id: parseInt(project.category.id),
                    name: project.name
                },
                company: {
                    id: parseInt(project.company.id),
                    name: project.company.name
                }
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
                return Tasklist.fromAPI(tasklist);
            });
        });
    }

    /**
     * Get a task list by ID.
     * @param  {Number} tasklist Tasklist ID.
     * @return {Promise} -> {Tasklist}
     */
    getTasklistByID(tasklist) {
        return this.request("GET", `/tasklists/${tasklist}.json`).then(({body}) => {
            return new Tasklist.fromAPI(body["todo-list"]);
        });
    }

    /**
     * Get tasks for in a particular scope.
     * @param  {Tasklist|Project} scope Tasklist or project.
     * @return {Promise} -> {Array[Task]}
     */
    getTasks(scope) {
        if(scope instanceof Tasklist) return this.getTasksForTasklist(scope);
        else if(scope instanceof Project) return this.getTasksForProject(scope);
    }

    /**
     * Get tasks for a specific tasklist.
     * @param  {Tasklist} tasklist The tasklist to get the tasks for.
     * @return {Promise} -> {Array[Task]}
     */
    getTasksForTasklist(tasklist) {
        return this.request("GET", `/tasklists/${tasklist.id}/tasks.json`).then(({ body, url }) => {
            return body["todo-items"].map((task) => {
                task.domain = this.installation.domain;
                return Task.fromAPI(task);
            });
        });
    }

    /**
     * Get a task by ID.
     * @param  {Number} task Task ID.
     * @return {Promise} -> {Task}
     */
    getTaskByID(task) {
        return this.request("GET", `/tasks/${task}.json`).then(({ body }) => {
            var task = body["todo-item"];
            task.domain = this.installation.domain;
            return Task.fromAPI(task);
        }).catch(HTTPError, (err) => {
            if(err.code === 404) throw new NotFoundError(`Task #${task} not found.`, task);
            else throw err; // Not ours to handle
        });
    }

    /**
     * Get time logs for a task.
     * @param  {Task} task 
     * @return {Promise} -> {Array[Log]}
     */
    getLogs(task) {
        return this.request("GET", `/todo_items/${task.id}/time_entries.json`).then(({ body }) => {
            return (body["time-entries"] || []).map((entry) => {
                return new Log({
                    id: parseInt(entry.id),
                    description: entry.description,
                    date: entry.date,
                    isBilled: !!parseInt(entry.isBillable),
                    minutes: parseInt(entry.minutes),
                    hours: parseInt(entry.hours),
                    author: {
                        id: parseInt(entry["person-id"]),
                        firstName: entry["person-first-name"],
                        lastName: entry["person-last-name"],
                    },
                    project: {
                        id: parseInt(entry["project-id"]),
                        name: entry["project-name"]
                    },
                    tasklist: {
                        id: parseInt(entry["todo-list-id"]),
                        name: entry["todo-list-name"]
                    },
                    task: {
                        id: parseInt(entry["todo-item-id"]),
                        title: entry["todo-item-name"]
                    },
                    company: {
                        id: entry["company-id"],
                        name: entry["company-name"]
                    }
                });
            });
        });
    }

    /**
     * Log time to a scope (project or task).
     * @param  {Project|Task} scope    The project or task to log time to.
     * @param {User} user The user to log the time to.
     * @return {Promise}
     */
    log(scope, user, log) {
        if(scope instanceof Task) return this.logToTask(scope, user, log);
        else if(scope instanceof Project) return this.logToProject(scope, user, log);
    }

    /**
     * Log time to a task.
     * @param  {Task} task    The task to log time to.
     * @param  {User} user The user to log the time to.
     * @param  {Log} log The log to log.
     * @return {Promise}
     */
    logToTask(task, user, log) {
        return this.request("POST", `/tasks/${task.id}/time_entries.json`, {
            "time-entry": {
                description: log.description,
                "person-id": user.id,
                "date": log.date.format("YYYYMMDD"),
                "time": log.date.format("HH:mm"),
                "hours": log.hours,
                "minutes": log.minutes,
                "isBillable": log.isBilled
            }
        }).then(({ body }) => {
            log.id = parseInt(body.timeLogId);

            return log;
        });
    }

    /**
     * Log time to a Project.
     * @param  {Project} task    The task to log time to.
     * @param  {User} user The user to log the time to.
     * @param  {Log} log The log to log.
     * @return {Promise}
     */
    logToProject(project, user, log) {
        return this.request("POST", `/projects/${project.id}/time_entries.json`, {
            "time-entry": {
                description: log.description,
                "person-id": user.id,
                "date": log.date.format("YYYYMMDD"),
                "time": log.date.format("HH:mm"),
                "hours": log.hours,
                "minutes": log.minutes,
                "isBillable": log.isBilled
            }
        }).then(({ body }) => {
            log.id = parseInt(body.timeLogId);

            return log;
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
    constructor(code, message, url) {
        super();

        var statusMessage = http.STATUS_CODES[code];
        this.message = `HTTP Error ${code}: ${message || statusMessage}`
        this.code = this.statusCode = code;
        this.statusMessage = statusMessage;
        this.url = url;
    }
}

export class NotFoundError extends HTTPError {
    constructor(reason, id) {
        super(404);
        this.message = reason;
        this.id = id;
    }
}