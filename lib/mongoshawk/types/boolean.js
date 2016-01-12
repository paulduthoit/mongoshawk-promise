/**
 * Herits from Boolean
 */
var SchemaTypeBoolean = Boolean;


/**
 * Validate type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeBoolean.validate = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Check if boolean
    if(value instanceof SchemaTypeBoolean) return true;
    if(value instanceof Boolean) return true;
    if(typeof(value) === "boolean") return true;
    
    // If not boolean
    return false;

}


/**
 * Convert type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeBoolean.convert = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Return boolean
    if(value instanceof SchemaTypeBoolean) return value.toString();
    if(value instanceof Boolean) return value.toString();
    if(typeof(value) === "boolean") return value;
    if(typeof(value) === "number" && value === 1) return true;
    if(typeof(value) === "number" && value === 0) return false;
    if(typeof(value) === "string" && value === "true") return true;
    if(typeof(value) === "string" && value === "false") return false;
    
    // Return value if not boolean
    return value;

}


/**
 * Module exports
 */
module.exports = SchemaTypeBoolean;