/**
 * Herits from Array
 */
var SchemaTypeArray = Array;


/**
 * Validate type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeArray.validate = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Check if array
    if(value instanceof SchemaTypeArray) return true;
    if(value instanceof Array) return true;
    
    // If not array
    return false;

}


/**
 * Module exports
 */
module.exports = SchemaTypeArray;