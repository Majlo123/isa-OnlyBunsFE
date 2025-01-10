import { Component, OnInit } from "@angular/core";
import { BunnyHealthCare } from "src/app/bunnyHealthCare.model";
import { HealthCareService } from "./health-care.service";

@Component({
    selector: 'health-care',
    templateUrl: './health-care.component.html',
    styleUrls: ['./health-care.component.css']
  })
  export class HealthCareComponent implements OnInit {
  
    institutions: BunnyHealthCare[]
    constructor(private healthCareService: HealthCareService){}
    
    ngOnInit(): void {
        this.healthCareService.getInstitutions().subscribe(
            (data: BunnyHealthCare[]) => {
                this.institutions = data
                
            }
        )    
    }
}