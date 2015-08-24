import debug from "debug";

// Weird Babel bug, won't translate `export debug` to this.
exports.Debug = debug;

const DEBUG = true;

// To turn off logs, comment out the below line
// debug.enable("*");

// Enable request's debug mode
// request.debug = true;

/**
 * Tells the programmer that you cannot call
 * this method because it is abstact and needs
 * to be implemented by the subclasser. Programmer 
 * error, should not make it to production.
 * 
 * @param  {String} className  - The name of the class.
 * @param  {String} methodName - The method name.
 */
export function abstract(className, methodName) {
    throw new Error(`Abstract method "${methodName}" on the class ${className} needs to be implemented, not called directly.`);
}

/**
 * Notify the programmer that a method has been deprecated. 
 * Programmer error but okay if it makes it to production.
 * 
 * @param  {String} className  - The name of the class.
 * @param  {String} methodName - The method name.
 * @param  {String} reason     - The reason for the deprecation.
 */
export function deprecated(className, methodName, reason) {
    if(DEBUG) console.warn("%s#%s has been deprecated: %s", className, methodName, reason);
}

/**
 * Tell the programmer that this method has not yet been implemented.
 * Should not make it to production.
 *     
 * @param  {String} className  - The name of the class.
 * @param  {String} methodName - The method name.
 */
export function notYetImplemented(className, methodName) {
    if(DEBUG) throw new Error(`The method ${className}:${methodName} has not yet been implemented.`);
}

/**
 * Assert a condition. Programmer error, should not make
 * it to production.
 * 
 * @param  {*} condition - Truthy value.
 * @param  {String} message - A voilation reason.   
 */
export function invariant(condition, message) {
    if(!condition()) throw new Error("Invariant voilation: " + message);
}