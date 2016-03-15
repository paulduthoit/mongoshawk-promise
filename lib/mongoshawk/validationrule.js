var async = require('async');
var _ = require('underscore');
var Validation = require('./validation');
var ValidationException = require('./exceptions/validation');


/**
 * Validation rule
 *
 * @params {String|Regex|Array} rule
 * @params {Object}             [options]
 *
 * @api public
 */
var ValidationRule = function(rule, options) {

    // Check arguments
    if(typeof options === "undefined")
        options = {};

    // Check datas
    if(typeof rule !== "string" && !(rule instanceof RegExp) && !(rule instanceof Array))
        throw new Error("rule have to be a string, a regex or an array");
    if(typeof options !== "object")
        throw new Error("options have to be an object");

    // Set instance datas
    this.rule = "";
    this.args = [];
    this.required = false;
    this.on = true;
    this.allowEmpty = true;
    this.message = false;

    // Get rule name and args
    if(typeof rule === "string" || rule instanceof RegExp) {
        this.rule = rule;
        this.args = [];
    } else if(rule instanceof Array) {
        this.rule = rule.shift();
        this.args = rule;
    }

    // Get required option
    if(typeof options.required !== "undefined") {
    	if(options.required === "create")
	        this.required = "create";
	    else if(options.required === "update")
	        this.required = "update";
	    else if(options.required === true)
	        this.required = true;
    }

    // Get on option
    if(typeof options.on !== "undefined") {
    	if(options.on === "create")
	        this.on = "create";
	    else if(options.on === "update")
	        this.on = "update";
    }

    // Get allowEmpty option
    if(typeof options.allowEmpty !== "undefined") {
        this.allowEmpty = options.allowEmpty ? true : false;
    }

    // Get message option
    if(typeof options.message === "string") {
        this.message = options.message;
    }

};



/**
 * ValidationRule datas
 */
ValidationRule.prototype.rule;
ValidationRule.prototype.args;
ValidationRule.prototype.required;
ValidationRule.prototype.on;
ValidationRule.prototype.allowEmpty;
ValidationRule.prototype.message;



/**
 * Rule validation
 *
 * @params {Mixed}    value
 * @params {String}   action (create|update)
 *
 * @api public
 */
ValidationRule.prototype.validate = function(value, action) {

    // Check datas
    if(typeof action !== "string" || ["create", "update"].indexOf(action) === -1)
        throw new Error("action have to be a string defined as create or update");

    // Datas
    var self = this;

    // Validate
    var validateLoad = function() {

        // Check allowEmpty
        if(self.allowEmpty === false) {

            // Data
            var emptyValidation = Validation.notEmpty(value);

            // If empty value
            if(emptyValidation instanceof ValidationException) {

                // Reject
                throw emptyValidation;

            }

        }

        // Check rule
        if(self.on === true || self.on === action) {

            // If undefined function
            if(typeof self.rule === "string" && typeof Validation[self.rule] !== "function")
                throw new Error("Validation." + self.rule + " is not a defined function");

            // If empty value
            if(Validation.notEmpty(value) instanceof ValidationException) {

                // Resolve
                return Promise.resolve();

            }

            // If valid function
            if(typeof self.rule === "string") {

                // Get rule args
                var ruleArguments = [];
                ruleArguments = self.args.slice();
                ruleArguments.unshift(value);

                // Get validation
                var ruleValidation = Validation[self.rule].apply(Validation, ruleArguments);

                // If validation failed
                if(ruleValidation instanceof ValidationException) {

                    // Reject
                    throw ruleValidation;

                }

                // If validation succeed
                else {

                    // Resolve
                    return Promise.resolve();

                }

            }

            // If regex function
            else if(self.rule instanceof RegExp) {

                // Get validation
                var ruleValidation = Validation.regex(value, self.rule);

                // If validation failed
                if(ruleValidation instanceof ValidationException) {

                    // Reject
                    throw ruleValidation;

                }

                // If validation succeed
                else {

                    // Resolve
                    return Promise.resolve();

                }

            }

        }

        // Resolve
        return Promise.resolve();

    }

    // Return promise
    return validateLoad();

};


/**
 * Module exports
 */
module.exports = ValidationRule;