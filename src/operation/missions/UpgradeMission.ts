import { Operation } from "../operations/Operation";
import { Mission } from "./Mission";

import * as creepActions from "creeps/creepActions";
import * as upgrader from "creeps/roles/upgrader";

export class UpgradeMission extends Mission {

    public upgraders: Creep[] = [];
    public haulers: Creep[] = [];
    public container?: StructureContainer;
    public storage?: StructureStorage;
    public controller?: StructureController;

    constructor(operation: Operation) {
        super(operation, "upgrade")
        if (this.room) {
            this.controller = this.room.controller;
        }
    }
    public initMission(): void {
        if (!this.room) { return; }
        this.container = this.findContainer();
        if (this.container) {
            this.room.memory.battery = this.container.id;
        }
    }
    public spawn(): void {
        this.upgraders = this.spawnRole(this.name, this.getMaxUpgraders, this.getUpgraderBody, { role: "upgrader" });

        const numCarts = (): number => this.room && this.room.storage ? 1 : 0;
        this.haulers = this.spawnRole(this.name + "cart", numCarts, this.getCartBody, { role: "refill" });

        if (Game.time % 50 === 20) {
            if (this.operation.stableOperation) {
                if (this.buildRoads(this.haulPath())) {
                    console.log("Building controller roads!");
                }
            }
        }
        // console.log("upgrade carts: " + numCarts() + " " + this.haulers.length + " " + this.haulers[0].name);
    }
    public work(): void {
        // for (const u of this.upgraders) {
        // upgrader.run(u);
        // }
        this.runUpgraders(this.upgraders);
        this.runHaulers(this.haulers);
    }
    public finalize(): void {
        ;
    }

    public getUpgraderBody = (): BodyPartConstant[] => {
        if (this.spawnRoom.rclLevel === 8) {
            return this.workerBody(15, 6, 8);
        }
        const energyAvailable: number = this.spawnRoom.energyCapacityAvailable;
        if (energyAvailable >= 1300) {
            return this.workerBody(8, 4, 6);
        } else if (energyAvailable >= 650) {
            return this.workerBody(4, 3, 2);
        } else if (energyAvailable >= 550) {
            return this.workerBody(3, 3, 2);
        } else if (energyAvailable >= 400) {
            return this.workerBody(2, 2, 2);
        } else {
            return this.workerBody(2, 1, 1);
        }
    }

    public getMaxUpgraders = (): number => {
        if (this.spawnRoom.rclLevel === 8) { return 1; };
        if (!this.container) { return 0; }
        if (this.room && this.room.controller && this.room.controller.level < 2) {
            return 1;
        }
        let numUpgraders = 2;
        if (this.room && this.room.storage) {
            const energy: number | undefined = this.room.storage.store.energy;
            if (energy) {
                if (energy > 100000) {
                    numUpgraders += 3;
                } else if (energy > 50000) {
                    numUpgraders += 2;
                } else if (energy > 30000) {
                    numUpgraders += 2;
                } else if (energy > 20000) {
                    numUpgraders += 1;
                } else if (energy > 10000) {
                    numUpgraders += 1;
                }
            }
        }
        return numUpgraders;
    }

    public haulPath = (): RoomPosition[] => {
        if (this.controller) {
            let goal;
            if (this.storage) {
                goal = { pos: this.storage.pos, range: 1 }
            } else {
                goal = { pos: this.spawnRoom.spawns[0].pos, range: 1 }
            }
            const path = PathFinder.search(this.controller.pos, goal).path;
            return path;
        }
        return [];
    }

    public runUpgraders(creeps: Creep[]): void {
        for (const u of this.upgraders) {
            let action: boolean = false;
            // action = creepActions.actionRenew(creep, action);

            if (!action && creepActions.canWork(u)) {
                // console.log("foo!");
                if (!this.container) {
                    action = creepActions.actionBuildStill(u, action);
                    action = creepActions.actionRepairStill(u, action);
                }
                action = creepActions.actionUpgrade(u, action);
                if (u.carry.energy === 0) { u.memory.working = false; }
            } else {
                // action = creepActions.actionGetStorageEnergy(u, action, 4);
                if (this.container) {
                    creepActions.moveToWithdraw(u, this.container);
                }
                // if (creep.room.energyCapacityAvailable < 550) {
                //   action = creepActions.actionGetSourceEnergy(creep, action, 2);
                // }
                // action = creepActions.actionGetDroppedEnergy(creep, action, false);
            }
        }
    }

    public runHaulers(creeps: Creep[]): void {
        for (const h of this.haulers) {

            let action: boolean = false;
            action = creepActions.actionRecycle(h, action);

            if (!action && creepActions.canWork(h)) {
                if (this.container) {
                    action = creepActions.actionTransfer(h, action, this.container);
                } else {
                    if (!action) { creepActions.moveTo(h, this.operation.rallyPos); };
                }
                // if (this.upgraders.length > 0) {
                //     _.min(this.upgraders,
                // }
                // action = creepActions.actionMoveToRoom(h, action, h.memory.home);
                // action = creepActions.actionFillEnergy(h, action);
                // action = creepActions.actionFillTower(h, action);
                // action = creepActions.actionFillBufferChest(h, action);
                // action = creepActions.actionFillEnergyStorage(h, action);
                // action = creepActions.actionFillBuilder(h, action);
                // action = creepActions.actionFillUpgrader(h, action);
                // action = creepActions.actionBuild(creep, action);
                // action = creepActions.actionUpgrade(creep, action);
            } else {
                // action = creepActions.actionMoveToRoom(h, action);
                // action = creepActions.actionGetDroppedEnergy(h, action, true);
                // action = creepActions.actionGetContainerEnergy(h, action, 2, true);
                action = creepActions.actionGetStorageEnergy(h, action, 20);
                if (!action) { creepActions.moveTo(h, this.operation.rallyPos); };

            }
        }
    }

    public findContainer(): StructureContainer | undefined {
        if (!this.controller) { return undefined; }
        const containers = this.controller.pos.findInRange<StructureContainer>(FIND_STRUCTURES, 4,
            { filter: (x: Structure) => x.structureType === STRUCTURE_CONTAINER });
        // let containers = this.source.pos.findInRange(STRUCTURE_CONTAINER, 1);
        if (!containers || containers.length === 0) {
            this.placeContainer();
        }
        return containers[0];
    }

    public placeContainer(): void {
        if (!this.controller) { return; }
        const boxSite: ConstructionSite[] = this.controller.pos.findInRange(FIND_MY_CONSTRUCTION_SITES, 4,
            { filter: (x: ConstructionSite) => x.structureType === STRUCTURE_CONTAINER });
        if (!boxSite || boxSite.length === 0) {
            const pos = this.haulPath()[2];
            const ret = pos.createConstructionSite(STRUCTURE_CONTAINER);
            if (ret !== OK) {
                console.log("Placing mining box error: " + ret);
            }
            return;
        }
    }

}