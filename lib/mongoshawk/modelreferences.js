var _ = require("underscore");

/**
 * Model references
 */
var ModelReferences = {};


/**
 * Populate references
 *
 * @params {Object} requestedReferences
 * @params {Array}  datas
 *
 * @api private
 */
ModelReferences.populateReferences = function(self, references, requestedReferences, datas) {

	// Looped required
	var Model = require('./model.js');

	// Check datas
	if(!(self instanceof Model))
		throw new Error("self have to be a model");
	if(typeof requestedReferences !== "object")
		throw new Error("requestedReferences have to be an object");
	if(!(datas instanceof Array))
		throw new Error("datas have to be an array");

	// Data
	var asyncQueue = Promise.resolve();

	// Hash references from datas
	hashedReferences = ModelReferences.hashReferencesFromDatas(requestedReferences, datas);

	// Get field hashed references
	var getFieldHashedReferencesLoad = function(fieldReferenceItem) {

		// Data
		var fieldHash = hashedReferences[fieldKey];
		var fieldFilter = {};
		var fieldFields = {};
		var fieldOptions = {};
		var listAction = false;
		var listActionSelf = false;

		// Get fields
		if(typeof requestedReferences[fieldKey] === "object" && typeof requestedReferences[fieldKey]["$fields"] === "object") {
			fieldFields = requestedReferences[fieldKey]["$fields"];
		} else if(typeof requestedReferences[fieldKey] === "object") {
			fieldFields = requestedReferences[fieldKey];
		}

		// Get filter
		fieldFilter._id = { "$in": fieldHash };

		// Get list action
		if(fieldReferenceItem.prototype instanceof Model) {
			var fieldModelInstance = new fieldReferenceItem();
			listAction = fieldModelInstance.list;
			listActionSelf = fieldModelInstance;
		} else {
			listAction = fieldReferenceItem;
			listActionSelf = self;
		}

		// Return promise
		return listAction.call(listActionSelf, fieldFilter, fieldFields, fieldOptions)
			.then(function(fieldDatas) {

				// Check field datas
				if(typeof fieldDatas !== "object" || typeof fieldDatas.datas === "undefined") {
					throw new Error("Returned datas is invalid");
				}

				// Replace hash references
				hashedReferences[fieldKey] = fieldDatas.datas;

				// Resolve
				return Promise.resolve();

			});

	};

	// Loop over hashed references
	_.each(Object.keys(hashedReferences), function(fieldKey) {

		// Datas
		var fieldReference = references[fieldKey];

		// If many references
		if(fieldReference instanceof Array) {

			// Walk through field references
			_.each(fieldReference, function(fieldReferenceItem) {

				// Push to async queue
				asyncQueue = asyncQueue
					.then(getFieldHashedReferencesLoad.bind(null, fieldReferenceItem));

			});

		}

		// If unique reference
		else {

			// Push to async queue
			asyncQueue = asyncQueue
				.then(getFieldHashedReferencesLoad.bind(null, fieldReference));

		}

	});

	// Push to async queue
	asyncQueue = asyncQueue
		.then(function() {

			// Hashed references to datas
			datas = ModelReferences.hashedReferencesToDatas(hashedReferences, datas);

			// Resolve
			return Promise.resolve(datas);

		});

	// Return async queue
	return asyncQueue;

}

/**
 * Hash references from datas
 *
 * @params {Object} references
 * @params {Array}  datas
 *
 * @return {Object} hashedReferences
 * @api private
 */
ModelReferences.hashReferencesFromDatas = function(references, datas) {

	// Check datas
	if(typeof references !== "object")
		throw new Error("references have to be an object");
	if(!(datas instanceof Array))
		throw new Error("datas have to be an array");

	// Datas
	var hashedReferences = {};

	// Walk through datas
	datas.forEach(function(dataItem) {

		// Walk through references
		Object.keys(references).forEach(function(fieldKey) {

			// Create field hash
			if(typeof hashedReferences[fieldKey] === "undefined")
				hashedReferences[fieldKey] = [];

			// Get hash values
			var hashedResults = ModelReferences.hashReferencesFromDatasByField(fieldKey, dataItem);
			hashedReferences[fieldKey] = hashedReferences[fieldKey].concat(hashedResults);

		});

	});

	return hashedReferences;

}

/**
 * Hash references by field
 *
 * @params {String} field
 * @params {Object} datas
 *
 * @return {Array} hashedReferences
 * @api private
 */
