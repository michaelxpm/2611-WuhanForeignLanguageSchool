import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import {
  Building2,
  Check,
  Compass,
  Download,
  Eye,
  EyeOff,
  Gamepad2,
  Grid3X3,
  MapPin,
  MousePointerClick,
  Orbit,
  Pencil,
  Play,
  Redo2,
  RotateCcw,
  RotateCw,
  Save,
  Square,
  Trees,
  Undo2,
  UserRound,
  X,
} from 'lucide-react';
import { TreeDisplayStyle } from './components/CampusFoliage';
import { MobileJoystickInput, WalkerCharacter } from './components/GirlWalker';
import { MobileJoystick } from './components/MobileJoystick';
import { CameraMode, DragKind, SceneRoot } from './components/SceneRoot';
import { BUILDINGS, BuildingSpec, CAMERA_PRESETS, CameraPreset } from './data/campusLayout';
import {
  DEFAULT_ROAD_NODES,
  generateDefaultTrees,
  RoadNode,
  TreeItem,
  TreeSpecies,
} from './data/editableDefaults';

const STORAGE_KEY = 'wfls-campus-layout-v3';

interface LayoutSnapshot {
  buildings: BuildingSpec[];
  roadNodes: RoadNode[];
  trees: TreeItem[];
}

type EditSelection =
  | { kind: 'building'; id: string }
  | { kind: 'road'; id: string }
  | { kind: 'tree'; id: string }
  | null;

function defaultSnapshot(): LayoutSnapshot {
  return {
    buildings: BUILDINGS.map((b) => ({ ...b, position: [...b.position] })),
    roadNodes: DEFAULT_ROAD_NODES.map((n) => ({ ...n })),
    trees: generateDefaultTrees(),
  };
}

function loadSavedSnapshot(): LayoutSnapshot {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return defaultSnapshot();
    const parsed = JSON.parse(raw) as Partial<LayoutSnapshot>;
    const def = defaultSnapshot();
    // Merge any newly added default buildings (like south-courts) if missing from older save
    const savedBuildings = parsed.buildings?.length ? parsed.buildings : def.buildings;
    const mergedBuildings = def.buildings.map(
      (db) => savedBuildings.find((sb) => sb.id === db.id) ?? db
    );
    return {
      buildings: mergedBuildings,
      roadNodes: parsed.roadNodes?.length ? parsed.roadNodes : def.roadNodes,
      trees: parsed.trees?.length ? parsed.trees : def.trees,
    };
  } catch {
    return defaultSnapshot();
  }
}

