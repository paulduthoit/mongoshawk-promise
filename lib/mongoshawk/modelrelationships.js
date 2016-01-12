var _ = require("underscore");
var async = require('async');
var deepmerge = require("deepmerge");
var mpath = require("mpath");
var SchemaPath = require('./schemapath.js');

/**
 * Model relationships
 */
var ModelRelationships = {};



/**
 * Populate relationships
 *
 * @params {Object} relationships
 * @params {Object} requestedRelationships
 * @params {Array}  datas
 * @api private
 */
ModelRelationships.populateRelationships = function(self, relationships, requestedRelationships, datas) {

	// Looped required
	var Model = require('./model.js');

	// Check datas
	if(!(self instanceof Model))
		throw new Error("self have to be a model");
	if(typeof relationships !== "object")
		throw new Error("relationships have to be an object");
	if(typeof requestedRelationships !== "object")
		throw new Error("requestedRelationships have to be an object");
	if(!(datas instanceof Array))
		throw new Error("datas have to be an array");

	// Datas
	var hashedRelationships = {};
	var asyncQueue = Promise.resolve();

	// Array to object by _id
	_.each(Object.keys(requestedRelationships), function(fieldKey) {
		_.each(datas, function(dataItem) {
			if(typeof hashedRelationships[fieldKey] === "undefined") {
				hashedRelationships[fieldKey] = [];
			}
			hashedRelationships[fieldKey].push(dataItem._id);
		});
	});

	// Walk through requested relationships
	_.each(Object.keys(requestedRelationships), function(fieldKey) {

		// If relationships by reference path
		if(typeof relationships[fieldKey].refPath !== "undefined") {

			// Datas
			var fieldReference = relationships[fieldKey].ref;
			var fieldPath = relationships[fieldKey].refPath;
			var fieldHash = hashedRelationships[fieldKey];
			var fieldFilter = {};
			var fieldFields = {};
			var fieldOptions = {};
			var listAction = false;
			var listActionSelf = false;

			// Get fields and options
			if(typeof requestedRelationships[fieldKey] === "object") {

				// Get filter
				if(typeof requestedRelationships[fieldKey]["$filter"] === "object") {
					fieldFilter = requestedRelationships[fieldKey]["$filter"];
				}

				// Get fields
				if(typeof requestedRelationships[fieldKey]["$fields"] === "object") {
					fieldFields = requestedRelationships[fieldKey]["$fields"];
				}

				// Get options
				if(typeof requestedRelationships[fieldKey]["$options"] === "object") {

					// Get skip
					if(typeof requestedRelationships[fieldKey]["$options"].skip !== "undefined" && requestedRelationships[fieldKey]["$options"].skip !== 0) {
						fieldOptions.skip = requestedRelationships[fieldKey]["$options"].skip;
					}

					// Get limit
					if(typeof requestedRelationships[fieldKey]["$options"].limit !== "undefined" && requestedRelationships[fieldKey]["$options"].limit !== 0) {
						fieldOptions.limit = requestedRelationships[fieldKey]["$options"].limit;
					}

					// Get orderby
					if(typeof requestedRelationships[fieldKey]["$options"].orderby !== "undefined" && requestedRelationships[fieldKey]["$options"].orderby) {
						fieldOptions.orderby = requestedRelationships[fieldKey]["$options"].orderby;
					}

				}

			}

			// Add necessary field
			fieldFields[fieldPath] = 1;

			// Get hash filter
			var hashFilter = {};
				hashFilter[fieldPath] = { "$in" : fieldHash };

			// Add to filter
			if(Object.keys(fieldFilter).length === 0) {
				fieldFilter = hashFilter;
			} else {
				fieldFilter = { "$and" : [ hashFilter, fieldFilter ] };
			}

			// Check fields
			/* if(Object.keys(fieldFilter).length === Object.keys(fieldFields).length) {
				var noQueringFields = Object.keys(fieldFilter).every(function(key) {
					return Object.keys(fieldFields).indexOf(key) !== -1;
				});
				if(noQueringFields) fieldFields = {};
			} */

			// Get list action
			if(fieldReference.prototype instanceof Model) {
				var fieldModelInstance = new fieldReference();
				listAction = fieldModelInstance.list;
				listActionSelf = fieldModelInstance;
			} else {
				listAction = fieldReference;
				listActionSelf = self;
			}

			// Push to async queue
			asyncQueue = asyncQueue
				.then(listAction.bind(listActionSelf, fieldFilter, fieldFields, fieldOptions))
				.then(function(fieldDatas) {

					// Check field datas
					if(typeof fieldDatas !== "object" || typeof fieldDatas.datas === "undefined") {
						throw new Error("Returned datas is invalid");
					}

					// Replace hash relationships
					hashedRelationships[fieldKey] = fieldDatas;

					// Resolve
					return Promise.resolve();

				});

		}

		// If relationships by conditions
		else if(typeof relationships[fieldKey].conditions !== "undefined") {

			// Datas
			var fieldItem = requestedRelationships[fieldKey];
			var fieldReference = relationships[fieldKey].ref;
			var fieldConditions = relationships[fieldKey].conditions;
			var fieldHash = hashedRelationships[fieldKey];
			var fieldConditionsHash	= _.clone(hashedRelationships[fieldKey]);
			var fieldDatasHash = _.object(_.map(datas, function(datasItem) { return [ datasItem._id, datasItem ]; }))
			var fieldFilter = {}
			var fieldFields = {};
			var fieldOptions = {};
			var listAction = false;
			var listActionSelf = false;

			// Get filter, fields and options
			if(typeof requestedRelationships[fieldKey] === "object") {

				// Get filter
				if(typeof requestedRelationships[fieldKey]["$filter"] === "object") {
					fieldFilter = requestedRelationships[fieldKey]["$filter"];
				}

				// Get fields
				if(typeof requestedRelationships[fieldKey]["$fields"] === "object") {
					fieldFields = requestedRelationships[fieldKey]["$fields"];
				}

				// Get options
				if(typeof requestedRelationships[fieldKey]["$options"] === "object") {

					// Get skip
					if(typeof requestedRelationships[fieldKey]["$options"].skip !== "undefined" && requestedRelationships[fieldKey]["$options"].skip !== 0) {
						fieldOptions.skip = requestedRelationships[fieldKey]["$options"].skip;
					}

					// Get limit
					if(typeof requestedRelationships[fieldKey]["$options"].limit !== "undefined" && requestedRelationships[fieldKey]["$options"].limit !== 0) {
						fieldOptions.limit = requestedRelationships[fieldKey]["$options"].limit;
					}

					// Get orderby
					if(typeof requestedRelationships[fieldKey]["$options"].orderby !== "undefined" && requestedRelationships[fieldKey]["$options"].orderby) {
						fieldOptions.orderby = requestedRelationships[fieldKey]["$options"].orderby;
					}

				}

			}

			// Add to filter
			if(Object.keys(fieldFilter).length === 0) {
				fieldFilter = ModelRelationships.relationshipConditionsToFilter(fieldConditions, datas);
			} else {
				fieldFilter = { "$and" : [ ModelRelationships.relationshipConditionsToFilter(fieldConditions, datas), fieldFilter ] };
			}

			// Create conditions hash
			fieldConditionsHash = fieldConditionsHash.map(function(_id) { return ModelRelationships.relationshipConditionsToFilter(fieldConditions, fieldDatasHash[_id]); });


			// Get list action
			if(fieldReference.prototype instanceof Model) {
				var fieldModelInstance = new fieldReference();
				listAction = fieldModelInstance.list;
				listActionSelf = fieldModelInstance;
			} else {
				listAction = fieldReference;
				listActionSelf = self;
			}

			// Push to async queue
			asyncQueue = asyncQueue
				.then(listAction.bind(listActionSelf, fieldFilter, fieldFields, fieldOptions))
				.then(function(fieldDatas) {

					// Check field datas
					if(typeof fieldDatas !== "object" || typeof fieldDatas.datas === "undefined") {
						throw new Error("Returned datas is invalid");
					}

					// Replace hash relationships
					hashedRelationships[fieldKey] = fieldDatas;

					// Resolve
					return Promise.resolve();

				});

		}

		else throw fieldKey + " relationship is invalid."

	});

	// Push to async queue
	asyncQueue = asyncQueue
		.then(function() {

			// Hashed relationships to datas
			datas = ModelRelationships.hashedRelationshipsToDatas(relationships, hashedRelationships, datas);

			// Resolve
			return Promise.resolve();

		});

	// Return async queue
	return asyncQueue;

}







