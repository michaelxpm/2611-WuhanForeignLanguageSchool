export type CampusZone = 'south' | 'central' | 'north' | 'athletics' | 'landscape';

/**
 * Converts satellite image pixel coordinates (from the 999×673 Google Maps ortho reference)
 * into metric 3D world coordinates [X, Z] centered at 中心花坛 (px=770, py=430), 1 px = 0.65 m.
 */
export function pxToWorld(px: number, py: number): [number, number] {
  return [Math.round((px - 770) * 0.65 * 10) / 10, Math.round((py - 430) * 0.65 * 10) / 10];
}

export function pxPos(px: number, py: number, y = 0): [number, number, number] {
  const [x, z] = pxToWorld(px, py);
  return [x, y, z];
}

export interface BuildingSpec {
  id: string;
  nameZh: string;
  nameEn: string;
  zone: CampusZone;
  /** World position [x, y, z] in meters. Origin (0,0,0) = 中心花坛 (Central Roundabout). -Z = North, +Z = South, +X = East, -X = West */
  position: [number, number, number];
  /** Y-axis rotation in radians */
  rotationY: number;
  /** Bounding dimensions [width, height, depth] in meters for massing & focus */
  dimensions: [number, number, number];
  stories: number;
  roofColor: string;
  wallColor: string;
  description: string;
  cameraOffset: [number, number, number];
}

export interface CameraPreset {
  id: string;
  labelZh: string;
  labelEn: string;
  position: [number, number, number];
  target: [number, number, number];
}

export const ZONE_COLORS: Record<CampusZone, string> = {
  south: '#475569',
  central: '#0f766e',
  north: '#334155',
  athletics: '#b91c1c',
  landscape: '#15803d',
};

