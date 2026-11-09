import { setupManifest } from '@start9labs/start-sdk'
import { long, short } from './i18n'

export const manifest = setupManifest({
  id: 'imgcompress',
  title: 'ImgCompress',
  license: 'GPL-3.0',
  packageRepo: 'https://github.com/stupleb/imgcompress-startos',
  upstreamRepo: 'https://github.com/karimz1/imgcompress',
  marketingUrl: 'https://imgcompress.karimzouine.com',
  donationUrl: 'https://github.com/sponsors/karimz1',
  description: { short, long },
  volumes: ['startos', 'tmp'],
  images: {
    imgcompress: {
      source: { dockerTag: 'ghcr.io/karimz1/imgcompress:0.9.0' },
      arch: ['x86_64', 'aarch64'],
    },
  },
})
