var mongodb = require('mongodb');

/**
 * Herits from mongodb driver
 */
var SchemaTypeObjectId = mongodb.ObjectID;


/**
 * Validate type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeObjectId.validate = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Check if object id
    if(value instanceof SchemaTypeObjectId) return true;
    if(value instanceof mongodb.ObjectID) return true;
    
    // If not object id
    return false;

}


/**
 * Convert type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeObjectId.convert = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // Return object id
    if(value instanceof SchemaTypeObjectId) return value;
    if(value instanceof mongodb.ObjectID) return value;
    if(typeof(value) === "string" && value !== "" && (value.length === 24 || value.length === 12 || !isNaN(value))) return new SchemaTypeObjectId(value);
    if(typeof(value) === "number") return new SchemaTypeObjectId(value);

    // Return value if not object id
    return value;

}


/**
 * Module exports
 */
module.exports = SchemaTypeObjectId;