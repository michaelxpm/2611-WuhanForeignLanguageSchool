# Development Log — 武汉外国语学校 3D Campus Viewer

This log tracks every development phase. Each completed phase is committed to `main`, tagged (`phase-1` through `phase-7`), and pushed to GitHub (`https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool.git`) so you can inspect or run any phase independently.

## How to Access Any Phase Separately
- **On GitHub**: Open `https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-N` (replace `N` with `1`–`7`), or select the tag `phase-N` from the branch/tag dropdown to browse or download that phase's ZIP.
- **Locally**:
  ```bash
  git checkout phase-N
  npm install
  npm run dev
  ```
  To return to the latest version:
  ```bash
  git checkout main
  ```

---

## Phase 0 — Planning & Reference Synthesis
- **Status**: Completed
- **Working Steps**:
  1. Synthesized 15 reference images (satellite ortho, `效果图` cutouts, annotated campus maps, hand-drawn guide, `西北门` gate photo, and `小操场升旗台` photo).
  2. Cataloged all 17 campus zones/structures with real names (`小学部教学楼`, `报告厅`, `初中部`, `桂苑`, `松苑`, `梅苑`, `竹苑`, `小学部食堂`, `初中部食堂`, `初中部宿舍`, `中心花坛`, `扇形广场`, `寻真园 · 种植区`, `小操场`, `小足球场`, `升旗台`, `西北门`, `北太子湖`).
  3. Saved [implementation_plan.md](./implementation_plan.md) and initialized `DEV_LOG.md`.
- **Validation**: Review `implementation_plan.md` for accuracy of building names, zones, and technical approach.

---

## Phase 1 — Project Scaffold, Ground Truth Alignment & Core Viewer Shell
- **Status**: Completed
- **Git Tag**: `phase-1` ([View on GitHub](https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-1))
- **Working Steps**:
  1. Initialized Vite + React 19 + TypeScript + Three.js (`@react-three/fiber`, `@react-three/drei`, `@react-three/postprocessing`) + Tailwind CSS v4.
  2. Created `src/data/campusLayout.ts` establishing the `1 unit = 1 m` true-North coordinate system centered at `中心花坛 (0, 0, 0)`, mapping all 17 campus zones/buildings and 7 camera presets.
  3. Built `src/components/SceneRoot.tsx` with damped `OrbitControls`, smooth fly-to camera interpolation, ground alignment grid, cardinal compass markers (`北 N / 南 S / 东 E / 西 W`), clickable building massing blocks, and toggleable 3D labels.
  4. Built `src/App.tsx` glassmorphic HUD with camera preset bar, label toggle, and building inspector card.
- **How to Access Phase 1**:
  - **GitHub**: `https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-1`
  - **Local**: `git checkout phase-1 && npm install && npm run dev`
- **Highlight**: Accurate metric spatial layout and interactive camera/inspection shell verified against the satellite ortho-map and `效果图`.
- **Validation Checklist**:
  - [ ] All 17 landmarks appear in their correct relative cardinal positions (`小学部教学楼` North of `中心花坛`, `初中部` South, `主体育场` SW, `小操场` NW).
  - [ ] Clicking any building opens its Chinese/English info card and smoothly flies the camera to focus on it.
  - [ ] Bottom preset buttons smoothly transition between `全景鸟瞰`, `中心花坛`, `初中部`, `小学部`, `小操场`, `主体育场`, and `西北门`.

---

## Phase 2 — PBR Material Library, Procedural Textures & Terrain / Plazas / Lakefront
- **Status**: Completed
- **Git Tag**: `phase-2` ([View on GitHub](https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-2))
- **Working Steps**:
  1. Built `src/materials/proceduralTextures.ts` with cached HTML5 Canvas PBR generators for stone pavers, terracotta brick walkways, natural campus grass, asphalt, animated water normal maps, and vertical gate plaques (`武汉外国语学校` / `武汉实验外国语学校`).
  2. Built `src/components/CampusGround.tsx` modeling `中心花坛`, `扇形广场` (4 terraced grass arcs + 5 brick rings + 6 radial spokes), Main Entrance Plaza & fountain parterre, `寻真园 · 种植区`, campus avenues, `太子湖北路`, `东风大道` + elevated viaduct, `西北门` gatehouse, and `北太子湖` with animated water & lotus leaf clusters (`荷叶群`).
  3. Integrated `CampusGround` into `SceneRoot.tsx` and added a toggleable `测量网格` (Measurement Grid) button in `App.tsx`.
