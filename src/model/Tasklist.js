import Project from "./Project";

export default class Tasklist {
    constructor(data) {
        this.name = data.name;
        this.description = data.description;
        this.id = parseInt(data.id);
        this.project = new Project({
            name: data.projectName,
            id: data.projectId
        });
    }    

    toListItem() {
        return `[#${this.id}] ${this.name}\n  ${this.description ? this.description : "No description"}`;
    }
}