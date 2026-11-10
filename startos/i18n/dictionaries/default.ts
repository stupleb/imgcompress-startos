export const DEFAULT_LANG = 'en_US'

const dict = {
  // main.ts
  'Starting ImgCompress!': 0,
  'Web Interface': 1,
  'The web interface is ready': 2,
  'The web interface is not ready': 3,

  // interfaces.ts
  'Web UI': 4,
  'Compress, convert and resize images': 5,

  // actions/manageAccess.ts
  Access: 6,
  '- Public: anyone who can reach one of its addresses can use ImgCompress, including its Storage Management panel, which lists every converted file still on the server\n- Private (require login): a username and password are required': 7,
  Public: 8,
  'Private (require login)': 9,
  Password: 10,
  'The password for logging in as "admin". Use the generate button for a strong random password, or type your own.': 11,
  'Manage Access': 12,
  'Leave ImgCompress open to anyone who can reach its addresses, or require a username and password. The username is always "admin"; you set the password.': 13,
  'ImgCompress is public': 14,
  "Anyone who can reach one of ImgCompress's addresses can use it without a login.": 15,
  'Login required': 16,
  'ImgCompress now asks for a username and password. Enter these when your browser prompts for them.': 17,
  Username: 18,

  // actions/configureLimits.ts
  'Upload size limit': 19,
  'The largest single upload ImgCompress accepts, in megabytes. 1024 is 1 GB. Very large PSD or PDF files may need more; upstream allows up to 40960 (40 GB).': 20,
  'Web workers': 21,
  'How many requests ImgCompress handles at once. Leave empty for one per CPU core. Each worker that has run background removal or AI upscaling keeps that model in memory, so fewer workers use less memory when several people convert at once.': 22,
  'One per CPU core': 23,
  'Configure Limits': 24,
  'Set the largest upload ImgCompress accepts and how many web workers it runs. A running ImgCompress restarts to apply a change.': 25,
} as const

/**
 * Plumbing. DO NOT EDIT.
 */
export type I18nKey = keyof typeof dict
export type LangDict = Record<(typeof dict)[I18nKey], string>
export default dict
