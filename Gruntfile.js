module.exports = function(grunt) {

  grunt.initConfig({
    pkg: grunt.file.readJSON('package.json'),
    'babel': {
      dist: {
        files: {
          'src/.tmp/app.js': 'src/app.es6',
          'src/.tmp/map.js': 'src/map.es6',
          'src/.tmp/register.js': 'src/register.es6',
          'src/.tmp/signin.js': 'src/signin.es6',
          'src/.tmp/checkin.js': 'src/checkin.es6'
        }
      }
    },
    'browserify': {
      'static/app.js': ['src/.tmp/*.js']
    }
  });

  grunt.loadNpmTasks('grunt-babel');
  grunt.loadNpmTasks('grunt-browserify');

  grunt.registerTask('default', ['babel', 'browserify']);

};