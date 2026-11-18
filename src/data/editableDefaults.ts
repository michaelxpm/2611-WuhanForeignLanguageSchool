import { pxToWorld } from './campusLayout';

export interface RoadNode {
  id: string;
  label: string;
  x: number;
  z: number;
}

export interface RoadEdge {
  from: string;
  to: string;
  width: number;
  y?: number;
  color?: string;
}

function nodePx(id: string, label: string, px: number, py: number): RoadNode {
  const [x, z] = pxToWorld(px, py);
  return { id, label, x, z };
}

export const DEFAULT_ROAD_NODES: RoadNode[] = [
  nodePx('gate', '校门主入口节点', 195, 544),
  nodePx('ped-east', '主干道东端 (广场口)', 610, 544),
  nodePx('stad-sw', '体育场西南弯', 166, 488),
  nodePx('stad-nw', '体育场西北弯', 166, 396),
  nodePx('stad-n-w', '看台北侧西口', 215, 345),
  nodePx('stad-n-e', '看台北侧东口', 482, 345),
  nodePx('stad-se', '体育场东侧南口', 482, 544),

  nodePx('xz-n', '寻真园东路北口', 632, 395),
  nodePx('xz-mid', '中心花坛西路口', 632, 442),
  nodePx('xz-s', '寻真园东路南口', 632, 520),
  nodePx('rb-w', '中心花坛西环口', 736, 442),
  nodePx('tri-nw', '三角绿地西北角', 642, 442),
  nodePx('tri-se', '初中部圆楼北口', 668, 512),

  nodePx('rb-nw', '花坛西北步道口', 745, 412),
  nodePx('aud-e', '报告厅东口', 708, 355),
  nodePx('rb-n', '花坛北口', 788, 400),
  nodePx('mid-n', '小学部东路口', 822, 355),
  nodePx('north-jct', '北翼主交叉口', 852, 290),

  nodePx('dorm-s', '宿舍区中路南口', 832, 270),
  nodePx('dorm-n', '宿舍区中路北口', 832, 75),

  nodePx('east-n', '东侧环路北口', 888, 415),
  nodePx('east-s', '东侧环路南口', 888, 605),
];

export const ROAD_EDGES: RoadEdge[] = [
  // Main pedestrian avenue
  { from: 'gate', to: 'ped-east', width: 7.5, y: 0.08, color: '#ded8ce' },
  // Vehicle loop around stadium
  { from: 'gate', to: 'stad-sw', width: 6.0, y: 0.07, color: '#cfd6df' },
  { from: 'stad-sw', to: 'stad-nw', width: 6.0, y: 0.07, color: '#cfd6df' },
  { from: 'stad-nw', to: 'stad-n-w', width: 6.0, y: 0.07, color: '#cfd6df' },
  { from: 'stad-n-w', to: 'stad-n-e', width: 7.0, y: 0.07, color: '#cfd6df' },
  { from: 'stad-n-e', to: 'stad-se', width: 9.0, y: 0.07, color: '#cfd6df' },
  // Transition zone & roundabout spokes
  { from: 'xz-n', to: 'xz-s', width: 8.0, y: 0.08, color: '#d6cfc4' },
  { from: 'xz-mid', to: 'rb-w', width: 8.0, y: 0.09, color: '#d6cfc4' },
  { from: 'rb-w', to: 'tri-se', width: 8.0, y: 0.09, color: '#d6cfc4' },
  { from: 'rb-nw', to: 'aud-e', width: 6.5, y: 0.08, color: '#d6cfc4' },
  { from: 'rb-n', to: 'mid-n', width: 7.5, y: 0.08, color: '#d6cfc4' },
  { from: 'mid-n', to: 'north-jct', width: 7.5, y: 0.08, color: '#d6cfc4' },
  // North zone (removed extra road next to 小操场)
  { from: 'north-jct', to: 'dorm-s', width: 6.5, y: 0.08, color: '#d6cfc4' },
  { from: 'dorm-s', to: 'dorm-n', width: 6.5, y: 0.08, color: '#d6cfc4' },
  // East perimeter
  { from: 'mid-n', to: 'east-n', width: 7.0, y: 0.07, color: '#d6cfc4' },
  { from: 'east-n', to: 'east-s', width: 7.0, y: 0.07, color: '#d6cfc4' },
];

