export interface MudmanOptions {
  id: string,
  name: string,
  gender: number,
  nature: {
    strength: number,
    intelligence: number,
    wisdom: number,
    dexterity: number,
    constitution: number,
    charisma: number,
  },
  nurture: {
    experience: number, // generic leveling
    age: number, // lived
    muscles: number, // grown
    education: number, // learned
    endurance: number, // core practice
    coordination: number, // hand-eye (trained)
    sociability: number, // social aptitude; friendly, politic, influential, etc.
    empathy: number, // good <=> evil
    duty: number, // lawful <=> chaotic
  }
}

export default class Mudman {
  constructor(options: MudmanOptions) {

  }

  static optionsFromSeed(seed: string): MudmanOptions {
    // return {
    //   id: 
    // }
  }

  static fromSeed(seed: string): Mudman {
    const mudmanOptions = this.optionsFromSeed(seed);
    return new Mudman(mudmanOptions);
  }
}
