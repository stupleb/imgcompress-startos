# ImgCompress

## Documentation

- [ImgCompress Web UI guide](https://imgcompress.karimzouine.com/docs/web-ui/*) — uploading, converting, cropping, background removal and targeting a file size.

## What you get on StartOS

- ImgCompress on the **Web UI** interface. Drop images in, choose the format, quality and size, and download the results one by one or as a ZIP.
- Everything is processed on your server. A conversion keeps running if you close the tab, and its results stay on the server for 48 hours after you last touched them.
- An optional login, set with the **Manage Access** action, and upload and worker limits, set with **Configure Limits**.

## Getting set up

1. Decide who should be able to use ImgCompress. It has no login of its own: anyone who can open one of its addresses can convert images, and can see and download the files other people converted. To require a password:
   1. Run **Manage Access** and choose **Private (require login)**.
   2. Keep the generated password, or type your own, and save. The result shows the username, `admin`, and the password.
   3. When you open ImgCompress, your browser asks for them.
2. Open the **Web UI**.

## Using ImgCompress

### Background removal and AI upscaling

Both run an AI model on your server's processor, so they take noticeably longer than a plain conversion: expect seconds for a small image, tens of seconds or more for a large photo, and longer on a small server or for a large batch.

### Storage Management

The **Storage Management** panel, opened from the button at the bottom right of the web interface, lists every converted file still on the server, with a download button for each and **Clear Processed Files** to delete them all. Results are deleted automatically 48 hours after their last activity.

### Manage Access

Run it again at any time to switch between **Public** and **Private (require login)**, or to change the password. The change applies within a few seconds, without restarting ImgCompress. After a password change, your browser asks for the new one.

### Configure Limits

Each upload is limited to 1 GB. If a very large PSD or PDF file is refused, run **Configure Limits** and raise **Upload size limit**. **Web workers** sets how many requests ImgCompress handles at once; leave it empty for one per processor core, or lower it if ImgCompress uses too much memory when several people use it at once. ImgCompress restarts to apply a change, which takes a few seconds.
