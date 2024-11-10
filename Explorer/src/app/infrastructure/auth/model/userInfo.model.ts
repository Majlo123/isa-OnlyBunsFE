import { Address } from "./Address.model";

export interface UserInfo {
    username: string;
    email: string;
    address: Address;
    firstName: string;
    lastName: string;
}