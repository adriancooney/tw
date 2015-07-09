import moment from "moment";

export default class Cache {
    constructor(lifespan, host) {
        this.cache = host || {};
        if(lifespan) {
            this.lifespan = lifespan;
    }

    cache(hash, data) {
        this.cache[hash] = {
            timestamp: moment(),
            data
        };
    }

    cached(hash) {
        var hit = this.cache[hit];

        if(hit) {
            if(lifespan) {
                if()
            } else return hit.data;
        } else return null;
    }

    invalidate(hash) {
        delete this.cache[hash];
    }
}