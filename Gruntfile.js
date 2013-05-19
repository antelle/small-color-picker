module.exports = function(grunt) {

    grunt.initConfig({
        pkg: grunt.file.readJSON("package.json"),
        qunit: {
            all: ["test/**/*.html"]
        },
        clean: {
            options: {
                force: true,
            },
            src: ["../build-v1/css/", "../build-v1/js/", "../build-v1/img/", "../site/scp"]
        },
        uglify: {
            options: {
                banner: "/*! <%= pkg.name %> v<%= pkg.version %>  | (c) <%= grunt.template.today('yyyy') %> Antelle | https://github.com/antelle/small-color-picker/blob/master/MIT-LICENSE.txt */\n"
            },
            color_picker: {
                files: {
                    "../build-v1/js/small-color-picker.min.js": ["js/*.js"]
                }
            }
        },
        less: {
            color_picker: {
                options: {
                    paths: ["less"],
                    yuicompress: true
                },
                files: {
                    "../build-v1/css/small-color-picker.min.css": ["less/circle-picker.less"],
                    "../build-v1/css/color-buttons.min.css": ["less/color-buttons.less"]
                }
            }
        },
        copy: {
            color_picker: {
                files: [
                    { expand: true, src: ["img/*.jpg", "img/*.png"], dest: "../build-v1/" }
                ]
            },
            site: {
                files: [
                    { expand: true, flatten: true, src: ["../build-v1/img/*.jpg", "../build-v1/img/*.png"], dest: "../site/scp/img/" },
                    { expand: true, flatten: true, src: "../build-v1/js/*.js", dest: "../site/scp/js/" },
                    { expand: true, flatten: true, src: "../build-v1/css/*.css", dest: "../site/scp/css/" }
                ]
            }
        }
    });

    grunt.loadNpmTasks("grunt-contrib-qunit");
    grunt.loadNpmTasks("grunt-contrib-clean");
    grunt.loadNpmTasks("grunt-contrib-uglify");
    grunt.loadNpmTasks("grunt-contrib-less");
    grunt.loadNpmTasks("grunt-contrib-copy");

    grunt.registerTask("default", ["qunit", "clean", "uglify", "less", "copy"]);

};