export type TreeSpecies = 'oak' | 'maple' | 'lowpoly';

export interface TreeItem {
  id: string;
  x: number;
  z: number;
  scale: number;
  shade: number;
  species?: TreeSpecies;
}

export function generateDefaultTrees(): TreeItem[] {
  const trees: TreeItem[] = [];
  let idx = 1;

  const addWorld = (x: number, z: number, scale = 1) => {
    trees.push({
      id: `tree-${idx}`,
      x: Math.round(x * 10) / 10,
      z: Math.round(z * 10) / 10,
      scale: scale * (0.85 + ((idx * 37) % 10) * 0.032),
      shade: ((idx * 19) % 10) / 10,
    });
    idx++;
  };

  const addPx = (px: number, py: number, scale = 1) => {
    const [x, z] = pxToWorld(px, py);
    addWorld(x + Math.sin(idx * 12.98) * 0.8, z + Math.cos(idx * 78.23) * 0.8, scale);
  };

  // 1. 中心花坛 ring (16 trees)
  for (let i = 0; i < 16; i++) {
    const a = (i / 16) * Math.PI * 2;
    addWorld(Math.cos(a) * 16.5, Math.sin(a) * 16.5, 0.92);
  }

  // 2. 北太子湖 & 小操场 dense double-row shoreline grove
  for (let py = 80; py <= 305; py += 11) {
    const px = 668 + ((305 - py) / 225) * 30;
    addPx(px - 6, py, 1.15);
    addPx(px - 15, py + 4, 1.0);
  }
  for (let px = 740; px <= 935; px += 12) {
    addPx(px, 26, 1.15);
    addPx(px + 5, 36, 1.0);
  }

  // 3. 太子湖北路 (South avenue boulevard)
  for (let px = 185; px <= 945; px += 14) {
    addPx(px, 612, 1.1);
    addPx(px + 6, 642, 1.15);
  }

  // 4. Red Main Pedestrian Avenue
  for (let px = 210; px <= 600; px += 13) {
    addPx(px, 533, 0.98);
    addPx(px, 553, 0.98);
  }

  // 5. N-S Avenue between Stadium and 寻真园
  for (let py = 350; py <= 525; py += 14) {
    addPx(468, py, 1.05);
    addPx(496, py, 1.05);
  }

  // 6. 寻真园 dense orchard/grove + Triangular Lawn border
  for (let py = 350; py <= 518; py += 13) {
    addPx(620, py, 1.05);
  }
  for (let px = 560; px <= 605; px += 14) {
    for (let py = 365; py <= 415; py += 16) {
      addPx(px, py, 0.95);
    }
  }
  for (let t = 0; t < 6; t++) {
    addPx(730 - t * 11, 452 + t * 11, 0.92);
  }

  // 7. North of 寻真园 / South shore of 北太子湖
  for (let px = 490; px <= 645; px += 13) {
    addPx(px, 326, 1.1);
    addPx(px + 5, 314, 1.0);
  }

  // 8. West & North-West perimeter of Stadium
  for (let py = 350; py <= 535; py += 14) {
    addPx(150, py, 1.1);
  }
  for (let px = 210; px <= 460; px += 18) {
    addPx(px, 330, 1.05);
  }

  // 9. East Perimeter & 扇形广场 outer rim
  for (let py = 410; py <= 595; py += 14) {
    addPx(900, py, 1.0);
  }
  for (let px = 710; px <= 760; px += 14) {
    addPx(px, 398, 1.0);
  }

  return trees;
}
