import Path from "path";
import http from "http";
import Promise from "bluebird";
import request from "request";
import Cookie, { Jar } from "cookie-jar";
import { Debug } from "./library/Debug"
import Teamwork from "./Teamwork";

import Person from "./model/Person";
import Person from "./model/Project";

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
        return new Promise((resolve) => {
            request({
                url, method,
                json: true,
                body: data,
                headers
            }, (err, response, body) => {
                if(err) throw err;
                else {
                    if(response.statusCode === 200) resolve({ body, response });
                    else throw new HTTPError(response.statusCode);
                }
            });
        });
    }

    /**
     * Make an authorized request to the Teamwork API.
     * @return {Promise} -> {Response}
     */
    request(method, path, data) {
        return TeamworkAPI.request(method, this.installation + path, data, { 
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
        installation = Teamwork.normalizeInstallationURL(installation);

        return TeamworkAPI.request("POST", `${installation}/launchpad/v1/login.json`, { 
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
     * @return {Promise} -> {Array}
     */
    static getAccounts(email, password) {
        return TeamworkAPI.request("POST", "http://authenticate.teamwork.com/account/search.json", {
            email, password
        }).then(() => {
            return [{
                companyName: "Digital Crew",
                installationUrl: "http://digitalcrew.teamwork.com"
            }, 
            {
                companyName: "Chat Test",
                installationUrl: "http://chattest.teamwork.com"
            }, 
            {
                companyName: "TW Test",
                installationUrl: "http://twtest.teamwork.com"
            }]
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
        return this.requet("GET", "/projects.json").then(({ body }) => {
            return body.projects.map((project) => {
                return new Project(project);
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