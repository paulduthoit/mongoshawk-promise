/**
 * Herits from Number
 */
var SchemaTypeFloat = Number;


/**
 * Validate type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeFloat.validate = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Check if float
    if(value instanceof SchemaTypeFloat) return true;
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
SchemaTypeFloat.convert = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Return float
    if(value instanceof SchemaTypeFloat) return parseFloat(value);
    if(value instanceof Number) return parseFloat(value);
    if(typeof(value) === "string" && !isNaN(value)) return parseFloat(value);
    if(typeof(value) === "number") return parseFloat(value);

    // Return null if not float
    return value;

}


/**
 * Module exports
 */
module.exports = SchemaTypeFloat;