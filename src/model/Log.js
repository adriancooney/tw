import moment from "moment";
import Model from "../library/Model";
import Person from "./Person";
import Task from "./Task";
import Tasklist from "./Tasklist";
import Project from "./Project";
import Company from "./Company";

export default class Log extends Model {
    constructor(data) {
        super({
            id: false,
            minutes: true,
            hours: true,
            description: false,
            date: [false, moment],
            isBilled: false,
            author: Person,
            task: Task,
            tasklist: Tasklist,
            project: Project,
            company: Company
        }, data);

        this.duration = data.duration || moment.duration(this.minutes, "m").add(moment.duration(this.hours, "h"));
    }

    toString() {
        return `${this.author.getNameInitialed()} logged ${this.duration.humanize()} ${this.date.calendar()}.\n > ${this.description.split("\n").join("\n > ")}`;
    }

    /**
     * Create a log.
     * @param  {Moment.duration} duration The duration of the timelog.
     * @param  {Moment} offset   The time when the log started.
     * @param  {String} comment  The message to log with.
     * @return {Log}
     */
    static create(duration, offset, user, comment) {
        // It's a pity moment doesn't have a good API for this
        var minutes = duration.asMinutes(),
            hours = Math.floor(minutes / 60);

        minutes = minutes - (hours * 60);

        return new Log({
            duration, minutes, hours,
            date: offset,
            author: user,
            description: comment
        });
    }
}