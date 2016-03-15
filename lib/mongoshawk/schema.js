/**
 * Schema constructor
 *
 * @params {Object} [fields]
 * @params {Object} [options]
 *
 * @api public
 */
var Schema = function(fields, options) {

    // Check method arguments
    if(typeof options === "undefined")
        options = {};
    if(typeof fields === "undefined")
        fields = {};

    // Check datas
    if(typeof fields !== "object")
        throw new Error("fields have to be an object");
    if(typeof options !== "object")
        throw new Error("options have to be an object");

    // Datas
    var self = this;
    var allowUndefinedFields = true;

    // Check if allow undefined fields
    if(typeof options.allowUndefinedFields !== "undefined" && !options.allowUndefinedFields) {
        allowUndefinedFields = false;
    }

    // Set instance datas
    this.fields = {};
    this.allowUndefinedFields = allowUndefinedFields;

    // Walk through fields
    Object.keys(fields).forEach(function(fieldName) {

        // Add field to schema
        self.addField(fieldName, fields[fieldName]);

    });

};



/**
 * Schema datas
 */
Schema.prototype.fields;
Schema.prototype.allowUndefinedFields;



/**
 * Schema constants
 */
Schema.Types = {
    String: require('./types/string.js'),
    Int: require('./types/int.js'),
    Float: require('./types/float.js'),
    Number: require('./types/number.js'),
    Date: require('./types/date.js'),
    Boolean: require('./types/boolean.js'),
    Array: require('./types/array.js'),
    Object: require('./types/object.js'),
    Mixed: require('./types/mixed.js'),
    ObjectId: require('./types/objectid.js')
};



/**
 * Add field
 *
 * @params {String} fieldPath
 * @params {Mixed}  details
 *
 * @api public
 */
Schema.prototype.addField = function(fieldPath, details) {

    // Check datas
    if(typeof fieldPath !== "string")
        throw new Error("fieldPath have to be a string");
    if(typeof details === "undefined")
        throw new Error("details have to be defined");

    // Datas
    var SchemaField = require('./schemafield.js');
    var type;
    var options;

    // Get type and options
    if(typeof details === "object" && typeof details.type !== "undefined") {
        type = details.type;
        delete details.type;
        options = details;
    } else {
        type = details;
        options = {};
    }

    // Set field
    this.fields[fieldPath] = new SchemaField(fieldPath, type, options);

};

/**
 * Get fields
 *
 * @return {Object} fields
 * @api public
 */
Schema.prototype.getFields = function() {
    return this.fields;
};

/**
 * Get a field
 *
 * @params {String} fieldPath
 *
 * @return {Object} fields
 * @api public
 */
Schema.prototype.getField = function(fieldPath) {

    // Check datas
    if(typeof fieldPath !== "string")
        throw new Error("fieldPath have to be a string");

    // Return field
    return this.fields[fieldPath];

};

/**
 * Remove a field
 *
 * @params {String} fieldPath
 *
 * @return {Object} fields
 * @api public
 */
Schema.prototype.removeField = function(fieldPath) {

    // Check datas
    if(typeof fieldPath !== "string")
        throw new Error("fieldPath have to be a string");

    // Delete field
    delete this.fields[fieldPath];

};



/**
 * Formate datas
 *
 * @params {Object} datas
 * @params {String} action (create|update)
 *
 * @return {Object} datas
 * @api public
 */
Schema.prototype.formate = function(datas, action) {

    // Check datas
    if(typeof datas !== "object")
        throw new Error("datas have to be an object");
    if(typeof action !== "string" || ["create", "update"].indexOf(action) === -1)
        throw new Error("action have to be a string defined as create or update");

    // Datas
    var self = this;
    var fields = this.fields;

    // Walk through instance fields
    Object.keys(fields).forEach(function(fieldName) {

        // Validate field datas
        var formatedFieldDatas = fields[fieldName].formate(datas[fieldName], action);

        // Set formated field datas
        if(typeof formatedFieldDatas !== "undefined")
            datas[fieldName] = formatedFieldDatas;

    });

    // Return datas
    return datas;

}



/**
 * Validate schema
 *
 * @params {Object} datas
 * @params {String} action (create|update)
 *
 * @api public
 */
Schema.prototype.validate = function(datas, action) {

    // Check datas
    if(typeof datas !== "object")
        throw new Error("datas have to be an object");
    if(typeof action !== "string" || ["create", "update"].indexOf(action) === -1)
        throw new Error("action have to be a string defined as create or update");

    // Datas
    var self = this;
    var fields = this.fields;
    var allowUndefinedFields = this.allowUndefinedFields;
    var errors = [];

    // Walk through instance fields
    Object.keys(fields).forEach(function(fieldName) {

        // Validate field datas
        fields[fieldName].validate(datas[fieldName], action, function(validationError) {

            // Push to errors
            if(validationError) {
                errors = errors.concat(validationError.exceptions);
            }

        });

    });

    // If undefined fields is not allowed
    if(!allowUndefinedFields) {

        // Walk through object
        Object.keys(datas).forEach(function(datafieldName) {

            // Datas
            var allowed = false;

            // Check if the field exists
            Object.keys(fields).forEach(function(fieldName) {
                if(fieldName === datafieldName) allowed = true;
            });

            // If not allowed
            if(!allowed) errors.push({ field: datafieldName, message: "The " + datafieldName + " field is not an allowed field" });

        });

    }

    // Validation failed
    if(errors.length) {
        throw new ValidationException("ValidationFailed", errors);
    }

    // Validation succeed
    return Promise.resolve();

}


/**
 * Module exports
 */
module.exports = Schema;