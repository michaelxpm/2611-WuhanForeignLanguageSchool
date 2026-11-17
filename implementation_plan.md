# Interactive 3D Campus Viewer — 武汉外国语学校 (Wuhan Foreign Languages School)

## 1. Project Specifications

### 1.1 Coordinate System & Scale
- **World Scale**: `1 unit = 1 meter` (real-world metric scale).
- **Orientation**: True geographic alignment derived from satellite imagery and the campus guide map (`Taizihu N Rd / 太子湖北路` running West–East along the South boundary, `Dongfeng Blvd Viaduct / 东风大道` to the West, `北太子湖` to the North):
  - `-Z` = North, `+Z` = South, `+X` = East, `-X` = West.
- **Estimated Campus Footprint**: ~520 m (W–E) × ~420 m (N–S), L-shaped/boot-shaped parcel.

### 1.2 Campus Zones & Building Inventory (Verified from Reference Photos & 效果图)

#### Zone A — South & Southeast Main Axis (初中部 & 中心区)
1. **西北门 / 西门 (Main School Gate, Dongfeng Blvd Frontage)**:
   - Black wrought-iron sliding/hinged gate, stone gatehouse pillars with vertical plaques (`武汉外国语学校` / `武汉实验外国语学校`), vehicle barrier arm, pedestrian railings, and `机动车道` signage.
2. **Main Entrance Plaza & Formal Garden**:
   - Grand stone-paved square with axial paving strips and a circular fountain/planted parterre to the west.
3. **初中部 / 初中教学楼 (Middle School Complex + Rotunda)**:
   - Long multi-story linear wing (~120 m) with white/light-grey facade, rhythmic window bands, dark pitched roof, and a prominent central **skylight spine** running along the ridge.
   - Attached **cylindrical rotunda pavilion** at the southwest corner facing the main plaza, featuring radial roof ribs and curved curtain-wall glazing.
   - Secondary rectangular annex behind (north of) the main wing.
4. **中心花坛 & 扇形广场 (Central Roundabout & Radial Fan Plaza)**:
   - Tree-lined central circular flowerbed (`r ≈ 22 m`) with inner manicured lawn.
   - Concentric terraced grass arcs intersected by radial red-brick/stone walkways.
5. **寻真园 & 种植区 (Xunzhen Garden & Planting Area, West of Roundabout)**:
   - Large manicured green lawns, garden paths, and planting beds.

#### Zone B — Central Academic & Cultural Core (小学部 & 报告厅)
6. **小学部教学楼 (Elementary Teaching Building)**:
   - Large rectangular perimeter-block building with an enclosed central courtyard, 4–5 stories, distinctive **teal/slate-grey pitched roofs** with pointed dormer/turret peaks, skylights, and recessed corridor balconies.
7. **报告厅 (Auditorium & Drum Complex, SW of 小学部教学楼)**:
   - Terracotta/brown-roofed rectangular hall.
   - Adjacent **cylindrical drum building** with radial/conical roof and curved glazing.
   - Small connecting courtyard wing.
8. **Triangular Atrium Complex (NE of Radial Plaza)**:
   - Distinctive acute-angled **triangular/wedge-shaped** multi-story building with a **circular central atrium/rotunda** cutout and sloped grey roof.
9. **桂苑 & 松苑 (Guiyuan & Songyuan, East Courtyard Blocks ×2)**:
   - Two matching square-ring courtyard buildings (4–5 stories) flanking the east side of the radial plaza.

#### Zone C — North & Northwest Elementary / Residential Zone
10. **初中部食堂 (Middle School Canteen — Crescent Building)**:
    - Curved/arc-shaped multi-story wing north of `小学部教学楼` with a matching rectangular annex behind it.
11. **梅苑 & 竹苑 (Meiyuan & Zhuyuan Dormitories ×2)**:
    - Two square-ring courtyard buildings stepped along the north side of `小操场`, featuring grey/white tile-grid facades, arched top-floor windows, and dark pitched roofs.