/**
 * Hashed relationships to datas
 *
 * @params {Object} relationships
 * @params {Object} hashedReferences
 * @params {Array}  datas
 *
 * @return {Array} datas
 * @api private
 */
ModelRelationships.hashedRelationshipsToDatas = function(relationships, hashedRelationships, datas) {

	// Check datas
	if(typeof relationships !== "object")
		throw new Error("relationships have to be an object");
	if(typeof hashedRelationships !== "object")
		throw new Error("hashedRelationships have to be an object");
	if(!(datas instanceof Array))
		throw new Error("datas have to be an array");

	// Array to object by _id
	var datasObjectById = {};
	datas.forEach(function(dataItem) {
		datasObjectById[dataItem._id] = dataItem;
	});

	// Walk through hashed relationships field
	Object.keys(hashedRelationships).forEach(function(fieldKey) {

		// If relationships by reference path
		if(typeof relationships[fieldKey].refPath !== "undefined") {

			// Walk through hashed relationships
			hashedRelationships[fieldKey].datas.forEach(function(hashedRelationship) {

				// Get hash values
				datasObjectById = ModelRelationships.hashedRelationshipToDatasByField(hashedRelationship, relationships[fieldKey].refPath, datasObjectById, fieldKey);

			});

		}

		// If relationships by conditions
		else if(typeof relationships[fieldKey].conditions !== "undefined") {

			// Walk through hashed relationships
			hashedRelationships[fieldKey].datas.forEach(function(hashedRelationship) {

				// Walk through datas
				datas.forEach(function(datasItem, datasKey, datasArray) {

					// If relation conditions are verified
					if(ModelRelationships.checkRelationshipConditions(relationships[fieldKey].conditions, datasItem, hashedRelationship)) {

						// Check if exists
						if(typeof datasArray[datasKey][fieldKey] === "undefined")
							datasArray[datasKey][fieldKey] = [];

						// Push to datas
						datasArray[datasKey][fieldKey].push(_.extend({}, hashedRelationship));

					}

				});

			});

		}

	});

	return datas;

}

