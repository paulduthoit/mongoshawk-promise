var assert = require('assert');
var logInfo = require('debug')('info');
var logError = require('debug')('error');
var mongoshawk = require('../lib/mongoshawk');
var _ = require('underscore');
var fs = require('fs');

// Export test function
module.exports.test = function() {

	// createConnection
	describe('#createConnection', function() {

		it('should return that connectionName is not a string', function() {

			// Action
			return Promise.resolve()
				.then(mongoshawk.createConnection.bind(null))
				.then(function(connection) {

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('connectionName have to be a string', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return that databaseName is not a string', function() {

			// Data
			var connectionName = 'main';

			// Action
			return Promise.resolve()
				.then(mongoshawk.createConnection.bind(null, connectionName))
				.then(function(connection) {

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('databaseName have to be a string', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return that serverConfig is not an object or array', function() {

			// Data
			var connectionName = 'main';
			var databaseName = 'fake';

			// Action
			return Promise.resolve()
				.then(mongoshawk.createConnection.bind(null, connectionName, databaseName))
				.then(function(connection) {

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('serverConfig have to be an object or an array', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return that serverConfig.host is not provided', function() {

			// Data
			var connectionName = 'main';
			var databaseName = 'fake';
			var serverConfig = {};

			// Action
			return Promise.resolve()
				.then(mongoshawk.createConnection.bind(null, connectionName, databaseName, serverConfig))
				.then(function(connection) {

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('serverConfig items have to define host as a string', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return that mongodb server is not found', function() {

			// Data
			var connectionName = 'main';
			var databaseName = 'fake';
			var serverConfig = {
				host: 'fake'
			};

			// Action
			return Promise.resolve()
				.then(mongoshawk.createConnection.bind(null, connectionName, databaseName, serverConfig))
				.then(function(connection) {

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err.message);

					// Tests
					assert.equal('MongoError', err.name);
					assert.equal('getaddrinfo ENOTFOUND fake', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return the database connection (serverConfig is an object)', function() {

			// Data
			var connectionName = 'main';
			var databaseName = 'test';
			var serverConfig = {
				host: '127.0.0.1',
				port: 27017
			};

			// Action
			return Promise.resolve()
				.then(mongoshawk.createConnection.bind(null, connectionName, databaseName, serverConfig))
				.then(function(connection) {

					// Info
					logInfo(connection);

					// Tests
					assert.equal('object', typeof connection.options);
					assert.equal('mongodb://127.0.0.1:27017/test', connection.options.url);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return the database connection (serverConfig is an array)', function() {

			// Data
			var connectionName = 'main2';
			var databaseName = 'test';
			var serverConfig = [ {
				host: '127.0.0.1',
				port: 27017
			} ];

			// Action
			return Promise.resolve()
				.then(mongoshawk.createConnection.bind(null, connectionName, databaseName, serverConfig))
				.then(function(connection) {

					// Info
					logInfo(connection);

					// Tests
					assert.equal('object', typeof connection.options);
					assert.equal('mongodb://127.0.0.1:27017/test', connection.options.url);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should return that options is not an object', function() {

			// Data
			var connectionName = 'main2';
			var databaseName = 'test';
			var serverConfig = [ {
				host: '127.0.0.1',
				port: 27017
			} ];
			var options = "";

			// Action
			return Promise.resolve()
				.then(mongoshawk.createConnection.bind(null, connectionName, databaseName, serverConfig, options))
				.then(function(connection) {

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('options have to be an object', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});
	
	});

	// getConnections
	describe('#getConnections', function() {

		it('should return the mongoshawk connections', function() {

			// Action
			var connections = mongoshawk.getConnections();

			// Info
			logInfo(connections);

			// Tests
			assert.equal('object', typeof connections);
			assert.equal('object', typeof connections.main);
			assert.equal('mongodb://127.0.0.1:27017/test', connections.main.url);
			assert.equal('object', typeof connections.main.connection);
			assert.equal('object', typeof connections.main2);
			assert.equal('mongodb://127.0.0.1:27017/test', connections.main2.url);
			assert.equal('object', typeof connections.main2.connection);

			// Resolve
			return Promise.resolve();

		});

	});

	// getConnection
	describe('#getConnection', function() {

		it('should return the main mongoshawk connection', function() {

			// Action
			var connection = mongoshawk.getConnection('main');

			// Info
			logInfo(connection);

			// Tests
			assert.equal('object', typeof connection);
			assert.equal('mongodb://127.0.0.1:27017/test', connection.url);
			assert.equal('object', typeof connection.connection);

			// Resolve
			return Promise.resolve();

		});

		it('should return undefined', function() {

			// Action
			var connection = mongoshawk.getConnection('fake');

			// Info
			logInfo(connection);

			// Tests
			assert.equal('undefined', typeof connection);

			// Resolve
			return Promise.resolve();

		});

	});

	// removeConnection
	describe('#removeConnection', function() {

		it('should return that the connection do not exist', function() {

			// Action
			return Promise.resolve()
				.then(function() {

					// Action
					mongoshawk.removeConnection('fake');

					// Tests
					assert(false);

				})
				.catch(function(err) {

					// Info
					logInfo(err);

					// Tests
					assert.equal('Error', err.name);
					assert.equal('connectionName is not a defined connection', err.message);

					// Resolve
					return Promise.resolve();

				})
				.catch(function(err) {

					// Error
					logError(err);

					// Throw error
					throw err;

				});

		});

		it('should remove the connection', function() {

			// Action
			mongoshawk.removeConnection('main2');
			var connection = mongoshawk.getConnection('main2');

			// Tests
			assert.equal('undefined', typeof connection);

			// Resolve
			return Promise.resolve();

		});

	});

};