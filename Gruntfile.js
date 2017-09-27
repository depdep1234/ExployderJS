module.exports = function(grunt){
	grunt.initConfig({
		pkg : grunt.file.readJSON('package.json'),
		path : {
		    src_dir : "src/",
		    dest_dir : "build/"
		},
		uglify : {
			exployderJS : {
				options : {
					banner : '',
					mangle : true,
					compress : false
				},
				src : [
					'<%= path.src_dir %>console_fix.js',
					'<%= path.src_dir %>namespace.js',
					'<%= path.src_dir %>util.js',
					'<%= path.src_dir %>queue.js',
					'<%= path.src_dir %>model.js',
					'<%= path.src_dir %>image_loader.js',
					'<%= path.src_dir %>html_loader.js',
					'<%= path.src_dir %>resource_manager.js',
					'<%= path.src_dir %>scene_manager.js',
					'<%= path.src_dir %>controller.js',
					'<%= path.src_dir %>linkage.js',
					'<%= path.src_dir %>state_machine.js',
					'<%= path.src_dir %>scene_button_controller.js'
				],
				dest : "<%= path.dest_dir %>exployder.pack.js"
			}
		},
		copy : {
			
		},
		watch : {
			js : {
				files : [
					"<%= path.src_dir %>*.js"
				],
				tasks : [
					"uglify"
				]
			}
		}
	});
	
	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-watch');

	grunt.registerTask('build', [
		'uglify'
	]);
	grunt.registerTask('default', [
		'uglify',
		'watch'
	]);
};