- **How to Access Phase 2**:
  - **GitHub**: `https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-2`
  - **Local**: `git checkout phase-2 && npm install && npm run dev`
- **Highlight**: Full ground-plane realism—radial `扇形广场`, animated `北太子湖` water with lotus clusters, and detailed `西北门` entrance gatehouse—while preserving all Phase 1 camera & inspection features.
- **Validation Checklist**:
  - [ ] Switch to `中心花坛 · 扇形广场` preset and verify concentric grass terraces and 6 radial red-brick walkways.
  - [ ] Switch to `西北门入口` preset and verify the stone pillars, vertical `武汉外国语学校` / `武汉实验外国语学校` plaques, barrier arm, and crosswalk.
  - [ ] Orbit NW to `北太子湖` and verify animated water ripples, lakeside brick trail, and circular lotus leaf clusters.

---

## Phase 3 — Hero Academic & Cultural Buildings (Zone A & Zone B)
- **Status**: Completed
- **Git Tag**: `phase-3` ([View on GitHub](https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-3))
- **Working Steps**:
  1. Extended `src/materials/proceduralTextures.ts` with `getFacadeWindowTexture` (recessed reflective glass, mullions, spandrel bands, optional arched top-floor windows) and `getRoofRibTexture`.
  2. Created `src/components/buildings/ArchitecturalKit.tsx` (`WingBlock`, `CourtyardRing`, `RotundaDrum`) with protruding concrete floor-slab stringcourses, base plinths, overhanging pitched gable roofs, and radial rotunda ribs.
  3. Built `src/components/buildings/HeroBuildings.tsx` modeling `初中部` (linear 5F wing + 18-bay ridge skylight spine + NW rotunda + north annex), `小学部教学楼` (double courtyard + teal pitched roofs + 4 pointed corner turret peaks + glass atrium), `报告厅` (terracotta pitched hall + cylindrical drum + north courtyard), `东侧三角中庭楼` (extruded triangle with circular central atrium hole), and `桂苑` / `松苑`.
- **How to Access Phase 3**:
  - **GitHub**: `https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-3`
  - **Local**: `git checkout phase-3 && npm.cmd install && npm.cmd run dev`
- **Highlight**: All Zone A & B hero buildings upgraded from massing boxes to multi-layered parametric architecture matching the `效果图` cutouts.
- **Validation Checklist**:
  - [ ] Click `初中部 · 主教学楼` preset: verify the 18-bay central skylight spine and NW cylindrical rotunda.
  - [ ] Click `小学部 · 报告厅` preset: verify teal pitched roofs with 4 corner turret peaks, inner courtyard, and terracotta-roofed `报告厅` + drum pavilion.
  - [ ] Inspect `东侧三角中庭楼`, `桂苑`, and `松苑` east of `扇形广场`.

---

## Phase 4 — North Zone Buildings & Flag-Raising Platform (Zone C)
- **Status**: Completed
- **Git Tag**: `phase-4` ([View on GitHub](https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-4))
- **Working Steps**:
  1. Added `getFlagWallTexture()` in `src/materials/proceduralTextures.ts` rendering the cream stone cladding, school emblem medallion (`WFLS`), and engraved motto (`从这里走向世界和未来` / `An Access to the World and the Future`).
  2. Built `src/components/buildings/NorthZoneBuildings.tsx` modeling `初中部食堂` (crescent arc wing + north annex), `梅苑` & `竹苑` (courtyard dormitories with arched top-floor windows), `小学部食堂` (wide-span hall with dual clerestory skylight monitors), `初中部宿舍 · 八角楼` (octagonal-ring courtyard), `初中部宿舍 · 北翼楼` (L-wing with corner turret accents), and `小操场升旗台` (tiered stone stage, gabled motto wall, and 3 silver flagpoles with red flags).
  3. Integrated `NorthZoneBuildings` into `SceneRoot.tsx`.
- **How to Access Phase 4**:
  - **GitHub**: `https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-4`
  - **Local**: `git checkout phase-4 && npm.cmd install && npm.cmd run dev`
