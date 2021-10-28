import { weightHigh } from "@/utilities/weight";

export const SNOW_LINE = 195;

// Takes an elevation from 0-255 and returns a number from 0-255
export default function snowiness(elevation: number): number {
  const percentElevatedOverSnowLine = Math.max((elevation - SNOW_LINE) / (255 - SNOW_LINE), 0);
  return 255 * weightHigh(percentElevatedOverSnowLine, 0.75);
}
