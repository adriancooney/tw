export default class Company {
    constructor(data) {
        this.name = data.companyname || data.name;
        this.id = parseInt(data.id);
    }
}