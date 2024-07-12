// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { IOPointInterface, IOPoint, IOSystemInterface, IOSystem } from "./api_models";

export interface DocumentMetadataInterface {
  commit_serial_number: number;
  document_type: string;
  machine_startup_time: Date;
  machine_uid: string;
  plan_id: string | undefined;
  experiment_id: string | undefined;
}

// export interface SystemSignalsInterface {
//   system_state: string;
//   alarm_active: boolean;
//   estop_active: boolean;
//   alarms_overridden: boolean;
// }

// export interface ControlLoopInterface {
//   controller_state: string;
//   enabled: boolean;
//   state_variables: { [key: string]: string | number | boolean };
//   parameters: { [key: string]: number | boolean };
// }

// export interface ParameterDataInterface {
//   value: boolean | number;
//   alarms: { [key: number]: AlarmDataInterface };
//   interlocks: { [key: number]: InterlockDataInterface };
// }

// export interface DatabaseDocumentInterface {
//   _id: string;
//   metadata: DocumentMetadataInterface;
//   record_hash: string;
//   timestamp: Date;
//   timestamp_seconds: number;
//   system_signals: SystemSignalsInterface;
//   component_signals: {
//     [key: string]: HardwareComponentInterface;
//   };
//   control_loops: {
//     [key: string]: ControlLoopInterface;
//   };
// }

export interface DatabaseFrontendMessageInterface {
  _id: string;
  metadata: DocumentMetadataInterface;
  record_hash: string;
  timestamp: Date;
  timestamp_seconds: number;
  severity: string;
  message: string;
}

export interface IOChannelStateInterface {
  channel_index: number;
  value: number;
  point_type: string;
}

export interface IOModuleStateInterface {
  name: string;
  module_index: number;
  channels: Array<IOChannelStateInterface>;
}

export class DocumentMetadata {
  commit_serial_number: number = -1;
  document_type: string = "";
  machine_startup_time: Date = new Date("1970");
  machine_uid: string = "";
  plan_id: string | undefined;
  experiment_id: string | undefined;

  constructor(metadata?: DocumentMetadataInterface) {
    if (metadata != undefined) {
      this.commit_serial_number = metadata.commit_serial_number;
      this.document_type = metadata.document_type;
      this.machine_startup_time = metadata.machine_startup_time;
      this.machine_uid = metadata.machine_uid;
      this.plan_id = metadata.plan_id;
      this.experiment_id = metadata.experiment_id;
    }
  }
}

// export interface AlarmDataInterface {
//   active: boolean;
//   enabled: boolean;
//   overridden: boolean;
// }

// export interface InterlockDataInterface {
//   armed: boolean;
//   enabled: boolean;
// }

// export class AlarmData {
//   active: boolean = false;
//   enabled: boolean = false;
//   overridden: boolean = false;

//   constructor(alarm_data: AlarmDataInterface) {
//     this.active = alarm_data.active;
//     this.enabled = alarm_data.enabled;
//     this.overridden = alarm_data.overridden;
//   }
// }

// export class InterlockData {
//   armed: boolean = false;
//   enabled: boolean = false;

//   constructor(interlock_data: InterlockDataInterface) {
//     this.armed = interlock_data.armed;
//     this.enabled = interlock_data.enabled;
//   }
// }

// export class ParameterData {
//   value: boolean | number = 0;
//   alarms: Array<AlarmData> = [];
//   interlocks: Array<InterlockData> = [];

//   constructor(input: ParameterDataInterface) {
//     if (input.value != undefined) {
//       this.value = input.value;
//     }

//     if (input.alarms != undefined) {
//       for (const key of Object.keys(input.alarms)) {
//         const alarm = input.alarms[parseInt(key)];
//         this.alarms.push(new AlarmData(alarm));
//       }
//     }

//     if (input.interlocks != undefined) {
//       for (const key of Object.keys(input.interlocks)) {
//         const interlock = input.interlocks[parseInt(key)];
//         this.interlocks.push(new InterlockData(interlock));
//       }
//     }
//   }
// }

// export interface HardwareComponentInterface {
//   [key: string]: ParameterDataInterface;
// }

// export class HardwareComponent {
//   [key: string]: ParameterData; // = {}

//   constructor(input?: HardwareComponentInterface) {
//     if (input != undefined) {
//       for (const key of Object.keys(input)) {
//         this[key] = new ParameterData(input[key]);
//       }
//     }
//   }
// }

