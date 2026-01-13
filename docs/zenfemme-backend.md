# ZenFemme backend (prototype)

This repo can generate charts in two ways:

1. **Local ephemeris** (default): Swiss Ephemeris (and optional JPL DE files)
2. **ZenFemme backend** (prototype): calls the same BodyGraphChart embed endpoint used by ZenFemme

The ZenFemme backend is intentionally minimal and intended only to get prototypes running.

## Usage

### 1) Set token

Export your token:

```bash
export ZENFEMME_TOKEN="<your-token>"
```

### 2) Run a chart (ZenFemme)

```bash
node run_1982_11_09_chart_zenfemme.js
```

### 3) Enable backend globally (optional)

If you want `calculateChartLocal(...)` to always use ZenFemme without passing options:

```bash
export HD_EPHEMERIS_BACKEND=zenfemme
```

## Notes / constraints

- This performs a network call per chart.
- We map ZenFemme `Personality`/`Design` body placements into this repo's `personality`/`design` shape.
- The rest of the chart (channels/centers/type + PHS) is derived locally from those placements.

