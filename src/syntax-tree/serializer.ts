import * as ast from "./ast";

export interface Serializable {
    serialize(): string;
}
