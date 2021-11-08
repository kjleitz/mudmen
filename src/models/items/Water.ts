// import MudmanBlackboard from "@/behavior/mudman/data/MudmanBlackboard";
// import MudworldBlackboard from "@/behavior/mudman/data/MudworldBlackboard";
// import Item, { ItemType } from "@/models/Item";

// export default class Water extends Item {
//   public volume: number;

//   constructor(volume: number, x: number, y: number) {
//     super(ItemType.WATER, x, y);
//     this.volume = volume;
//   }

//   use(local: MudmanBlackboard, world: MudworldBlackboard): void {
//     super.use(local, world);

//     const oldHydration = local.data.hydration;
//     local.hydrate(this.volume);
//     const newHydration = local.data.hydration;
//     const hydrationAmount = newHydration - oldHydration;

//     this.volume = Math.max(0, this.volume - hydrationAmount);
//   }
// }
