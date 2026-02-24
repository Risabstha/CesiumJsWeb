
import { useEffect, useRef, useState } from "react";
import { Entity, Viewer } from "resium";
import * as Cesium from "cesium";
import {
  Cartesian3,
  Ion,
  SceneMode,
  TerrainProvider,
  createWorldTerrainAsync,
  OpenStreetMapImageryProvider,
  ProviderViewModel,
  Color,
} from "cesium";

const createDefaultImageryProviderViewModels = (
  Cesium as unknown as { createDefaultImageryProviderViewModels: () => ProviderViewModel[] }
).createDefaultImageryProviderViewModels;
import "../styles/maps.css";
import ProfileTool from "./ProfileTool";
import SimpleLoader from "./Loader";
import layersData from "../stores/mapLayer.json";     // can use any name for json


Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZDIzMjZiMy05ZGI5LTRlZmItOGU5My1iMjliMTRmOTBjMzkiLCJpZCI6Mzg2ODAyLCJpYXQiOjE3NzAxODIzNTJ9.9Y0fvN8dEkRPbRfkEYA_CwEn6cbQRouXyae1JbO-JAA";

const REMOVED_LAYERS = new Set([
  "Bing Maps Aerial",
  "Bing Maps Aerial with Labels",
  "Bing Maps Roads",
  "Sentinel-2",
  "Blue Marble",
  "Earth at night",
  // "Natural Earth II",
  "Azure Maps Aerial",
  "Azure Maps Roads",
  "ArcGIS World Imagery",
  "ArcGIS World Hillshade",
  "Esri World Ocean",
  "Stadia x Stamen Watercolor",
  "Stadia x Stamen Toner",
  "Stadia Alidade Smooth",
  "Stadia Alidade Smooth Dark",
]);

const filteredImageryProviders = createDefaultImageryProviderViewModels().filter(
  (vm: ProviderViewModel) => !REMOVED_LAYERS.has(vm.name)
);



export default function Map() {
  const [loading, setLoading] = useState(true);
  const viewerRef = useRef<any>(null);
  const [terrainProvider, setTerrainProvider] =
    useState<TerrainProvider>();
  const [points, setPoints] = useState<Cartesian3[]>([]);

  // Per-layer refs and visibility, keyed by layer_name
  const layerRefs = useRef<Record<string, Cesium.ImageryLayer>>({});
  const [layerVisibility, setLayerVisibility] = useState<Record<string, boolean>>({});



  /** 1️⃣ Load Terrain */
  useEffect(() => {
    createWorldTerrainAsync({
      requestVertexNormals: true,
      requestWaterMask: true,
    })
      .then((terrain) => setTerrainProvider(terrain))
      .catch(console.error);
  }, []);

  /** 2️⃣ Initialize Viewer once terrain is ready */
  useEffect(() => {
  if (!terrainProvider) return;

  let initialized = false;
  let interval: ReturnType<typeof setInterval>;
  let hardTimeout: ReturnType<typeof setTimeout>;

  const initViewer = async (viewer: any) => {
    if (initialized) return;
    initialized = true;

    clearInterval(interval);
    clearTimeout(hardTimeout);

    // Ensure we're in 3D mode instantly (0 = no animation delay)
    viewer.scene.morphTo3D(0);

    // Clear default imagery and apply OSM
    viewer.imageryLayers.removeAll();



    viewer.imageryLayers.addImageryProvider(
      new OpenStreetMapImageryProvider({
        url: "https://a.tile.openstreetmap.org/",
        credit: "© OpenStreetMap contributors",
      })
    );

    // Add all imagery layers from mapLayer.json (awaited sequentially)
    const initialVisibility: Record<string, boolean> = {};
    for (const def of layersData) {
      if (def.layer_type === "imagery" && def.assetId) {
        const provider = await Cesium.IonImageryProvider.fromAssetId(def.assetId);
        const layer = viewer.imageryLayers.addImageryProvider(provider);
        layerRefs.current[def.layer_name] = layer;
        initialVisibility[def.layer_name] = true;
      }
    }
    setLayerVisibility(initialVisibility);


    // Focus camera on Nepal
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(85.3206, 27.7017, 500000),
      orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 }, // top-down view
    });

    // Constrain zoom range to avoid going underground or too far out
    const ssc = viewer.scene.screenSpaceCameraController;
    ssc.minimumZoomDistance = 1000;
    ssc.maximumZoomDistance = 15_000_000;

    setLoading(false);
  };

  const checkViewerAndTiles = () => {
    // Re-read the ref on every tick to handle late Viewer mounting
    const viewer = viewerRef.current?.cesiumElement;
    if (!viewer) return; // Viewer not mounted yet, keep waiting

    if (viewer.scene.globe.tilesLoaded) {
      initViewer(viewer);
    }
  };

  // Poll every 200ms until viewer is ready and tiles are loaded
  interval = setInterval(checkViewerAndTiles, 200);

  // Hard fallback: force init after 6s regardless of tile state
  hardTimeout = setTimeout(() => {
    const viewer = viewerRef.current?.cesiumElement;
    if (viewer) initViewer(viewer);
    else console.warn("Map: Viewer still not available after timeout.");
  }, 6000);

  return () => {
    clearInterval(interval);
    clearTimeout(hardTimeout);
  };
}, [terrainProvider]);



  /** 3️⃣ UI */
  return (
    <div className="h-screen w-screen relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center
        bg-black bg-opacity-40 text-white text-2xl z-50">
            <SimpleLoader/>
        </div>
      )}


      {/* Layer toggle buttons — one per imagery entry in mapLayer.json */}
      {!loading && Object.keys(layerVisibility).length > 0 && (
        <div className="absolute bottom-2 left-2 z-50 flex flex-col gap-1">
          {Object.entries(layerVisibility).map(([name, visible]) => (
            <button
              key={name}
              onClick={() => {
                const layer = layerRefs.current[name];
                if (layer) {
                  layer.show = !layer.show;
                  setLayerVisibility((prev) => ({ ...prev, [name]: layer.show }));
                }
              }}
              className="flex items-center gap-2 px-2 py-1.5 rounded-lg shadow-lg text-sm font-medium"
              style={{ background: visible ? "#2563eb" : "#374151", color: "white" }}
            >
              <span
                className="inline-block w-3 h-3 rounded-full border-2 border-white"
                style={{ background: visible ? "#93c5fd" : "transparent" }}
              />
              {name}
            </button>
          ))}
        </div>
      )}

      {terrainProvider && (
        <Viewer
          ref={viewerRef}
          full
          sceneMode={SceneMode.SCENE3D}
          terrainProvider={terrainProvider}
          baseLayerPicker={true}
          imageryProviderViewModels={filteredImageryProviders}
          animation={false}
          timeline={false}
          geocoder={true}
          homeButton={false}
          navigationHelpButton={true}
          infoBox={true}
          selectionIndicator={false}      // set this false always
          projectionPicker={false}
          className="md:w-full w-screen"

        >
    
          {points.length === 1 && (
            <Entity
              position={points[0]}
              point={{ pixelSize: 10, color: Color.YELLOW }}
            />
          )}

          {points.length >= 2 && (
            <Entity
              polyline={{
                positions: points,
                width: 3,
                material: Color.RED,
              }}
            />
          )}
        </Viewer>
      )}

      {!loading && terrainProvider && (
        <ProfileTool
          viewerRef={viewerRef}
          terrainProvider={terrainProvider}
          points={points}
          setPoints={setPoints}
        />
      )}  
    </div>
  );
}