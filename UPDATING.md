# Updating the upstream version

Upstream is the `ghcr.io/karimz1/imgcompress` image, pinned by tag in
`startos/manifest/index.ts`. [karimz1/imgcompress](https://github.com/karimz1/imgcompress)
builds it from each `release_X.Y.Z` tag and publishes the same image to Docker Hub as
`karimz1/imgcompress`.

## Determining the upstream version

Take the newest release GitHub does not mark as a pre-release:

```bash
gh release list -R karimz1/imgcompress --exclude-pre-releases --limit 1
```

Its tag `release_X.Y.Z` is published as the image tag `X.Y.Z`. Release candidates
(`X.Y.Z-rc.N`) and `nightly` are test builds; don't pin them. Confirm the tag carries
both architectures (the two `unknown/unknown` entries are build attestations):

```bash
docker buildx imagetools inspect ghcr.io/karimz1/imgcompress:X.Y.Z | grep Platform
```

## Applying the bump

1. Set `images.imgcompress.source.dockerTag` in `startos/manifest/index.ts` to
   `ghcr.io/karimz1/imgcompress:X.Y.Z`.
2. In `startos/versions/current.ts`, set `version` to `X.Y.Z:0` and rewrite the release
   notes, linking the upstream release.
3. Check what `startos/main.ts` relies on inside the image, all visible in upstream's
   `Dockerfile`, `entrypoint.py` and `backend/image_converter/config/` at the new tag:
   - the process still runs as uid 65532 (`appUid` in `startos/utils.ts`, which owns the
     `tmp` volume);
   - `temporary_storage.directory` and `logging.backend_log_file` in `app.json` are still
     under `/tmp`;
   - `loader.py` still reads `DISABLE_UPDATE_CHECK`, `MAX_UPLOAD_SIZE_MB` and
     `WEB_WORKERS` with the same meaning; `main.ts` sets all three.
4. Read the release notes for new environment variables. Upstream's settings are
   environment variables read at start.