/**
 * Hashed relationships to datas by field
 *
 * @params {Object} relationship
 * @params {String} field
 * @params {Object} datas
 * @params {String} relationshipField
 * @params {Object} [relationshipParent]
 *
 * @return {Object} datas
 * @api private
 */
ModelRelationships.hashedRelationshipToDatasByField = function(relationship, field, datas, relationshipField, relationshipParent) {

	// Check method arguments
	if(typeof relationshipParent === "undefined")
		relationshipParent = relationship;

	// Check datas
	if(typeof relationship !== "object")
		throw new Error("relationship have to be an object");
	if(typeof field !== "string")
		throw new Error("field have to be a string");
	if(typeof datas !== "object")
		throw new Error("datas have to be an object");
	if(typeof relationshipField !== "string")
		throw new Error("relationshipField have to be a string");
	if(typeof relationshipParent !== "object")
		throw new Error("relationshipParent have to be an object");

	// Datas
	var splitedField = field.split('.');
	var fieldPathRoot = splitedField[0];

	// If last child
	if(splitedField.length === 1) {

		if(relationship[fieldPathRoot] instanceof Array) {

			// Walk through relationships
			relationship[fieldPathRoot].forEach(function(reference) {

				// If relationship of datas
				if(Object.keys(datas).indexOf(reference.toString()) !== -1) {

					// Check if exists
					if(typeof datas[reference][relationshipField] === "undefined")
						datas[reference][relationshipField] = [];

					// Push to datas
					datas[reference][relationshipField].push(_.extend({}, relationshipParent));

				}

			});

		} else if(typeof relationship[fieldPathRoot] !== "undefined") {

			// If relationship of datas
			if(Object.keys(datas).indexOf(relationship[fieldPathRoot].toString()) !== -1) {

				// Check if exists
				if(typeof datas[relationship[fieldPathRoot]][relationshipField] === "undefined")
					datas[relationship[fieldPathRoot]][relationshipField] = [];

				// Push to datas
				datas[relationship[fieldPathRoot]][relationshipField].push(_.extend({}, relationshipParent));

			}

		}

	} 

	// If need continue
	else {
	
		// Datas
		var fieldPathChild = splitedField.slice(1).join(".");

		// If field relationship is array
		if(relationship[fieldPathRoot] instanceof Array) {

			// Walk through field relationship
			relationship[fieldPathRoot].forEach(function(relationshipItem) {

				// Hashed relationships to data by field
				datas = ModelRelationships.hashedRelationshipsToDatasByField(relationshipItem, fieldPathChild, datas, relationshipField, relationshipParent);

			});

		}

		else if(typeof relationship[fieldPathRoot] !== "undefined") {

			// Hashed relationships to data by field
			datas = ModelRelationships.hashedRelationshipsToDatasByField(relationship[fieldPathRoot], fieldPathChild, datas, relationshipField, relationshipParent);

		}

	}

	return datas;

}


