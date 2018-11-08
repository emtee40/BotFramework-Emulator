// const gulp = require('gulp');
const common = require('./gulpfile.common.js');
const packageJson = require('./package.json');

stageThenDist()
  .then(files => console.log('CREATED FILES: ', files))
  .catch(err => console.error('ERROR WHILE BUILDING MAC: ', err));

async function stageThenDist() {
  await stage();
  return await redist();
}

/** Package the emulator using electron-builder */
async function stage() {
  const { getConfig } = common;
  const builder = require('electron-builder');
  const config = getConfig('mac', 'dir');

  // create build artifacts
  await builder.build({
    targets: builder.Platform.MAC.createTarget(['dir']),
    config
  });
};

/** Creates the emulator installers */
async function redist() {
  const { getConfig, getReleaseFilename } = common;
  const rename = require('gulp-rename');
  const builder = require('electron-builder');
  const config = getConfig('mac');

  // create installers
  const filenames = await builder.build({
    targets: builder.Platform.MAC.createTarget(['zip', 'dmg']),
    config,
    prepackaged: './dist/mac'
  });

  return filenames;

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

/** Creates the .yml and .json metadata files */
// gulp.task('redist:metadata-only', async () => {
//   const { hashFileAsync, getReleaseFilename } = common;
//   const releaseFilename = `${getReleaseFilename()}.zip`;
//   const releaseHash = await hashFileAsync(`./dist/${releaseFilename}`);
//   const releaseDate = new Date().toISOString();

//   writeYamlMetadataFile(releaseFilename, 'latest-mac.yml', './dist', releaseHash, releaseDate);
// });

/** Writes the .yml metadata file */
function writeYamlMetadataFile(releaseFilename, yamlFilename, path, fileHash, releaseDate, extra = {}) {
  const { extend, getEnvironmentVar } = common;
  const fsp = require('fs-extra');
  const yaml = require('js-yaml');
  const version = getEnvironmentVar('EMU_VERSION', packageJson.version);

  const ymlInfo = {
    version,
    releaseDate,
    githubArtifactName: releaseFilename,
    path: releaseFilename,
    sha512: fileHash
  };
  const obj = extend({}, ymlInfo, extra);
  const ymlStr = yaml.safeDump(obj);
  fsp.writeFileSync(`./${path}/${yamlFilename}`, ymlStr);
}
