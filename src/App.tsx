import { useEffect, useState } from 'react';
import {
  Building2,
  Compass,
  Eye,
  EyeOff,
  Footprints,
  Grid3X3,
  MapPin,
  Moon,
  Orbit,
  Play,
  RotateCw,
  Square,
  Sun,
  Sunrise,
  Sunset,
  X,
} from 'lucide-react';
import { SceneRoot } from './components/SceneRoot';
import { TimeOfDay } from './components/EnvironmentEffects';
import { BUILDINGS, BuildingSpec, CAMERA_PRESETS, CameraPreset } from './data/campusLayout';

const TIME_OPTIONS: { id: TimeOfDay; label: string; icon: typeof Sun }[] = [
  { id: 'morning', label: '清晨', icon: Sunrise },
  { id: 'noon', label: '正午', icon: Sun },
  { id: 'golden', label: '黄昏', icon: Sunset },
  { id: 'night', label: '夜景', icon: Moon },
];

export function App() {
  const [activePreset, setActivePreset] = useState<CameraPreset | null>(CAMERA_PRESETS[0]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingSpec | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [timeOfDay, setTimeOfDay] = useState<TimeOfDay>('noon');
  const [cameraMode, setCameraMode] = useState<'orbit' | 'walk'>('orbit');
  const [showDirectory, setShowDirectory] = useState(false);
  const [yawDeg, setYawDeg] = useState(0);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [autoTour, setAutoTour] = useState(false);

  useEffect(() => {
    if (!autoTour) return;
    let idx = 0;
    setCameraMode('orbit');
    setSelectedBuilding(null);
    setAutoOrbit(false);
    setActivePreset(CAMERA_PRESETS[0]);

    const timer = window.setInterval(() => {
      idx = (idx + 1) % CAMERA_PRESETS.length;
      setActivePreset(CAMERA_PRESETS[idx]);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [autoTour]);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <SceneRoot
        activePreset={activePreset}
        selectedBuilding={selectedBuilding}
        showLabels={showLabels}
        showGrid={showGrid}
        timeOfDay={timeOfDay}
        cameraMode={cameraMode}
        autoOrbit={autoOrbit}
        onSelectBuilding={(b) => {
          setSelectedBuilding(b);
          setAutoTour(false);
          if (!b) setAutoOrbit(false);
          if (b) {
            setCameraMode('orbit');
            setActivePreset(null);
          }
        }}
        onTransitionEnd={() => setActivePreset(null)}
        onYawChange={setYawDeg}
      />

      {/* Top-Left Title & Live Compass */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto flex items-center gap-3 bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-xl px-4 py-3 shadow-xl">
        <div
          className="w-9 h-9 rounded-full bg-slate-800/90 border border-slate-600 flex items-center justify-center shrink-0 transition-transform duration-75"
          style={{ transform: `rotate(${yawDeg}deg)` }}
          title="实时指北针 (红色指针指向正北)"
        >
          <Compass className="w-5 h-5 text-rose-400" />
        </div>
        <div>
          <h1 className="text-sm font-bold text-white leading-tight">
            武汉外国语学校 · 3D 数字校园
          </h1>
          <p className="text-[11px] text-slate-400">
            Wuhan Foreign Languages School · Phase 7 Final
          </p>
        </div>
      </div>

      {/* Top-Right Controls: Time of Day, Walk/Orbit Mode, Directory, Grid, Labels */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center justify-end gap-2 max-w-[60vw]">
        {/* Time-of-Day Switcher */}
        <div className="flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-xl p-1 shadow-lg">
          {TIME_OPTIONS.map((opt) => {
            const Icon = opt.icon;
            const active = timeOfDay === opt.id;
            return (
              <button
                key={opt.id}
                onClick={() => setTimeOfDay(opt.id)}
                className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  active ? 'bg-amber-500/90 text-slate-950 shadow' : 'text-slate-300 hover:text-white'
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">{opt.label}</span>
              </button>
            );
          })}
        </div>

        {/* Guided Auto-Tour */}
        <button
          onClick={() => setAutoTour((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md shadow-lg transition cursor-pointer ${
            autoTour
              ? 'bg-rose-500 text-white border-rose-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/70'
          }`}
        >
          {autoTour ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-sky-400" />}
          <span>{autoTour ? '停止导览' : '自动导览'}</span>
        </button>

        {/* Camera Mode Toggle */}
        <button
          onClick={() => {
            setCameraMode((m) => (m === 'orbit' ? 'walk' : 'orbit'));
            setSelectedBuilding(null);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md shadow-lg transition cursor-pointer ${
            cameraMode === 'walk'
              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/70'
          }`}
        >
          {cameraMode === 'walk' ? <Footprints className="w-3.5 h-3.5" /> : <Orbit className="w-3.5 h-3.5 text-sky-400" />}
          <span>{cameraMode === 'walk' ? '漫步中 (点击切回航拍)' : '第一人称漫步'}</span>
        </button>

        {/* Building Directory Toggle */}
        <button
          onClick={() => setShowDirectory((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md shadow-lg transition cursor-pointer ${
            showDirectory
              ? 'bg-sky-500 text-white border-sky-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/70'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span>建筑导览</span>
        </button>

        <button
          onClick={() => setShowGrid((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 backdrop-blur-md shadow-lg transition cursor-pointer"
        >
          <Grid3X3 className={`w-3.5 h-3.5 ${showGrid ? 'text-sky-400' : 'text-slate-400'}`} />
          <span className="hidden md:inline">{showGrid ? '隐藏网格' : '测量网格'}</span>
        </button>

        <button
          onClick={() => setShowLabels((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 backdrop-blur-md shadow-lg transition cursor-pointer"
        >
          {showLabels ? <Eye className="w-3.5 h-3.5 text-sky-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span className="hidden md:inline">{showLabels ? '隐藏标签' : '显示标签'}</span>
        </button>
      </div>

      {/* Building Directory Drawer */}
      {showDirectory && (
        <div className="absolute top-20 right-4 z-10 w-72 max-h-[65vh] overflow-y-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200">校园建筑导览 ({BUILDINGS.length})</span>
            <button
              onClick={() => setShowDirectory(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {BUILDINGS.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setCameraMode('orbit');
                  setActivePreset(null);
                  setSelectedBuilding(b);
                }}
                className={`w-full text-left px-2.5 py-2 rounded-xl text-xs transition cursor-pointer flex items-center justify-between ${
                  selectedBuilding?.id === b.id
                    ? 'bg-sky-500/25 text-sky-300 border border-sky-500/40'
                    : 'text-slate-300 hover:bg-slate-800/80 hover:text-white'
                }`}
              >
                <span className="font-medium truncate">{b.nameZh}</span>
                <span className="text-[10px] text-slate-500 shrink-0 ml-2">{b.stories}F</span>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* First-Person Walk Help Banner */}
      {cameraMode === 'walk' && (
        <div className="absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-emerald-950/85 border border-emerald-500/50 text-emerald-100 px-4 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-md">
          第一人称漫步模式：WASD / 方向键移动 · Shift 加速 · 鼠标按住拖拽旋转视角
        </div>
      )}

      {/* Bottom Camera Presets Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70 shadow-xl max-w-[95vw] overflow-x-auto">
        {CAMERA_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              setCameraMode('orbit');
              setSelectedBuilding(null);
              setActivePreset(preset);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              activePreset?.id === preset.id && cameraMode === 'orbit'
                ? 'bg-sky-500 text-white shadow'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            {preset.labelZh}
          </button>
        ))}
      </div>

      {/* Building Inspector Card */}
      {selectedBuilding && (
        <div className="absolute bottom-20 left-4 z-10 w-80 bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2">
              <MapPin className="w-4 h-4 text-sky-400 shrink-0" />
              <div>
                <h2 className="text-sm font-bold text-white">{selectedBuilding.nameZh}</h2>
                <p className="text-[11px] text-slate-400">{selectedBuilding.nameEn}</p>
              </div>
            </div>
            <button
              onClick={() => setSelectedBuilding(null)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
          <p className="mt-2.5 text-xs text-slate-300 leading-relaxed">
            {selectedBuilding.description}
          </p>
          <div className="mt-3 pt-2.5 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
            <span>楼层: {selectedBuilding.stories}F</span>
            <span>
              尺寸: {selectedBuilding.dimensions[0]}m × {selectedBuilding.dimensions[2]}m
            </span>
          </div>
          <button
            onClick={() => setAutoOrbit((v) => !v)}
            className={`mt-3 w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
              autoOrbit
                ? 'bg-sky-500 text-white'
                : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoOrbit ? 'animate-spin' : ''}`} />
            <span>{autoOrbit ? '停止环绕此建筑' : '环绕此建筑'}</span>
          </button>
        </div>
      )}

      {/* Quick Directory Count */}
      <div className="hidden md:block absolute bottom-20 right-4 z-10 bg-slate-900/75 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-400">
        已定位地标建筑: <span className="text-sky-400 font-semibold">{BUILDINGS.length}</span> 处 ·{' '}
        {cameraMode === 'orbit' ? '左键旋转 / 右键平移 / 滚轮缩放' : 'WASD 移动 / 拖拽视角'}
      </div>
    </div>
  );
}

export default App;