/**
 * Formalize relationship conditions
 *
 * @params {Object} conditions
 *
 * @return {Object} formalizedConditions
 * @api private
 */
ModelRelationships.formalizeRelationshipConditions = function(conditions) {

	// Check datas
	if(typeof conditions !== "object")
		throw new Error("conditions must be an object");

	// Datas
	var formalizedConditions = {};

	// If logical operator object
 	if(Object.keys(conditions)[0] === "$and" && Object.keys(conditions).length === 1) {

	 	// Concat $and child to $and parent
	 	formalizedConditions["$and"] = [];
		conditions["$and"].forEach(function(andItem) {

			// If $and object returned
			if(Object.keys(andItem)[0] === "$and" && Object.keys(andItem).length === 1) {
				formalizedConditions["$and"] = formalizedConditions["$and"].concat(andItem["$and"]);
			} else {
				formalizedConditions["$and"].push(andItem);
			}

		});

		// Concat $and conditions with same parent path
		formalizedConditions["$and"] = ModelRelationships.mergeRelationshipConditions(formalizedConditions["$and"]);

		// Formalize $and conditions
		formalizedConditions["$and"].forEach(function(andItem, andKey, andArray) {
			andArray[andKey] = ModelRelationships.formalizeRelationshipConditions(andItem);
		});

		// Return formalized conditions
		return formalizedConditions;

	}

	// If logical operator object
 	if(Object.keys(conditions)[0] === "$or" && Object.keys(conditions).length === 1) {

		// Walk through $and items
		formalizedConditions["$or"] = [];
		conditions["$or"].forEach(function(orItem) {

			// Datas
			var orItemPath = Object.keys(orItem)[0];
			var orItemValue = orItem[Object.keys(orItem)[0]];

			// If splited path
			if(orItemPath.search(".") !== -1) {
				formalizedConditions["$or"].push(SchemaPath.toObject(orItemPath, orItemValue));
			} else {
				formalizedConditions["$or"].push(orItem);
			}

		});

		// Formalize $or conditions
		formalizedConditions["$or"].forEach(function(orItem, orKey, orArray) {
			orArray[orKey] = ModelRelationships.formalizeRelationshipConditions(orItem);
		});

		// Return formalized conditions
		return formalizedConditions;

	}

	// If implicit $and object
	else if(Object.keys(conditions).length > 1) {

		// Walk through implicit $and items
		formalizedConditions["$and"] = [];
		Object.keys(conditions).forEach(function(andKey) {
			var andItemObject = {};
			andItemObject[andKey] = conditions[andKey];
			formalizedConditions["$and"].push(andItemObject);
		});

		// Merge conditions
		formalizedConditions = ModelRelationships.formalizeRelationshipConditions(formalizedConditions);

		// Return formalized conditions
		return formalizedConditions;

	}

	// If other conditions
	else {

		// Datas
		var conditionChildKey = Object.keys(conditions)[0];
		var conditionChildValue = conditions[Object.keys(conditions)[0]];

		// If condition child is implicit $and object
		if(typeof conditionChildValue === "object" && Object.keys(conditionChildValue).length > 1) {

			// Walk through implicit $and items
			formalizedConditions[conditionChildKey] = {};
			formalizedConditions[conditionChildKey]["$and"] = [];
			Object.keys(conditionChildValue).forEach(function(andKey) {
				var andItemObject = {};
				andItemObject[andKey] = conditionChildValue[andKey];
				formalizedConditions[conditionChildKey]["$and"].push(andItemObject);
			});

			// Merge conditions
			formalizedConditions[conditionChildKey] = ModelRelationships.formalizeRelationshipConditions(formalizedConditions[conditionChildKey]);

			// Return formalized conditions
			return formalizedConditions;

		}

		// Return conditions
		return conditions;

	}

}