export function App() {
  const initial = useMemo(() => loadSavedSnapshot(), []);
  const [buildings, setBuildings] = useState<BuildingSpec[]>(initial.buildings);
  const [roadNodes, setRoadNodes] = useState<RoadNode[]>(initial.roadNodes);
  const [trees, setTrees] = useState<TreeItem[]>(initial.trees);

  const [past, setPast] = useState<LayoutSnapshot[]>([]);
  const [future, setFuture] = useState<LayoutSnapshot[]>([]);
  const [justSaved, setJustSaved] = useState(false);

  const latestRef = useRef<LayoutSnapshot>({ buildings, roadNodes, trees });
  latestRef.current = { buildings, roadNodes, trees };

  const mobileInputRef = useRef<MobileJoystickInput>({ x: 0, y: 0, sprint: false });
  const [isTouchDevice] = useState(
    () => typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0)
  );
  const [showMobilePad, setShowMobilePad] = useState(false);

  const cloneSnap = (s: LayoutSnapshot): LayoutSnapshot => ({
    buildings: s.buildings.map((b) => ({ ...b, position: [...b.position] })),
    roadNodes: s.roadNodes.map((n) => ({ ...n })),
    trees: s.trees.map((t) => ({ ...t })),
  });

  const pushHistory = useCallback(() => {
    setPast((p) => [...p.slice(-39), cloneSnap(latestRef.current)]);
    setFuture([]);
  }, []);

  const persistNow = useCallback((snap?: LayoutSnapshot) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snap ?? latestRef.current));
      setJustSaved(true);
      window.setTimeout(() => setJustSaved(false), 1600);
    } catch {
      // Ignore storage quota errors
    }
  }, []);

  const handleUndo = useCallback(() => {
    setPast((prevPast) => {
      if (prevPast.length === 0) return prevPast;
      const previous = prevPast[prevPast.length - 1];
      setFuture((f) => [cloneSnap(latestRef.current), ...f]);
      setBuildings(previous.buildings);
      setRoadNodes(previous.roadNodes);
      setTrees(previous.trees);
      persistNow(previous);
      return prevPast.slice(0, -1);
    });
  }, [persistNow]);

  const handleRedo = useCallback(() => {
    setFuture((prevFuture) => {
      if (prevFuture.length === 0) return prevFuture;
      const next = prevFuture[0];
      setPast((p) => [...p, cloneSnap(latestRef.current)]);
      setBuildings(next.buildings);
      setRoadNodes(next.roadNodes);
      setTrees(next.trees);
      persistNow(next);
      return prevFuture.slice(1);
    });
  }, [persistNow]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (!(e.ctrlKey || e.metaKey)) return;
      const key = e.key.toLowerCase();
      if (key === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      } else if (key === 'y' || (key === 'z' && e.shiftKey)) {
        e.preventDefault();
        handleRedo();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [handleUndo, handleRedo]);

  const [activePreset, setActivePreset] = useState<CameraPreset | null>(CAMERA_PRESETS[0]);
  const [selectedBuildingId, setSelectedBuildingId] = useState<string | null>(null);
  const [showLabels, setShowLabels] = useState(true);
  const [showGrid, setShowGrid] = useState(false);
  const [cameraMode, setCameraMode] = useState<CameraMode>('orbit');
  const [walkerCharacter, setWalkerCharacter] = useState<WalkerCharacter>('girl');
  const [treeStyle, setTreeStyle] = useState<TreeDisplayStyle>('mixed');
  const [plantTreeMode, setPlantTreeMode] = useState(false);
  const [plantSpecies, setPlantSpecies] = useState<TreeSpecies>('oak');

  const [showDirectory, setShowDirectory] = useState(false);
  const [yawDeg, setYawDeg] = useState(0);
  const [autoOrbit, setAutoOrbit] = useState(false);
  const [autoTour, setAutoTour] = useState(false);

  const [editMode, setEditMode] = useState(false);
  const [editSelection, setEditSelection] = useState<EditSelection>(null);
  const [clickToMove, setClickToMove] = useState(false);

  const selectedBuilding = useMemo(
    () => buildings.find((b) => b.id === selectedBuildingId) ?? null,
    [buildings, selectedBuildingId]
  );

  const selectedRoadNode = useMemo(
    () => (editSelection?.kind === 'road' ? roadNodes.find((n) => n.id === editSelection.id) ?? null : null),
    [editSelection, roadNodes]
  );

  const selectedTree = useMemo(
    () => (editSelection?.kind === 'tree' ? trees.find((t) => t.id === editSelection.id) ?? null : null),
    [editSelection, trees]
  );

  useEffect(() => {
    if (!autoTour) return;
    let idx = 0;
    setCameraMode('orbit');
    setSelectedBuildingId(null);
    setAutoOrbit(false);
    setActivePreset(CAMERA_PRESETS[0]);

    const timer = window.setInterval(() => {
      idx = (idx + 1) % CAMERA_PRESETS.length;
      setActivePreset(CAMERA_PRESETS[idx]);
    }, 5200);
    return () => window.clearInterval(timer);
  }, [autoTour]);

  const updateSelectedBuilding = (
    patch: { x?: number; z?: number; rotDeg?: number },
    recordHistory = true
  ) => {
    if (!selectedBuildingId) return;
    if (recordHistory) pushHistory();
    setBuildings((prev) =>
      prev.map((b) => {
        if (b.id !== selectedBuildingId) return b;
        return {
          ...b,
          position: [patch.x ?? b.position[0], b.position[1], patch.z ?? b.position[2]],
          rotationY: patch.rotDeg !== undefined ? (patch.rotDeg * Math.PI) / 180 : b.rotationY,
        };
      })
    );
  };

  const updateSelectedRoadNode = (x: number, z: number, recordHistory = true) => {
    if (!selectedRoadNode) return;
    if (recordHistory) pushHistory();
    setRoadNodes((prev) =>
      prev.map((n) => (n.id === selectedRoadNode.id ? { ...n, x, z } : n))
    );
  };

  const updateSelectedTree = (
    patch: { x?: number; z?: number; scale?: number },
    recordHistory = true
  ) => {
    if (!selectedTree) return;
    if (recordHistory) pushHistory();
    setTrees((prev) =>
      prev.map((t) =>
        t.id === selectedTree.id
          ? {
              ...t,
              x: patch.x ?? t.x,
              z: patch.z ?? t.z,
              scale: patch.scale ?? t.scale,
            }
          : t
      )
    );
  };

  const handleDragMove = useCallback((kind: DragKind, id: string, x: number, z: number) => {
    if (kind === 'building') {
      setBuildings((prev) =>
        prev.map((b) => (b.id === id ? { ...b, position: [x, b.position[1], z] } : b))
      );
    } else if (kind === 'road') {
      setRoadNodes((prev) => prev.map((n) => (n.id === id ? { ...n, x, z } : n)));
    } else if (kind === 'tree') {
      setTrees((prev) => prev.map((t) => (t.id === id ? { ...t, x, z } : t)));
    }
  }, []);

  const handleDragEnd = useCallback(() => {
    persistNow();
  }, [persistNow]);

  const handleGroundClickInEdit = (x: number, z: number) => {
    if (!editSelection) return;
    if (editSelection.kind === 'building') {
      updateSelectedBuilding({ x, z }, true);
    } else if (editSelection.kind === 'road') {
      updateSelectedRoadNode(x, z, true);
    } else if (editSelection.kind === 'tree') {
      updateSelectedTree({ x, z }, true);
    }
    window.setTimeout(() => persistNow(), 50);
  };

  const handlePlantTreeAt = (x: number, z: number) => {
    pushHistory();
    const newTree: TreeItem = {
      id: `user-tree-${Date.now()}`,
      x,
      z,
      scale: 1.0,
      shade: Math.random(),
      species: plantSpecies,
    };
    setTrees((prev) => {
      const next = [...prev, newTree];
      window.setTimeout(() => persistNow({ ...latestRef.current, trees: next }), 20);
      return next;
    });
    setEditSelection({ kind: 'tree', id: newTree.id });
  };

  const exportLayoutJson = () => {
    const payload = {
      buildings: buildings.map((b) => ({ id: b.id, position: b.position, rotationY: b.rotationY })),
      roadNodes,
      trees,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'wfls-campus-layout.json';
    a.click();
    URL.revokeObjectURL(url);
  };

  const resetAllEdits = () => {
    pushHistory();
    const def = defaultSnapshot();
    setBuildings(def.buildings);
    setRoadNodes(def.roadNodes);
    setTrees(def.trees);
    setEditSelection(null);
    setSelectedBuildingId(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  return (
    <div className="relative w-full h-full bg-slate-950 overflow-hidden">
      <SceneRoot
        buildings={buildings}
        roadNodes={roadNodes}
        trees={trees}
        treeStyle={treeStyle}
        activePreset={activePreset}
        selectedBuilding={selectedBuilding}
        selectedRoadNodeId={selectedRoadNode?.id ?? null}
        selectedTreeId={selectedTree?.id ?? null}
        showLabels={showLabels}
        showGrid={showGrid}
        cameraMode={cameraMode}
        walkerCharacter={walkerCharacter}
        mobileInputRef={mobileInputRef}
        autoOrbit={autoOrbit}
        editMode={editMode}
        clickToMove={clickToMove}
        plantTreeMode={plantTreeMode}
        onSelectBuilding={(b) => {
          setSelectedBuildingId(b?.id ?? null);
          setAutoTour(false);
          if (!b) setAutoOrbit(false);
          if (b) {
            setEditSelection({ kind: 'building', id: b.id });
            if (!editMode) {
              setCameraMode('orbit');
              setActivePreset(null);
            }
          }
        }}
        onSelectRoadNode={(node) => {
          setSelectedBuildingId(null);
          setEditSelection({ kind: 'road', id: node.id });
        }}
        onSelectTree={(tree) => {
          setSelectedBuildingId(null);
          setEditSelection({ kind: 'tree', id: tree.id });
        }}
        onGroundClickInEdit={handleGroundClickInEdit}
        onPlantTreeAt={handlePlantTreeAt}
        onDragStart={pushHistory}
        onDragMove={handleDragMove}
        onDragEnd={handleDragEnd}
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
            Wuhan Foreign Languages School · Phase 9 Real Trees & Characters
          </p>
        </div>
      </div>

      {/* Top-Right Controls */}
      <div className="absolute top-4 right-4 z-10 flex flex-wrap items-center justify-end gap-2 max-w-[70vw]">
        {/* Camera Mode Switcher: Orbit / First-Person (Character Walk) */}
        <div className="flex items-center bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-xl p-1 shadow-lg">
          <button
            onClick={() => {
              setCameraMode('orbit');
              setAutoTour(false);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              cameraMode === 'orbit' ? 'bg-sky-500 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <Orbit className="w-3.5 h-3.5" />
            <span>航拍</span>
          </button>
          <button
            onClick={() => {
              setCameraMode('girl');
              setAutoTour(false);
              setEditMode(false);
              setPlantTreeMode(false);
              setSelectedBuildingId(null);
            }}
            className={`flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
              cameraMode === 'girl' ? 'bg-pink-500 text-white shadow' : 'text-slate-300 hover:text-white'
            }`}
          >
            <UserRound className="w-3.5 h-3.5" />
            <span>第一人称</span>
          </button>
        </div>

        {/* Character Switcher when in First-Person Mode */}
        {cameraMode === 'girl' && (
          <div className="flex items-center bg-slate-900/85 backdrop-blur-md border border-pink-500/40 rounded-xl p-1 shadow-lg">
            {(
              [
                { id: 'girl', label: '女生' },
                { id: 'kuromi', label: '库洛米' },
                { id: 'ironman', label: '钢铁侠' },
              ] as { id: WalkerCharacter; label: string }[]
            ).map((ch) => (
              <button
                key={ch.id}
                onClick={() => setWalkerCharacter(ch.id)}
                className={`px-2.5 py-1.5 rounded-lg text-xs font-medium transition cursor-pointer ${
                  walkerCharacter === ch.id
                    ? 'bg-pink-500 text-white shadow'
                    : 'text-slate-300 hover:text-white'
                }`}
              >
                {ch.label}
              </button>
            ))}
            <button
              onClick={() => setShowMobilePad((v) => !v)}
              title="切换触屏摇杆"
              className={`ml-1 p-1.5 rounded-lg transition cursor-pointer ${
                showMobilePad || isTouchDevice ? 'text-sky-400' : 'text-slate-400 hover:text-white'
              }`}
            >
              <Gamepad2 className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tree Model Style Switcher */}
        <div className="hidden lg:flex items-center gap-1 bg-slate-900/80 backdrop-blur-md border border-slate-700/70 rounded-xl px-2 py-1 shadow-lg text-xs">
          <Trees className="w-3.5 h-3.5 text-emerald-400 mr-1" />
          <select
            value={treeStyle}
            onChange={(e) => setTreeStyle(e.target.value as TreeDisplayStyle)}
            className="bg-transparent text-slate-200 outline-none cursor-pointer text-xs"
            title="切换树种模型对比效果"
          >
            <option value="mixed" className="bg-slate-900">混合真树 (Oak+Maple+LowPoly)</option>
            <option value="oak" className="bg-slate-900">橡树模型 (Oak)</option>
            <option value="maple" className="bg-slate-900">枫树模型 (Maple)</option>
            <option value="lowpoly" className="bg-slate-900">阔叶模型 (LowPoly)</option>
            <option value="procedural" className="bg-slate-900">几何树冠 (对比)</option>
          </select>
        </div>

        {/* Plant Tree Quick Toggle */}
        <button
          onClick={() => {
            setPlantTreeMode((v) => !v);
            setCameraMode('orbit');
            setAutoTour(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md shadow-lg transition cursor-pointer ${
            plantTreeMode
              ? 'bg-emerald-500 text-slate-950 border-emerald-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/70'
          }`}
        >
          <Trees className="w-3.5 h-3.5" />
          <span>{plantTreeMode ? '点击地面种树中…' : '种树'}</span>
        </button>

        <button
          onClick={() => {
            setEditMode((v) => !v);
            setPlantTreeMode(false);
            setCameraMode('orbit');
            setAutoTour(false);
            setClickToMove(false);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md shadow-lg transition cursor-pointer ${
            editMode
              ? 'bg-amber-500 text-slate-950 border-amber-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/70'
          }`}
        >
          <Pencil className="w-3.5 h-3.5" />
          <span>{editMode ? '退出编辑' : '编辑模式'}</span>
        </button>

        <button
          onClick={() => {
            setEditMode(false);
            setPlantTreeMode(false);
            setAutoTour((v) => !v);
          }}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md shadow-lg transition cursor-pointer ${
            autoTour
              ? 'bg-rose-500 text-white border-rose-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/70'
          }`}
        >
          {autoTour ? <Square className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-sky-400" />}
          <span className="hidden sm:inline">{autoTour ? '停止导览' : '自动导览'}</span>
        </button>

        <button
          onClick={() => setShowDirectory((v) => !v)}
          className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium border backdrop-blur-md shadow-lg transition cursor-pointer ${
            showDirectory
              ? 'bg-sky-500 text-white border-sky-300'
              : 'bg-slate-900/80 hover:bg-slate-800 text-slate-200 border-slate-700/70'
          }`}
        >
          <Building2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">建筑导览</span>
        </button>

        <button
          onClick={() => setShowGrid((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 backdrop-blur-md shadow-lg transition cursor-pointer"
        >
          <Grid3X3 className={`w-3.5 h-3.5 ${showGrid ? 'text-sky-400' : 'text-slate-400'}`} />
        </button>

        <button
          onClick={() => setShowLabels((v) => !v)}
          className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-900/80 hover:bg-slate-800 text-slate-200 border border-slate-700/70 backdrop-blur-md shadow-lg transition cursor-pointer"
        >
          {showLabels ? <Eye className="w-3.5 h-3.5 text-sky-400" /> : <EyeOff className="w-3.5 h-3.5" />}
        </button>
      </div>

      {/* Plant Tree Species Selector Banner */}
      {plantTreeMode && (
        <div className="absolute top-24 left-4 z-10 bg-slate-900/90 backdrop-blur-md border border-emerald-500/50 rounded-2xl p-3 shadow-2xl w-72">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold text-emerald-300">自主种树模式 (点击地面种植)</span>
            <button onClick={() => setPlantTreeMode(false)} className="text-slate-400 hover:text-white cursor-pointer">
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="flex gap-1.5">
            {(
              [
                { id: 'oak', label: '橡树 Oak' },
                { id: 'maple', label: '枫树 Maple' },
                { id: 'lowpoly', label: '阔叶 LowPoly' },
              ] as { id: TreeSpecies; label: string }[]
            ).map((sp) => (
              <button
                key={sp.id}
                onClick={() => setPlantSpecies(sp.id)}
                className={`flex-1 py-1.5 rounded-lg text-[11px] font-medium transition cursor-pointer ${
                  plantSpecies === sp.id
                    ? 'bg-emerald-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:text-white'
                }`}
              >
                {sp.label}
              </button>
            ))}
          </div>
          <p className="mt-2 text-[11px] text-slate-400">
            支持 Ctrl+Z 撤销种植，位置自动永久保存。当前树木: {trees.length} 棵
          </p>
        </div>
      )}

      {/* Edit Mode Inspector Panel */}
      {editMode && (
        <div className="absolute top-24 left-4 z-10 w-80 bg-slate-900/92 backdrop-blur-md border border-amber-500/50 rounded-2xl p-4 shadow-2xl">
          <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Pencil className="w-4 h-4 text-amber-400" />
              <span className="text-xs font-bold text-amber-300">拖拽编辑模式</span>
            </div>
            <div className="flex items-center gap-1">
              <button
                onClick={handleUndo}
                disabled={past.length === 0}
                title="撤销 (Ctrl+Z)"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-slate-200 cursor-pointer"
              >
                <Undo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={handleRedo}
                disabled={future.length === 0}
                title="重做 (Ctrl+Y)"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 disabled:opacity-35 text-slate-200 cursor-pointer"
              >
                <Redo2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => persistNow()}
                title="永久保存到浏览器"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-emerald-400 cursor-pointer"
              >
                {justSaved ? <Check className="w-3.5 h-3.5" /> : <Save className="w-3.5 h-3.5" />}
              </button>
              <button
                onClick={exportLayoutJson}
                title="导出 JSON 布局"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-sky-400 cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={resetAllEdits}
                title="恢复默认位置"
                className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-rose-400 cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>

          {!editSelection ? (
            <p className="text-xs text-slate-300 leading-relaxed">
              直接<span className="text-amber-300 font-semibold">按住并拖动</span>场景中的任意{' '}
              <span className="text-amber-300 font-semibold">建筑（含校门与球场）</span>、
              <span className="text-cyan-300 font-semibold">青色道路节点</span> 或{' '}
              <span className="text-emerald-300 font-semibold">树木</span> 即可移动；支持{' '}
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px]">Ctrl+Z</kbd> 撤销 /{' '}
              <kbd className="px-1 py-0.5 rounded bg-slate-800 text-[10px]">Ctrl+Y</kbd> 重做。
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-white">
                  {editSelection.kind === 'building' && selectedBuilding?.nameZh}
                  {editSelection.kind === 'road' && `道路节点: ${selectedRoadNode?.label}`}
                  {editSelection.kind === 'tree' && `树木 (${selectedTree?.id})`}
                </span>
                {justSaved && <span className="text-[10px] text-emerald-400">已永久保存</span>}
              </div>

              {(() => {
                const curX =
                  editSelection.kind === 'building'
                    ? selectedBuilding?.position[0] ?? 0
                    : editSelection.kind === 'road'
                    ? selectedRoadNode?.x ?? 0
                    : selectedTree?.x ?? 0;
                const curZ =
                  editSelection.kind === 'building'
                    ? selectedBuilding?.position[2] ?? 0
                    : editSelection.kind === 'road'
                    ? selectedRoadNode?.z ?? 0
                    : selectedTree?.z ?? 0;
                const setXZ = (nx: number, nz: number) => {
                  if (editSelection.kind === 'building') updateSelectedBuilding({ x: nx, z: nz });
                  if (editSelection.kind === 'road') updateSelectedRoadNode(nx, nz);
                  if (editSelection.kind === 'tree') updateSelectedTree({ x: nx, z: nz });
                  window.setTimeout(() => persistNow(), 50);
                };

                return (
                  <div className="space-y-2 text-xs">
                    <label className="block">
                      <span className="text-slate-400 flex justify-between">
                        <span>东西坐标 X (m)</span>
                        <span className="text-sky-300 font-mono">{curX.toFixed(1)}</span>
                      </span>
                      <input
                        type="range"
                        min={-400}
                        max={200}
                        step={0.5}
                        value={curX}
                        onChange={(e) => setXZ(parseFloat(e.target.value), curZ)}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </label>
                    <label className="block">
                      <span className="text-slate-400 flex justify-between">
                        <span>南北坐标 Z (m)</span>
                        <span className="text-sky-300 font-mono">{curZ.toFixed(1)}</span>
                      </span>
                      <input
                        type="range"
                        min={-300}
                        max={200}
                        step={0.5}
                        value={curZ}
                        onChange={(e) => setXZ(curX, parseFloat(e.target.value))}
                        className="w-full accent-amber-400 cursor-pointer"
                      />
                    </label>
                  </div>
                );
              })()}

              {editSelection.kind === 'building' && selectedBuilding && (
                <label className="block text-xs">
                  <span className="text-slate-400 flex justify-between">
                    <span>旋转角度 (°)</span>
                    <span className="text-sky-300 font-mono">
                      {Math.round((selectedBuilding.rotationY * 180) / Math.PI)}°
                    </span>
                  </span>
                  <input
                    type="range"
                    min={-180}
                    max={180}
                    step={1}
                    value={Math.round((selectedBuilding.rotationY * 180) / Math.PI)}
                    onChange={(e) => {
                      updateSelectedBuilding({ rotDeg: parseFloat(e.target.value) });
                      window.setTimeout(() => persistNow(), 50);
                    }}
                    className="w-full accent-amber-400 cursor-pointer"
                  />
                </label>
              )}

              {editSelection.kind === 'tree' && selectedTree && (
                <label className="block text-xs">
                  <span className="text-slate-400 flex justify-between">
                    <span>树冠缩放</span>
                    <span className="text-emerald-300 font-mono">{selectedTree.scale.toFixed(2)}x</span>
                  </span>
                  <input
                    type="range"
                    min={0.5}
                    max={2.0}
                    step={0.05}
                    value={selectedTree.scale}
                    onChange={(e) => {
                      updateSelectedTree({ scale: parseFloat(e.target.value) });
                      window.setTimeout(() => persistNow(), 50);
                    }}
                    className="w-full accent-emerald-400 cursor-pointer"
                  />
                </label>
              )}

              <button
                onClick={() => setClickToMove((v) => !v)}
                className={`w-full flex items-center justify-center gap-1.5 py-2 rounded-xl text-xs font-medium transition cursor-pointer ${
                  clickToMove
                    ? 'bg-amber-500 text-slate-950'
                    : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
                }`}
              >
                <MousePointerClick className="w-3.5 h-3.5" />
                <span>{clickToMove ? '请点击地面新位置…' : '开启「点击地面移动」'}</span>
              </button>
            </div>
          )}
        </div>
      )}

      {/* Building Directory Drawer */}
      {showDirectory && (
        <div className="absolute top-20 right-4 z-10 w-72 max-h-[65vh] overflow-y-auto bg-slate-900/90 backdrop-blur-md border border-slate-700/80 rounded-2xl p-3 shadow-2xl">
          <div className="flex items-center justify-between mb-2 pb-2 border-b border-slate-800">
            <span className="text-xs font-bold text-slate-200">校园建筑导览 ({buildings.length})</span>
            <button
              onClick={() => setShowDirectory(false)}
              className="p-1 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
          <div className="space-y-1">
            {buildings.map((b) => (
              <button
                key={b.id}
                onClick={() => {
                  setCameraMode('orbit');
                  setActivePreset(null);
                  setSelectedBuildingId(b.id);
                  setEditSelection({ kind: 'building', id: b.id });
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

      {/* First-Person Character Walk Help Banner */}
      {cameraMode === 'girl' && (
        <div className="hidden sm:block absolute top-20 left-1/2 -translate-x-1/2 z-10 bg-slate-900/85 border border-pink-500/50 text-slate-100 px-4 py-2 rounded-full text-xs font-medium shadow-lg backdrop-blur-md">
          第一人称漫步：WASD / 方向键行走 · Shift 奔跑 · 鼠标拖拽旋转视角 · 滚轮/双指缩放远近
        </div>
      )}

      {/* Mobile Touch Virtual Joystick (shown on touch devices or when toggled) */}
      {cameraMode === 'girl' && (isTouchDevice || showMobilePad) && (
        <MobileJoystick inputRef={mobileInputRef} />
      )}

      {/* Bottom Camera Presets Bar */}
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-slate-900/80 backdrop-blur-md border border-slate-700/70 shadow-xl max-w-[95vw] overflow-x-auto">
        {CAMERA_PRESETS.map((preset) => (
          <button
            key={preset.id}
            onClick={() => {
              setCameraMode('orbit');
              setSelectedBuildingId(null);
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
      {selectedBuilding && !editMode && (
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
              onClick={() => setSelectedBuildingId(null)}
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
              autoOrbit ? 'bg-sky-500 text-white' : 'bg-slate-800 hover:bg-slate-700 text-slate-200'
            }`}
          >
            <RotateCw className={`w-3.5 h-3.5 ${autoOrbit ? 'animate-spin' : ''}`} />
            <span>{autoOrbit ? '停止环绕此建筑' : '环绕此建筑'}</span>
          </button>
        </div>
      )}
    </div>
  );
}

export default App;
