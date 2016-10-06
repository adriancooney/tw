import moment from "moment";
import Model from "../library/Model";
import Tag from "./Tag";
import Person from "./Person";
import Company from "./Company";
import Project from "./Project";
import Tasklist from "./Tasklist";

export default class Task extends Model {
    /**
     * Create a new Task.
     * @param  {Object} data 
     *           {Number} :id - ID of the task.
     *           {String} :title  
     *           {String} :description 
     *           {String} :status
     *           {String} :priority 
     *           {Number} :progress 
     *           {Number} :parent - The ID of the parent task.
     *           {Number} :dependencyCount
     *           {Number} :attachmentCount
     *           {Object} :project - See Project#constructor.
     *           {Object} :tasklist - See Tasklist#constructor.
     *           {Object} :author - See Person#constructor.
     *           {Array}  :tags - Array of tags. See Tag#constructor.
     *           {Obejct} :assigned - See Person#constructor.
     */
    constructor(data) {
        super({
            id: [Number, Model.required],
            title: [String, Model.required],
            description: String,
            domain: String,
            status: String,
            priority: String,
            progress: Number,
            completed: Boolean,
            attachmentCount: Number,
            dependencyCount: Number,
            commentCount: Number,
            createdAt: [moment, Model.callable],
            lastChangedAt: [moment, Model.callable],
            hasUnreadComments: Boolean,
            hasReminders: Boolean,
            loggedTime: Number,
            estimatedTime: Number,
            subTasks: Task,
            tasklist: Tasklist,
            project: Project,
            company: Company,
            author: Person,
            tags: Tag,
            assigned: Person
        }, data);
    }

    /**
     * Return the progress string. i.e. "20%"
     * @return {String} 
     */
    getProgress() {
        return `${this.progress}%`;
    }
    /**
     * Convert to Task to a string. 
     * @param  {Boolean} detailed Give a detailed view of the task.
     * @return {String}
     */
    toString(detailed = true) {
        var details = [];
        details.push(this.getProgress());

        if(detailed) {
            if(this.assigned) details.push(this.assigned.getNameInitialed());
            if(this.priority) details.push(this.priority);
        }

        details = details.join(", ");

        return `[#${this.id}] ${this.title} (${details})`;
    }

    /**
     * Create a Task object from the Teamwork API.
     * @param {Object} data Data returned from Teamwork API.
     * @return {Task} 
     */
    static fromAPI(task) {
        var data = {
            id: task.id,
            title: task.content,
            description: task.description,
            domain: task.domain,
            status: task.status,
            priority: task.priority,
            progress: task.progress,
            completed: task.completed,
            attachmentCount: task["attachments-count"],
            dependencyCount: task["has-dependencies"],
            commentCount: task["comments-count"],
            createdAt: task["created-on"],
            lastChangedAt: task["last-changed-on"],
            hasUnreadComments: task["has-unread-comments"],
            hasReminders: task["has-reminders"],
            loggedTime: parseInt(task.timeIsLogged),
            estimatedTime: task["estimated-minutes"],
            tasklist: {
                id: task["todo-list-id"],
                name: task["todo-list-name"]
            },
            project: {
                id: task["project-id"],
                name: task["project-name"]
            },
            company: {
                id: task["company-id"],
                name: task["company-name"]
            },
            author: {
                firstName: task["creator-firstname"],
                lastName: task["creator-lastname"],
                id: task["creator-id"],
                avatar: task["creator-avatar-url"]
            },
            tags: task.tags
        };

        if(task["responsible-party-id"]) {
            data.assigned = {
                id: parseInt(task["responsible-party-id"]),
                firstName: task["responsible-party-firstname"],
                lastName: task["responsible-party-lastname"]
            };
        }

        if(task.subTasks) {
            data.subTasks = task.subTasks.map((subTask) => {
                subTask.domain = task.domain;
                return new Task(Task.fromAPI(subTask));
            });
        }

        // if(task["predecessors"]) {
            // TODO: Predecessors. Ask what's the difference between predecessors and dependencies.
        // }

        return new Task(data);
    }

    /**
     * Return the URL for the task.
     * @return {String} 
     */
    getURL() {
        return `http://${this.domain}/tasks/${this.id}`;
    }
}