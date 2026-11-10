<p align="center">
  <img src="icon.webp" alt="ImgCompress Logo" width="21%">
</p>

# ImgCompress on StartOS

> Everything not listed in this document should behave the same as upstream ImgCompress.
> If a feature, setting, or behavior is not mentioned here, the upstream
> documentation is accurate and fully applicable — see the Documentation section of
> `instructions.md` for links.

[ImgCompress](https://github.com/karimz1/imgcompress) compresses, converts, resizes and
edits images in bulk, and removes backgrounds and upscales images with AI models that
run on the CPU. This package runs upstream's image unmodified. It adds an optional login
enforced by StartOS, keeps uploads on the data drive, turns off the web UI's check for
new releases, and lets the user set the upload size limit and the number of web workers.

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

| Property      | Value                                                                     |
| ------------- | ------------------------------------------------------------------------- |
| Image         | `ghcr.io/karimz1/imgcompress`, upstream, unmodified                       |
| Architectures | x86_64, aarch64                                                           |
| Entrypoint    | upstream: `dumb-init`, then `entrypoint.py`, run as the container's PID 1 |
| User          | the image's `nonroot` user, uid 65532                                     |
| Subcontainer  | `imgcompress-sub`, running the daemon `primary`                           |

`entrypoint.py` writes the web UI's runtime settings and starts the Python backend,
which runs the Granian web server with the number of worker processes Configure Limits
sets, one per CPU core by default. Conversions run as background jobs inside it.

The image has no shell. `start-cli package attach imgcompress -n imgcompress-sub --
python -c "…"` works; `sh` does not exist.

Two warnings at every start come from upstream and are harmless: `tzlocal`'s "Can not
find any timezone configuration, defaulting to UTC" (the image has no timezone set),
and Granian's "Configuration allows spawning up to 128 Python threads".

## Volume and Data Layout

Nothing ImgCompress keeps is meant to last: there is no database and no account. The
package has two volumes.

| Volume    | Mount point | Contents                                                                                                                  |
| --------- | ----------- | ------------------------------------------------------------------------------------------------------------------------- |
| `startos` | not mounted | `store.json`: the access setting and the limits                                                                           |
| `tmp`     | `/tmp`      | jobs (`job_*/status.json`), uploads and results (`source_*/`, `converted_*/`, ZIPs), and the backend log `imgcompress-backend.log` |

ImgCompress stages every upload, result and job under `/tmp`. Mounting `tmp` there puts
those files on the data drive rather than in the container's own writable layer, and
lets finished jobs survive a restart. A cleanup inside ImgCompress runs every
hour and deletes job folders, results and ZIPs 48 hours after their last activity; the
folders of a job still running are never deleted. The backend log rotates at 25 MiB and
keeps one old copy. Each start also leaves a `pymp-*` folder from Python's
multiprocessing, which the cleanup doesn't remove.

ImgCompress runs as uid 65532 and the volume is created owned by root, so the package
sets the owner of the volume's root to 65532 on every start, before the daemon runs.

## File Models

One JSON file, written only by the package's actions.

**`store.json`** (`startos` volume):

| Key           | Written by       | Effect                                                                         |
| ------------- | ---------------- | ------------------------------------------------------------------------------ |
| `uiPassword`  | Manage Access    | Present: StartOS's proxy asks for a login. Absent: the Web UI is public        |
| `maxUploadMb` | Configure Limits | Largest single upload, in MB; 1024 when absent                                 |
| `workers`     | Configure Limits | Granian worker processes; `null` or absent means one per CPU core              |

The interface re-reads `uiPassword` on every change, so a login change, hand edits
included, applies without a restart. `maxUploadMb` and `workers` reach ImgCompress as
environment variables read at start, so a change restarts the daemon:

| Variable               | Value                                         |
| ---------------------- | --------------------------------------------- |
| `DISABLE_UPDATE_CHECK` | always `true`                                 |
| `MAX_UPLOAD_SIZE_MB`   | `maxUploadMb`                                 |
| `WEB_WORKERS`          | `workers`, or `auto` when unset               |

The package does not touch upstream's `app.json`; everything else runs with upstream's
defaults, the Storage Management panel included.

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

`DISABLE_UPDATE_CHECK=true` stops the web UI from asking `api.github.com`, from the
visitor's browser, whether a newer release exists, and so from showing upstream's
Docker update steps. Its "What's new" panel still shows upstream's notes for the
installed version.

The server makes one outbound connection of its own, and only on request: the internet
check button in the web UI's system status panel (`/api/health/internet`) opens a TCP
connection to `1.1.1.1` port 53 and sends nothing over it. It can report no internet
on a working server; nothing ImgCompress does depends on it. Upstream's "Notify me when
done" (`NOTIFY_URL`) is off, as upstream ships it.

## Installation and First-Run Flow

There is no setup and nothing to create. The Web UI is public and usable as soon as the
service starts, as upstream's is; Manage Access adds a login.

## Actions

Two actions, both available whether the service is running or stopped.

**Manage Access** (`manage-access`) — run it before giving ImgCompress an address other
people can reach, or to change who can use it. **Public** removes `uiPassword` from
`store.json`; **Private (require login)** stores the password the form holds, a
generated one by default. The form pre-fills the current choice and password, so running
it again and saving changes nothing. The proxy picks up the change within seconds,
without restarting ImgCompress. Browsers that saved the old password ask again. The
result shows the username and the password.

**Configure Limits** (`configure-limits`) — run it when an upload is refused as too large
(ImgCompress answers 413 and names the limit), or to lower memory use when several
people convert at once. It writes `maxUploadMb` and `workers` to `store.json`; a running
ImgCompress restarts, which takes a few seconds and stops any conversion in progress. The form pre-fills the current values, so saving them unchanged is
harmless. It returns no result.

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
setting and the limits. The `tmp` volume is left out: jobs, uploads and results are
temporary and deleted within 49 hours anyway. A restored instance starts with the same
access setting and limits and no files.

## Limitations and Differences

1. **No login of its own.** Without Manage Access, anyone who can reach an address can
   process images, the Storage Management panel lets them download or clear every
   converted file still on the server, other people's background jobs included, and
   `/api/logs/backend` serves them the backend log.
2. **Uploads capped at 1 GB by default**, where upstream allows 40 GB. Configure Limits
   raises it.
3. **The AI features are heavy.** Both models run on the CPU. On four cores, removing the
   background of one 1600-pixel photo took about 45 seconds and lowered free memory by
   about 1.4 GB. Each worker that has used a model keeps it loaded until the service
   restarts.
4. **No "Notify me when done".** The package doesn't set upstream's `NOTIFY_URL`.

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
startos_managed_env_vars:
  - DISABLE_UPDATE_CHECK
  - MAX_UPLOAD_SIZE_MB
  - WEB_WORKERS
dependencies: none
interfaces:
  ui: { type: ui, port: 5000 }
actions:
  - manage-access
  - configure-limits
tasks: []
health_checks:
  - primary
```
