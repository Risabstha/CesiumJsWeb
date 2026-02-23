// import { useEffect, useRef, useState } from "react";
// import { Entity, Viewer } from "resium";
// import {
//   Cartesian3,
//   Ion,
//   SceneMode,
//   TerrainProvider,
//   createWorldTerrainAsync,
//   OpenStreetMapImageryProvider,
//   Color,
// } from "cesium";
// import "../styles/maps.css";
// import ProfileTool from "./ProfileTool";

// Ion.defaultAccessToken =
//   "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZDIzMjZiMy05ZGI5LTRlZmItOGU5My1iMjliMTRmOTBjMzkiLCJpZCI6Mzg2ODAyLCJpYXQiOjE3NzAxODIzNTJ9.9Y0fvN8dEkRPbRfkEYA_CwEn6cbQRouXyae1JbO-JAA";

// export default function Map() {
//   const [loading, setLoading] = useState(true);
//   const viewerRef = useRef<any>(null);
//   const [terrainProvider, setTerrainProvider] = useState<TerrainProvider>();
//   const [points, setPoints] = useState<Cartesian3[]>([]); // <-- lifted state

//   // Load terrain asynchronously
//   useEffect(() => {
//     createWorldTerrainAsync({
//       requestVertexNormals: true,
//       requestWaterMask: true,
//     })
//       .then((terrain) => setTerrainProvider(terrain))
//       .catch(console.error);
//   }, []);

//   // Once terrain is ready, set camera, OSM, zoom limits, and force 3D
//   useEffect(() => {
//     const viewer = viewerRef.current?.cesiumElement;
//     if (!viewer || !terrainProvider) return;

//     const init = () => {
//     // Force viewer to 3D (no morph)
//     if (viewer.scene.mode !== SceneMode.SCENE3D) {
//       viewer.scene.morphTo3D(0); // instant morph
//     }

//     // Replace default imagery with OpenStreetMap
//     viewer.imageryLayers.removeAll();
//     viewer.imageryLayers.addImageryProvider(
//       new OpenStreetMapImageryProvider({
//         url: "https://a.tile.openstreetmap.org/",
//       }),
//     );

//     // Set camera to Nepal
//     viewer.camera.setView({
//       destination: Cartesian3.fromDegrees(85.3206, 27.7017, 500000),
//       orientation: {
//         heading: 0,
//         // pitch: -Math.PI / 6, // tilt down 30 degrees
//         roll: 0,
//       },
//     });

//     // Enable camera controls and set zoom limits
//     const ssc = viewer.scene.screenSpaceCameraController;
//     ssc.enableLook = true;
//     ssc.enableTilt = true;
//     ssc.enableTranslate = true;
//     ssc.enableZoom = true;
//     ssc.minimumZoomDistance = 1500;
//     ssc.maximumZoomDistance = 10000000;
//      };
//      setTimeout(init, 0); // small delay ensures Viewer exists
//   }, [terrainProvider]);


//   return (
//     <div className="h-screen w-screen">
//       {terrainProvider && (
//         <Viewer
//           ref={viewerRef}
//           full
//           sceneMode={SceneMode.SCENE3D} // Ensure 3D mode on load
//           terrainProvider={terrainProvider}
//           baseLayerPicker={true} // disables maps selector
//           animation={false} // hides animation widget
//           timeline={false} // hides timeline
//           geocoder={true} // hides search box
//           homeButton={false} // hides home button
//           navigationHelpButton={true} // hides help button
//           infoBox={false} // hides info box popup  // keep it always false to prevent selection highlights
//           selectionIndicator={false} // hides selection highlights
//         >

//           {/* Show temporary point on first click (for cross section) */}
//           {points.length === 1 && (
//             <Entity
//               position={points[0]}
//               point={{ pixelSize: 10, color: Color.YELLOW }}
//             />
//           )}

//           {/* Draw the polyline when at least two points exist */}
//           {points.length >= 2 && (
//             <Entity
//               polyline={{
//                 positions: points,
//                 width: 3,
//                 material: Color.RED,
//               }}
//             />
//           )}
//           {/* Polyline now rendered inside Viewer */}
//           {points.length >= 2 && (
//             <Entity
//               polyline={{
//                 positions: points,
//                 width: 3,
//                 material: Color.RED,
//               }}
//             />
//           )}
//         </Viewer>
//       )}
//       {/* Pass state setter to ProfileTool so it can add points */}
//       {terrainProvider && (
//         <ProfileTool
//           viewerRef={viewerRef}
//           terrainProvider={terrainProvider}
//           points={points} // <-- pass points state
//           setPoints={setPoints} // <-- pass setter
//         />
//       )}
//     </div>
//   );
// }

import { useEffect, useRef, useState } from "react";
import { Entity, Viewer } from "resium";
import {
  Cartesian3,
  Ion,
  SceneMode,
  TerrainProvider,
  createWorldTerrainAsync,
  OpenStreetMapImageryProvider,
  Color,
} from "cesium";
import "../styles/maps.css";
import ProfileTool from "./ProfileTool";
import SimpleLoader from "./Loader";

Ion.defaultAccessToken =
  "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJqdGkiOiI2ZDIzMjZiMy05ZGI5LTRlZmItOGU5My1iMjliMTRmOTBjMzkiLCJpZCI6Mzg2ODAyLCJpYXQiOjE3NzAxODIzNTJ9.9Y0fvN8dEkRPbRfkEYA_CwEn6cbQRouXyae1JbO-JAA";

