import { Location } from "@angular/common"

export class BunnyHealthCare {
    id: number
    name: string
    latitude: number
    longitude: number
    type: InstitutionType

}
export enum InstitutionType {
    Shelter,
    Vet
}