// export interface ComponentSignalsInterface {
//   [key: string]: HardwareComponentInterface;
// }

// export class ComponentSignals {
//   [key: string]: HardwareComponent;

//   constructor(input?: ComponentSignalsInterface) {
//     if (input != undefined) {
//       for (const key of Object.keys(input)) {
//         this[key] = new HardwareComponent(input[key]);
//       }
//     }
//   }
// }

// export class ControlLoop {
//   controller_state: string = "";
//   enabled: boolean = false;
//   state_variables: {
//     [key: string]: string | number | boolean;
//   } = {};
//   parameters: {
//     [key: string]: number | boolean;
//   } = {};

//   constructor(data?: ControlLoopInterface) {
//     if (data != undefined) {
//       this.controller_state = data.controller_state;
//       this.enabled = data.enabled;
//       this.state_variables = data.state_variables;
//       this.parameters = data.parameters;
//     }
//   }
// }

// export class ControlLoops {
//   [key: string]: ControlLoop;

//   constructor(loops?: { [key: string]: ControlLoopInterface }) {
//     if (loops != undefined) {
//       for (const key of Object.keys(loops)) {
//         this[key] = new ControlLoop(loops[key]);
//       }
//     }
//   }
// }

// export class SystemSignals {
//   system_state: string = "";
//   alarm_active: boolean = false;
//   estop_active: boolean = false;
//   alarms_overridden: boolean = false;
//   // [key: string]: string

//   constructor(input?: SystemSignalsInterface) {
//     if (input != undefined) {
//       Object.assign(this, input);
//     }
//   }
// }

export class DatabaseFrontendMessage {
  _id: string = "";
  metadata: DocumentMetadata = new DocumentMetadata();
  record_hash: string = "";
  timestamp: Date = new Date("1970");
  timestamp_seconds: number = 0;
  severity: string = "";
  message: string = "";

  constructor(document?: DatabaseFrontendMessageInterface) {
    if (document != undefined) {
      this._id = document._id;
      this.timestamp = document.timestamp;
      this.timestamp_seconds = document.timestamp_seconds;
      this.metadata = new DocumentMetadata(document.metadata);
      this.message = document.message;
      this.severity = document.severity;
    }
  }
}

// export class IOChannelState {
//   channel_index: number = -1;
//   value: number = -1;
//   point_type: string = "";

//   constructor(input?: IOChannelStateInterface) {
//     Object.assign(this, input);
//   }
// }

// export class IOModuleState {
//   name: string = "";
//   module_index: number = -1;
//   channels: Array<IOChannelState> = [];

//   constructor(input?: IOModuleStateInterface) {
//     if (input != undefined) {
//       this.name = input.name;
//       this.module_index = input.module_index;
//       input.channels.forEach((channel) => {
//         this.channels.push(new IOChannelState(channel));
//       });
//     }
//   }

//   get_io_point_state(channel_index: number) {
//     return this.channels[channel_index - 1];
//   }
// }

// export class DatabaseIOState {
//   _id: string = "";
//   metadata: DocumentMetadata = new DocumentMetadata();
//   record_hash: string = "";
//   timestamp: Date = new Date("1970");
//   timestamp_seconds: number = 0;
//   modules: Array<IOModuleState> = [];

//   constructor(document?: DatabaseIOStateInterface) {
//     if (document != undefined) {
//       this._id = document._id;
//       this.timestamp = document.timestamp;
//       this.timestamp_seconds = document.timestamp_seconds;
//       this.metadata = new DocumentMetadata(document.metadata);
//       document.modules.forEach((module) => {
//         this.modules.push(new IOModuleState(module));
//       });
//     }
//   }

//   get_module_state(module_index: number) {
//     return this.modules[module_index - 1];
//   }
// }

// export class IOPoint implements IOPointInterface

export interface DatabaseDocumentInterface {
  _id: string;
  metadata: DocumentMetadataInterface;
  record_hash: string;
  timestamp: Date;
  timestamp_seconds: number;
  // system_signals: SystemSignalsInterface;
  // component_signals: {
  //   [key: string]: HardwareComponentInterface;
  // };
  // control_loops: {
  //   [key: string]: ControlLoopInterface;
  // };
}