/**
 * Merge $and conditions
 *
 * @params {Array} conditions
 *
 * @return {Array} mergedConditions
 * @api private
 */
ModelRelationships.mergeRelationshipConditions = function(conditions) {

	// Check datas
	if(!(conditions instanceof Array))
		throw new Error("conditions must be an array");

	// Datas
	var mergedConditions = {};
	var formalizedConditions = [];

	// Walk through $and items
	conditions.forEach(function(andItem, andKey, andArray) {

		// Datas
		var andItemPath = Object.keys(andItem)[0];
		var andItemValue = andItem[Object.keys(andItem)[0]];

		// If splited path
		if(andItemPath.search(".") !== -1) {
			andArray[andKey] = SchemaPath.toObject(andItemPath, andItemValue, 1);
		}

		// Merge conditions
		mergedConditions = deepmerge(mergedConditions, andArray[andKey]);

	});

	// Walk through implicit $and items
	Object.keys(mergedConditions).forEach(function(andKey) {
		var andItemObject = {};
		andItemObject[andKey] = mergedConditions[andKey];
		formalizedConditions.push(andItemObject);
	});

	// Return merged and formalized conditions
	return formalizedConditions;

}

/**
 * Check conditions
 *
 * @params {Object} condition
 * @params {Object} datas
 * @params {Object} relationshipDatas
 *
 * @return {Boolean} verify
 * @api private
 */
