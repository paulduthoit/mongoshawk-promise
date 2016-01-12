/**
 * Herits from Object
 */
var SchemaTypeObject = Object;


/**
 * Validate type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeObject.validate = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Check if object
    if(value instanceof SchemaTypeObject) return true;
    if(value instanceof Object) return true;

    // If not object
    return false;

}


/**
 * Module exports
 */
module.exports = SchemaTypeObject;