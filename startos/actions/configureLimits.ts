import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { defaultMaxUploadMb } from '../utils'

const { InputSpec, Value } = sdk

export const inputSpec = InputSpec.of({
  maxUploadMb: Value.number({
    name: i18n('Upload size limit'),
    description: i18n(
      'The largest single upload ImgCompress accepts, in megabytes. 1024 is 1 GB. Very large PSD or PDF files may need more; upstream allows up to 40960 (40 GB).',
    ),
    required: true,
    default: defaultMaxUploadMb,
    min: 1,
    integer: true,
    units: 'MB',
  }),
  workers: Value.number({
    name: i18n('Web workers'),
    description: i18n(
      'How many requests ImgCompress handles at once. Leave empty for one per CPU core. Each worker that has run background removal or AI upscaling keeps that model in memory, so fewer workers use less memory when several people convert at once.',
    ),
    required: false,
    default: null,
    min: 1,
    integer: true,
    placeholder: i18n('One per CPU core'),
  }),
})

export const configureLimits = sdk.Action.withInput(
  // id
  'configure-limits',

  // metadata
  async ({ effects }) => ({
    name: i18n('Configure Limits'),
    description: i18n(
      'Set the largest upload ImgCompress accepts and how many web workers it runs. A running ImgCompress restarts to apply a change.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // input spec
  inputSpec,

  // pre-fill
  async ({ effects }) => ({
    maxUploadMb:
      (await storeJson.read((s) => s.maxUploadMb).once()) ?? defaultMaxUploadMb,
    workers: (await storeJson.read((s) => s.workers).once()) ?? null,
  }),

  // execution
  async ({ effects, input }) => {
    await storeJson.merge(effects, {
      maxUploadMb: input.maxUploadMb,
      workers: input.workers,
    })
  },
)