export class DatabaseDocument implements DatabaseDocumentInterface {
  _id: string = "";
  metadata: DocumentMetadata = new DocumentMetadata();
  record_hash: string = "";
  timestamp: Date = new Date("1970");
  timestamp_seconds: number = 0;

  constructor(document?: DatabaseDocumentInterface) {
    if (document != undefined) {
      this._id = document._id;
      this.metadata = new DocumentMetadata(document.metadata);
      // this.component_signals = new ComponentSignals(document.component_signals);
      // this.control_loops = new ControlLoops(document.control_loops);
      // this.system_signals = new SystemSignals(document.system_signals);
      this.record_hash = document.record_hash;
      this.timestamp = document.timestamp;
      this.timestamp_seconds = document.timestamp_seconds;
    }
  }

}

export interface DatabaseIOStateInterface extends DatabaseDocumentInterface {
  // _id: string;
  // metadata: DocumentMetadataInterface;
  // record_hash: string;
  // timestamp: Date;
  // timestamp_seconds: number;
  // modules: Array<IOModuleStateInterface>;
  // io_points: Array<IOPointInterface>;
  io_system: IOSystemInterface | null;
}

export class DatabaseIOState extends DatabaseDocument implements DatabaseIOStateInterface {
  // _id: string = "";
  // metadata: DocumentMetadata = new DocumentMetadata();
  // record_hash: string = "";
  // timestamp: Date = new Date("1970");
  // timestamp_seconds: number = 0;
  // modules: Array<IOModuleState> = [];
  // io_points: Array<IOPoint> = [];
  // digital_inputs: IOPort = new IOPointControl();
  //{[key: string]: value}: IOSystemInterface;
  io_system: IOSystemInterface | null = null;

  // state_variables: { [key: string]: string | number | boolean };

  constructor(document?: DatabaseIOStateInterface) {
    super(document);
    if (document != undefined) {
      // this._id = document._id;
      // this.timestamp = document.timestamp;
      // this.timestamp_seconds = document.timestamp_seconds;
      // this.metadata = new DocumentMetadata(document.metadata);
      if (document.io_system != null) {
        this.io_system = new IOSystem(document.io_system);
      }
      
      // document.io_points.forEach((io_point) => {
      //   this.io_points.push(new IOPoint(io_point))
      // })
      // document.modules.forEach((module) => {
      //   this.modules.push(new IOModuleState(module));
      // });
    }
  }

  // get_module_state(module_index: number) {
  //   return this.modules[module_index - 1];
  // }

  // get_point_state(point_index: number) {
  //   return this.io_points[point_index].state;
  // }
}

// export class DatabaseDocument {
//   _id: string = "";
//   metadata: DocumentMetadata = new DocumentMetadata();
//   record_hash: string = "";
//   timestamp: Date = new Date("1970");
//   timestamp_seconds: number = 0;
//   component_signals: ComponentSignals = new ComponentSignals();
//   control_loops: ControlLoops = new ControlLoops();
//   system_signals: SystemSignals = new SystemSignals();

//   constructor(document?: DatabaseDocumentInterface) {
//     if (document != undefined) {
//       this._id = document._id;
//       this.metadata = new DocumentMetadata(document.metadata);
//       this.component_signals = new ComponentSignals(document.component_signals);
//       this.control_loops = new ControlLoops(document.control_loops);
//       this.system_signals = new SystemSignals(document.system_signals);
//       this.record_hash = document.record_hash;
//       this.timestamp = document.timestamp;
//       this.timestamp_seconds = document.timestamp_seconds;
//     }
//   }

//   GetComponentParameterState(
//     component_name: string,
//     parameter_name: string,
//   ): number | boolean {
//     let state: number | boolean;
//     try {
//       state = this.component_signals[component_name][parameter_name].value;
//     } catch (e) {
//       console.log(
//         `Parameter ${parameter_name} not found on component ${component_name}`,
//       );
//       state = 0;
//     }

//     return state;
//   }

//   GetComponentParameters(
//     component_name: string,
//   ): HardwareComponent | undefined {
//     return this.component_signals[component_name];
//   }

//   public get hardware_components(): string[] {
//     return Object.keys(this.component_signals);
//   }

//   public get document_valid(): boolean {
//     return Object.keys(this.component_signals).length != 0;
//   }

//   public get machine_state(): string {
//     if (this.document_valid) {
//       return this.system_signals.system_state;
//     } else {
//       return "UNAVAILABLE";
//     }
//     // this.document_valid ? return this.system_signals.system_state : return "NONE";
//   }

