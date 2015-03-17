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
          'src/.tmp/destinationLists.js': 'src/destinationLists.es6.js'
        }
      }
    },
    'browserify': {
      'static/js/app.js': ['src/.tmp/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['babel', 'browserify']);

};