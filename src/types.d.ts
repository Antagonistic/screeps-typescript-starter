// import "./Profiler/typings"

// example declaration file - remove these and add your own custom typings
declare namespace NodeJS {
  interface Global {
    log: any;
    cc: any;
    emp: Empire;
    Profiler: Profiler;

    lastMemoryTick: number | undefined;
    LastMemory: any;
    Memory: any;
  }
}

interface RawMemory {
  _parsed: any;
}

interface Game {
  operations: { [opName: string]: any }
}

interface MarketHistory {
  resourceType: ResourceConstant;
  date: string;
  transactions: number;
  volume: number;
  avgPrice: number;
  stddevPrice: number;
}

interface Market {
  getHistory(resource: ResourceConstant): MarketHistory[];
}

// memory extension samples
interface CreepMemory {
  home?: string;
  role?: string;
  room?: string;
  working: boolean;
  uuid: number;
  hasworkpart?: boolean;
  recycle?: boolean;
  reserve?: any;
  sourceID?: string;
  squad?: string;
  renew?: boolean;
  target?: Id<Creep | ConstructionSite | Structure>;
  energyTarget?: string;
  isBoosted?: boolean;
  inPosition?: boolean;
  _trav?: any;
  _travel?: any;
  oversize?: number;
}

interface RoomMemory {
  // state: RoomStates;
  home?: string;
  homelevel?: number;
  spawns?: string[];
  remote?: string[];
  layout?: LayoutMemory[];
  lastSeen?: Number;
  nextScan?: Number;
  visual?: boolean;
  dest?: RoomPosition[];

  towers?: string[];
  // mine_structures: number;
  // stable_structures: boolean;
  bufferChests?: string[];
  remoteRoom?: string[];
  mininglinks?: string[] | undefined;
  spawnlinks?: string[] | undefined;
  controllerlinks?: string[] | undefined;
  availBoost?: { [name: string]: string; };
  rally?: RoomPosition;
  battery?: string;
  buildState?: number;
  supervisor?: LightRoomPos[];
  spawnRoom?: string;
  controllerBattery?: string;
  avoid?: number;
}

interface LayoutMemory {
  name: string;
  flagName: string;
}

interface Memory {
  uuid: number;
  log: any;
  empire: any;
  // profiler: { [identifier: string]: ProfilerData };
  cpu: {
    history: number[];
    average: number;
  };
}

/*interface ProfilerData {
  startOfPeriod: number;
  lastTickTracked: number;
  total: number;
  count: number;
  costPerCall: number;
  costPerTick: number;
  callsPerTick: number;
  cpu: number;
  consoleReport: boolean;
  period: number;
}*/

interface WorldMap {
  controlledRooms: { [roomName: string]: Room };
  init(): { [roomName: string]: SpawnRoom };
  expandInfluence(spawn: SpawnRoom): string[];
}

// interface IMission {
//   name: string;
//   operation: IOperation;

//   roles: { [roleName: string]: Creep[] };
// }

// interface IOperation {
//   name: string;
//   type: string;

//   flag: Flag;
//   room: Room | undefined;

//   missions: { [missionName: string]: IMission };

//   init(): void;
// }

interface SpawnRoom {
  spawns: StructureSpawn[];
  room: Room;
  availableSpawnCount: number;
  availableSpawnEnergy: number;
  logistics: any;
  createCreep(bodyParts: string[] | null, role: string, memory?: any, room?: Room, creepName?: string): boolean;
}

interface Empire {
  spawnRooms: { [roomName: string]: SpawnRoom };
  map: WorldMap;
  // operations: { [operationName: string]: IOperation };
  // init(): void;
  getSpawnRoom(roomName: string): any;
}

interface RCLRoomLayout {
  anchor: LightRoomPos;
  road: LightRoomPos[];
  [RCL: number]: RoomLayout;
}

interface RoomLayout {
  build: { [key: string]: LightRoomPos[] };
  memory?: any;
}

interface LightRoomPos {
  x: number;
  y: number;
}

interface SquadComposition {
  archer?: number;
  healer?: number;
  siege?: number;
  brawler?: number;
}

interface Squad {
  name: string;
  composition: SquadComposition;
  members: string[];
  assignedRoom: string;
}

declare const enum RoomStates {
  NONE = 0,
  WAR = 1,
  NEUTRAL = 2,
  MINE = 3,
  CLAIM = 4,
  BOOTSTRAP = 5,
  TRANSITION = 6,
  STABLE = 7
}

declare const __REVISION__: string;
