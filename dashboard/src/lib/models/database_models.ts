// Frontend Web Application for RA Products
// Developed by R2 Labs for Seabound Carbon

import { ROSTimestamp } from "@/lib/models/shared_ros_types";
import { IRosTypeR2CInterfacesEncoderEstimates } from "@/lib/models/ros_types";

export interface DocumentMetadataInterface {
  commit_serial_number: number;
  document_type: string;
  machine_startup_time: Date;
  machine_uid: string;
  plan_id: string | undefined;
  experiment_id: string | undefined;
}

export interface DatabaseFrontendMessageInterface {
  _id: string;
  metadata: DocumentMetadataInterface;
  record_hash: string;
  timestamp: Date;
  timestamp_seconds: number;
  severity: string;
  message: string;
}

export class DocumentMetadata implements DocumentMetadataInterface {
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

export interface DatabaseDocumentInterface {
  _id: string;
  metadata: DocumentMetadataInterface;
  record_hash: string;
  timestamp: Date;
  timestamp_seconds: number;
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
      this.record_hash = document.record_hash;
      this.timestamp = document.timestamp;
      this.timestamp_seconds = document.timestamp_seconds;
    }
  }

  public get document_valid() : boolean {
    return this.record_hash != "";
  }

}

export interface DatabaseDocumentIOPointInterface {
  configured: boolean
  state?: number | boolean
}

export class DatabaseDocumentIOPoint implements DatabaseDocumentIOPointInterface {
  configured: boolean
  state?: number | boolean

  constructor(input: DatabaseDocumentIOPointInterface) {
    this.configured = input.configured;
    this.state = input.state;
  }
}

export interface DatabaseDocumentIOPortInterface {
  points: DatabaseDocumentIOPointInterface[]
}

export class DatabaseDocumentIOPort implements DatabaseDocumentIOPortInterface {
  points: DatabaseDocumentIOPoint[]

  constructor(input: DatabaseDocumentIOPortInterface) {
    this.points = new Array<DatabaseDocumentIOPoint>;

    input.points.forEach((p) => {
      this.points.push(new DatabaseDocumentIOPoint(p))
    })
  }
}

export interface DatabaseIOStateInterface extends DatabaseDocumentInterface {
  digital_inputs: DatabaseDocumentIOPortInterface
  digital_outputs: DatabaseDocumentIOPortInterface
}

export class DatabaseIOState extends DatabaseDocument implements DatabaseIOStateInterface {
  digital_inputs: DatabaseDocumentIOPort;
  digital_outputs: DatabaseDocumentIOPort;

  constructor(document?: DatabaseIOStateInterface) {
    super(document);
    if (document != undefined) {
      this.digital_inputs = new DatabaseDocumentIOPort(document.digital_inputs);
      this.digital_outputs = new DatabaseDocumentIOPort(document.digital_outputs);
    }
  }
}

export interface ROSIOStateInterface extends DatabaseDocumentInterface {
  values: Record<string, number> | Array<boolean>
  stamp: ROSTimestamp
  time_sec: number
  time_nsec: number
}

export class ROSIOState extends DatabaseDocument implements ROSIOStateInterface {
  values: Record<string, number> | Array<boolean>
  stamp: ROSTimestamp
  time_sec: number
  time_nsec: number

  constructor(document?: ROSIOStateInterface) {
    super(document);
    if (document != undefined) {
      this.values = document.values;
      this.stamp = document.stamp;
      this.time_nsec = document.time_nsec;
      this.time_sec = document.time_sec;
      // this.digital_inputs = new DatabaseDocumentIOPort(document.digital_inputs);
      // this.digital_outputs = new DatabaseDocumentIOPort(document.digital_outputs);
    }
  }
}

export interface ROSAxisStateInterface extends DatabaseDocumentInterface, IRosTypeR2CInterfacesEncoderEstimates {
  // stamp: ROSTimestamp
  // velocity: number
  // position: number
  // axis_index: number
}

export class ROSAxisState extends DatabaseDocument implements ROSAxisStateInterface {
  stamp: ROSTimestamp
  velocity: number
  position: number
  axis_index: number

  constructor(document?: ROSAxisStateInterface) {
    super(document);
    if (document != undefined) {
      this.stamp = document.stamp;
      this.axis_index = document.axis_index;
      this.velocity = document.velocity;
      this.position = document.position;
    }
  }
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
    return JSON.parse(JSON.stringify(this._documents));
  }
}

// export class DatabaseIOStateDocumentArray extends DocumentArray {
//   protected _documents: Array<DatabaseIOState> = [];

//   constructor(input_documents?: Array<DatabaseIOStateInterface>) {
//     super();
//     if (input_documents != undefined) {
//       input_documents.forEach((input_doc) => {
//         this.add_document(input_doc);
//       });
//     }
//   }

//   public get state_valid() {
//     return this._documents.length > 0;
//   }

//   add_document(document: DatabaseIOStateInterface) {
//     this._documents.push(new DatabaseIOState(document));
//   }
// }

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

export class DatabaseROSIOStateArray extends DocumentArray {
  protected _documents: Array<ROSIOState> = [];

  public get documents() {
    return this._documents;
  }

  constructor(input_documents?: Array<ROSIOStateInterface>) {
    super();
    if (input_documents != undefined) {
      input_documents.forEach((input_doc) => {
        this.add_document(input_doc);
      });
    }
  }

  add_document(document: ROSIOStateInterface) {
    this._documents.push(new ROSIOState(document));
  }
}

export class DatabaseROSAxisStateArray extends DocumentArray {
  protected _documents: Array<ROSAxisState> = [];

  public get documents() {
    return this._documents;
  }

  constructor(input_documents?: Array<ROSAxisStateInterface>) {
    super();
    if (input_documents != undefined) {
      input_documents.forEach((input_doc) => {
        this.add_document(input_doc);
      });
    }
  }

  add_document(document: ROSAxisStateInterface) {
    this._documents.push(new ROSAxisState(document));
  }
}
