import { LogisticsManager } from "operation/LogisticsManager";
import { Operation } from "../operations/Operation";
import { Mission } from "./mission";

import * as creepActions from "creeps/creepActions";


export class SupervisorMission extends Mission {
    public logistics: LogisticsManager;
    public supers: Creep[] = [];
    constructor(operation: Operation, logistics: LogisticsManager) {
        super(operation, "supervisor");
        this.logistics = logistics;
    }
    public initMission(): void {
        ;
    }
    public spawn(): void {
        const numSuper = (): number => {
            return this.room && this.room.memory.supervisor ? this.room.memory.supervisor.length : 0;
        }
        const superBody = (): BodyPartConstant[] => {
            const carryparts = Math.min((this.logistics.C / 50) - 1, 15);
            return this.workerBody(0, carryparts, 1);
        }
        this.supers = this.spawnRole("super", numSuper, superBody, { role: "super" }, 0);
    }
    public work(): void {
        if (this.room && this.room.memory.supervisor && this.room.memory.supervisor.length > 0) {
            for (let i = 0; i < this.room.memory.supervisor.length; i++) {
                const sup = this.supers[i];
                const supPos = this.room.memory.supervisor[i];
                if (!sup || !supPos) { continue; }
                if (sup.pos.x !== supPos.x || sup.pos.y !== supPos.y) {
                    sup.say("Move " + supPos.x + "," + supPos.y);
                    // creepActions.moveTo(sup, new RoomPosition(supPos.x, supPos.y, this.room.name));
                    sup.moveTo(supPos.x, supPos.y);
                    continue;
                }
                const struct = sup.pos.findInRange(FIND_MY_STRUCTURES, 1);
                let storage: StructureStorage | undefined;
                const containers: StructureContainer[] = [];
                const towers: StructureTower[] = [];
                const spawns: StructureSpawn[] = [];
                let link: StructureLink | undefined;
                for (const s of struct) {
                    if (s instanceof StructureStorage) { storage = s; }
                    if (s instanceof StructureContainer) { containers.push(s); }
                    if (s instanceof StructureTower) { towers.push(s); }
                    if (s instanceof StructureSpawn) { spawns.push(s); }
                    if (s instanceof StructureLink) { link = s; }
                }
                let spent = sup.carryCapacity - sup.carry.energy;
                for (const t of towers) {
                    if (t.energy < t.energyCapacity) {
                        const amount = t.energyCapacity - t.energy;
                        sup.transfer(t, RESOURCE_ENERGY, amount);
                        spent += amount;
                    }
                }
                for (const s of spawns) {
                    if (s.energy < s.energyCapacity) {
                        const amount = s.energyCapacity - s.energy;
                        sup.transfer(s, RESOURCE_ENERGY, amount);
                        spent += amount;
                    }
                }
                for (const c of containers) {
                    if (_.sum(c.store) < c.storeCapacity) {
                        const amount = c.storeCapacity - _.sum(c.store);
                        sup.transfer(c, RESOURCE_ENERGY, amount);
                        spent += amount;
                    }
                }
                if (storage) {
                    if (storage.store.energy > spent) {
                        sup.withdraw(storage, RESOURCE_ENERGY, spent);
                    }
                }

            }
        }
    }
    public finalize(): void {
        ;
    }

}