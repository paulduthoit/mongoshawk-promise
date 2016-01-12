var ValidationException = require('./exceptions/validation');


/**
 * Validation constructor
 */
function Validation() {}



/**
 * Regex validation
 *
 * @params {String} value
 * @params {Regex} regex
 *
 * @api private
 */
Validation.regex = function(value, regex) {

    // Check datas
    if(!(regex instanceof RegExp))
        throw new Error("regex have to be a regex");

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("Must be a string");
    }

    // Check if match
    if(!value.match(regex)) {
        return new ValidationException("Must match with the following regex : " + regex.toString());
    }

    return null;

}

/**
 * Email validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.email = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("Must be a string");
    }

    // Check if match
    if(!value.match(/^[-0-9a-zA-Z.+_]+@[-0-9a-zA-Z.+_]+\.[a-zA-Z]{2,8}$/)) {
        return new ValidationException("Must be a valid email address");
    }

    return null;

}

/**
 * Alpha validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.alpha = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("Must be a string");
    }

    // Check if match
    if(!value.match(/^[a-zA-Z]*$/)) {
        return new ValidationException("Must contain only letters");
    }

    return null;

}

/**
 * Alpha or numeric validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.alphaNumeric = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("Must be a string");
    }

    // Check if match
    if(!value.match(/^[0-9a-zA-Z]*$/)) {
        return new ValidationException("Must contain only letters and numbers");
    }

    return null;

}

/**
 * Alpha, numeric, dash or underscore validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.alphaNumericDashUnderscore = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("Must be a string");
    }

    // Check if match
    if(!value.match(/^[0-9a-zA-Z_-]*$/)) {
        return new ValidationException("Must contain only letters, numbers, dash and underscore");
    }

    return null;

}

/**
 * Length validation
 *
 * @params {String} value
 * @params {Number} min
 * @params {Number} [max]
 *
 * @api private
 */
Validation.length = function(value, min, max) {

    // Default datas
    if(!min) min = 0;

    // Check datas
    if(typeof min !== "number")
        throw new Error("min have to be a number");
    if(typeof max !== "undefined" && typeof max !== "number")
        throw new Error("max have to be a number");

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("Must be a string");
    }

    // Check if match
    if(typeof max !== "undefined" && min > 0 && (value.length < min || value.length > max)) {
        return new ValidationException("Must contain between " + min + " and " + max + " character(s)");
    } else if(value.length < min) {
        return new ValidationException("Must contain minimum " + min + " character(s)");
    } else if(typeof max !== "undefined" && value.length > max) {
        return new ValidationException("Must contain maximum " + max + " character(s)");
    }

    return null;

}

/**
 * InList validation
 *
 * @params {String} value
 * @params {Array} list
 *
 * @api private
 */
Validation.inList = function(value, list) {

    // Check datas
    if(!(list instanceof Array))
        throw new Error("list have to be an array");

    // Check if match
    if(list.indexOf(value) === -1) {
        var popped = list.pop();
        return new ValidationException("Must be " + list.join(", ") + " or " + popped);
    }

    return null;

}

/**
 * Ip validation
 *
 * @params {String} value
 * @params {String} [type] (ipv4|ipv6|both)
 *
 * @api private
 */
Validation.ip = function(value, type) {

    // Check arguments
    if(typeof type === "undefined")
        type = "both";

    // Check datas
    if(typeof type !== "string" || [ "ipv4", "ipv6", "both" ].indexOf(type) === -1)
        throw new Error("type have to be a string defined as ipv4, ipv6 or both");

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("Must be a string");
    }

    // Check if match
    if(type === "ipv4" && !value.match(/^([0-9]{1,3}\.){3}([0-9]{1,3})$/)) {
        return new ValidationException("Must be a valid ipv4 address");
    } else if(type === "ipv6" && !value.match(/^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)) {
        return new ValidationException("Must be a valid ipv6 address");
    } else if(type === "both" && !value.match(/^([0-9]{1,3}\.){3}([0-9]{1,3})$|^([0-9a-fA-F]{1,4}:){7}[0-9a-fA-F]{1,4}$/)) {
        return new ValidationException("Must be a valid ipv4 or ipv6 address");
    }

    return null;

}

