import Promise from "bluebird";
import { Debug } from "./library/Debug"

const debug = Debug("teamwork:api");

export default class TeamworkAPI {
    /**
     * Make an unauthenticated request to the Teamwork API.
     * @return {Promise} -> {Response}
     */
    static request(method, url, data) {
        debug("%s %s %j", method, url, data);
        return new Promise((resolve, reject) => {
            resolve();
        })
    }

    /**
     * Make an authorized request to the Teamwork API.
     * @return {Promise} -> {Response}
     */
    request() {

    }

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
}