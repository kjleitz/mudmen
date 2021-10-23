import Mudman from "@/models/Mudman";
import Renderer from "@/rendering/base/Renderer";
import { mudworld } from "@/behavior/mudman/data/MudworldBlackboard";
import MudworldMap, { from32Bits, to32Bits } from "@/mapmaking/mudworld/MudworldMap";
import elevationNoise from "@/mapmaking/mudworld/noise/elevationNoise";
import SimplexNoise from "simplex-noise";

const mudman = new Mudman();

(window as any).mudman = mudman;
(window as any).mudworld = mudworld;
(window as any).MudworldMap = MudworldMap;
(window as any).elevationNoise = elevationNoise;
(window as any).SimplexNoise = SimplexNoise;
(window as any).to32Bits = to32Bits;
(window as any).from32Bits = from32Bits;

const TILE_WIDTH = 16;
const TILE_HEIGHT = 16;
const VIEWPORT_WIDTH = 512;
const VIEWPORT_HEIGHT = 512;
const MUDWORLD_MAP_WIDTH = mudworld.data.map.colCount * TILE_WIDTH;
const MUDWORLD_MAP_HEIGHT = mudworld.data.map.rowCount * TILE_HEIGHT;

// const worldCanvas = document.getElementById("world-map") as HTMLCanvasElement;
const worldCanvas = document.createElement("canvas");
const worldRenderer = new Renderer(worldCanvas, MUDWORLD_MAP_WIDTH, MUDWORLD_MAP_HEIGHT);

const viewportCanvas = document.getElementById("viewport") as HTMLCanvasElement;
const viewportRenderer = new Renderer(viewportCanvas, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

// worldRenderer.drawLoop((ctx, timestamp) => {
//   ctx.clearRect(0, 0, mudworld.data.map.colCount, mudworld.data.map.rowCount)
//   mudworld.data.map.eachTile((row, col, elevation, moisture, structure, underwater) => {
//     // console.log(elevation)
//     const elevationColor = `rgb(${elevation}, ${elevation}, ${elevation})`;
//     // const elevationColor = `rgb(${elevation}, 255, 255)`;
//     ctx.fillStyle = elevationColor;
//     ctx.fillRect(col, row, 1, 1);
//   });
// });

(window as any).renderOnce = () => {
  mudworld.data.map.fillWithTerrain();

  worldRenderer.drawOnce((ctx, timestamp) => {
    ctx.clearRect(0, 0, MUDWORLD_MAP_WIDTH, MUDWORLD_MAP_HEIGHT);
    mudworld.data.map.eachTile((row, col, elevation, moisture, structure, underwater) => {
      if (underwater) {
        ctx.fillStyle = "rgb(0, 100, 200)";
      } else {
        // TODO: have a set of pre-defined tile color/illustrations when each
        //       value is within a certain range
        ctx.fillStyle = `rgb(${elevation}, ${moisture}, ${(elevation / 2).toFixed(0)})`
      }
      const x = col * TILE_WIDTH;
      const y = row * TILE_HEIGHT;
      ctx.fillRect(x, y, TILE_WIDTH, TILE_HEIGHT);

      ctx.strokeStyle = "rgba(0, 0, 0, 0.125)";
      ctx.strokeRect(x, y, TILE_WIDTH, TILE_HEIGHT);
    });
  });
}

viewportRenderer.drawLoop((ctx, timestamp) => {
  ctx.clearRect(0, 0, VIEWPORT_WIDTH, VIEWPORT_HEIGHT);

  // const rowTileCount = 21;
  // const colTileCount = 21;

  const sourceX = mudman.local.x - (VIEWPORT_WIDTH / 2);
  const sourceY = mudman.local.y - (VIEWPORT_HEIGHT / 2);

  ctx.drawImage(
    worldRenderer.canvas,
    sourceX, sourceY,
    VIEWPORT_WIDTH, VIEWPORT_HEIGHT,
    0, 0,
    VIEWPORT_WIDTH, VIEWPORT_HEIGHT,
  );

  ctx.fillStyle = "red";
  ctx.fillRect((VIEWPORT_WIDTH / 2) - 5, (VIEWPORT_HEIGHT / 2) - 5, 10, 10);

  mudman.tick();
  // mudworld.data.map.eachTile((row, col, elevation, moisture, structure, underwater) => {
  //   if (underwater) {
  //     ctx.fillStyle = "rgb(0, 100, 200)";
  //   } else {
  //     // TODO: have a set of pre-defined tile color/illustrations when each
  //     //       value is within a certain range
  //     ctx.fillStyle = `rgb(${elevation}, ${moisture}, ${(elevation / 2).toFixed(0)})`
  //   }
  //   ctx.fillRect(col, row, 1, 1);
  // });
});