ModelRelationships.checkRelationshipConditions = function(condition, datas, relationshipDatas) {

	// Check datas
	if(typeof condition !== "object")
		throw new Error("condition must be an object");
	if(typeof datas !== "object")
		throw new Error("datas must be an object");
	if(typeof relationshipDatas !== "object")
		throw new Error("relationshipDatas must be an object");

	// Datas
	var verified;

	// If logical operator object of conditions
 	if(["$and", "$or", "$not"].indexOf(Object.keys(condition)[0]) !== -1) {

 		// Check datas
 		if(Object.keys(condition).length !== 1)
 			throw new Error("$and/$or objects must contain only one item per object");
 		if(!(condition[Object.keys(condition)[0]] instanceof Array))
 			throw new Error("First item of the $and/$or object must be an array");

 		// If the logical operator is $and
 		if(Object.keys(condition)[0] === "$and") {

 			// Walk through $and items
 			condition["$and"].forEach(function(andItem) {

		 		// Check datas
		 		if(typeof andItem !== "object")
		 			throw new Error("$and object items must be objects");

		 		// Check condition
		 		if(typeof verified === "undefined") {
		 			verified = ModelRelationships.checkRelationshipConditions(andItem, datas, relationshipDatas);
		 		} else {
		 			verified &= ModelRelationships.checkRelationshipConditions(andItem, datas, relationshipDatas);
		 		}

 			});

	 		// Return verified
	 		return verified;

 		}

 		// If the logical operator is $or
 		else if(Object.keys(condition)[0] === "$or") {

 			// Walk through $or items
 			condition["$or"].forEach(function(orItem) {

		 		// Check datas
		 		if(typeof orItem !== "object")
		 			throw new Error("$or object items must be objects");

		 		// Check condition
		 		if(typeof verified === "undefined") {
		 			verified = ModelRelationships.checkRelationshipConditions(orItem, datas, relationshipDatas);
		 		} else {
		 			verified |= ModelRelationships.checkRelationshipConditions(orItem, datas, relationshipDatas);
		 		}

 			});

	 		// Return verified
	 		return verified;

 		}

 		// If the logical operator is $or
 		else if(Object.keys(condition)[0] === "$not") {

	 		// Check datas
	 		if(typeof condition !== "object")
	 			throw new Error("$and object items must be objects");

	 		// Check condition
	 		verified = !ModelRelationships.checkRelationshipConditions(condition["$not"], datas, relationshipDatas);

	 		// Return verified
	 		return verified;

 		}

 	} 

	// If condition
 	else {

 		// Check every condition
 		var verifiedArray = Object.keys(condition).map(function(conditionItemKey) {

 			// Datas
 			var verified;
	 		var conditionItemValue = condition[conditionItemKey];

	 		// If condition is an instance of SchemaPath
	 		if(conditionItemValue instanceof SchemaPath) {

	 			// Datas
	 			var dataToCompare = mpath.get(conditionItemKey, relationshipDatas);
	 			var dataToVerify = conditionItemValue.get(datas);

	 			// Verify
	 			if(typeof dataToCompare !== "undefined" && typeof dataToVerify !== "undefined") {

	 				// Relationship datas is an array
	 				if(dataToCompare instanceof Array) {

	 					// Check every relationship data item
	 					dataToCompare.forEach(function(dataItem) {
	 						if(typeof verified === "undefined" && dataItem.toString() === dataToVerify.toString()) {
					 			verified = true;
					 		} else if(typeof verified === "undefined" && dataItem.toString() !== dataToVerify.toString()) {
					 			verified = false;
					 		} else if(dataItem.toString() === dataToVerify.toString()) {
					 			verified |= true;
					 		} else {
					 			verified |= false;
					 		}
	 					});

	 				} else {

	 					// Check relationship data
	 					if(dataToCompare.toString() === dataToVerify.toString()) {
				 			verified = true;
				 		} else {
				 			verified = false;
				 		}

	 				}

	 			} else {

	 				verified = false;

	 			}

		 		// Return verified
		 		return verified;

	 		}

	 		// If condition is $in object
	 		else if(typeof conditionItemValue === "object" && typeof conditionItemValue["$in"] !== "undefined") {

	 			// Datas
	 			var dataToCompare = mpath.get(conditionItemKey, relationshipDatas);
	 			var dataToVerify = conditionItemValue["$in"];

	 			// Verify
	 			if(typeof dataToCompare !== "undefined" && dataToVerify instanceof Array) {

	 				// Relationship datas is an array
	 				if(dataToCompare instanceof Array) {

	 					// Check every relationship data item
	 					dataToCompare.forEach(function(dataItem) {
	 						if(typeof verified === "undefined" && dataToVerify.indexOf(dataItem) !== -1) {
					 			verified = true;
					 		} else if(typeof verified === "undefined" && dataToVerify.indexOf(dataItem) !== -1) {
					 			verified = false;
					 		} else if(dataToVerify.indexOf(dataItem) !== -1) {
					 			verified |= true;
					 		} else {
					 			verified |= false;
					 		}
	 					});

	 				} else {

	 					// Check relationship data
	 					if(dataToVerify.indexOf(dataToCompare) !== -1) {
				 			verified = true;
				 		} else {
				 			verified = false;
				 		}

	 				}

	 			} else {

	 				verified = false;

	 			}

		 		// Return verified
		 		return verified;

	 		}

	 		// If condition is $and object
	 		else if(typeof conditionItemValue === "object") {

	 			// Datas
	 			var dataToCompare = mpath.get(conditionItemKey, relationshipDatas);
	 			var dataToVerify = conditionItemValue;

	 			// Verify
	 			if(typeof dataToCompare !== "undefined") {

	 				// Relationship datas is an array
	 				if(dataToCompare instanceof Array) {

	 					// Check every relationship data item
	 					dataToCompare.forEach(function(dataItem) {
	 						if(typeof verified === "undefined") {
					 			verified = ModelRelationships.checkRelationshipConditions(dataToVerify, datas, dataItem);
					 		} else {
					 			verified |= ModelRelationships.checkRelationshipConditions(dataToVerify, datas, dataItem);
					 		}
	 					});

	 				} else {

	 					// Check relationship data
	 					verified = ModelRelationships.checkRelationshipConditions(dataToVerify, datas, dataToCompare);

	 				}

	 			} else {

	 				verified = false;

	 			}

		 		// Return verified
		 		return verified;

	 		}

	 		// If condition is string, boolean or number
	 		else {

	 			// Datas
	 			var dataToCompare = mpath.get(conditionItemKey, relationshipDatas);
	 			var dataToVerify = conditionItemValue;

	 			// Verify
	 			if(typeof dataToCompare !== "undefined" && typeof dataToVerify !== "undefined") {

	 				// Relationship datas is an array
	 				if(dataToCompare instanceof Array) {

	 					// Check every relationship data item
	 					dataToCompare.forEach(function(dataItem) {
	 						if(typeof verified === "undefined" && dataItem.toString() === dataToVerify.toString()) {
					 			verified = true;
					 		} else if(typeof verified === "undefined" && dataItem.toString() !== dataToVerify.toString()) {
					 			verified = false;
					 		} else if(dataItem.toString() === dataToVerify.toString()) {
					 			verified |= true;
					 		} else {
					 			verified |= false;
					 		}
	 					});

	 				} else {

	 					// Check relationship data
	 					if(dataToCompare.toString() === dataToVerify.toString()) {
				 			verified = true;
				 		} else {
				 			verified = false;
				 		}

	 				}

	 			} else {

	 				verified = false;

	 			}

		 		// Return verified
		 		return verified;

	 		}

 		});

		// Check if verified
		if(verifiedArray.indexOf(false) === -1) {
			return true;
		} else {
			return false;
		}

	}

}


