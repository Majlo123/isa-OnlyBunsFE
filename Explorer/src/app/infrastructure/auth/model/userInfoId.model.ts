import { Address } from "./Address.model";

export interface UserInfoId {
    id: number;
    username: string;
    email: string;
    address: Address;
    firstName: string;
    lastName: string;
    followersCount: number;
}