# ImgCompress

## Documentation

- [ImgCompress Web UI guide](https://imgcompress.karimzouine.com/docs/web-ui/*) — uploading, converting, cropping, background removal and targeting a file size.

## What you get on StartOS

- ImgCompress on the **Web UI** interface. Drop images in, choose the format, quality and size, and download the results one by one or as a ZIP.
- Everything is processed on your server. Uploads and results are deleted about an hour after they were made.
- An optional login, set with the **Manage Access** action.

## Getting set up

1. Decide who should be able to use ImgCompress. It has no login of its own: anyone who can open one of its addresses can convert images, and can see and download the files other people converted. To require a password:
   1. Run **Manage Access** and choose **Private (require login)**.
   2. Keep the generated password, or type your own, and save. The result shows the username, `admin`, and the password.
   3. When you open ImgCompress, your browser asks for them.
2. Open the **Web UI**.

## Using ImgCompress

### Background removal

Background removal runs an AI model on your server's processor. It takes noticeably longer than a plain conversion: expect tens of seconds per photo, and more on a small server or for a large batch.

### Storage Management

The **Storage Management** panel, opened from the button at the bottom right of the web interface, lists every converted file still on the server, with a download button for each and **Clear Processed Files** to delete them all. Results are deleted automatically within two hours, so download what you want to keep right away.

### Manage Access

Run it again at any time to switch between **Public** and **Private (require login)**, or to change the password. The change applies within a few seconds, without restarting ImgCompress. After a password change, your browser asks for the new one.

## Limitations

- **No WebP output.** ImgCompress reads WebP images but can't save to WebP in this release, though the upstream guide already describes it. Use AVIF for a similarly small modern format.
