import * as creepActions from "../creepActions";

import * as CreepManager from "../creepManager";

/**
 * Runs all creep actions.
 *
 * @export
 * @param {Creep} creep
 */
export function run(creep: Creep): void {
  let action: boolean = false;

  action = creepActions.actionRecycle(creep, action);

  action = creepActions.actionMoveToRoom(creep, action);

  action = creepActions.actionAttackHostile(creep, action);

  action = creepActions.actionRally(creep, action);
}

export function getBody(): string[] | null {
  return [RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, RANGED_ATTACK, MOVE, MOVE, MOVE, MOVE];
}

export function build(room: Room, spawn: Spawn, creeps: Creep[],
                      spawnAction: boolean): boolean {
  if (spawnAction === false) {
    const hostiles = room.find<Creep>(FIND_HOSTILE_CREEPS);
    if (hostiles && hostiles.length) {
      const guards: Creep[] = _.filter(creeps, (creep) => creep.memory.role === "guard" &&
       creep.memory.room === room.name);
      _.each(guards, (guard) => guard.memory.recycle = undefined);
      return CreepManager.createCreep(spawn, getBody(), "guard", {}, room);
    } else {
      const guards: Creep[] = _.filter(creeps, (creep) => creep.memory.role === "guard" &&
       creep.memory.room === room.name);
      if (guards && guards.length) {
        _.each(guards, (guard) => guard.memory.recycle = true);
      }
    }
  }
  return spawnAction;
}
