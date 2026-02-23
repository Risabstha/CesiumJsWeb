// Handles line drawing & terrain sampling

import React, { useState } from "react";
import { Viewer, Entity } from "resium";
import {
  Cartesian3,
  Color,
  TerrainProvider,
  Cartographic,
  sampleTerrainMostDetailed,
} from "cesium";
import ProfileChart from "./ProfileChart";

// ✅ Import Cesium classes directly from the package
import { ScreenSpaceEventHandler, ScreenSpaceEventType } from "cesium";
import { IoMdClose } from "react-icons/io";
import { MdOutlineCalculate, MdOutlineDraw } from "react-icons/md";
import { VscGraphLine } from "react-icons/vsc";
import { BiSolidFileExport } from "react-icons/bi";

interface Props {
  viewerRef: React.RefObject<any>;
  terrainProvider: TerrainProvider;
  points: Cartesian3[]; // <-- added

  setPoints: React.Dispatch<React.SetStateAction<Cartesian3[]>>; // <-- added
}

export default function ProfileTool({
  viewerRef,
  terrainProvider,
  points,
  setPoints,
}: Props) {
  const [heights, setHeights] = useState<number[]>([]);
  const [distances, setDistances] = useState<number[]>([]);
const [clickHandler, setClickHandler] = useState<ScreenSpaceEventHandler | null>(null);
  const [isClicked, setIsClicked] = useState(false);

  // const handleCrossSectionClick = () => {
  //   if (1) {
  //     // Closing: clear points and chart
  //     setPoints([]);
  //     setHeights([]);
  //     setDistances([]);
  //   }
  //   setIsClicked(!isClicked);
  // };

  const handleCrossSectionClick = () => {
  // If closing tool
  if (isClicked) {
    setPoints([]);
    setHeights([]);
    setDistances([]);

    // Remove drawing event handler
    if (clickHandler) {
      clickHandler.destroy();
      setClickHandler(null);
    }
  }

  setIsClicked(!isClicked);
};

  // Handle map click to select points
  const handleMapClick = () => {
  const viewer = viewerRef.current?.cesiumElement;
  if (!viewer) return;

  // Prevent multiple handlers
  if (clickHandler) return;

  const handler = new ScreenSpaceEventHandler(viewer.scene.canvas);
  handler.setInputAction((click: any) => {
    // Only allow two points
    setPoints((prev) => {
      if (prev.length >= 2) return prev;
      const cartesian = viewer.camera.pickEllipsoid(click.position);
      if (cartesian) return [...prev, cartesian];
      return prev;
    });
  }, ScreenSpaceEventType.LEFT_CLICK);

  setClickHandler(handler);
};



  // Sample terrain along the line
  //   const generateProfile = async () => {
  //     if (points.length < 2) return;

  //     const numSamples = 100;
  //     const start = Cartographic.fromCartesian(points[0]);
  //     const end = Cartographic.fromCartesian(points[points.length - 1]);
  //     const interpolated: Cartographic[] = [];

  //     for (let i = 0; i <= numSamples; i++) {
  //       const t = i / numSamples;
  //       interpolated.push(
  //         new Cartographic(
  //           start.longitude + t * (end.longitude - start.longitude),
  //           start.latitude + t * (end.latitude - start.latitude),
  //           0
  //         )
  //       );
  //     }

  //     const terrainData = await sampleTerrainMostDetailed(terrainProvider, interpolated);
  //     setHeights(terrainData.map((pt) => pt.height ?? 0));
  //   };
  const generateProfile = async () => {
    if (points.length < 2) return;

    const numSamples = 100; // number of points along the line
    const start = Cartographic.fromCartesian(points[0]);
    const end = Cartographic.fromCartesian(points[points.length - 1]);
    const interpolated: Cartographic[] = [];

    for (let i = 0; i <= numSamples; i++) {
      const t = i / numSamples;
      interpolated.push(
        new Cartographic(
          start.longitude + t * (end.longitude - start.longitude),
          start.latitude + t * (end.latitude - start.latitude),
          0,
        ),
      );
    }

    // Sample terrain elevations
    const terrainData = await sampleTerrainMostDetailed(
      terrainProvider,
      interpolated,
    );
    const heightsArr = terrainData.map((pt) => pt.height ?? 0);

    // Calculate cumulative distances along interpolated points
    const distancesArr: number[] = [0];
    for (let i = 1; i < interpolated.length; i++) {
      const lon1 = interpolated[i - 1].longitude;
      const lat1 = interpolated[i - 1].latitude;
      const lon2 = interpolated[i].longitude;
      const lat2 = interpolated[i].latitude;

      const R = 6371000; // Earth radius in meters
      const dx = (lon2 - lon1) * R * Math.cos((lat1 + lat2) / 2);
      const dy = (lat2 - lat1) * R;
      const stepDist = Math.sqrt(dx * dx + dy * dy);

      distancesArr.push(distancesArr[i - 1] + stepDist);
    }

    setHeights(heightsArr);
    setDistances(distancesArr);
  };

  return (
    <div className="absolute top-2  left-2 z-50 rounded shadow">
      {!isClicked ? (
        <button
        title="calculate cross-section"
          onClick={handleCrossSectionClick}
          className="p-1 bg-green-500 text-white rounded hover:bg-green-600 "
        >
          <MdOutlineCalculate size={24} />
        </button>
      ) : (
        <div className="flex flex-col space-y-2 bg-gray-500/50 rounded-md p-1">
          <button
            title="Close"
            onClick={handleCrossSectionClick}
            className="p-1 bg-red-500 hover:bg-red-600 text-white rounded-full w-7 "
          >
          <IoMdClose size={20} />
          </button>

          <div>
            <button
              title="draw line to get cross-section"
              onClick={handleMapClick}
              className="mr-2 p-1 bg-blue-500 hover:bg-blue-600 text-white rounded"
            >
              <MdOutlineDraw size={24}/>
            </button>
            <button
              title = "generate cross-section graph"
              onClick={generateProfile}
              className="p-1 bg-green-500 hover:bg-green-600 text-white rounded"
            >
              <VscGraphLine size={24} />
            </button>

            <button
              title="export data as CSV"
              onClick={() => {
                if (
                  !points ||
                  points.length < 2 ||
                  !heights ||
                  heights.length < 2 ||
                  !distances ||
                  distances.length < 2
                )
                  return;

                const csvRows = [["Distance (m)", "Elevation (m)"]];
                for (let i = 0; i < heights.length; i++) {
                  csvRows.push([
                    distances[i].toFixed(2),
                    heights[i].toFixed(2),
                  ]);
                }

                const csvContent = csvRows
                  .map((row) => row.join(","))
                  .join("\n");
                const blob = new Blob([csvContent], {
                  type: "text/csv;charset=utf-8;",
                });
                const url = URL.createObjectURL(blob);
                const link = document.createElement("a");
                link.href = url;
                link.setAttribute("download", "profile.csv");
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);
              }}
              className="ml-2 p-1 bg-yellow-500 hover:bg-yellow-600 text-white rounded"
            >
              <BiSolidFileExport  size={24}/>
            </button>

            {/* Draw polyline on map */}
            {points.length >= 2 && (
              <Entity
                polyline={{
                  positions: points,
                  width: 3,
                  material: Color.RED,
                }}
              />
            )}

            {/* Display cross-section chart */}
            {/* {heights.length > 0 && <ProfileChart heights={heights} />} */}
            {heights.length > 0 && (
              <ProfileChart heights={heights} distances={distances} />
            )}
          </div>
        </div>
      )}
    </div>
  );
}
