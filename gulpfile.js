//gulpfile.js
  var gulp = require('gulp');
	var rename = require('gulp-rename');  

//------------------------------------------
	//process css files
	var postcss = require('gulp-postcss');
	var autoprefixer = require('autoprefixer');
	var mqpacker = require('css-mqpacker');
	var cssnano = require('cssnano');
	var precss = require('precss');
	//css paths
	var cssFiles = ['src/app.css'],  
	    cssDest = 'src/';

	gulp.task('css', function () {
	  var processors = [
	  	precss,
	  	autoprefixer,
	  	mqpacker,
	  	cssnano
	  ];
	  return gulp.src(cssFiles)
	    .pipe(postcss(processors))
	    .pipe(rename('myrecipemongo.min.css'))
	    .pipe(gulp.dest(cssDest));
	});
