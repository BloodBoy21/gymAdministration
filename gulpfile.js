const { src, dest, watch } = require('gulp');
const sass = require('gulp-sass')(require('sass'));
const plumber = require('gulp-plumber');

const filesSCSS = 'src/public/scss/**/*.scss';

function css(done) {
  // Indentidicar el archivo .SCSS a compilar
  src(filesSCSS)
    .pipe(plumber())
    // Compilar el archivo
    .pipe(sass())
    // Alamacenar
    .pipe(dest('src/public/css/'));

  done();
}

function dev(done) {
  watch(filesSCSS, css);
  done();
}

exports.dev = dev;