export default function Map() {
  const [loading, setLoading] = useState(true);
  const viewerRef = useRef<any>(null);
  const [terrainProvider, setTerrainProvider] =
    useState<TerrainProvider>();
  const [points, setPoints] = useState<Cartesian3[]>([]);

  /** 1️⃣ Load Terrain */
  useEffect(() => {
    createWorldTerrainAsync({
      requestVertexNormals: true,
      requestWaterMask: true,
    })
      .then((terrain) => setTerrainProvider(terrain))
      .catch(console.error);
  }, []);

  /** 2️⃣ Initialize Viewer */
  // useEffect(() => {
  //   const viewer = viewerRef.current?.cesiumElement;
  //   if (!viewer || !terrainProvider) return;

  //   let initialized = false;

  //   /** 🔥 The actual init function */
  //   const initViewer = () => {
  //     if (initialized) return;
  //     initialized = true;

  //     // Force 3D
  //     viewer.scene.morphTo3D(0);

  //     // Update imagery
  //     viewer.imageryLayers.removeAll();
  //     viewer.imageryLayers.addImageryProvider(
  //       new OpenStreetMapImageryProvider({
  //         url: "https://a.tile.openstreetmap.org/",
  //       })
  //     );

  //     // Camera
  //     viewer.camera.setView({
  //       destination: Cartesian3.fromDegrees(85.3206, 27.7017, 500000),
  //       orientation: { heading: 0, roll: 0 },
  //     });

  //     // Controls
  //     const ssc = viewer.scene.screenSpaceCameraController;
  //     ssc.minimumZoomDistance = 1500;
  //     ssc.maximumZoomDistance = 15000000;

  //     setLoading(false);
  //     viewer.scene.postRender.removeEventListener(onRender);
  //   };

  //   /** 🔄 Trigger when first frame renders */
  //   const onRender = () => initViewer();
  //   viewer.scene.postRender.addEventListener(onRender);

  //   /** ⚠ Fallback: Force init after 3 seconds */
  //   const fallbackTimeout = setTimeout(() => {
  //     if (!initialized) initViewer();
  //   }, 3000);

  //   /** 🔧 Handle WebGL context restore */
  //   const canvas = viewer.scene.canvas;
  //   const restoreHandler = () => initViewer();
  //   canvas.addEventListener("webglcontextrestored", restoreHandler);

  //   return () => {
  //     viewer?.scene?.postRender.removeEventListener(onRender);
  //     canvas.removeEventListener("webglcontextrestored", restoreHandler);
  //     clearTimeout(fallbackTimeout);
  //   };
  // }, [terrainProvider]);


  useEffect(() => {
  if (!terrainProvider) return;

  let initialized = false;
  let interval: ReturnType<typeof setInterval>;
  let hardTimeout: ReturnType<typeof setTimeout>;

  const initViewer = (viewer: any) => {
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

    // Focus camera on Nepal
    viewer.camera.setView({
      destination: Cartesian3.fromDegrees(85.3206, 27.7017, 500000),
      orientation: { heading: 0, pitch: -Math.PI / 2, roll: 0 }, // top-down view
    });

    // Constrain zoom range to avoid going underground or too far out
    const ssc = viewer.scene.screenSpaceCameraController;
    ssc.minimumZoomDistance = 1500;
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


//   useEffect(() => {
//   const viewer = viewerRef.current?.cesiumElement;
//   if (!viewer || !terrainProvider) return;

//   let initialized = false;

//   const initViewer = () => {
//     if (initialized) return;
//     initialized = true;

//     viewer.scene.morphTo3D(0);

//     viewer.imageryLayers.removeAll();
//     viewer.imageryLayers.addImageryProvider(
//       new OpenStreetMapImageryProvider({
//         url: "https://a.tile.openstreetmap.org/",
//       })
//     );

//     viewer.camera.setView({
//       destination: Cartesian3.fromDegrees(85.3206, 27.7017, 500000),
//       orientation: { heading: 0, roll: 0 },
//     });

//     const ssc = viewer.scene.screenSpaceCameraController;
//     ssc.minimumZoomDistance = 1500;
//     ssc.maximumZoomDistance = 15000000;

//     setLoading(false);
//   };

//   /** ⭐ 1) When terrain + imagery tiles finish loading */
//   const checkTiles = () => {
//     if (viewer.scene.globe.tilesLoaded) {
//       initViewer();
//     }
//   };

//   /** ⭐ 2) Poll until tilesLoaded = true */
//   const interval = setInterval(checkTiles, 200);

//   /** ⭐ 3) Hard fallback – force init after 5s max */
//   const hardTimeout = setTimeout(initViewer, 5000);

//   return () => {
//     clearInterval(interval);
//     clearTimeout(hardTimeout);
//   };
// }, [terrainProvider]);

  /** 3️⃣ UI */
  return (
    <div className="h-screen w-screen relative">
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center
        bg-black bg-opacity-40 text-white text-2xl z-50">
            <SimpleLoader/>
        </div>
      )}

      {terrainProvider && (
        <Viewer
          ref={viewerRef}
          full
          sceneMode={SceneMode.SCENE3D}
          terrainProvider={terrainProvider}
          baseLayerPicker={false}
          animation={false}
          timeline={false}
          geocoder={false}
          homeButton={false}
          navigationHelpButton={true}
          infoBox={true}
          selectionIndicator={false}
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

      {terrainProvider && (
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