stageAndRedist().catch(e => console.error(e));

/** Package the emulator using electron-builder */
async function stageAndRedist() {
  const common = require('../gulpfile.common.js');
  const path = require('path');

  /** Package the emulator using electron-builder */
  const { getConfig } = common;
  const builder = require('electron-builder');
  const config = getConfig('mac', 'dir');

  // create build artifacts
  await builder.build({
    targets: builder.Platform.MAC.createTarget(['dir']),
    config,
    projectDir: path.resolve('.')
  });

  /** Creates the emulator installers */
  const config2 = getConfig('mac');

  // create installers
  const filenames = await builder.build({
    targets: builder.Platform.MAC.createTarget(['zip', 'dmg']),
    config2,
    prepackaged: '../dist/mac',
    projectDir: path.resolve('.')
  });
  console.log(filenames);

  // rename and move the files to the /dist/ directory
  // await new Promise(resolve => {
  //   gulp
  //     .src(filenames, { allowEmpty: true })
  //     .pipe(rename(path => {
  //       path.basename = getReleaseFilename();
  //     }))
  //     .pipe(gulp.dest('./dist'))
  //     .on('end', resolve);
  // });
};