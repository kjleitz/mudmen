# mudmen

## of mudworld

mud men mud men mud men

![mudmen.gif](mudmen.gif)

## demo

https://kjleitz.github.io/mudmen (note for mobile users: the ground/terrain doesn't render on any mobile device I've tested, at the moment... so, try on desktop instead)

### controls

- press `m` to open the map (every pixel of the map is one "square" on the ground when you're following a mudman)
- press `←` and `→` (left and right arrow keys) to cycle through the 1,000 wandering mudmen
- click a spot in the viewport to get the mudman you're following to traverse to the spot you clicked
- press `n` to invoke nighttime (or just wait ~30s), press `d` to invoke daytime (or just wait ~30s)
- sit back and watch

### basic explanation

- all terrain, flora, biomes, etc., are procedurally generated with simplex noise
- each of the 1,000 mudmen represent individual behavior-tree-based AIs, and their pathfinding uses a variant of the A* algorithm
- the three meters at the top right represent social satisfaction (yellow), warmth (red), and hydration (blue) for the mudman you're following

## try out locally

first, [install `pnpm`](https://pnpm.io/installation).

then:

```
git clone https://github.com/kjleitz/mudmen.git
cd mudmen
pnpm install
pnpm run start
```

...then open http://localhost:8080.

## behavior

### notes

1. physiological (animal and physical) needs
    - water
    - warmth
    - food
    - air
    - sleep
    - excrement
    - childbirth
    - death
1. security (safety and planning) needs
    - taking shelter
    - building shelter
    - fight
    - flight
    - tool-making
    - tool use
1. social (platonic and romantic) needs
    - proximity to others
    - talk to others
    - watch/follow others
    - inherited (familial) relationships
    - friendships (same sex)
    - romances (opposite sex)
    - attraction
    - respect
    - act of sex
    - help others
    - helping offspring with physiological needs
    - helping offspring with security needs
1. self-esteem/recreational (creativity, fun, practice, and accomplishment) needs
    - build utility structures (housing, hospitals, etc.)
    - build emotional structures (monuments, memorials, cemeteries, etc.)
    - build recreational structures (museum, theatre, stadium, etc.)
    - find stuff
    - discover new places
    - discover new things
    - discover new animals
    - collect things
    - play
    - tell stories
    - pretend/act
    - laugh/listen

### todo

- [x] pathfinding
- [x] find item of type
- [x] thirst (find water and consume it)
- [ ] thirst (fill water bottle)
- [ ] thirst (build well)
- [ ] food (find food and consume it)
- [ ] food (gather food)
- [ ] food (farm food)
- [ ] hunting
- [ ] social
- [ ] shelter (take shelter)
- [ ] shelter (build shelter)
- [x] warmth (find fire and sit by it)
- [ ] warmth (build fire)
- [ ] sleep
- [ ] pee and poop?
- [ ] dangers
- [ ] fight dangers
- [ ] flee from dangers
- [ ] use tools
- [ ] make tools
- [ ] interact with others
- [ ] death
- [ ] mourning

## nature

### notes

1. landscape
    - land
    - sea
    - elevation
    - biomes
      - forest
      - desert
      - plains
      - arctic
1. weather
    - sun
    - rain
    - snow
    - seasons
    - clouds
1. day/night
    - daylight
    - different animals
    - temperature
    - danger
1. flora
    - grass
    - trees
    - food-bearing plants
    - farms
    - seeds
1. fauna
    - small animals
    - medium animals
    - large animals
    - pets
    - danger
    - herbivores
    - carnivores
    - land animals
    - water animals
    - sky animals
1. metaphysics
    - player (as god)
    - spirits
    - gods
    - fairies
    - magic
    - demigods

### todo

- [x] procedural terrain
- [x] land
- [x] islands
- [x] elevation
- [x] ocean
- [x] snow
- [-] general fertility
- [-] flora
- [x] trees
- [ ] **pets**
- [ ] ground animals
- [ ] air animals
- [ ] sea animals
- [ ] tree animals
- [ ] SPIRITS!!!
- [ ] acorns and pinecones (seeds)
- [ ] choppin' down trees
- [ ] frogs
- [ ] ponds
- [ ] birds, bees, and butterflies
- [ ] wolves
- [ ] bears
- [ ] clouds

## items and objects

### notes

- water
- fire (item? what other category?)
- regenerating items
- holding items
- placing items

### todo

- [x] water bottles
- [ ] refill water bottles after a while
- [x] campfires
- [ ] cooking food and stuff
- [ ] rocks (these are structures)

## why

- math, geometry, art, and logic
