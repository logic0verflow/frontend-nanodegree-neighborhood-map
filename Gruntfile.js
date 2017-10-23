module.exports = function(grunt) {

  grunt.initConfig({

    responsive_images: {
      dev: {
        options: {
          engine: 'im',
          sizes: [{
            width: 32,
            suffix: '_exsm',
            quality: 30
          }]
        },
        files: [{
          expand: true,
          src: ['*.{gif,jpeg,jpg,png}'],
          cwd: 'src/img/',
          dest: 'dist/img/'
        }]
      },
    },

    /* Clear out the images directory if it exists */
    clean: {
      dev: {
        src: ['dist/img'],
      }
    },

    /* Generate the images directory if it is missing */
    mkdir: {
      dev: {
        options: {
          create: ['dist/img']
        },
      },
    },

    htmlmin: {
        dist: {
            options: {
                removeComments: true,
                collapseWhitespace: true
            },
            files: {
                'dist/index.html': 'src/index.html'
            }
        }
    },

    uglify: {
        dist: {
            options: {
                comments: false
            },
            files: {
                'dist/js/app-knockout.js': 'src/js/app-knockout.js',
                'dist/js/app.js': 'src/js/app.js'
            }
        }
    },

    cssmin: {
        dist: {
            files: {
                'dist/css/master.css': 'src/css/master.css',
                'dist/css/loc-info-pane.css': 'src/css/loc-info-pane.css'
            }
        }
    },

    copy: {
      main: {
        files: {
            'dist/img/no-place-preview.jpg': 'src/img/no-place-preview.jpg',
            'dist/img/poweredby_nytimes_150c.png': 'src/img/poweredby_nytimes_150c.png',
            'dist/css/bootstrap.min.css': 'src/css/bootstrap.min.css',
            'dist/js/bootstrap.min.js': 'src/js/bootstrap.min.js',
            'dist/js/jquery-3.2.1.min.js': 'src/js/jquery-3.2.1.min.js',
            'dist/js/knockout-3.4.2.js': 'src/js/knockout-3.4.2.js'
        },
      },
    },
    fileregexrename: {
		dev: {
			files: {
				"dist/img/img": "dist/img/*",
				"dist/views/images/images": "dist/views/images/*"
			},
			options: {
				replacements: [{
					pattern: "-32_exsm",
					replacement: ""
				}]
			}
		}
	},
  });

  grunt.loadNpmTasks('grunt-responsive-images');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-copy');
  grunt.loadNpmTasks('grunt-mkdir');
  grunt.loadNpmTasks('grunt-contrib-htmlmin');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-cssmin');
  grunt.loadNpmTasks('grunt-file-regex-rename');
  grunt.registerTask('default',
  [
      'clean',
      'mkdir',
      'responsive_images',
      'htmlmin',
      'uglify',
      'cssmin',
      'fileregexrename',
      'copy'
  ]);

};
