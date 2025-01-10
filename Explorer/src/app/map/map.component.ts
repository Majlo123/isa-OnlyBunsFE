import { Component, AfterViewInit, Input, Output, EventEmitter, ViewContainerRef, ViewChild, ComponentRef } from '@angular/core';
import * as L from 'leaflet';
import { GeocodingService } from '../nearby-posts/nearby-posts.service';
import { Address } from '../infrastructure/auth/model/Address.model';
import { Post } from '../post.model';
import { PopupContentComponent } from '../one-post/one-post.component';
import { BunnyHealthCare, InstitutionType } from '../bunnyHealthCare.model';

@Component({
    selector: 'xp-map',
    templateUrl: './map.component.html',
    styleUrls: ['./map.component.css']
})
export class MapComponent implements AfterViewInit {
    @ViewChild('popupContainer', { read: ViewContainerRef, static: true })
    popupContainer!: ViewContainerRef;
    map: any;

    @Input() isModalMap: boolean = false;
    @Input() uniqueId: string = '';
    @Input() initialCenter: [number, number] = [45.2396, 19.8227];
    @Input() initialZoom: number = 13;
    @Input() address: Address | undefined;
    @Input() posts: Post[] | undefined;
    @Input() institutions: BunnyHealthCare[] | undefined;
    constructor(private geocodingService: GeocodingService) { }
    private initMap(): void {

        if (this.map) {
            return;
        }
        const mapElementId = 'map' + this.uniqueId;
        this.map = L.map(mapElementId, {
            center: this.initialCenter,
            zoom: this.initialZoom,

        });

        const tiles = L.tileLayer(
            'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
            {
                maxZoom: 18,
                minZoom: 3,
                attribution:
                    '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',
            }
        );
        tiles.addTo(this.map);
        console.log("POSTS: ", this.posts)
        if (this.address) {
            this.focusOnAddress(this.address);
        }
        if (this.posts) {
            this.showPosts(this.posts)
        }
        if(this.institutions) {
            this.showInstitutions(this.institutions)
        }
    }
    ngAfterViewInit(): void {
        console.log("Modal map component after view init...");

        let DefaultIcon = L.icon({
            iconUrl: 'https://unpkg.com/leaflet@1.6.0/dist/images/marker-icon.png',
        });

        L.Marker.prototype.options.icon = DefaultIcon;
        this.initMap();

        if (this.isModalMap) {
            console.log("Initializing map inside modal...");
            this.invalidateSize();
            //this.setUniqueMarker(this.initialCheckpoint.lat, this.initialCheckpoint.lng);
        }

    }
    public invalidateSize(): void {
        if (this.map) {
            console.log("Invalidating map size");
            setTimeout(() => {
                this.map.invalidateSize();
            }, 200);
        } else {
            console.log("Mapa nije inicijalizovana, ne mogu da izvršim invalidaciju.");
        }

    }
    focusOnAddress(address: Address): void {
        const fullAddress = `${address.number} ${address.street}, ${address.city}, ${address.country}`;
        console.log("FOKUSIRAJ: ", fullAddress)
        this.geocodingService.getCoordinates(fullAddress).subscribe((data: any) => {
            if (data.length > 0) {
                const lat = parseFloat(data[0].lat);
                const lon = parseFloat(data[0].lon);

                if (this.map) {
                    this.map.setView([lat, lon], 15); // Zoom level 15
                    L.marker([lat, lon])
                        .addTo(this.map)
                        .bindPopup(`Address: ${fullAddress}`)
                        .openPopup();
                }
            } else {
                console.error('Address not found.');
            }
        });
    }
    showPosts(posts: Post[]): void {
        const postIcon = L.icon({
            iconUrl: 'assets/images/postIcon.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        if (this.map) {
            posts.forEach(post => {
                const marker = L.marker([post.latitude, post.longitude], { icon: postIcon })
                    .addTo(this.map);
                marker.bindPopup('<div id="popup-content"></div>', {
                    maxWidth: 600, // Set the maximum width
                    minWidth: 300, // Optional: Set a minimum width
                  });

                marker.on('popupopen', () => {
                    const popupContent = document.getElementById('popup-content');

        if (popupContent) {
          // Clear the container
          this.popupContainer.clear();

          // Dynamically create and inject the component
          const componentRef: ComponentRef<PopupContentComponent> =
            this.popupContainer.createComponent(PopupContentComponent);

          // Pass data to the component
          componentRef.instance.post = post;
          

          // Append the component's element to the popup
          popupContent.appendChild(componentRef.location.nativeElement);
                    }
                })

                //.bindPopup(`Opis: ${post.description}`)
                //.openPopup();
            });

        }
        else {
            console.error('Address not found.');
        }
    }
    showInstitutions(institutions: BunnyHealthCare[]): void {
        const shelterIcon = L.icon({
            iconUrl: 'assets/images/shelter.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        const vetIcon = L.icon({
            iconUrl: 'assets/images/vet.png',
            iconSize: [32, 32],
            iconAnchor: [16, 32],
            popupAnchor: [0, -32]
        });
        institutions = Array.isArray(institutions) ? institutions : [institutions];
        let icon = shelterIcon

        console.log("IS ARRAY: ", Array.isArray(institutions))
        if(this.map){
        institutions.forEach(institution => {
            console.log("INSTITUTION: ",institution)
            if(institution.type.toLocaleString() == "Shelter"){
                icon = shelterIcon
            }else{
                icon = vetIcon
            }
            const marker = L.marker([institution.latitude, institution.longitude], { icon: icon })
                .addTo(this.map);
            
            marker.bindPopup(`<div id="popup-content"> <p>Name: ${institution.name}</p>
                <p>Type: ${institution.type}</p></div>`, {
                maxWidth: 600, // Set the maximum width
                minWidth: 300, // Optional: Set a minimum width
              });

            marker.on('popupopen', () => {
                const popupContent = document.getElementById('popup-content');
            });
        })
    }
    }
    ngOnDestroy(): void {
        // Očistite mapu kada se komponenta uništi
        if (this.map) {
            this.map.remove();
        }
    }
}