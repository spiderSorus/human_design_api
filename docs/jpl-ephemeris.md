## Optional JPL ephemeris (DE4xx) support

This project uses the `swisseph` Node bindings (Swiss Ephemeris) for planetary longitudes.

Swiss Ephemeris can optionally use a **JPL DE ephemeris** file (e.g. **DE431**, **DE440**) for
maximum precision. This is similar to what some commercial engines do.

### What’s implemented

We now support configuring Swiss Ephemeris via environment variables:

- `SWE_EPHE_PATH` – directory containing Swiss Ephemeris data files (optional)
- `SWE_JPL_FILE` – full path to a JPL DE file (optional)
- `SWE_FLAGS` – calculation flags integer (optional)
  - Default is `SEFLG_SWIEPH`
  - To force JPL, set `SWE_FLAGS=1` (this is `SEFLG_JPLEPH` in the bindings)

If `SWE_JPL_FILE` is set, we call `swe_set_jpl_file(path)` at runtime (best-effort).

### How to enable locally

1. Obtain a DE ephemeris file.
   - We are targeting **DE441**.
   - The JPL SSD directory listing is here:
     https://ssd.jpl.nasa.gov/ftp/eph/planets/ascii/de441/
   - These are large files.

2. Put it somewhere local (recommended, not committed):

```bash
mkdir -p .local/de441
# Download as needed (these are huge). For example:
# ./scripts/download_de441.sh testpo
# ./scripts/download_de441.sh header
```

3. Run with env vars:

```bash
export SWE_EPHE_PATH="$PWD/.local/de441"

# Swiss Ephemeris expects a single JPL ephemeris file path here.
# (Depending on your Swiss Ephemeris build/bindings, this may need to point
#  at the merged/binary DE file rather than the ASCII chunks.)
export SWE_JPL_FILE="$PWD/.local/de441/testpo.441"

# Force JPL mode
export SWE_FLAGS=1

node run_1982_11_09_chart.js
```

### Notes

- If the JPL file is missing/unreadable, the engine falls back to default Swiss Ephemeris mode.
- We do **not** download DE files automatically, because sources vary and files are large; we can add
  a scripted download once you pick a canonical source URL you’re comfortable with.
