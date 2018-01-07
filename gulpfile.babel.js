import gulp from 'gulp';
import del from 'del';
import babel from 'gulp-babel';
import sass from 'gulp-sass';
import notify from 'gulp-notify';
import autoprefixer from 'gulp-autoprefixer';
import rename from 'gulp-rename';
import concat from 'gulp-concat';
import cssnano from 'gulp-cssnano';
import uglifyjs from 'gulp-uglifyjs';
import newer from 'gulp-newer';
import browserSync from 'browser-sync';

gulp.task('browser-sync', () => {
    browserSync.init({
        server: {
            baseDir: './app'
        },
        notify: false
    })
});

gulp.task('sass', () => { 
	return gulp.src('./app/scss/**/*.scss') 
        .pipe(sass()
        .on('error', notify.onError({
            message: "<%= error.message %>",
            title: "Sass Error!"
         })))
        .pipe(autoprefixer(['last 2 versions', '> 1%', 'safari >= 7', 'ie >= 8'], { cascade: true }))
        .pipe(cssnano())
        .pipe(rename({ suffix: '.min' }))
        .pipe(gulp.dest('app/css'))
        .pipe(browserSync.reload({ stream: true })) 
});

gulp.task('polyfills', () => {
  return gulp.src('./app/js/polyfills/*.js')
		.pipe(concat('polyfills.all.js'))
		.pipe(gulp.dest('app/js'))
});

gulp.task('babel', () => {
  return gulp.src('./app/js/app.js')
        .pipe(babel({
            presets: ['es2015',  
                     ['env', {'targets': {"browsers": ['last 15 versions',
                                                       '> 1%',
                                                       'safari >= 7',
                                                       'ie >= 8'
                                                       ] }
                              }
                     ]
            ]
        }).on('error', notify.onError({
            message: "<%= error.message %>",
            title: "Babel Error!"
        })))
        .pipe(rename({ suffix: '.babel' }))
        .pipe(gulp.dest('app/js'))
});

gulp.task('scripts', ['polyfills', 'babel'], () => {
  return gulp.src(['./app/js/polyfills.all.js', './app/js/jquery-3.2.1.js','./app/js/app.babel.js'])
        .pipe(concat('app.min.js'))
        .pipe(uglifyjs())
        .pipe(gulp.dest('app/js'))
        .pipe(browserSync.reload({stream: true}));
});


gulp.task('watch', ['sass', 'scripts', 'browser-sync'], () => {
    gulp.watch('./app/**/*.html', browserSync.reload);
    gulp.watch('./app/scss/**/*.scss', ['sass']);
    gulp.watch('./app/js/app.js', ['scripts']);
});

gulp.task('clean', () => {
	return del.sync('dist');
});

gulp.task('build', ['clean', 'sass', 'scripts'], () => {

	let buildCss = gulp.src('app/css/app.min.css')
		.pipe(gulp.dest('dist/css'))

	let buildFonts = gulp.src('app/fonts/**/*') 
		.pipe(gulp.dest('dist/fonts'))

	let buildJs = gulp.src('app/js/app.min.js') 
		.pipe(gulp.dest('dist/js'))

	let buildImages = gulp.src('app/img/*')
		.pipe(gulp.dest('dist/img')) 

	let buildImagesCss = gulp.src('app/css/images/*.*')
		.pipe(gulp.dest('dist/css/images'))

	let buildHtml = gulp.src('app/*.html') 
		.pipe(gulp.dest('dist'));

});

gulp.task('default', ['watch']);