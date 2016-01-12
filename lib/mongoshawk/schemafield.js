var async = require('async');
var Schema = require('./schema.js');
var ValidationSet = require('./validationset.js');
var ValidationRule = require('./validationrule.js');
var ValidationException = require('./exceptions/validation');

/**
 * SchemaField constructor
 *
 * @params {String} path
 * @params {Mixed}  type
 * @params {Object} [options]
 *
 * @api public
 */
function SchemaField(path, type, options) {

    // Check method arguments
    if(typeof options === "undefined")
        options = {};

    // Check datas
    if(typeof path !== "string")
        throw new Error("path have to be a string");
    if(typeof type === "undefined")
        throw new Error("type have to be defined");
    if(typeof options !== "object")
        throw new Error("options have to be an object");

    // Set instance datas
    this.path = path;
    this.type;
    this.array = false;
    this.subSchema = false;
    this.validation = false;
    this.default = undefined;
    this.required = false;

    // Check if type is an array
    if(type instanceof Array) {

        // Datas
        var arrayType = type[0];

        // Set array
        this.array = true;
        
        // Check if type is undefined
        if(typeof arrayType === "undefined") {
            type = Schema.Types.Mixed;
        }

        // Check if type is options
        else if(typeof arrayType === "object" && typeof arrayType.type !== "undefined") {
            type = arrayType.type;
            delete arrayType.type;
            options = arrayType;
        }
        
        // Check if type is undefined
        else {
            type = arrayType;
        }

    }

    // Check if type is a sub schema
    if(type instanceof Schema) {
        this.subSchema = type;
        type = Schema.Types.Object;
    }

    // Set type
    this.type = SchemaField.checkType(type);

    // Get validation option
    if(typeof options.validation !== "undefined") {
	    if(typeof options.validation === "string")
	        this.validation = new ValidationSet([new ValidationRule(options.validation)]);
	    else if(options.validation instanceof ValidationRule)
	        this.validation = new ValidationSet([options.validation]);
	    else if(options.validation instanceof ValidationSet)
	        this.validation = options.validation;
	}

	// Get default option
	if(typeof options.default !== "undefined") {
    	this.default = options.default;
    }

	// Get required option
	if(typeof options.required !== "undefined") {
    	this.required = options.required;
    }

}



/**
 * SchemaField datas
 */
SchemaField.prototype.path;
SchemaField.prototype.type;
SchemaField.prototype.array;
SchemaField.prototype.subSchema;
SchemaField.prototype.validation;
SchemaField.prototype.default;
SchemaField.prototype.required;



/**
 * Formate field value
 *
 * @params {Mixed}  [value]
 * @params {String} action (create|update)
 *
 * @return {Object} datas
 * @api public
 */
SchemaField.prototype.formate = function(value, action) {

    // Check datas
    if(typeof action !== "string" || ["create", "update"].indexOf(action) === -1)
        throw new Error("action have to be a string defined as create or update");

    // Datas
    var self = this;

    // Check default
    if(typeof value === "undefined" && typeof this.default !== "undefined" && (this.required === action || this.required === true)) {
        if(typeof this.default === "function") {
            var value = this.default.call(this);
        } else {
            var value = this.default;
        }
    }

    // If value is defined
    if(typeof value === "undefined") {

        // Return value
        return value;

    }

	// If field is an array
	if(self.array) {

        // If value is null
        if(value === null) {

            // Return value
            return [];

        }

		// If value is not an array
		if(!(value instanceof Array)) {

            // Return value
    		return value;

		}

    	// If value is an array
        else if(value instanceof Array) {

            // If array is empty
            if(value.length === 0)
                return [];

            // Remove undefined array values
            value = value.filter(function(valueItem) {
                return typeof valueItem !== "undefined";
            });

	        // Walk through value
	        value.forEach(function(valueItem, valueIndex) {

	            // If field is a sub-schema
	            if(self.subSchema) {

	            	// If value item is not an object
	            	if(typeof valueItem !== "object") {
		        		return;
	            	}

            		// Get sub schema formatage
	                value[valueIndex] = self.subSchema.formate(valueItem, action);

	            }

	            // If field is not a sub-schema
	            else {

                    // Convert to request type
	            	if(typeof self.type.convert === "function") {
	            		value[valueIndex] = self.type.convert(valueItem);
	            	}

	            }

	        });

            // Return value
            return value;

	    }

	}

    // If field is not an array
	else {

        // If field is a sub-schema
        if(self.subSchema) {

            // If value item is not an object
            if(typeof value !== "object") {
                return value;
            }

            // Get sub schema formatage
            value = self.subSchema.formate(value, action);

            // Return value
            return value;

        }

        // If field is not a sub-schema
        else {

            // Convert to request type
            if(typeof self.type.convert === "function") {
                value = self.type.convert(value);
            }

            // Return value
            return value;

        }

    }

}



