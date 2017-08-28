import * as Config from "../../config/config";

/**
 * Shorthand method for `Creep.moveTo()`.
 *
 * @export
 * @param {Creep} creep
 * @param {(Structure | RoomPosition)} target
 * @returns {number}
 */
export function moveTo(creep: Creep, target: Structure | RoomPosition): number {
  return creep.moveTo(target);
}

/**
 * Returns true if the `ticksToLive` of a creep has dropped below the renew
 * limit set in config.
 *
 * @export
 * @param {Creep} creep
 * @returns {boolean}
 */
export function needsRenew(creep: Creep): boolean {
  return (creep.ticksToLive < Config.DEFAULT_MIN_LIFE_BEFORE_NEEDS_REFILL);
}

/**
 * Shorthand method for `renewCreep()`.
 *
 * @export
 * @param {Creep} creep
 * @param {Spawn} spawn
 * @returns {number}
 */
export function tryRenew(creep: Creep, spawn: Spawn): number {
  const  ret = spawn.renewCreep(creep);
  return ret;
}

/**
 * Moves a creep to a designated renew spot (in this case the spawn).
 *
 * @export
 * @param {Creep} creep
 * @param {Spawn} spawn
 */
export function moveToRenew(creep: Creep, spawn: Spawn): void {
  if (tryRenew(creep, spawn) === ERR_NOT_IN_RANGE) {
    creep.moveTo(spawn);
  }
}

/**
 * Attempts transferring available resources to the creep.
 *
 * @export
 * @param {Creep} creep
 * @param {RoomObject} roomObject
 */
export function getEnergy(creep: Creep, roomObject: RoomObject): void {
  const energy: Resource = roomObject as Resource;

  if (energy) {
    if (creep.pos.isNearTo(energy)) {
      creep.pickup(energy);
    } else {
      moveTo(creep, energy.pos);
    }
  }
}

/**
 * Returns true if a creep's `working` memory entry is set to true, and false
 * otherwise.
 *
 * @export
 * @param {Creep} creep
 * @returns {boolean}
 */
export function canWork(creep: Creep): boolean {
  const working = creep.memory.working;
  if (working && _.sum(creep.carry) === 0) {
    creep.memory.working = false;
    return false;
  } else if (!working && _.sum(creep.carry) === creep.carryCapacity) {
    creep.memory.working = true;
    return true;
  } else {
    return creep.memory.working;
  }
}

export function getAnyEnergy(creep: Creep): void {
  const droppedRes: Resource[] = creep.room.find<Resource>(FIND_DROPPED_RESOURCES,
    {filter: (x: Resource) => x.resourceType === RESOURCE_ENERGY
      && x.amount >= creep.carryCapacity});
  if (droppedRes && droppedRes.length > 0) {
    if (creep.pickup(droppedRes[0]) === ERR_NOT_IN_RANGE) {
      creep.moveTo(droppedRes[0]);
    }
  }
  const energyCont: Container[] = creep.pos.findClosestByRange(FIND_STRUCTURES,
    {filter: (x: Container) => x.structureType === STRUCTURE_CONTAINER
      && x.store[RESOURCE_ENERGY] >= creep.carryCapacity});
  if (energyCont && energyCont.length > 0) {
    if (creep.withdraw(energyCont[0], RESOURCE_ENERGY) === ERR_NOT_IN_RANGE) {
      creep.moveTo(energyCont[0]);
    }
  }
}

export function moveToUpgrade(creep: Creep): void {
  const controller: Controller =  creep.room.controller;
  if (creep.upgradeController(controller) === ERR_NOT_IN_RANGE) {
    moveTo(creep, controller.pos);
  }
}

export function moveToBuild(creep: Creep, target: ConstructionSite): void {
  if (creep.build(target) === ERR_NOT_IN_RANGE) {
    moveTo(creep, target.pos);
  }
}
