import Path from "path";
import Promise from "bluebird";
import { Debug } from "./library/Debug"
import Teamwork from "./Teamwork";

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
    static request(method, url, data) {
        debug("%s %s %j", method, url, data);
        return new Promise((resolve, reject) => {
            resolve();
        });
    }

    /**
     * Make an authorized request to the Teamwork API.
     * @return {Promise} -> {Response}
     */
    request(method, path, data) {
        return TeamworkAPI.request(method, Path.join(this.installation, path), data);
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
            email, password 
        }).then((response) => {
            return new TeamworkAPI("example-auth-key", installation);
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
     * @return {Promise} -> {Object}
     */
    getProfile() {
        return this.request("GET", "/profile.json").then(() => {
            return {
                name: "Adrian"
            }
        });
    }
}

export class LoginError extends Error {
    constructor(email) { 
        super(); 
        this.message = `Login failed: Invalid credentials. (${email})`;
    }
}