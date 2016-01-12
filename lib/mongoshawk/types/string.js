/**
 * Herits from String
 */
var SchemaTypeString = String;


/**
 * Validate type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeString.validate = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Check if string
    if(value instanceof String) return true;
    if(typeof(value) === "string") return true;

    // If not string
    return false;

}


/**
 * Module exports
 */
module.exports = SchemaTypeString;