- **Highlight**: Every residential, dining, and north-campus building is now modeled with its exact geometric silhouette (crescent, octagon, courtyard, clerestory) plus the authentic `小操场升旗台` landmark.
- **Validation Checklist**:
  - [ ] Click `小操场 · 升旗台` preset and zoom in on the east side of the track to verify the gabled motto wall (`从这里走向世界和未来`), emblem, and 3 flagpoles.
  - [ ] Inspect `梅苑` & `竹苑` arched top-floor windows, `初中部食堂` crescent curve, and the NW `八角楼` octagonal courtyard.

---

## Phase 5 — Athletics, Courts & Instanced Landscape Props (Zone D)
- **Status**: Completed
- **Git Tag**: `phase-5` ([View on GitHub](https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-5))
- **Working Steps**:
  1. Added `getFootballPitchTexture()` (mowed grass stripes + crisp FIFA pitch markings) and `getCourtTexture()` (basketball/tennis court lines) to `src/materials/proceduralTextures.ts`.
  2. Built `src/components/AthleticsZone.tsx` modeling the Main 400 m Stadium (red EPDM track, striped pitch, goalposts, stepped concrete bleachers, flanking 2F locker wings, 5 white tensile-membrane arched canopies, and paved parking lot), `小操场` + `小足球场`, and the 8 South outdoor courts (6 red basketball courts with 3D hoops + 2 teal tennis courts).
  3. Built `src/components/CampusFoliage.tsx` using `THREE.InstancedMesh` to render lush multi-tier campus trees along `北太子湖`, `中心花坛`, `扇形广场`, `寻真园`, `太子湖北路`, `东风大道`, and stadium perimeters at high FPS.
  4. Removed all remaining Phase 1 placeholder massing blocks from `SceneRoot.tsx`.
- **How to Access Phase 5**:
  - **GitHub**: `https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-5`
  - **Local**: `git checkout phase-5 && npm.cmd install && npm.cmd run dev`
- **Highlight**: 100% of the campus is now modeled—every building, stadium, court, plaza, lakefront, and tree-lined avenue—with zero placeholder boxes left.
- **Validation Checklist**:
  - [ ] Click `主体育场 · 张拉膜看台` preset: verify the 5-bay white tensile-membrane canopies, stepped bleachers, striped football pitch, goalposts, and 400 m track.
  - [ ] Pan southeast of the stadium to inspect the 6 red basketball courts (with hoops) and 2 teal tennis courts along `太子湖北路`.
  - [ ] Pan over the campus avenues and `北太子湖` shoreline to verify lush instanced trees and smooth orbit FPS.

---

## Phase 5 Fix — Precision Alignment, Octagonal Dormitory & Z-Fighting Resolution
- **Status**: Completed
- **Git Tag**: `phase-5-fix` ([View on GitHub](https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-5-fix))
- **Working Steps**:
  1. Rebuilt `初中部宿舍 · 八角楼` in `NorthZoneBuildings.tsx` using 8 parametric `WingBlock` segments arranged in an octagon (proper window bays, concrete floor-slab ledges, overhanging pitched slate roofs, ridge caps, and inner octagonal courtyard lawn).
  2. Eliminated all Z-fighting/flickering on `小操场`, `小足球场`, white roads behind `梅苑`/`竹苑`, and `主体育场` by flattening the peninsula turf to `y = 0.01`, enforcing a strict non-overlapping elevation hierarchy (`roads y=0.07..0.09`, `tracks y=0.14`, `pitches y=0.18`), and replacing circular `ringGeometry` lane lines with true stadium-oval lane geometry.
  3. Remapped `西北门 · 校园主入口` and all 17 buildings, courts, tracks, plazas, and road segments using a direct mathematical pixel-to-meter projection (`pxToWorld(px, py)` in `campusLayout.ts`, `1 px = 0.65 m` calibrated to the 999×673 Google Maps ortho satellite reference) and verified every footprint and road vector via an automated overlay on the satellite map.
  4. Added the `卫星平面视角` (Top-Down Plan View) camera preset for one-click orthographic alignment inspection.
- **How to Access Phase 5 Fix**:
  - **GitHub**: `https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-5-fix`
  - **Local**: `git checkout phase-5-fix && npm.cmd install && npm.cmd run dev` (or `git checkout main`)
