import SimplexNoise from "simplex-noise";

// TODO: Seeds should probably be configurable, or from a browser fingerprint,
// or cached in localStorage (latter two for repeatability, former for new maps)
const itemTypeSimplex = new SimplexNoise("item types");

export default function itemTypeNoise(x: number, y: number): number {
  return itemTypeSimplex.noise2D(x, y);
}
