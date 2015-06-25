import moment from "moment";
import TeamworkCLI from "../TeamworkCLI";
import Person from "./Person";
import Task from "./Task";
import Project from "./Project";

export default class Log {
    constructor(data) {
        this.minutes = parseInt(data.minutes);
        this.hours = parseInt(data.hours);
        this.duration = moment.duration(this.minutes, "m").add(moment.duration(this.hours, "h"));
        this.description = data.description;
        this.date = moment(data.date);
        this.isBilled = data.isBilled;

        this.author = new Person({
            firstName: data["person-first-name"],
            lastName: data["person-last-name"],
            id: data["person-id"]
        });

        this.task = new Task({
            id: parseInt(data["todo-item-id"]),
            name: data["todo-item-name"]
        });

        // TODO: Normalize all model creations instead of using API names
        this.project = new Project({
            name: data["project-name"],
            id: data["project-id"]
        })
    }

    toListItem() {
        return `${TeamworkCLI.color.green(this.author.getNameInitialed())} logged ${TeamworkCLI.color.magenta(this.duration.humanize())} ${this.date.calendar()}.\n > ${this.description}` 
    }
}