/**
 * Validate field value
 *
 * @params {Mixed}  [value]
 * @params {String} action (create|update)
 *
 * @api public
 */
SchemaField.prototype.validate = function(value, action) {

    // Check datas
    if(typeof action !== "string" || ["create", "update"].indexOf(action) === -1)
        throw new Error("action have to be a string defined as create or update");

    // Datas
    var self = this;
    var errors = [];

    // Validate
    var validateLoad = function() {

        // Data
        var asyncQueue = Promise.resolve();

        // Check required
        if((self.required === true || self.required === action) && typeof value === "undefined") {

            // Push to errors
            errors.push({ "field" : self.path, "message" : "The " + self.path + " field is required" });
            
            // Return async queue
            return asyncQueue;

        }

        // If value is undefined
        if(typeof value === "undefined") {
            
            // Return async queue
            return asyncQueue;

        }

        // If must be array
        if(self.array) {

            // If value is null
            if(value === null) {
                value = [];
            }

            // If value is not an array
            if(!(value instanceof Array)) {
                
                // Push to errors
                errors.push({ "field" : self.path, "message" : "The " + self.path + " field must be an array" });
            
                // Return async queue
                return asyncQueue;

            }

            // If field is a sub-schema
            if(self.subSchema) {

                // Walk through value
                _.each(value, function(valueItem, valueIndex) {

                    // If value is not an object
                    if(typeof valueItem !== "object") {
            
                        // Push to errors
                        errors.push({ "field" : self.path + "." + valueIndex, "message" : "The " + self.path + "." + valueIndex + " field child must be an object" });
                        return;

                    }

                    // Push to async queue
                    asyncQueue = asyncQueue
                        .then(self.subSchema.validate.bind(self, valueItem, action))
                        .then(function(validationError) {

                            // Push to errors
                            if(validationError) {
                                validationError.exceptions.forEach(function(err) {
                                    err.message = err.message.replace(err.field, self.path + "." + valueIndex + "." + err.field);
                                    errors.push({ "field" : self.path + "." + valueIndex + "." + err.field, "message" : err.message });
                                });
                            }

                            // Resolve
                            return Promise.resolve();

                        });

                });
            
                // Return async queue
                return asyncQueue;

            }

            // If field is not a sub-schema
            else {

                // Walk through value
                _.each(value, function(valueItem, valueIndex) {

                    // If value type is invalid
                    if(!self.type.validate(valueItem)) {

                        // Push to errors
                        if(["a", "e", "i", "o", "u", "y"].indexOf(self.type.name.substr(0, 1).toLowerCase()) !== -1) {
                            errors.push({ "field" : self.path + "." + valueIndex, "message" : "The " + self.path + "." + valueIndex + " field child must be an " + self.type.name });
                            return;
                        } else {
                            errors.push({ "field" : self.path + "." + valueIndex, "message" : "The " + self.path + "." + valueIndex + " field child must be a " + self.type.name });
                            return;
                        }

                    }

                    // Check validation
                    if(self.validation instanceof ValidationSet) {

                        // Push to async queue
                        asyncQueue = asyncQueue
                            .then(self.validation.validate.bind(self, valueItem, action))
                            .then(function(validationError) {
                
                                // Push to errors
                                if(validationError) {
                                    validationError.exceptions.forEach(function(err) {
                                        err = err.message.substr(0, 1).toLowerCase() + err.message.substr(1);
                                        errors.push({ "field" : self.path + "." + valueIndex, "message" : "The " + self.path + "." + valueIndex + " field child " + err });
                                    });
                                }

                                // Resolve
                                return Promise.resolve();

                            });

                    }

                });
            
                // Return async queue
                return asyncQueue;

            }

        }

        // Must not be an array
        else {

            // If field is a sub-schema
            if(self.subSchema) {

                // If value is not an object
                if(typeof value !== "object") {
        
                    // Push to errors
                    errors.push({ "field" : self.path, "message" : "The " + self.path + " field must be an object" });

                }

                // Push to async queue
                asyncQueue = asyncQueue
                    .then(self.subSchema.validate.bind(self, value, action))
                    .then(function(validationError) {
                    
                        // Push to errors
                        if(validationError) {
                            validationError.exceptions.forEach(function(err) {
                                err.message = err.message.replace(err.field, self.path + "." + err.field);
                                errors.push({ "field" : self.path + "." + err.field, "message" : err.message });
                            });
                        }

                        // Resolve
                        return Promise.resolve();

                    });
            
                // Return async queue
                return asyncQueue;

            }

            // If field is not a sub-schema
            else {

                // If value type is invalid
                if(value !== null && !self.type.validate(value)) {

                    // Push to errors
                    if(["a", "e", "i", "o", "u", "y"].indexOf(self.type.name.substr(0, 1).toLowerCase()) !== -1) {
                        errors.push({ "field" : self.path, "message" : "The " + self.path + " field child must be an " + self.type.name });
                    } else {
                        errors.push({ "field" : self.path, "message" : "The " + self.path + " field child must be a " + self.type.name });
                    }
            
                    // Return async queue
                    return asyncQueue;

                }

                // Check validation
                if(self.validation instanceof ValidationSet) {

                    // Push to async queue
                    asyncQueue = asyncQueue
                        .then(self.validation.validate.bind(self, value, action))
                        .then(function(validationError) {
                        
                            // Push to errors
                            if(validationError) {
                                validationError.exceptions.forEach(function(err) {
                                    err = err.message.substr(0, 1).toLowerCase() + err.message.substr(1);
                                    errors.push({ "field" : self.path, "message" : "The " + self.path + " field " + err });
                                });
                            }

                            // Resolve
                            return Promise.resolve();

                        });
                
                    // Return async queue
                    return asyncQueue;

                }
                
                // Return async queue
                return asyncQueue;

            }

        }

    };

    // Return promise
    return validateLoad()
        .then(function() {

            // If error
            if(errors.length > 0) {
                throw new ValidationException("ValidationFailed", errors);
            }

            // Resolve
            return Promise.resolve();

        });

}



