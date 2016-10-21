import * as format from "../format";

export function scope(scope) {
    return format.color.yellow(`${format.getScopeType(scope).toLowerCase()} ${scope.title}`);
}

export function highlight(text) {
    return format.color.bgBlack(format.color.highlight(text));
}