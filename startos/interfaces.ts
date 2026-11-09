import { storeJson } from './fileModels/store.json'
import { i18n } from './i18n'
import { sdk } from './sdk'
import { uiHostId, uiPort, uiUsername } from './utils'

export const setInterfaces = sdk.setupInterfaces(async ({ effects }) => {
  const password = await storeJson.read((s) => s.uiPassword).const(effects)

  const uiMultiOrigin = await sdk.MultiHost.of(effects, uiHostId).bindPort(
    uiPort,
    {
      protocol: 'http',
      proxy: password
        ? {
            auth: {
              type: 'basic',
              credentials: [{ username: uiUsername, password }],
              realm: 'ImgCompress',
            },
          }
        : undefined,
    },
  )

  const ui = sdk.createInterface(effects, {
    name: i18n('Web UI'),
    id: 'ui',
    description: i18n('Compress, convert and resize images'),
    type: 'ui',
    masked: false,
    schemeOverride: null,
    username: null,
    path: '',
    query: {},
  })

  return [await uiMultiOrigin.export([ui])]
})
