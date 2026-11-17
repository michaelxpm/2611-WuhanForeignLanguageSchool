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
