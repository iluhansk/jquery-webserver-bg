var gulp = require('gulp'),
        uglify = require('gulp-uglify'),
        rename = require('gulp-rename');

gulp.task('minify', function () {
    gulp.src(['src/*.js', '!src/*.min.js']) // Исключаем минифицированные файлы
            .pipe(uglify()) // Сжимаем JS файл
            .pipe(rename({
                suffix: '.min'
            })) // Добавляем суффикс .min
            .pipe(gulp.dest('src')); // Выгружаем в папку назначения
});