//   public get estop_active(): boolean {
//     if (this.document_valid) {
//       return this.system_signals.estop_active;
//     } else {
//       return false;
//     }
//   }

//   public get alarm_active(): boolean {
//     if (this.document_valid) {
//       return this.system_signals.alarm_active;
//     } else {
//       return false;
//     }
//   }

//   public get alarms_overridden(): boolean {
//     if (this.document_valid) {
//       return this.system_signals.alarms_overridden;
//     } else {
//       return false;
//     }
//   }

//   public get plan_id(): string | undefined {
//     if (!this.document_valid) {
//       return undefined;
//     } else {
//       return this.metadata.plan_id;
//     }
//   }

//   public get experiment_id(): string | undefined {
//     if (!this.document_valid) {
//       return undefined;
//     } else {
//       return this.metadata.experiment_id;
//     }
//   }
// }

export interface DataPointsInterface {
  x_values: Array<number>;
  y_values: Array<number>;
}

//////////////////////////////////////////////////////////////
//// DATABASE RETURN VALUES
//////////////////////////////////////////////////////////////

export class DocumentArray {
  protected _documents: Array<any> = [];

  public get latest_document() {
    return this._documents[0];
  }

  public get documents() {
    return this._documents;
  }

  public serialize(): string {
    // const json_value = JSON.parse(JSON.stringify(this));
    return JSON.parse(JSON.stringify(this._documents));
  }
}

export class DatabaseIOStateArray extends DocumentArray {
  protected _documents: Array<DatabaseIOState> = [];

  constructor(input_documents?: Array<DatabaseIOStateInterface>) {
    super();
    if (input_documents != undefined) {
      input_documents.forEach((input_doc) => {
        this.add_document(input_doc);
      });
    }
  }

  public get state_valid() {
    return this._documents.length > 0;
  }

  // public get latest_document() {
  //   return this._documents[0];
  // }

  // public get documents() {
  //   return this._documents;
  // }

  add_document(document: DatabaseIOStateInterface) {
    this._documents.push(new DatabaseIOState(document));
  }
}

export class DatabaseMessageArray extends DocumentArray {
  protected _documents: Array<DatabaseFrontendMessage> = [];

  constructor(input_documents?: Array<DatabaseFrontendMessageInterface>) {
    super();
    if (input_documents != undefined) {
      input_documents.forEach((input_doc) => {
        this.add_document(input_doc);
      });
    }
  }

  add_document(document: DatabaseFrontendMessageInterface) {
    this._documents.push(new DatabaseFrontendMessage(document));
  }
}

export class DatabaseDocumentArray extends DocumentArray {
  protected _documents: Array<DatabaseDocument> = [];

  constructor(input_documents?: Array<DatabaseDocumentInterface>) {
    super();
    if (input_documents != undefined) {
      input_documents.forEach((input_doc) => {
        this.add_document(input_doc);
      });
    }
  }

  add_document(document: DatabaseDocumentInterface) {
    this._documents.push(new DatabaseDocument(document));
  }

  // get_data_points(
  //   component_name: string,
  //   parameter_name: string,
  //   number_of_points: number,
  //   reverse_order: boolean = false,
  // ): DataPointsInterface {
  //   const x_values: Array<number> = [];
  //   const y_values: Array<number> = [];

  //   if (number_of_points > this._documents.length)
  //     number_of_points = this._documents.length;

  //   for (let i = 0; i < number_of_points; i++) {
  //     x_values.push(this._documents[i].timestamp_seconds);
  //     try {
  //       y_values.push(
  //         this._documents[i].component_signals[component_name][parameter_name]
  //           .value as number,
  //       );
  //     } catch (e) {
  //       console.log(
  //         `Unknown parameter ${parameter_name} for component ${component_name}`,
  //       );
  //       y_values.push(0);
  //     }
  //   }

  //   if (reverse_order) {
  //     return {
  //       x_values: x_values.reverse(),
  //       y_values: y_values.reverse(),
  //     };
  //   } else {
  //     return {
  //       x_values: x_values,
  //       y_values: y_values,
  //     };
  //   }
  // }

  // public get latest_document() {
  //   return this._documents[0];
  // }

  // public get documents() {
  //   return this._documents;
  // }
}