/**
 * Relationship conditions to fields
 *
 * @params {Object} conditions
 *
 * @return {Object} fields
 * @api private
 */
ModelRelationships.relationshipConditionsToFields = function(conditions) {

	// Check datas
	if(typeof conditions !== "object")
		throw new Error("conditions must be an object");

	// Datas
	var fields = {};

	// If logical operator object of conditions
 	if(["$and", "$or", "$not"].indexOf(Object.keys(conditions)[0]) !== -1) {

 		// Check datas
 		if(Object.keys(conditions).length !== 1)
 			throw new Error("$and/$or objects must contain only one item per object");
 		if(!(conditions[Object.keys(conditions)[0]] instanceof Array))
 			throw new Error("First item of the $and/$or object must be an array");

 		// If the logical operator is $and
 		if(Object.keys(conditions)[0] === "$and") {

 			// Walk through $and items
 			conditions["$and"].forEach(function(andItem) {

		 		// Check datas
		 		if(typeof andItem !== "object")
		 			throw new Error("$and object items must be objects");

		 		// Get fields
		 		fields = deepmerge(fields, ModelRelationships.relationshipConditionsToFields(andItem));

 			});

	 		// Return fields
	 		return fields;

 		}

 		// If the logical operator is $or
 		else if(Object.keys(conditions)[0] === "$or") {

 			// Walk through $or items
 			conditions["$or"].forEach(function(orItem) {

		 		// Check datas
		 		if(typeof orItem !== "object")
		 			throw new Error("$or object items must be objects");

		 		// Get fields
		 		fields = deepmerge(fields, ModelRelationships.relationshipConditionsToFields(orItem));

 			});

	 		// Return fields
	 		return fields;

 		}

 		// If the logical operator is $or
 		else if(Object.keys(conditions)[0] === "$not") {

	 		// Check datas
	 		if(typeof conditions !== "object")
	 			throw new Error("$and object items must be objects");

	 		// Get fields
		 	fields = ModelRelationships.relationshipConditionsToFields(conditions["$not"]);

	 		// Return fields
	 		return fields;

 		}

 	} 

	// If condition
 	else {

 		// Datas
 		var conditionItemKey = Object.keys(conditions)[0];
 		var conditionItemValue = conditions[Object.keys(conditions)[0]];

 		// If condition is an instance of SchemaPath
 		if(conditionItemValue instanceof SchemaPath) {

 			// Set fields
 			fields[conditionItemKey] = 1;

	 		// Return fields
	 		return fields;

 		}

 		// If condition is $in object
 		else if(typeof conditionItemValue === "object" && typeof conditionItemValue["$in"] !== "undefined") {

 			// Set fields
 			fields[conditionItemKey] = 1;

	 		// Return fields
	 		return fields;

 		}

 		// If condition is $and object
 		else if(typeof conditionItemValue === "object") {

 			// Set fields
 			fields[conditionItemKey] = { "$fields" : ModelRelationships.relationshipConditionsToFields(conditionItemValue) };

	 		// Return fields
	 		return fields;

 		}

 		// If condition is string, boolean or number
 		else {

 			// Set fields
 			fields[conditionItemKey] = 1;

	 		// Return fields
	 		return fields;

 		}

	}

}