ModelReferences.hashReferencesFromDatasByField = function(field, datas) {

	// Check datas
	if(typeof field !== "string")
		throw new Error("field have to be a string");
	if(typeof datas !== "object")
		throw new Error("datas have to be an object");

	// Datas
	var hashedReferences = [];
	var splitedField = field.split('.');
	var fieldPathRoot = splitedField[0];

	// If last child
	if(splitedField.length === 1) {

		// Get hash values
		if(datas[fieldPathRoot] instanceof Array)
			hashedReferences = hashedReferences.concat(datas[fieldPathRoot]);
		else if(typeof datas[fieldPathRoot] !== "undefined")
			hashedReferences.push(datas[fieldPathRoot]);

	} 

	// If need continue
	else {
	
		// Datas
		var fieldPathChild  = splitedField.slice(1).join(".");

		// If field datas is array
		if(datas[fieldPathRoot] instanceof Array) {

			// Walk through field datas
			datas[fieldPathRoot].forEach(function(dataItem) {

				// Get hashed values
				var hashedResults = ModelReferences.hashReferencesFromDatasByField(fieldPathChild, dataItem);
				hashedReferences = hashedReferences.concat(hashedResults);

			});

		}

		else if(typeof datas[fieldPathRoot] !== "undefined") {
			
			// Get hashed value
			hashedReferences = ModelReferences.hashReferencesFromDatasByField(fieldPathChild, datas[fieldPathRoot]);

		}

	}

	return hashedReferences;

}

/**
 * Hashed references to datas
 *
 * @params {Object} hashedReferences
 * @params {Array}  datas
 *
 * @return {Array} datas
 * @api private
 */
ModelReferences.hashedReferencesToDatas = function(hashedReferences, datas) {

	// Check datas
	if(typeof hashedReferences !== "object")
		throw new Error("hashedReferences have to be an object");
	if(!(datas instanceof Array))
		throw new Error("datas have to be an array");

	// Walk through datas
	datas.forEach(function(dataItem, dataIndex, dataArray) {

		// Walk through hashed references
		Object.keys(hashedReferences).forEach(function(fieldKey) {

			// Array to object by _id
			var fieldHashedReferences = {};
			hashedReferences[fieldKey].forEach(function(hashedReference) {
				fieldHashedReferences[hashedReference._id] = hashedReference;
			});

			// Get hash values
			dataArray[dataIndex] = ModelReferences.hashedReferencesToDatasByField(fieldHashedReferences, fieldKey, dataArray[dataIndex]);

		});

	});

	return datas;

}

/**
 * Hashed references to datas by field
 *
 * @params {Array}  references
 * @params {String} field
 * @params {Object} datas
 *
 * @return {Object} datas
 * @api private
 */
ModelReferences.hashedReferencesToDatasByField = function(references, field, datas) {

	// Check datas
	if(typeof references !== "object")
		throw new Error("references have to be an object");
	if(typeof field !== "string")
		throw new Error("field have to be a string");
	if(typeof datas !== "object")
		throw new Error("datas have to be an object");

	// Datas
	var splitedField = field.split('.');
	var fieldPathRoot = splitedField[0];

	// If last child
	if(splitedField.length === 1) {

		if(datas[fieldPathRoot] instanceof Array) {

			// Change reference to data
			datas[fieldPathRoot].forEach(function(dataItem, dataIndex, dataArray) {
				dataArray[dataIndex] = _.extend({}, references[dataItem]);
			});

		} else if(typeof datas[fieldPathRoot] !== "undefined") {

			// Change reference to data
			datas[fieldPathRoot] = _.extend({}, references[datas[fieldPathRoot]]);

		}

	} 

	// If need continue
	else {
	
		// Datas
		var fieldPathChild = splitedField.slice(1).join(".");

		// If field datas is array
		if(datas[fieldPathRoot] instanceof Array) {

			// Walk through field datas
			datas[fieldPathRoot].forEach(function(dataItem, dataIndex, dataArray) {

				// Hashed references to data by field
				dataArray[dataIndex] = ModelReferences.hashedReferencesToDatasByField(references, fieldPathChild, dataArray[dataIndex]);

			});

		}

		else if(typeof datas[fieldPathRoot] !== "undefined") {

			// Hashed references to data by field
			datas[fieldPathRoot] = ModelReferences.hashedReferencesToDatasByField(references, fieldPathChild, datas[fieldPathRoot]);

		}

	}

	return datas;

}


/**
 * Module exports
 */
module.exports = ModelReferences;