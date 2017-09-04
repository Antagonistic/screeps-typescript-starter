import * as Config from "./config/config";

import * as CreepManager from "./components/creeps/creepManager";
import * as FlagManager from "./components/flags/flagManager";
import * as StateManager from "./components/state/stateManager";
import * as StructureManager from "./components/structures/structureManager";

import * as Profiler from "screeps-profiler";
import { log } from "./lib/logger/log";

// Any code written outside the `loop()` method is executed only when the
// Screeps system reloads your script.
// Use this bootstrap wisely. You can cache some of your stuff to save CPU.
// You should extend prototypes before the game loop executes here.

// This is an example for using a config variable from `config.ts`.
// NOTE: this is used as an example, you may have better performance
// by setting USE_PROFILER through webpack, if you want to permanently
// remove it on deploy
// Start the profiler
if (Config.USE_PROFILER) {
  Profiler.enable();
}

// log.info(`Scripts bootstrapped`);
if (__REVISION__) {
  log.info(`Revision ID: ${__REVISION__}`);
}

function mloop() {
  // Check memory for null or out of bounds custom objects
  if (!Memory.uuid || Memory.uuid > 100) {
    Memory.uuid = 0;
  }

  let creeps: Creep[] = [];
  for (const i in Game.rooms) {
    const room: Room = Game.rooms[i];
    const roomCreeps: Creep[] = room.find(FIND_MY_CREEPS);
    if (roomCreeps && roomCreeps.length) {
      creeps = creeps.concat(roomCreeps);
    }
  }

  // console.log(creeps.length);

  CreepManager.runCreeps(creeps);

  FlagManager.run();

  for (const i in Game.rooms) {
    const room: Room = Game.rooms[i];

    CreepManager.run(room, creeps);
    if (Game.time % 20 === 0) {
      StateManager.run(room);
    }
    StructureManager.run(room);

    // Clears any non-existing creep memory.
    for (const name in Memory.creeps) {
      const creep: any = Memory.creeps[name];

      if (creep.room === room.name) {
        if (!Game.creeps[name]) {
          log.info("Clearing non-existing creep memory:", name);
          delete Memory.creeps[name];
        }
      }
    }
  }
}

/**
 * Screeps system expects this "loop" method in main.js to run the
 * application. If we have this line, we can be sure that the globals are
 * bootstrapped properly and the game loop is executed.
 * http://support.screeps.com/hc/en-us/articles/204825672-New-main-loop-architecture
 *
 * @export
 */
export const loop = !Config.USE_PROFILER ? mloop : () => { Profiler.wrap(mloop); };