/**
 * Relationship conditions to filter
 *
 * @params {Object} conditions
 * @params {Array} datas
 *
 * @return {Object} fields
 * @api private
 */
ModelRelationships.relationshipConditionsToFilter = function(conditions, datas) {

	// Check datas
	if(typeof conditions !== "object")
		throw new Error("conditions must be an object");
	if(!(datas instanceof Array) && typeof datas !== "object")
		throw new Error("datas must be an object or an array");

	// Datas
	var filter 	= {};

	// If logical operator object
 	if(Object.keys(conditions)[0] === "$and" && Object.keys(conditions).length === 1) {

		// Get filter of $and conditions
	 	filter["$and"] = [];
		conditions["$and"].forEach(function(andItem, andKey, andArray) {
			filter["$and"][andKey] = ModelRelationships.relationshipConditionsToFilter(andItem, datas);
		});

		// Return filter
		return filter;

	}

	// If logical operator object
 	if(Object.keys(conditions)[0] === "$or" && Object.keys(conditions).length === 1) {

		// Get filter of $or conditions
	 	filter["$or"] = [];
		conditions["$or"].forEach(function(orItem, orKey, orArray) {
			filter["$or"][orKey] = ModelRelationships.relationshipConditionsToFilter(orItem, datas);
		});

		// Return filter
		return filter;

	}

	// If implicit $and object
	else if(Object.keys(conditions).length > 1) {

		// Walk through implicit $and items
		filter["$and"] = [];
		Object.keys(conditions).forEach(function(andKey) {
			var andItemObject = {};
			andItemObject[andKey] = conditions[andKey];
			filter["$and"].push(andItemObject);
		});

		// Get filter
		filter = ModelRelationships.relationshipConditionsToFilter(filter, datas);

		// Return filter
		return filter;

	}

	// If other conditions
	else {

		// Datas
		var conditionChildKey = Object.keys(conditions)[0];
		var conditionChildValue = conditions[Object.keys(conditions)[0]];

		// If condition child is implicit $and object
 		if(conditionChildValue instanceof SchemaPath) {

 			// Get schema path value
 			var schemaPathValue = conditionChildValue.get(datas);

 			// Set filter
 			if(schemaPathValue instanceof Array && conditionChildKey !== "$in") {
				filter[conditionChildKey] = { "$in" : schemaPathValue };
 			} else if(typeof schemaPathValue !== "undefined") {
				filter[conditionChildKey] = schemaPathValue;
 			}

			// Return filter
			return filter;

		}

		// If condition child is implicit $and object
		else if(typeof conditionChildValue === "object" && !(conditionChildValue instanceof Array) && Object.keys(conditionChildValue).length > 1) {

			// Walk through implicit $and items
			filter[conditionChildKey] = {};
			filter[conditionChildKey]["$and"] = [];
			Object.keys(conditionChildValue).forEach(function(andKey) {
				var andItemObject = {};
				andItemObject[andKey] = conditionChildValue[andKey];
				filter[conditionChildKey]["$and"].push(andItemObject);
			});

			// Get filter
			filter[conditionChildKey] = ModelRelationships.relationshipConditionsToFilter(filter[conditionChildKey], datas);

			// Return filter
			return filter;

		} else if(typeof conditionChildValue === "object" && !(conditionChildValue instanceof Array)) {

			// Get filter
			filter[conditionChildKey] = ModelRelationships.relationshipConditionsToFilter(conditionChildValue, datas);

			// Return filter
			return filter;

		} else {

			// Set filter
			filter[conditionChildKey] = conditionChildValue;

			// Return filter
			return filter;

		}

		// Return filter
		return filter;

	}

}



/**
 * Module exports
 */
module.exports = ModelRelationships;