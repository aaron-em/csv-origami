module.exports = function (grunt) {
  var gruntConfig = {}
    , makeBowerDist
    , bowerTemplate;

  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-shell');

  makeBowerDist = function() {
    return grunt.template
      .process(bowerTemplate, {
        data: {
          package: grunt.file
            .readJSON('package.json'),
          lib: grunt.file
            .read('lib/csv-origami.js')
            .replace(/(?:^|\n)/g, '\n  ')
        }
      });
  };

  bowerTemplate = [
    '/*',
    ' * CSV Origami version <%= package.version %>',
    ' * Generated on <%= grunt.template.today(\'yyyy-mm-dd\') %>',
    ' */',
    'define(function(require, exports, module) {',
    '<%= lib %>',
    '});'
  ].join('\n');

  grunt.initConfig({
    devServer: {
      port: 12344
    },

    jshint: {
      files: [
        '*.js',
        'lib/*.js',
        'test/*.js',
        'test/lib/*.js'
      ],
      options: {
        jshintrc: './.jshintrc'
      }
    },

    shell: {
      test: {
        command: 'istanbul cover '
                 + '--report lcov '
                 + '--dir test/output '
                 + 'node_modules/.bin/_mocha test test/lib -- '
                 + '--reporter spec'
      },
      coverage: {
        command: 'open test/output/lcov-report/index.html'
      },

      bowerClean: {
          command: 'rm -rf ./bower'
      },
      bowerPrep: {
        command: 'mkdir ./bower'
      },
      bowerCopy: {
        command: 'echo "'
               + makeBowerDist()
               + '" > bower/csv-origami.js'
      },

      devServer: {
        command: '(cd examples/client '
               + '&& node server.js '
               + '--port <%= devServer.port %> &)'
               + '&& open http://localhost:<%= devServer.port %>'
      }
    }
  });

  grunt.registerTask('test', [
    'jshint',
    'shell:test'
  ]);

  grunt.registerTask('coverage', [
    'jshint',
    'shell:test',
    'shell:coverage'
  ]);

  grunt.registerTask('bower', [
    'shell:bowerClean',
    'shell:bowerPrep',
    'shell:bowerCopy'
  ]);

  grunt.registerTask('server', [
    'bower',
    'shell:devServer'
  ]);
};