12. **初中部宿舍 (Octagonal & North L-Wing Dormitories)**:
    - Far-NW **octagonal/hexagonal-ring** courtyard building.
    - Long U/L-shaped northern dormitory block along the lakeside.
13. **小学部食堂 (Elementary Canteen)**:
    - Wide-span rectangular hall with white/light-grey roof and clerestory/skylight bays.

#### Zone D — Athletics, Recreation & Waterfront
14. **Main Stadium (Southwest)**:
    - Standard 400 m 8-lane red EPDM running track, striped natural-turf football pitch with goals, D-zones, and white lane markings.
    - **Grandstand / Bleachers**: Tiered seating covered by 5 white **tensile-membrane arched canopies**, flanked by two 2-story locker/equipment wings.
    - Adjacent paved parking lot with marked bays.
15. **小操场 & 小足球场 & 升旗台 (Small Track, Small Pitch & Flag-Raising Platform, Northwest)**:
    - ~200 m red running track with green turf field + `小足球场` at the north end + adjacent red/green courts.
    - **升旗台 (Flag-Raising Platform)**: Cream/beige stone-clad gabled backdrop wall with 3 silver flagpoles, circular school emblem medallion at the gable peak, and engraved motto `从这里走向世界和未来` / `An Access to the World and the Future`.
16. **Outdoor Courts Strip (South)**:
    - 6 red/teal basketball/volleyball courts + 2 blue-green tennis courts with fencing, backboards/nets, and lighting poles.
17. **北太子湖 (North Taizihu Lakefront & Lotus Pond)**:
    - Reflective water plane with shoreline embankment, lakeside walking path, and floating circular **lotus leaf clusters**.

### 1.3 Interactive Viewer Features
- **Camera Modes**:
  - *Aerial Orbit*: Smooth damped orbit, pan, zoom, and tilt with ground-collision clamping.
  - *First-Person Campus Walk*: WASD / arrow-key ground-level exploration at human eye height (`1.7 m`) with sprint and collision/terrain following.
  - *Guided Flyover / Presets*: Smooth camera transitions (`西北门 Main Gate`, `中心花坛 Radial Plaza`, `Main Stadium`, `小学部教学楼`, `小操场 & 升旗台`, `初中部`, `Overview`).
- **Building Inspection**: Hover highlight + click-to-focus on any building, displaying a clean info card (Chinese/English name, zone, architectural notes) and option to orbit around that specific building.
- **Environment & Atmosphere**: Time-of-day slider (Morning, Noon, Golden Hour, Dusk/Night with lit interior windows and streetlights) + toggleable 3D labels & mini-compass.

---

## 2. Technical Pathway & Architecture

| Layer | Technology Choice | Rationale |
| :--- | :--- | :--- |
| **App Framework** | React 19 + TypeScript + Vite | Fast HMR, strict typing for geometric specs, clean component isolation. |
| **3D Engine** | Three.js + `@react-three/fiber` + `@react-three/drei` | Declarative scene graph, easy camera/control hooks, built-in `Environment`, `Sky`, `Html`. |
| **Post-Processing** | `@react-three/postprocessing` (`N8AO`, `Bloom`, `SMAA`, `ToneMapping`) | Adds realistic crevice/courtyard ambient occlusion, sun/lamp bloom, and crisp edges. |
| **UI / HUD** | Tailwind CSS + Lucide Icons | Lightweight glassmorphic overlay that stays out of the 3D viewport's way. |
| **Geometry Strategy** | **Parametric Procedural Architecture** | Custom TypeScript builders (`ExtrudeGeometry`, `LatheGeometry`, instanced mullions/columns) instead of plain boxes. |
| **Textures** | Procedural HTML5 Canvas PBR Maps (Albedo, Roughness, Normal/Bump) | Zero external asset loading failures; crisp tiled concrete, brick, glass, turf, and EPDM track lines, plus custom canvas signage for `升旗台` and `西北门`. |

---

## 3. Step-by-Step Build Plan (With Git Tagging per Phase)

