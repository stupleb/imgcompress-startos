import { FileHelper, z } from '@start9labs/start-sdk'
import { sdk } from '../sdk'
import { defaultMaxUploadMb } from '../utils'

export const storeJson = FileHelper.json(
  { base: sdk.volumes.startos, subpath: 'store.json' },
  z.looseObject({
    uiPassword: z.string().optional().catch(undefined),
    maxUploadMb: z.number().int().min(1).catch(defaultMaxUploadMb),
    workers: z.number().int().min(1).nullable().catch(null),
  }),
)
