# human_design_api — Swiss Ephemeris Astronomical Chart & Transit Calculation Engine

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](LICENSE)

**`human_design_api`** is a deterministic, high-precision Node.js astronomical calculation library built on top of the **Swiss Ephemeris (`swisseph`)** and **Luxon**. Given a UTC or timezone-qualified timestamp and geographic coordinates, it computes exact ecliptic longitudes for all 13 celestial bodies (Sun, Earth, Moon, True/Mean Nodes, Mercury, Venus, Mars, Jupiter, Saturn, Uranus, Neptune, Pluto), solves the $88^\circ$ solar arc regression for **Design Time**, and maps planetary degrees into the 64 I Ching Gates, 6 Lines, 6 Colors, 6 Tones, and 5 Bases.

Built for **ephemeris software developers, astrology/Human Design chart applications, and transit visualization tools**, the engine also computes **Primary Health System (PHS) / Rave Psychology** substructures (harmonics, variable arrows, bases, and narratives), active channels, defined centers, aura types, and continuous **UTC Gate Transit Segments** for Gantt-chart timelines.

---

## Built With

- **Runtime**: **Node.js** (CommonJS module architecture)
- **Astronomical Ephemeris**: [`swisseph`](https://www.npmjs.com/package/swisseph) (`^0.5.17`) — C/C++ bindings to the Astrodienst Swiss Ephemeris.
- **Date & Timezone Handling**: [`luxon`](https://moment.github.io/luxon/) (`^3.7.2`) for historical IANA timezone resolution and Julian Day conversions.
- **Modular Core (`src/hd/`)**:
  - `engine.js` — Public calculation entrypoints (`calculateChart`, `calculateChartWithOptions`, `calculateJustNowChart`).
  - `design-time.js` — Iterative root-finding solver locating the exact historical Julian Day when the Sun stood $88.0000^\circ$ of ecliptic longitude prior to birth.
  - `gates.js` & `positions.js` — Ecliptic degree-to-Gate/Line/Color/Tone/Base quantizer around the 64-sector Rave Mandala wheel.
  - `channels.js`, `centers.js`, `type.js` — Graph connectivity resolver for the 36 Channels, 9 Centers, Profile, Definition type, and Aura Type/Authority.
  - `rave-psychology.js` & `rave-psychology-derive.js` — Substructure engine for Color/Tone/Base, Variable arrows, and harmonic resonance.
  - `transits.js` — High-resolution planetary transit boundary scanner (`calculateGateTransitSegmentsUtc`).

---

## How to Run

### Prerequisites
- **Node.js** `>= 18.x` and **npm**
- A C/C++ compiler toolchain (`clang` / `gcc`, `make`, `python3`) for `node-gyp` to compile the native `swisseph` addon during `npm install`.

### 1. Install Dependencies
```bash
npm install
```

### 2. Run the Automated Verification Suite
The repository includes a comprehensive verification runner (`test_runner.js`) that executes `verify_*.js` test suites against known historical reference charts, transit intervals, and substructure calculations:
```bash
npm test
```

### 3. Run Example Scripts
```bash
# Calculate full natal + design chart and current ("just now") transit chart:
node example_usage.js

# Calculate UTC planetary gate transit segments for Gantt timeline rendering:
node example_transits_gantt.js
```

### Quick Code Example
```javascript
const {
  calculateChart,
  calculateJustNowChart,
  calculateGateTransitSegmentsUtc
} = require('./index');

async function run() {
  // 1. Full Natal + 88° Solar Design Chart (with PHS & Rave Psychology)
  const chart = await calculateChart('1979-06-15', '14:30', 37.7749, -122.4194);
  console.log('Type:', chart.type, '| Defined Centers:', chart.definedCenters);

  // 2. Real-time Transit ("Just Now") Chart
  const transit = await calculateJustNowChart(37.7749, -122.4194);
  console.log('Current Sun Gate:', transit.personality.Sun);

  // 3. Gate Transit Segments across a UTC Window
  const segments = await calculateGateTransitSegmentsUtc({
    startUtc: '2026-01-01T00:00:00Z',
    endUtc: '2026-01-08T00:00:00Z',
    bodies: ['Sun', 'Moon', 'Mercury']
  });
  console.log('Transit segments:', segments.length);
}

run();
```

---

## Roadmap & Planned Work Ahead (40+ Hours)

- [ ] **Phase 1 — REST / HTTP Server & OpenAPI 3.1 Specification (~8 hrs)**
  - [ ] Build a fast, stateless HTTP server (`src/server/`) exposing `/v1/chart`, `/v1/transits/now`, `/v1/transits/segments`, and `/v1/compatibility` endpoints.
  - [ ] Add Zod/JSON-Schema request validation, rate-limiting middleware, and an interactive OpenAPI/Swagger documentation route.
- [ ] **Phase 2 — Relationship / Composite & Penta Group Chart Calculators (~8 hrs)**
  - [ ] Implement `calculateCompositeChart(chartA, chartB)` computing electromagnetic, compromise, dominance, and companionship channels between two charts.
  - [ ] Implement `calculatePentaChart(charts[])` for small-group (3–5 person) business/family dynamics analysis.
- [ ] **Phase 3 — Lifecycle Return Calculators (Solar Return, Saturn Return, Uranus Opposition, Kiron Return) (~8 hrs)**
  - [ ] Build precision ecliptic-longitude root-finders in `src/hd/returns.js` to compute exact UTC timestamps and charts for annual Solar Returns, Saturn Return (~age 29.5), Uranus Opposition (~age 42), and Kiron Return (~age 50), including local-birthplace vs. relocated coordinates.
- [ ] **Phase 4 — Vector SVG BodyGraph & Transit Gantt Renderer (~9 hrs)**
  - [ ] Build a zero-DOM server-side SVG generator (`src/render/svg-bodygraph.js`) outputting customizable vector BodyGraphs (colored defined centers, red/black/striped channel paths, and planetary activation columns).
  - [ ] Build an SVG/HTML Gantt timeline renderer for `calculateGateTransitSegmentsUtc`.
- [ ] **Phase 5 — TypeScript Declarations (`.d.ts`), Ephemeris Caching & Benchmark Suite (~7 hrs)**
  - [ ] Author complete TypeScript type definitions (`index.d.ts`) for all chart outputs, options, and PHS/Rave Psychology structures.
  - [ ] Add an LRU ephemeris interpolation cache to accelerate multi-year transit scans by 10×+ and expand automated test coverage.

---

## License

Released under the [MIT License](LICENSE).
