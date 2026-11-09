import { chown } from 'node:fs/promises'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { appUid, staticSite, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting ImgCompress!'))

  await chown(sdk.volumes.tmp.path, appUid, appUid)

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'imgcompress' },
      sdk.Mounts.of()
        .mountVolume({
          volumeId: 'tmp',
          subpath: null,
          mountpoint: '/tmp',
          readonly: false,
        })
        // The web UI asks GitHub for a newer release only when this file names a version.
        .mountAssets({
          subpath: 'release-notes.md',
          mountpoint: `${staticSite}/release-notes.md`,
          type: 'file',
        }),
      'imgcompress-sub',
    ),
    exec: { command: sdk.useEntrypoint(), runAsInit: true },
    ready: {
      display: i18n('Web Interface'),
      fn: () =>
        sdk.healthCheck.checkWebUrl(
          effects,
          `http://localhost:${uiPort}/api/health/backend`,
          {
            successMessage: i18n('The web interface is ready'),
            errorMessage: i18n('The web interface is not ready'),
          },
        ),
    },
    requires: [],
  })
})
