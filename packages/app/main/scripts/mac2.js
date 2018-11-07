stageAndRedist().catch(e => console.error(e));

/** Package the emulator using electron-builder */
async function stageAndRedist() {
  const packageJson = require('../package.json')
  const builder = require('electron-builder');
  const config = packageJson.build;

  // create build artifacts
  await builder.build({
    targets: builder.Platform.MAC.createTarget(['dir']),
    config
  });

  // create installers
  const results = await builder.build({
    targets: builder.Platform.MAC.createTarget(['zip', 'dmg']),
    config,
    prepackaged: './dist/mac'
  });
  console.log(results);
};