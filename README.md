<p align="center">
  <img src="icon.webp" alt="ImgCompress Logo" width="21%">
</p>

# ImgCompress on StartOS

> Everything not listed in this document should behave the same as upstream ImgCompress.
> If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

[ImgCompress](https://github.com/karimz1/imgcompress) compresses, converts and resizes
images in bulk and removes backgrounds with an AI model that runs on the CPU. This
package runs upstream's image unmodified. It adds an optional login enforced by
StartOS, keeps uploads on the data drive, and stops the web UI from checking GitHub for
new releases.

---

## Table of Contents

- [Image and Container Runtime](#image-and-container-runtime)
- [Volume and Data Layout](#volume-and-data-layout)
- [File Models](#file-models)
- [Dependencies](#dependencies)
- [Network Access and Interfaces](#network-access-and-interfaces)
- [Installation and First-Run Flow](#installation-and-first-run-flow)
- [Actions](#actions)
- [Tasks](#tasks)
- [Health Checks](#health-checks)
- [Backups and Restore](#backups-and-restore)
- [Limitations and Differences](#limitations-and-differences)
- [Quick Reference for AI Consumers](#quick-reference-for-ai-consumers)

---

## Image and Container Runtime

The package runs upstream's own image and entrypoint in one subcontainer.

| Property      | Value                                                                       |
| ------------- | --------------------------------------------------------------------------- |
| Image         | `ghcr.io/karimz1/imgcompress`, upstream, unmodified                         |
| Architectures | x86_64, aarch64                                                             |
| Entrypoint    | upstream: `dumb-init`, then `entrypoint.py`, run as the container's PID 1   |
| User          | the image's `nonroot` user, uid 65532                                       |
| Subcontainer  | `imgcompress-sub`, running the daemon `primary`                             |

`entrypoint.py` writes the web UI's runtime settings and starts the Python backend,
which runs the Granian web server with one worker process per CPU core of the server.
The worker count is set only in upstream's built-in `app.json`, which the package
leaves alone.

The image has no shell. `start-cli package attach imgcompress -n imgcompress-sub --
python -c "…"` works; `sh` does not exist.

Two warnings at every start come from upstream and are harmless: `tzlocal`'s "Can not
find any timezone configuration, defaulting to UTC" (the image has no timezone set),
and Granian's
"Configuration allows spawning up to 128 Python threads".

## Volume and Data Layout

Nothing ImgCompress keeps is meant to last: there is no database and no account. The
package has two volumes.

| Volume    | Mount point | Contents                                                                          |
| --------- | ----------- | --------------------------------------------------------------------------------- |
| `startos` | not mounted | `store.json`: the access setting                                                  |
| `tmp`     | `/tmp`      | uploads and results (`source_*/`, `converted_*/`, `converted_*.zip`), and the backend log `imgcompress-backend.log` |

ImgCompress stages every upload and result under `/tmp`, and a single upload may be up
to 40 GiB. Mounting `tmp` there puts those files on the data drive rather than in the
container's own writable layer. A cleanup inside ImgCompress runs every hour and deletes
job folders and ZIPs more than an hour old, so a result lives one to two hours; the
first cleanup after a start runs an hour later. The backend log rotates at 25 MiB and
keeps one old copy.

ImgCompress runs as uid 65532 and the volume is created owned by root, so the package
sets the owner of the volume's root to 65532 on every start, before the daemon runs.

The package also mounts an empty file from its assets over the web UI's
`static_site/release-notes.md`, read-only (see Network Access and Interfaces).

## File Models

One JSON file, written only by the package.

**`store.json`** (`startos` volume) holds `uiPassword`. Only Manage Access writes it.
When it is set, StartOS's proxy asks for a login; when it is absent, the Web UI is
public. The interface re-reads it on every change, so a hand edit takes effect at once
as well.

The package passes no environment variables and does not touch upstream's `app.json`:
ImgCompress runs with its defaults, Storage Management panel included.

## Dependencies

None.

## Network Access and Interfaces

The package exposes one HTTP interface, serving both the web UI and the API it calls.

| Interface | ID   | Type | Port | Protocol | Serves                    |
| --------- | ---- | ---- | ---- | -------- | ------------------------- |
| Web UI    | `ui` | `ui` | 5000 | HTTP     | the web UI and its `/api` |

With a password set, StartOS's proxy requires HTTP Basic authentication, username
`admin`, realm `ImgCompress`, on every address of the interface before a request
reaches ImgCompress. ImgCompress itself has no login and no idea the gate exists.

Upstream's web UI reads its own version from `release-notes.md` and, when it finds
one, asks `api.github.com` from the visitor's browser for the latest release, to show an
"update available" banner with Docker update steps. The empty file the package mounts
there leaves it no version, so the browser never contacts GitHub.

The server makes one outbound connection of its own, and only on request: the internet
check button in the web UI's system status panel (`/api/health/internet`) opens a TCP
connection to `1.1.1.1` port 53 and sends nothing over it. It can report no internet
on a working server; nothing ImgCompress does depends on it.

## Installation and First-Run Flow

There is no setup and nothing to create. The Web UI is public and usable as soon as the
service starts, as upstream's is; Manage Access adds a login.

## Actions

One action, available whether the service is running or stopped.

**Manage Access** (`manage-access`) — run it before giving ImgCompress an address other
people can reach, or to change who can use it. **Public** removes `uiPassword` from
`store.json`; **Private (require login)** stores the password the form holds, a
generated one by default. The form pre-fills the current choice and password, so running
it again and saving changes nothing. The proxy picks up the change within seconds,
without restarting ImgCompress. Browsers that saved the old password ask again. The
result shows the username and the password.

## Tasks

None. The service never waits on a prompt.

## Health Checks

One check reports whether the web server answers.

**Web Interface** (`primary`) requests `http://localhost:5000/api/health/backend` and
passes on any HTTP response. Granian answers a few seconds after start. A failure
that lasts means the backend did not start: look in the log for upstream's
`ConfigError` or a Python traceback.

## Backups and Restore

The `startos` volume is copied whole (`ofVolumes('startos')`); it holds only the access
setting. The `tmp` volume is left out: uploads and results are temporary and gone within
two hours anyway. A restored instance starts with the same access setting and no files.

## Limitations and Differences

1. **No WebP output.** This upstream release reads WebP but writes only JPEG, PNG, AVIF,
   ICO and PDF; upstream's docs site already describes WebP output from a later release.
2. **No login of its own.** Without Manage Access, anyone who can reach an address can
   process images, the Storage Management panel lets them download or clear every
   converted file still on the server, and `/api/logs/backend` serves them the backend
   log.
3. **No update banner and no "What's new".** Both come from the release-notes file the
   package empties. StartOS shows the package's release notes on update instead.
4. **Background removal is heavy.** The model runs on the CPU. On four cores, one
   1600-pixel photo took about 40 seconds and memory peaked at 1.3 GiB. Each worker that
   has removed a background keeps the model loaded, about 600 MiB, until the service
   restarts.

---

## Quick Reference for AI Consumers

```yaml
package_id: imgcompress
image: ghcr.io/karimz1/imgcompress
architectures: [x86_64, aarch64]
subcontainers: [imgcompress-sub]
volumes:
  startos: null
  tmp: /tmp
file_models:
  - startos/store.json
startos_managed_env_vars: []
dependencies: none
interfaces:
  ui: { type: ui, port: 5000 }
actions:
  - manage-access
tasks: []
health_checks:
  - primary
```
