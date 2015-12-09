module.exports = function(grunt) {
  
  // Let's set up our 'source' and 'build' folders
  var globalConfig = {
    src: 'src',
    build: '_site'
  };
  
  // Load all grunt tasks matching the 'grunt-*' pattern
  require('load-grunt-tasks')(grunt);

  grunt.initConfig({
    globalConfig: globalConfig,
    pkg: grunt.file.readJSON('package.json'),

    // shell commands for use in Grunt tasks
    shell: {
      jekyllBuild: {
        command: 'jekyll build'
      },
      jekyllDev: {
        command: 'jekyll build --drafts'
      }
    },

    // watch
    watch: {
      // Watch for changes in rootImages
      favicons: {
        files: ['<%= globalConfig.src %>/favicons/**/*.{jpg,jpeg,png,gif,svg}'],
        tasks: ['newer:copy:favicons']
      },
      // Watch for changes in fonts
      fonts: {
        files: ['<%= globalConfig.src %>/fonts/**/*.{eot,svg,ttf,woff,woff2}'],
        tasks: ['newer:copy:fonts']
      },
      // Watch for changes in vendor javascript
      vendorScripts: {
        files: ['<%= globalConfig.src %>/js/vendor/**/*.js'],
        tasks: ['concat:vendorScripts']
      },
      // Watch for changes in main javascript
      mainScript: {
        files: ['<%= globalConfig.src %>/js/main.js'],
        tasks: ['jshint:mainScript', 'copy:mainScript']
      },
      // Watch for changes to styles
      styles: {
        files: ['<%= globalConfig.src %>/scss/**/*.{scss,sass}'],
        tasks: ['sass:develop', 'autoprefixer']
      },
      // Watch for jekyll changes
      jekyll: {
        files: ['<%= globalConfig.src %>/_includes/**/*.{html,svg}',
                '<%= globalConfig.src %>/_layouts/**/*.{html}',
                '<%= globalConfig.src %>/_posts/**/*.{html}',
                '<%= globalConfig.src %>/*.{html,md,xml,yml}'
                ],
        tasks: ['shell:jekyllDev']
      }
    }, 
    // end watch
    
    // Let's do some copying!
    copy: {    
      // Favicons
      favicons: {
        files: [{
          expand: true,
          cwd: '<%= globalConfig.src %>/favicons/',
          src: ['**'], 
          dest: '<%= globalConfig.build %>/'
        }]
      },
      
      // Font files
      fonts: {
        files: [{
          expand: true,
          cwd: '<%= globalConfig.src %>/fonts',
          src: ['**'], 
          dest: '<%= globalConfig.build %>/fonts'
        }]
      },
      
      // Main javascript file
      mainScript: {
        files: [{
          expand: true,
          cwd: '<%= globalConfig.src %>/js',
          src: ['main.js'],
          dest: '<%= globalConfig.build %>/js/'
        }]
      }        
    }, 
    // end copy 
    
    // SASS/CSS Development
		// Compile sass
		sass: {
			develop: {
				options: {
					style: 'expanded'
				},
				files: {
					'<%= globalConfig.build %>/css/main.css': '<%= globalConfig.src  %>/scss/main.scss'
				}
			}
		},
		// end compilation
		
		// Autoprefixer
		autoprefixer: {
			options: {
				browsers: ['last 2 versions', 'ie9', 'ios 6', 'android 4']
			},
			files: {
				expand: true,
				flatten: true,
				src: '<%= globalConfig.build %>/css/*.css'
			}
		},
		// end autoprefixer
		
		// SASS/CSS Build
		// Combine all of our media queries
		cmq: {
			mainCSS: {
	        expand: true,
	        src: '<%= globalConfig.build %>/css/*.css'
	    }
		}, // end combining media queries
		
		// Send our CSS to Jenny Craig
		cssmin: {
		  target: {
		    files: [{
		      expand: true,
		      cwd: '<%= globalConfig.build %>/css/',
		      src: ['*.css', '!*.min.css'],
		      dest: '<%= globalConfig.build %>/css/',
		      ext: '.css'
		    }]
		  }
		},
		// enough weight lost
		
		// Javascript Development
		// Concat vendor/bower scripts
		concat: {
	    options: {
	      separator: ';',
	    },
	    vendorScripts: {
	      src: [
  	      'bower_components/jquery/dist/jquery.js',
  	      'bower_components/modernizr/modernizr.js',
	      	'<%= globalConfig.src  %>/js/vendor/vendor.js'
	      ],
	      dest: '<%= globalConfig.build %>/js/vendor.js',
	    }
	  },
	  // end concat
		
		// Javascript linting using jshint
		jshint: {
			mainScript: '<%= globalConfig.src  %>/js/main.js'
		}, 
		// end linting
		
		// Javascript Build
		// Javascript minification with uglify
		uglify: {
	    build: {
	      files: {
	        '<%= globalConfig.build %>/js/main.js': ['<%= globalConfig.build %>/js/main.js'],
	        '<%= globalConfig.build %>/js/vendor.js': ['<%= globalConfig.build %>/js/vendor.js']
	      }
	    }
	  }, 
	  // end minification

		// Get images ready for summer with imagemin
		imagemin: {
			themeImages: {
				options: {
					optimizationLevel: 7,
					progressive: true,
					interlaces: true
				},
				files: [{
					expand: true,
					cwd: '<%= globalConfig.src  %>/images/',
					src: ['**/*.{jpg,jpeg,png,gif,svg}'],
					dest: '<%= globalConfig.build %>/images/'
				}]
			}
		},
		// end imagemin
		
		// preview changes live with browserSync!
		browserSync: {
			dev: {
				bsFiles: {
					src: ['<%= globalConfig.build %>/css/main.css', '<%= globalConfig.build %>/js/*.js','<%= globalConfig.build %>/images/**/*.{jpg,jpeg,png,gif,svg}']
				},
				options: {
					watchTask: true,
          server: './_site'
				}
			}
		},
		// end browserSync			
	});	
	
	// Development
	grunt.registerTask('default', [
		'copy',
		'sass:develop', 'autoprefixer',
		'jshint',
		'concat:vendorScripts',
		'newer:imagemin',
    'shell:jekyllDev',
		'browserSync', 'watch'
	]);
	
	// Build
	grunt.registerTask('build', [
		'copy',
		'sass:develop', 'autoprefixer',
		'jshint',
		'concat:vendorScripts',
		'cmq','cssmin',
		'uglify',
		'imagemin',
    'shell:jekyllBuild'
	]);

};