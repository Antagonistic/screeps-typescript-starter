import * as creepActions from "../creepActions";

import { SpawnRoom } from "../../rooms/SpawnRoom";
// import * as CreepManager from "../creepManager";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {

  // if (creepActions.needsRenew(creep)) {
  //  const spawn = creep.room.find<Spawn>(FIND_MY_SPAWNS)[0];
  //  creepActions.moveToRenew(creep, spawn);
  //  return;
  // }

  let action: boolean = false;
  action = creepActions.actionRecycle(creep, action);

  if (creepActions.canWork(creep)) {
    action = creepActions.actionFillEnergy(creep, action);
    if (creep.room.controller && creep.room.controller.ticksToDowngrade < 2000) {
      action = creepActions.actionUpgrade(creep, action);
    }
    action = creepActions.actionRepair(creep, action, false, 8);
    action = creepActions.actionBuild(creep, action);
    action = creepActions.actionUpgrade(creep, action);
  } else {
    if (creep.room.storage && creep.room.storage.store.energy > 1000) {
      action = creepActions.actionGetStorageEnergy(creep, action);
    }
    action = creepActions.actionGetDroppedEnergy(creep, action, true);
    action = creepActions.actionGetContainerEnergy(creep, action, 4);
    action = creepActions.actionGetSourceEnergy(creep, action, 2);
  }
}

export function getBody(room: Room): BodyPartConstant[] {
  // if (room.memory.stable_structures) {
  //  return [WORK, WORK, CARRY, MOVE];
  // }
  /*if (room.energyCapacityAvailable >= 500) {
    return [MOVE, MOVE, MOVE, WORK, WORK, CARRY, CARRY, CARRY];
  } else if (room.energyCapacityAvailable >= 400) {
    return [MOVE, MOVE, WORK, WORK, CARRY, CARRY];
  }*/
  return [WORK, CARRY, MOVE, MOVE];
}

export function build(spawn: SpawnRoom, creeps: Creep[], State: RoomStates, spawnAction: boolean): boolean {
  if (spawnAction === false) {
    let numHarvesters: number = 0;
    switch (State) {
      case RoomStates.BOOTSTRAP: {
        numHarvesters = 7;
        break;
      }
      case RoomStates.TRANSITION: {
        numHarvesters = 3;
        break;
      }
    }
    const harvesters = _.filter(creeps, (creep) => creep.memory.role === "harvester");
    if (harvesters.length < numHarvesters) {
      console.log(spawn.room.name + ": harvester: " + harvesters.length + "/" + numHarvesters);
      return spawn.createCreep(getBody(spawn.room), "harvester");
    }
    if (numHarvesters === 0 && harvesters.length) {
      _.each(harvesters, (harvester) => harvester.memory.recycle = true);
    }
  }
  return spawnAction;
}
