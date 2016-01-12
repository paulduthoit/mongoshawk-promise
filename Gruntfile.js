module.exports = function(grunt) {
 
	// Grunt init configuration
	grunt.initConfig({

		// Grunt clean
		clean: {

			// Prepare
			prepare: {
				src: [ 'build' ]
			}

		},

		// Grunt copy
		copy: {

			// Prepare
			prepare: {
				expand: true,
				cwd: 'src',
				src: [ '**' ],
				dest: 'build'
			}

		},

		// Grunt shell
		shell: {

			// Populate DB
			populateDB: {
				command: 'mongo testNextyapi ./tests/populateDB.js'
			},

			// Start server
			start: {
				command: 'node build/app.js'
			}

		},

		// Grunt mocha
		mochaTest: {

			// Test
			test: {
				src: [ './tests/tests.js' ],
				options: {
					timeout: 10000
				}
			}

		}

	});
 
	// Load plugins
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-shell');
	grunt.loadNpmTasks('grunt-mocha-test');
 
	// Tasks
	grunt.registerTask('release', [ 'clean:prepare', 'copy:prepare' ]);
	grunt.registerTask('build', [ 'clean:prepare', 'copy:prepare' ]);
	grunt.registerTask('build-test', [ 'clean:prepare', 'copy:prepare' ]);
	grunt.registerTask('run-test', [ 'shell:populateDB', 'mochaTest:test' ]);

}