1. **Phase 1 — Project Scaffold, Ground Truth Alignment & Core Viewer Shell**
   - Initialize Vite + React + TS + R3F + Drei + Postprocessing + Tailwind.
   - Establish the `1 unit = 1 m` campus coordinate grid (`campusLayout.ts`) traced from satellite & `效果图` references, with placeholder massing blocks, OrbitControls, and debug compass/grid.
   - Tag: `phase-1`
2. **Phase 2 — PBR Material Library, Procedural Textures & Terrain/Plazas/Lakefront**
   - Build canvas-generated PBR texture generators (stucco, tile-grid facades, architectural glass, slate/terracotta/teal roofs, EPDM track, striped turf, radial brick walkways, asphalt, lake water + lotus pads).
   - Model `中心花坛`, `扇形广场`, `寻真园 · 种植区`, road network, `西北门` gatehouse, and `北太子湖`.
   - Tag: `phase-2`
3. **Phase 3 — Hero Academic & Cultural Buildings (Zone A & Zone B)**
   - Build the Parametric Building Kit (`FacadeBuilder`, `RoofBuilder`, `RotundaBuilder`).
   - Model `初中部` (linear wing + central skylight spine + rotunda), `小学部教学楼` (courtyard + teal pitched roofs + pointed dormers), `报告厅` (terracotta hall + drum + courtyard), Triangular Atrium Complex, and `桂苑` / `松苑`.
   - Tag: `phase-3`
4. **Phase 4 — North Zone Buildings & Flag-Raising Platform (Zone C)**
   - Model `初中部食堂` (crescent building + annex), `梅苑` & `竹苑` (with arched top-floor windows), `初中部宿舍` (octagonal & L-wing), `小学部食堂`, and the `小操场升旗台` (gabled motto wall, emblem, 3 flagpoles).
   - Tag: `phase-4`
5. **Phase 5 — Athletics, Courts & Instanced Landscape Props (Zone D)**
   - Model Main Stadium (400 m track, pitch, goals, 5-bay tensile membrane grandstand, parking lot), `小操场` & `小足球场`, 8 outdoor basketball/tennis courts, and `InstancedMesh` trees, hedges, streetlights, and benches.
   - Tag: `phase-5`
6. **Phase 6 — Photometric Lighting, Post-Processing & Interactive Controls**
   - Configure `Sky` + `DirectionalLight` (4096×4096 PCFSoftShadowMap) + IBL `Environment` + `N8AO` + `Bloom` + `ACESFilmic` tone mapping.
   - Implement First-Person Walk mode, Time-of-Day presets, Building Click-to-Inspect, Camera Fly-to presets, and glassmorphic HUD.
   - Tag: `phase-6`
7. **Phase 7 — Visual Verification & Final Polish**
   - Inspect rendered views in browser against all reference `效果图` and photos, refine proportions, facade rhythm, and exposure balance.
   - Tag: `phase-7`

---

## 4. Technical Challenges & Solutions

| Challenge | Solution |
| :--- | :--- |
| **Accurate Proportions & Alignment** | Derive all building centerpoints, angles, and dimensions from a single normalized coordinate map traced over the satellite ortho-view, cross-checked against all `效果图` cutouts. |
| **Draw Calls & FPS with Detailed Facades** | Merge static architectural sub-parts per building by material, and use `THREE.InstancedMesh` for repetitive elements (trees, streetlights, window mullions, bleachers, court fences). |
| **Shadow Acne & Range Across a 500 m Campus** | Tune shadow camera frustum tightly to the campus bounding box (`±300 m`), use `4096×4096` shadow map with calibrated `bias`/`normalBias`, and supplement close-range contact grounding with `N8AO`. |
| **Avoiding "Boxy" / Plastic Look** | Enforce architectural depth (recessed windows, protruding slab ledges, eaves overhang, skylight ridges, pointed dormers), matte concrete (`roughness: 0.85`) contrasted against glossy tinted glass (`roughness: 0.08`), and `ACESFilmic` tone mapping. |
| **Phase-by-Phase Reproducibility** | Each phase ends with a clean `npm run build`, an entry in `DEV_LOG.md`, an annotated Git tag (`phase-1` … `phase-7`), and a push to GitHub so any phase can be checked out or browsed independently. |
