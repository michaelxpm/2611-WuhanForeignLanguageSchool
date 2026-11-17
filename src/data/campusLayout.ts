export type CampusZone = 'south' | 'central' | 'north' | 'athletics' | 'landscape';

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
    position: [45, 0, 108],
    rotationY: -0.14,
    dimensions: [118, 19, 26],
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
    position: [82, 0, 74],
    rotationY: -0.14,
    dimensions: [42, 14, 18],
    stories: 3,
    roofColor: '#4b5563',
    wallColor: '#e2e8f0',
    description: '紧邻初中部教学楼北侧的多功能附楼，面向扇形广场。',
    cameraOffset: [-30, 35, 50],
  },
  {
    id: 'west-gate',
    nameZh: '西北门 · 校园主入口',
    nameEn: 'Northwest Main Gate',
    zone: 'south',
    position: [-325, 0, 18],
    rotationY: 0,
    dimensions: [16, 6, 22],
    stories: 1,
    roofColor: '#1e293b',
    wallColor: '#cbd5e1',
    description: '临东风大道校园主出入口，设有石材门柱、校名竖匾及人车分流道闸。',
    cameraOffset: [32, 16, 28],
  },

  // ================= ZONE B: CENTRAL ACADEMIC & CULTURAL =================
  {
    id: 'elementary-teaching',
    nameZh: '小学部教学楼',
    nameEn: 'Elementary School Teaching Building',
    zone: 'central',
    position: [-24, 0, -68],
    rotationY: 0.24,
    dimensions: [64, 18, 44],
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
    position: [-66, 0, -42],
    rotationY: 0.24,
    dimensions: [44, 15, 28],
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
    position: [84, 0, -44],
    rotationY: -0.18,
    dimensions: [56, 17, 46],
    stories: 4,
    roofColor: '#374151',
    wallColor: '#e5e7eb',
    description: '独特锐角三角形平面建筑，中央嵌入圆形采光中庭。',
    cameraOffset: [-40, 50, 60],
  },
  {
    id: 'guiyuan',
    nameZh: '桂苑',
    nameEn: 'Guiyuan Courtyard Block',
    zone: 'central',
    position: [112, 0, 12],
    rotationY: -0.14,
    dimensions: [32, 16, 30],
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
    position: [118, 0, 50],
    rotationY: -0.14,
    dimensions: [32, 16, 30],
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
    position: [10, 0, -155],
    rotationY: 0.2,
    dimensions: [58, 13, 24],
    stories: 3,
    roofColor: '#4b453f',
    wallColor: '#e5e7eb',
    description: '弧形新月造型主楼与后侧矩形配楼组成的初中部餐饮中心。',
    cameraOffset: [-35, 36, 52],
  },
  {
    id: 'zhuyuan',
    nameZh: '竹苑',
    nameEn: 'Zhuyuan Dormitory',
    zone: 'north',
    position: [-56, 0, -135],
    rotationY: 0.28,
    dimensions: [30, 16, 28],
    stories: 4,
    roofColor: '#2f3947',
    wallColor: '#e2e8f0',
    description: '小操场东侧方形庭院宿舍楼（竹苑），顶层设拱形窗。',
    cameraOffset: [-32, 32, 42],
  },
  {
    id: 'meiyuan',
    nameZh: '梅苑',
    nameEn: 'Meiyuan Dormitory',
    zone: 'north',
    position: [-76, 0, -176],
    rotationY: 0.28,
    dimensions: [30, 16, 28],
    stories: 4,
    roofColor: '#2f3947',
    wallColor: '#e2e8f0',
    description: '小操场东北侧方形庭院宿舍楼（梅苑），紧邻升旗台。',
    cameraOffset: [-32, 32, 42],
  },
  {
    id: 'elementary-canteen',
    nameZh: '小学部食堂',
    nameEn: 'Elementary School Canteen',
    zone: 'north',
    position: [-26, 0, -214],
    rotationY: 0.28,
    dimensions: [42, 12, 26],
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
    position: [-106, 0, -225],
    rotationY: 0.25,
    dimensions: [36, 16, 36],
    stories: 4,
    roofColor: '#2d3748',
    wallColor: '#e2e8f0',
    description: '西北角临湖八边形围合式宿舍楼。',
    cameraOffset: [-35, 36, 48],
  },
  {
    id: 'dorm-north-wing',
    nameZh: '初中部宿舍 · 北翼楼',
    nameEn: 'Middle School North L-Wing Dormitory',
    zone: 'north',
    position: [-52, 0, -258],
    rotationY: 0.28,
    dimensions: [56, 17, 32],
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
    position: [-235, 0, 52],
    rotationY: 0.04,
    dimensions: [158, 14, 96],
    stories: 2,
    roofColor: '#f8fafc',
    wallColor: '#cbd5e1',
    description: '标准400米塑胶跑道与天然草坪足球场，北侧设五连拱白色张拉膜看台。',
    cameraOffset: [0, 85, 130],
  },
  {
    id: 'small-track',
    nameZh: '小操场 · 小足球场 · 升旗台',
    nameEn: 'Small Track, Pitch & Flag Platform',
    zone: 'athletics',
    position: [-116, 0, -148],
    rotationY: 0.34,
    dimensions: [46, 8, 106],
    stories: 1,
    roofColor: '#d97706',
    wallColor: '#e7dcc8',
    description: '小学部200米跑道与小足球场，东侧设「从这里走向世界和未来」主题升旗台。',
    cameraOffset: [-55, 42, 48],
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
    description: '校园几何中心花坛与向东南展开的放射状砖石绿地扇形广场。',
    cameraOffset: [-45, 58, 72],
  },
];

export const CAMERA_PRESETS: CameraPreset[] = [
  {
    id: 'overview',
    labelZh: '全景鸟瞰',
    labelEn: 'Campus Overview',
    position: [-210, 210, 260],
    target: [-35, 0, -15],
  },
  {
    id: 'roundabout',
    labelZh: '中心花坛 · 扇形广场',
    labelEn: 'Central Plaza',
    position: [-65, 55, 85],
    target: [25, 0, 15],
  },
  {
    id: 'middle-school',
    labelZh: '初中部 · 主教学楼',
    labelEn: 'Middle School',
    position: [-15, 52, 195],
    target: [42, 8, 105],
  },
  {
    id: 'elementary',
    labelZh: '小学部 · 报告厅',
    labelEn: 'Elementary & Auditorium',
    position: [-85, 50, 10],
    target: [-38, 8, -62],
  },
  {
    id: 'small-track',
    labelZh: '小操场 · 升旗台',
    labelEn: 'Small Track & Flagpole',
    position: [-175, 40, -110],
    target: [-102, 5, -148],
  },
  {
    id: 'stadium',
    labelZh: '主体育场 · 张拉膜看台',
    labelEn: 'Main Stadium',
    position: [-235, 85, 175],
    target: [-235, 5, 45],
  },
  {
    id: 'west-gate',
    labelZh: '西北门入口',
    labelEn: 'Main Gate',
    position: [-290, 18, 45],
    target: [-325, 3, 18],
  },
];