/**
 * Check if type is authorized
 *
 * @params {Mixed} type
 *
 * @return {Mixed} type
 * @api private
 */
SchemaField.checkType = function(type) {

    // Formate type
    if(typeof type === "string")
        type = type.toLowerCase();

    // Return valide type
    if(type === Schema.Types.String || type === String || type === "string")
        return Schema.Types.String;
    
    if(type === Schema.Types.Int || type === "int")
        return Schema.Types.Int;
    
    if(type === Schema.Types.Float || type === "float")
        return Schema.Types.Float;
    
    if(type === Schema.Types.Number || type === Number || type === "number")
        return Schema.Types.Number;

    if(type === Schema.Types.Date || type === "date")
        return Schema.Types.Date;
    
    if(type === Schema.Types.Boolean || type === Boolean || type === "boolean" || type === "bool")
        return Schema.Types.Boolean;
    
    if(type === Schema.Types.Array || type === Array || type === "array" || type instanceof Array)
        return Schema.Types.Array;
    
    if(type === Schema.Types.ObjectId || type === "objectid")
        return Schema.Types.ObjectId;

    if(type === Schema.Types.Mixed || type === "mixed")
        return Schema.Types.Mixed;
    
    if(type === Schema.Types.Object || type === Object || type === "object" || type instanceof Object)
        return Schema.Types.Object;

    // Error
    throw new Error("Invalid type of field");

}


/**
 * Module exports
 */
module.exports = SchemaField;