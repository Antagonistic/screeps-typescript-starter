import { MiningMission } from "../missions/MiningMission";
import { ScoutMission } from "../missions/ScoutMission";
import { Operation } from "./Operation";

export class MiningOperation extends Operation {
    public sources: Source[] = [];

    constructor(flag: Flag, name: string, type: string) {
        super(flag, name, type)
        if (flag.room) {
            this.sources = _.sortBy(flag.room.find(FIND_SOURCES), (s: Source) => s.pos.getRangeTo(flag));
        }
    }

    public finalizeOperation(): void {
        ;
    }
    public initOperation() {
        if (this.spawnRoom.rclLevel < 4) { return; }
        this.addMission(new ScoutMission(this));
        for (let i = 0; i < this.sources.length; i++) {
            ;
            this.addMission(new MiningMission(this, "mining" + i, this.sources[i], false));
        }
    }
}