/**
 * Url validation
 *
 * @params {String} value
 *
 * @api private
 */
Validation.url = function(value) {

    // Check if is string
    if(typeof value !== "string") {
        return new ValidationException("Must be a string");
    }

    // Check if match
    if(!value.match(/^((http:\/\/|https:\/\/)(www.)?(([a-zA-Z0-9-]){1,}\.){1,4}([a-zA-Z]){2,6}(\/([a-zA-Z-_\/\.0-9#:?=&;,\(\)%]*)?)?)$/)) {
        return new ValidationException("Must be a valid url");
    }

    return null;

}



/**
 * Comparison validation
 *
 * @params {Number} value
 * @params {String} operator
 * @params {Number} check
 *
 * @api private
 */
Validation.comparison = function(value, operator, check) {

    // Check datas
    if(typeof operator !== "string" || !operator.match(/(=|!=|<=|<|>=|>)$/))
        throw new Error("operator have to be defined as a valid operator");
    if(typeof check !== "number")
        throw new Error("check have to be a number");

    // Check if is number
    if(typeof value !== "number") {
        return new ValidationException("Must be a number");
    }

    // Check if match
    if(operator === "=" && value != check) {
        return new ValidationException("Must be equal to " + check);
    } else if(operator === "!=" && value == check) {
        return new ValidationException("Must be different from " + check);
    } else if(operator === "<=" && value > check) {
        return new ValidationException("Must be lower or equal to " + check);
    } else if(operator === "<" && value >= check) {
        return new ValidationException("Must be lower than " + check);
    } else if(operator === ">=" && value < check) {
        return new ValidationException("Must be upper or equal to " + check);
    } else if(operator === ">" && value <= check) {
        return new ValidationException("Must be upper than " + check);
    }

    return null;

}

/**
 * Range validation
 *
 * @params {Number} value
 * @params {Number} min
 * @params {Number} max
 *
 * @api private
 */
Validation.range = function(value, min, max) {

    // Check datas
    if(typeof min !== "number")
        throw new Error("min have to be a number");
    if(typeof max !== "number")
        throw new Error("max have to be a number");

    // Check if is number
    if(typeof value !== "number") {
        return new ValidationException("Must be a number");
    }

    // Check if match
    if(value < min || value > max) {
        return new ValidationException("Must be upper or equal to " + min);
    }

    return null;

}



/**
 * Equal validation
 *
 * @params {Mixed} value
 * @params {Mixed} check
 *
 * @api private
 */
Validation.equalTo = function(value, check) {

    // Check if equal to check
    if(value != check) {
        return new ValidationException("Must be equal to the following element : " + check);;
    }

    return null;

}

/**
 * Strict equal validation
 *
 * @params {Mixed} value
 * @params {Mixed} check
 *
 * @api private
 */
Validation.strictEqualTo = function(value, check) {

    // Check if equal to check
    if(value !== check) {
        return new ValidationException("Must be strictly equal to the following element : " + check);
    }

    return null;

}



/**
 * NotEmpty validation
 *
 * @params {Mixed} value
 *
 * @api private
 */
Validation.notEmpty = function(value) {

    // Check if not empty
    if(value === null) {
        return new ValidationException("Must be non empty");
    } else if(typeof value === "string" && value === "") {
        return new ValidationException("Must be non empty");
    } else if(typeof value === "number" && isNaN(value)) {
        return new ValidationException("Must be non empty");
    } else if(value instanceof Date && isNaN(Number(value))) {
        return new ValidationException("Must be non empty");
    } else if(value instanceof Array && value.length === 0) {
        return new ValidationException("Must be non empty");
    } else if(value instanceof Object && Object.keys(value).length === 0) {
        return new ValidationException("Must be non empty");
    }

    return null;

}


/**
 * Module exports
 */
module.exports = Validation;