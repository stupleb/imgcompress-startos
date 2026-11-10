import { chown } from 'node:fs/promises'
import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { appUid, defaultMaxUploadMb, uiPort } from './utils'

export const main = sdk.setupMain(async ({ effects }) => {
  console.info(i18n('Starting ImgCompress!'))

  const maxUploadMb =
    (await storeJson.read((s) => s.maxUploadMb).const(effects)) ??
    defaultMaxUploadMb
  const workers = await storeJson.read((s) => s.workers).const(effects)

  await chown(sdk.volumes.tmp.path, appUid, appUid)

  return sdk.Daemons.of(effects).addDaemon('primary', {
    subcontainer: sdk.SubContainer.of(
      effects,
      { imageId: 'imgcompress' },
      sdk.Mounts.of().mountVolume({
        volumeId: 'tmp',
        subpath: null,
        mountpoint: '/tmp',
        readonly: false,
      }),
      'imgcompress-sub',
    ),
    exec: {
      command: sdk.useEntrypoint(),
      runAsInit: true,
      env: {
        DISABLE_UPDATE_CHECK: 'true',
        MAX_UPLOAD_SIZE_MB: String(maxUploadMb),
        WEB_WORKERS: workers ? String(workers) : 'auto',
      },
    },
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
