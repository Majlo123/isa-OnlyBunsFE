import { Address } from "./Address.model";

export interface Registration {
    firstName: string,
    lastName: string,
    email: string,
    username: string,
    password: string,
    address: Address

}