/**
 * Herits from Date
 */
var SchemaTypeDate = Date;


/**
 * Validate type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeDate.validate = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Check if date
    if(value instanceof SchemaTypeDate) return true;
    if(value instanceof Date) return true;
    
    // If not date
    return false;

}


/**
 * Convert type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeDate.convert = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Return date
    if(value instanceof SchemaTypeDate) return value;
    if(value instanceof Date) return value;
    if(typeof(value) === "string" && new Date(value).valueOf() !== NaN) return new Date(value);
    if(typeof(value) === "number" && new Date(value).valueOf() !== NaN) return new Date(value);

    // Return value if not date
    return value;

}


/**
 * Module exports
 */
module.exports = SchemaTypeDate;