export const BUILDINGS: BuildingSpec[] = [
  // ================= ZONE A: SOUTH & SOUTHEAST =================
  {
    id: 'middle-school-main',
    nameZh: '初中部 · 初中教学楼',
    nameEn: 'Middle School Complex & Rotunda',
    zone: 'south',
    position: pxPos(788, 575), // [11.7, 0, 94.3]
    rotationY: 0,
    dimensions: [114, 19, 26],
    stories: 5,
    roofColor: '#2b323c',
    wallColor: '#e8eaed',
    description: '南侧主教学综合体，配有标志性中央天窗脊线及西北角圆柱形报告/门厅建筑。',
    cameraOffset: [-45, 55, 85],
  },
  {
    id: 'middle-school-annex',
    nameZh: '初中部北侧附楼',
    nameEn: 'Middle School North Annex',
    zone: 'south',
    position: pxPos(844, 520), // [48.1, 0, 58.5]
    rotationY: 0,
    dimensions: [26, 14, 36],
    stories: 3,
    roofColor: '#4b5563',
    wallColor: '#e2e8f0',
    description: '紧邻初中部教学楼东北侧的多功能附楼，面向扇形广场东翼。',
    cameraOffset: [-35, 35, 45],
  },
  {
    id: 'west-gate',
    nameZh: '西北门 · 校园主入口',
    nameEn: 'Main School Gate (SW Entrance)',
    zone: 'south',
    position: [-403.4, 0, 73.2],
    rotationY: (-90 * Math.PI) / 180,
    dimensions: [16, 6, 22],
    stories: 1,
    roofColor: '#1e293b',
    wallColor: '#cbd5e1',
    description: '临东风大道与太子湖北路交汇处校园主入口，直通主体育场南侧主干道及中心花坛。',
    cameraOffset: [42, 18, 28],
  },

  // ================= ZONE B: CENTRAL ACADEMIC & CULTURAL =================
  {
    id: 'elementary-teaching',
    nameZh: '小学部教学楼',
    nameEn: 'Elementary School Teaching Building',
    zone: 'central',
    position: [-15.1, 0, -75.9],
    rotationY: (-86 * Math.PI) / 180,
    dimensions: [46, 18, 46],
    stories: 4,
    roofColor: '#1f4e5f',
    wallColor: '#f1f5f9',
    description: '合院式四层教学楼，青灰色坡屋顶搭配尖顶采光窗与双内庭院。',
    cameraOffset: [-45, 48, 65],
  },
  {
    id: 'auditorium',
    nameZh: '报告厅与艺术圆楼',
    nameEn: 'Auditorium & Drum Pavilion',
    zone: 'central',
    position: [-57.7, 0, -55.2],
    rotationY: (-60 * Math.PI) / 180,
    dimensions: [42, 15, 28],
    stories: 3,
    roofColor: '#7c4a33',
    wallColor: '#ede9e3',
    description: '红褐坡顶主报告厅、圆柱形多功能厅及连接内院组成的核心文化建筑群。',
    cameraOffset: [-35, 36, 52],
  },
  {
    id: 'triangular-atrium',
    nameZh: '东侧三角中庭楼',
    nameEn: 'Triangular Atrium Complex',
    zone: 'central',
    position: pxPos(950, 362), // [117, 0, -44.2]
    rotationY: 0,
    dimensions: [56, 17, 46],
    stories: 4,
    roofColor: '#374151',
    wallColor: '#e5e7eb',
    description: '独特锐角三角形平面建筑，中央嵌入圆形采光中庭。',
    cameraOffset: [-45, 50, 60],
  },
  {
    id: 'guiyuan',
    nameZh: '桂苑',
    nameEn: 'Guiyuan Courtyard Block',
    zone: 'central',
    position: pxPos(932, 442), // [105.3, 0, 7.8]
    rotationY: 0,
    dimensions: [34, 16, 30],
    stories: 4,
    roofColor: '#2d3748',
    wallColor: '#f1f5f9',
    description: '扇形广场东侧围合式庭院楼（桂苑）。',
    cameraOffset: [-35, 34, 42],
  },
  {
    id: 'songyuan',
    nameZh: '松苑',
    nameEn: 'Songyuan Courtyard Block',
    zone: 'central',
    position: pxPos(932, 504), // [105.3, 0, 48.1]
    rotationY: 0,
    dimensions: [34, 16, 30],
    stories: 4,
    roofColor: '#2d3748',
    wallColor: '#f1f5f9',
    description: '扇形广场东南侧围合式庭院楼（松苑）。',
    cameraOffset: [-35, 34, 42],
  },

  // ================= ZONE C: NORTH & NORTHWEST =================
  {
    id: 'middle-canteen',
    nameZh: '初中部食堂',
    nameEn: 'Middle School Canteen (Crescent)',
    zone: 'north',
    position: pxPos(876, 235), // [68.9, 0, -126.8]
    rotationY: 0,
    dimensions: [46, 13, 46],
    stories: 3,
    roofColor: '#4b453f',
    wallColor: '#e5e7eb',
    description: '弧形新月造型主楼与东侧矩形配楼组成的初中部餐饮中心。',
    cameraOffset: [-40, 38, 52],
  },
  {
    id: 'zhuyuan',
    nameZh: '竹苑',
    nameEn: 'Zhuyuan Dormitory',
    zone: 'north',
    position: pxPos(798, 222), // [18.2, 0, -135.2]
    rotationY: 0,
    dimensions: [32, 16, 30],
    stories: 4,
    roofColor: '#2f3947',
    wallColor: '#e2e8f0',
    description: '小操场东南侧方形庭院宿舍楼（竹苑），顶层设拱形窗。',
    cameraOffset: [-32, 32, 42],
  },
  {
    id: 'meiyuan',
    nameZh: '梅苑',
    nameEn: 'Meiyuan Dormitory',
    zone: 'north',
    position: pxPos(790, 155), // [13, 0, -178.8]
    rotationY: 0,
    dimensions: [32, 16, 30],
    stories: 4,
    roofColor: '#2f3947',
    wallColor: '#e2e8f0',
    description: '小操场东侧方形庭院宿舍楼（梅苑），紧邻升旗台。',
    cameraOffset: [-32, 32, 42],
  },
  {
    id: 'elementary-canteen',
    nameZh: '小学部食堂',
    nameEn: 'Elementary School Canteen',
    zone: 'north',
    position: pxPos(876, 155), // [68.9, 0, -178.8]
    rotationY: 0,
    dimensions: [40, 12, 34],
    stories: 2,
    roofColor: '#cbd5e1',
    wallColor: '#f1f5f9',
    description: '大跨度浅灰白屋顶小学部食堂，设有高侧采光天窗。',
    cameraOffset: [-35, 32, 45],
  },
  {
    id: 'dorm-octagonal',
    nameZh: '初中部宿舍 · 八角楼',
    nameEn: 'Middle School Octagonal Dormitory',
    zone: 'north',
    position: pxPos(789, 90), // [12.4, 0, -221]
    rotationY: 0,
    dimensions: [36, 16, 36],
    stories: 4,
    roofColor: '#2d3748',
    wallColor: '#e2e8f0',
    description: '北侧临湖八边形围合式宿舍楼。',
    cameraOffset: [-35, 36, 48],
  },
  {
    id: 'dorm-north-wing',
    nameZh: '初中部宿舍 · 北翼楼',
    nameEn: 'Middle School North L-Wing Dormitory',
    zone: 'north',
    position: pxPos(870, 85), // [65, 0, -224.3]
    rotationY: 0,
    dimensions: [44, 17, 36],
    stories: 4,
    roofColor: '#334155',
    wallColor: '#e5e7eb',
    description: '校园最北端临北太子湖L型宿舍建筑群。',
    cameraOffset: [-45, 42, 56],
  },

  // ================= ZONE D: ATHLETICS & LANDSCAPE LANDMARKS =================
  {
    id: 'main-stadium',
    nameZh: '主体育场与看台',
    nameEn: 'Main 400m Stadium & Tensile Grandstand',
    zone: 'athletics',
    position: pxPos(312, 444), // [-297.7, 0, 9.1]
    rotationY: 0,
    dimensions: [164, 14, 92],
    stories: 2,
    roofColor: '#f8fafc',
    wallColor: '#cbd5e1',
    description: '标准400米塑胶跑道与天然草坪足球场，北侧设五连拱白色张拉膜看台。',
    cameraOffset: [0, 95, 135],
  },
  {
    id: 'small-track',
    nameZh: '小操场 · 小足球场 · 升旗台',
    nameEn: 'Small Track, Pitch & Flag Platform',
    zone: 'athletics',
    position: pxPos(722, 180), // [-31.2, 0, -162.5]
    rotationY: -0.23,
    dimensions: [46, 8, 106],
    stories: 1,
    roofColor: '#d97706',
    wallColor: '#e7dcc8',
    description: '小学部200米跑道与小足球场，东侧设「从这里走向世界和未来」主题升旗台。',
    cameraOffset: [-55, 45, 50],
  },
  {
    id: 'south-courts',
    nameZh: '南侧篮球网球场群',
    nameEn: 'South Basketball & Tennis Courts',
    zone: 'athletics',
    position: pxPos(360, 580),
    rotationY: 0,
    dimensions: [188, 4, 34],
    stories: 1,
    roofColor: '#b94a3e',
    wallColor: '#1d6f72',
    description: '6片红色标准篮球场与东西两侧青色网球场，配有围网、球架与照明灯柱。',
    cameraOffset: [0, 70, 95],
  },
  {
    id: 'central-roundabout',
    nameZh: '中心花坛 · 扇形广场',
    nameEn: 'Central Roundabout & Radial Plaza',
    zone: 'landscape',
    position: [0, 0, 0],
    rotationY: 0,
    dimensions: [44, 2, 44],
    stories: 1,
    roofColor: '#22c55e',
    wallColor: '#b45309',
    description: '校园几何中心花坛与向东及东南展开的放射状砖石绿地扇形广场。',
    cameraOffset: [-45, 58, 72],
  },
];

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    labelZh: '全景鸟瞰',
    labelEn: 'Campus Overview',
    position: [-120, 260, 240],
    target: [-80, 0, -20],
  },
  {
    id: 'plan-view',
    labelZh: '卫星平面视角',
    labelEn: 'Top-Down Plan View',
    position: [-110, 420, 10],
    target: [-110, 0, -20],
  },
  {
    id: 'roundabout',
    labelZh: '中心花坛 · 扇形广场',
    labelEn: 'Central Plaza',
    position: [-55, 68, 95],
    target: [15, 0, 15],
  },
  {
    id: 'middle-school',
    labelZh: '初中部 · 主教学楼',
    labelEn: 'Middle School',
    position: [-45, 58, 185],
    target: [5, 8, 88],
  },
  {
    id: 'elementary',
    labelZh: '小学部 · 报告厅',
    labelEn: 'Elementary & Auditorium',
    position: [-75, 55, 5],
    target: [-20, 8, -68],
  },
  {
    id: 'small-track',
    labelZh: '小操场 · 升旗台',
    labelEn: 'Small Track & Flagpole',
    position: [-95, 42, -115],
    target: [-22, 5, -160],
  },
  {
    id: 'stadium',
    labelZh: '主体育场 · 张拉膜看台',
    labelEn: 'Main Stadium',
    position: [-298, 95, 135],
    target: [-298, 5, 15],
  },
  {
    id: 'west-gate',
    labelZh: '校园主入口 (校门)',
    labelEn: 'Main Gate',
    position: [-355, 26, 108],
    target: [-403.4, 3, 73.2],
  },
];
