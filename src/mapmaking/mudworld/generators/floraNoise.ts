import elevationNoise from "@/mapmaking/mudworld/generators/elevationNoise";
import moistureNoise from "@/mapmaking/mudworld/generators/moistureNoise";
import { SNOW_LINE } from "@/mapmaking/mudworld/generators/snowiness";
import { f } from "@/utilities/math";
import SimplexNoise from "simplex-noise";

export const TREE_LINE = SNOW_LINE + f((255 - SNOW_LINE) / 4);

// TODO: Seeds should probably be configurable, or from a browser fingerprint,
// or cached in localStorage (latter two for repeatability, former for new maps)
const floraSimplex = new SimplexNoise("flora");

const ELEVATION_WEIGHT = 1.5;
const MOISTURE_WEIGHT = 0.25;
// const FLORA_WEIGHT = 0;
const FLORA_WEIGHT = 1;
// const FLORA_WEIGHT = 0.75;
const FLORA_FREQUENCY = 20;
// const GROVES_WEIGHT = 0.5;
const GROVES_WEIGHT = 1;
// const GROVES_FREQUENCY = 40;
const GROVES_FREQUENCY = 70;
const TOTAL_WEIGHT = ELEVATION_WEIGHT + FLORA_WEIGHT;

export default function floraNoise(x: number, y: number): number {
  return (
    (ELEVATION_WEIGHT * elevationNoise(x, y))
    + (MOISTURE_WEIGHT * moistureNoise(x, y))
    + (FLORA_WEIGHT * floraSimplex.noise2D(FLORA_FREQUENCY * x, FLORA_FREQUENCY * y))
    + (GROVES_WEIGHT * floraSimplex.noise2D(GROVES_FREQUENCY * x, GROVES_FREQUENCY * y))
  ) / TOTAL_WEIGHT;
}
