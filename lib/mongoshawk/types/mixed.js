/**
 * SchemaTypeMixed constructor
 *
 * @api public
 */
function SchemaTypeMixed() {}


/**
 * Validate type
 *
 * @params {mixed} value
 *
 * @api public
 */
SchemaTypeMixed.validate = function(value) {

    // Check datas
    if(typeof(value) === "undefined")
        throw new Error("value have to be defined");

    // All is mixed
    return true;

}


/**
 * Module exports
 */
module.exports = SchemaTypeMixed;