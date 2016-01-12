/**
 * Herits from Number
 */
var SchemaTypeInt = Number;


/**
 * Validate type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeInt.validate = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Check if float
    if(value instanceof SchemaTypeInt) return true;
    if(value instanceof Number) return true;
    if(typeof(value) === "number") return true;
    
    // If not float
    return false;

}


/**
 * Convert type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeInt.convert = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Return float
    if(value instanceof SchemaTypeInt) return parseInt(value);
    if(value instanceof Number) return parseInt(value);
    if(typeof(value) === "string" && !isNaN(value)) return parseInt(value);
    if(typeof(value) === "number") return parseInt(value);

    // Return value if not int
    return value;

}


/**
 * Module exports
 */
module.exports = SchemaTypeInt;