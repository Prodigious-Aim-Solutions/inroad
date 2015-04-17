var optipng = require('imagemin-optipng');

module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'babel': {
      dist: {
        files: {
          'src/.tmp/app.js': 'src/app.es6.js',
          'src/.tmp/map.js': 'src/map.es6.js',
          'src/.tmp/register.js': 'src/register.es6.js',
          'src/.tmp/signin.js': 'src/signin.es6.js',
          'src/.tmp/checkin.js': 'src/checkin.es6.js',
          'src/.tmp/badge.js': 'src/badge.es6.js',
          'src/.tmp/destinationList.js': 'src/destinationList.es6.js',
          'src/.tmp/destinationLists.js': 'src/destinationLists.es6.js',
          'src/.tmp/confirmationModal.js': 'src/confirmationModal.es6.js',
          'src/.tmp/analytics.js': 'src/analytics.es6.js'
        }
      }
    },
    'browserify': {
      'static/js/app.js': ['src/.tmp/*.js']
    },
    'imagemin': {
      default: {
        options: {
          optimizationLevel: 7,
          use: [optipng()]
        },
        files: {
          'static/images/Southwest_corner_of_Cape_Breton_Highlands_National_Park.png': 'static/images/Southwest_corner_of_Cape_Breton_Highlands_National_Park.png'
        }
      }
    }
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');
  grunt.loadNpmTasks('grunt-contrib-imagemin');
  
  grunt.registerTask('compress', ['imagemin']);

  grunt.registerTask('default', ['babel', 'browserify']);

};