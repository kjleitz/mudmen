import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
import Item, { ItemType } from "@/models/Item";
import { bound } from "@/utilities/math";

export const enum FluidType {
  AIR,
  WATER,
}

// This might be a bad idea
export default class Bottle extends Item {
  public filledWith: FluidType;
  public volume: number;

  private _content = 0;

  constructor(filledWith: FluidType, x: number, y: number, volume = 100, content = 100) {
    super(ItemType.BOTTLE, x, y);
    this.filledWith = filledWith;
    this.volume = volume;
    this.content = content;
  }

  get content(): number { return this._content }
  set content(value: number) {
    this._content = bound(value, 0, this.volume);
    if (this._content === 0) this.filledWith = FluidType.AIR;
  }

  get isEmpty(): boolean { return this.content === 0 || this.filledWith === FluidType.AIR }
  get hasContent(): boolean { return this.isEmpty }
  get isFull(): boolean { return this.content === this.volume && this.filledWith !== FluidType.AIR }
  get percentFull(): number { return this.content / this.volume }

  canAdd(itemType: FluidType): boolean {
    return !this.isFull && (itemType === this.filledWith || this.filledWith === FluidType.AIR);
  }

  // Careful; this will dump out any remaining content of a different type
  // before filling with the given type, if any such content exists.
  fillWith(itemType: FluidType, amount?: number): void {
    if (!this.canAdd(itemType)) this.dump();

    this.filledWith = itemType;
    const initialContent = this.isEmpty ? 0 : this.content; // in case it's filled with non-zero content of air
    const contentToAdd = amount ?? this.volume; // if no amount was given, fill 'er up
    this.content = initialContent + contentToAdd;
  }

  dump(): void {
    this.content = 0;
    this.filledWith = FluidType.AIR; // implied by previous line, but whatever
  }

  resize(volume: number): void {
    this.volume = volume;
    this.content = this.content; // eslint-disable-line no-self-assign
  }

  use(local: MudmanBlackboard, world: MudworldBlackboard): void {
    // if (this.isEmpty) return;

    switch (this.filledWith) {
      case FluidType.AIR: break;
      case FluidType.WATER: {
        const oldHydration = local.data.hydration;
        local.hydrate(this.content);
        const newHydration = local.data.hydration;
        const hydrationAmount = newHydration - oldHydration;
        this.content -= hydrationAmount;
        break;
      }
      // case FluidType.ALCOHOL: {
      //   break;
      // }
    }

    if (this.isEmpty) this.used = true;

    // TODO: remove
    // TODO: remove
    // TODO: remove
    // TODO: remove
    // TODO: remove
    // TODO: remove
    // this.drop(local, world);
  }
}
