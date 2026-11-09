import { storeJson } from '../fileModels/store.json'
import { i18n } from '../i18n'
import { sdk } from '../sdk'
import { uiUsername } from '../utils'

const { InputSpec, Value, Variants } = sdk

const randomPassword = { charset: 'a-z,A-Z,0-9', len: 32 }

export const inputSpec = InputSpec.of({
  access: Value.union({
    name: i18n('Access'),
    description: i18n(
      '- Public: anyone who can reach one of its addresses can use ImgCompress, including its Storage Management panel, which lists every converted file still on the server\n- Private (require login): a username and password are required',
    ),
    default: 'public',
    variants: Variants.of({
      public: { name: i18n('Public'), spec: InputSpec.of({}) },
      private: {
        name: i18n('Private (require login)'),
        spec: InputSpec.of({
          password: Value.text({
            name: i18n('Password'),
            description: i18n(
              'The password for logging in as "admin". Use the generate button for a strong random password, or type your own.',
            ),
            required: true,
            masked: true,
            default: randomPassword,
            generate: randomPassword,
          }),
        }),
      },
    }),
  }),
})

export const manageAccess = sdk.Action.withInput(
  // id
  'manage-access',

  // metadata
  async ({ effects }) => ({
    name: i18n('Manage Access'),
    description: i18n(
      'Leave ImgCompress open to anyone who can reach its addresses, or require a username and password. The username is always "admin"; you set the password.',
    ),
    warning: null,
    allowedStatuses: 'any',
    group: null,
    visibility: 'enabled',
  }),

  // input spec
  inputSpec,

  // pre-fill
  async ({ effects }) => {
    const password = await storeJson.read((s) => s.uiPassword).once()
    return {
      access: password
        ? { selection: 'private' as const, value: { password } }
        : { selection: 'public' as const, value: {} },
    }
  },

  // execution
  async ({ effects, input }) => {
    if (input.access.selection === 'public') {
      await storeJson.merge(effects, { uiPassword: undefined })
      return {
        version: '1',
        title: i18n('ImgCompress is public'),
        message: i18n(
          "Anyone who can reach one of ImgCompress's addresses can use it without a login.",
        ),
        result: null,
      }
    }

    const { password } = input.access.value
    await storeJson.merge(effects, { uiPassword: password })
    return {
      version: '1',
      title: i18n('Login required'),
      message: i18n(
        'ImgCompress now asks for a username and password. Enter these when your browser prompts for them.',
      ),
      result: {
        type: 'group',
        value: [
          {
            type: 'single',
            name: i18n('Username'),
            description: null,
            value: uiUsername,
            masked: false,
            copyable: true,
            qr: false,
            launchable: false,
          },
          {
            type: 'single',
            name: i18n('Password'),
            description: null,
            value: password,
            masked: true,
            copyable: true,
            qr: false,
            launchable: false,
          },
        ],
      },
    }
  },
)