- **Highlight**: Crisp 8-wing octagonal dormitory, zero surface flickering at any zoom level, and faithful road/gate/plaza alignment matching the annotated satellite maps.
- **Validation Checklist**:
  - [ ] Zoom in on `初中部宿舍 · 八角楼`: verify 8 pitched-roof wings with crisp window bays and inner courtyard.
  - [ ] Zoom in closely on `小操场`, `小足球场`, and the white road behind `梅苑`/`竹苑`: verify zero flickering/disappearing.
  - [ ] Click `校园主入口 (校门)` preset: verify the gate sits at the SW corner and the main white avenue runs between `主体育场` and the 8 courts toward `中心花坛` and its triangular lawn.

---

## Phase 6 — Photometric Lighting, Post-Processing & Interactive Walk Mode
- **Status**: Completed
- **Git Tag**: `phase-6` ([View on GitHub](https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-6))
- **Working Steps**:
  1. Built `src/components/EnvironmentEffects.tsx` with 4 Time-of-Day presets (`清晨`, `正午`, `黄昏`, `夜景`), procedural `<Sky>`, self-contained `<Environment>` IBL `<Lightformer>`s (zero external HDR fetch), `4096×4096` PCFSoftShadowMap sun light, instanced glowing campus streetlights, and `<EffectComposer>` (`Bloom` + `ACESFilmic` ToneMapping).
  2. Built `src/components/FirstPersonControls.tsx` for ground-level human-scale exploration (`y = 1.75 m`, WASD/Arrow keys, Shift sprint, drag-to-look).
  3. Updated `SceneRoot.tsx` and `App.tsx` with Time-of-Day switcher, `航拍 / 第一人称漫步` mode toggle, real-time rotating Compass Rose, and expandable `建筑导览` directory drawer.
- **How to Access Phase 6**:
  - **GitHub**: `https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-6`
  - **Local**: `git checkout phase-6 && npm.cmd install && npm.cmd run dev`
- **Highlight**: Full atmospheric time-of-day rendering (daylight, golden hour, night with glowing streetlights), ACES Filmic post-processing, First-Person Campus Walk, and complete building directory navigation.
- **Validation Checklist**:
  - [ ] Toggle `清晨 / 正午 / 黄昏 / 夜景` and verify dynamic sun angles, sky colors, and glowing avenue streetlights at night.
  - [ ] Click `第一人称漫步`, use `WASD` + `Shift` + mouse drag to walk through `西北门` and `扇形广场`.
  - [ ] Open `建筑导览` and jump to any of the 17 campus landmarks.

---

## Phase 7 — Specification Audit, Visual Polish & Final Deployment
- **Status**: Completed
- **Git Tag**: `phase-7` ([View on GitHub](https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-7))
- **Working Steps**:
  1. Audited every requirement in `implementation_plan.md` against the live codebase.
  2. Added remaining specification details in `AthleticsZone.tsx`: 3D tennis nets on the 2 teal tennis courts, perimeter court fencing rails, 6 court floodlight poles, and 7 parked cars in the stadium parking lot.
  3. Added `自动导览` (Guided Auto-Tour cycling through all campus presets) and `环绕此建筑` (per-building auto-orbit) in `App.tsx` and `SceneRoot.tsx`.
  4. Rebuilt `dist/assets/app.js` & `dist/assets/app.css` and deployed to GitHub Pages.
- **How to Access Phase 7**:
  - **Live Website**: `https://michaelxpm.github.io/2611-WuhanForeignLanguageSchool/`
  - **GitHub**: `https://github.com/michaelxpm/2611-WuhanForeignLanguageSchool/tree/phase-7`
  - **Local**: `git checkout phase-7 && npm.cmd install && npm.cmd run dev` (or `git checkout main`)
- **Highlight**: 100% of `implementation_plan.md` specifications implemented, verified, and live on GitHub Pages.
- **Validation Checklist**:
  - [ ] Click `自动导览` to watch the smooth guided flyover across all campus presets.
  - [ ] Click any building and click `环绕此建筑` to orbit around it smoothly.
  - [ ] Inspect the South outdoor courts (tennis nets, fencing, floodlights) and stadium parking lot (parked cars).








