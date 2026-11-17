import { useState } from 'react';
import { Compass, Eye, EyeOff, Grid3X3, MapPin, X } from 'lucide-react';
import { SceneRoot } from './components/SceneRoot';
import { BUILDINGS, BuildingSpec, CAMERA_PRESETS, CameraPreset } from './data/campusLayout';

export function App() {
  const [activePreset, setActivePreset] = useState<CameraPreset | null>(CAMERA_PRESETS[0]);
  const [selectedBuilding, setSelectedBuilding] = useState<BuildingSpec | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(false);

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <SceneRoot
        activePreset={activePreset}
        selectedBuilding={selectedBuilding}
        showLabels={showLabels}
        showGrid={showGrid}
        onSelectBuilding={(b) => {
          setSelectedBuilding(b);
          if (b) setActivePreset(null);
        }}
        onTransitionEnd={() => setActivePreset(null)}
      />

      {/* Top-Left Title & Phase Badge */}
      <div className="absolute top-4 left-4 z-10 pointer-events-auto bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-xl px-4 py-3 shadow-xl max-w-xs">
        <div className="flex items-center gap-2">
          <Compass className="w-5 h-5 text-sky-400 shrink-0" />
          <div>
            <h1 className="text-sm font-bold text-white leading-tight">
              武汉外国语学校 · 3D 数字校园
            </h1>
            <p className="text-[11px] text-slate-400">
              Wuhan Foreign Languages School · Phase 4 North Zone & Flag Platform
            </p>
          </div>
        </div>
      </div>

      {/* Top-Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
        <button
          onClick={() => setShowGrid((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 backdrop-blur-md shadow-lg transition cursor-pointer"
        >
          <Grid3X3 className={`w-3.5 h-3.5 ${showGrid ? 'text-sky-400' : 'text-slate-400'}`} />
          <span>{showGrid ? '隐藏网格' : '测量网格'}</span>
        </button>
        <button
          onClick={() => setShowLabels((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 backdrop-blur-md shadow-lg transition cursor-pointer"
        >
          {showLabels ? <Eye className="w-3.5 h-3.5 text-sky-400" /> : <EyeOff className="w-3.5 h-3.5" />}
          <span>{showLabels ? '隐藏标签' : '显示标签'}</span>
        </button>
      </div>

      {/* Bottom Camera Presets Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70 shadow-xl max-w-[95vw] overflow-x-auto">
        {CAMERA_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              setSelectedBuilding(null);
              setActivePreset(preset);
            }}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
              activePreset?.id === preset.id
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
        </div>
      )}

      {/* Quick Directory Count */}
      <div className="hidden md:block absolute bottom-20 right-4 z-10 bg-slate-900/75 backdrop-blur-md border border-slate-800 rounded-xl px-3 py-2 text-[11px] text-slate-400">
        已定位地标建筑: <span className="text-sky-400 font-semibold">{BUILDINGS.length}</span> 处 · 左键旋转 / 右键平移 / 滚轮缩放
      </div>
    </div>
  );
}

export default App;
