import { Operation } from "../operations/Operation";
import { Mission } from "./Mission";

import * as creepActions from "creeps/creepActions";
import { profile } from "Profiler";

@profile
export class ReserveMission extends Mission {
    public reservers: Creep[] = [];
    public roomName: string;
    public controller?: StructureController;

    constructor(operation: Operation) {
        super(operation, "reserve");
        this.roomName = this.operation.roomName;
        if (this.room && this.room.controller) { this.controller = this.room.controller; }
    }

    public initMission(): void {
        ;
    }
    public spawn(): void {
        const needReserver = () => this.controller && !this.controller.my && this.spawnRoom.availableSpawnEnergy >= 1300 && (!this.controller.reservation ||
            this.controller.reservation.ticksToEnd < 3000) ? 1 : 0;
        this.reservers = this.spawnRole("claim", needReserver, this.reserveBody);
    }
    public work(): void {
        for (const creep of this.reservers) {
            if (creep.ticksToLive && creep.ticksToLive >= 1499) {
                creep.notifyWhenAttacked(false);
            }

            if (this.room && this.controller) {
                creepActions.moveToReserve(creep, this.controller);
            } else {
                creepActions.moveTo(creep, this.operation.flag.pos);
            }
        }
    }
    public finalize(): void {
        ;
    }

    public reserveBody = (): BodyPartConstant[] => this.configBody({ claim: 2, move: 2 });
}
