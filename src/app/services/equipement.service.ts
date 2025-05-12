import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Equipement, CreateEquipement, UpdateEquipement, EquipementFilter } from '../models/equipement.model';
import { Caracteristique } from '../models/caracteristique.model';

@Injectable({
    providedIn: 'root'
})
export class EquipementService {
    private apiUrl = `${environment.apiUrl}/equipement`;

    constructor(private http: HttpClient) { }

    getAll(filter?: EquipementFilter): Observable<Equipement[]> {
        let params = new HttpParams();
        if (filter) {
            if (filter.search) {
                params = params.set('searchTerm', filter.search);
            }
            if (filter.sortBy) {
                params = params.set('sortBy', filter.sortBy);
            }
            if (filter.ascending !== undefined) {
                params = params.set('ascending', filter.ascending.toString());
            }
        }
        return this.http.get<Equipement[]>(this.apiUrl, { params });
    }

    getById(id: number): Observable<Equipement> {
        return this.http.get<Equipement>(`${this.apiUrl}/${id}`);
    }

    getByCode(code: string): Observable<Equipement> {
        return this.http.get<Equipement>(`${this.apiUrl}/code/${code}`);
    }

    create(equipement: CreateEquipement): Observable<Equipement> {
        return this.http.post<Equipement>(this.apiUrl, equipement);
    }

    update(id: number, equipement: UpdateEquipement): Observable<Equipement> {
        return this.http.put<Equipement>(`${this.apiUrl}/${id}`, equipement);
    }

    delete(id: number): Observable<boolean> {
        return this.http.delete<boolean>(`${this.apiUrl}/${id}`);
    }

    getCaracteristiquesByTypeAndMarque(typeId: number, marqueId: number) {
        return this.http.get<Caracteristique[]>(`${environment.apiUrl}/Caracteristique/type/${typeId}/marque/${marqueId}`);
    }

    bulkCreateCaracteristiqueEquipement(dto: { ideqpt: number, caracteristiques: { idcarac: number, valeur: string }[] }) {
        return this.http.post(`${environment.apiUrl}/CaracteristiqueEquipement/bulk`, dto);
    }

    getOrganesByTypeAndMarque(typeId: number, marqueId: number) {
        return this.http.get<any[]>(`${environment.apiUrl}/Organe/type/${typeId}/marque/${marqueId}`);
    }

    postOrganeEquipement(dto: { ideqpt: number, organes: { idorg: number, numsérie: string }[] }) {
        return this.http.post(`${environment.apiUrl}/OrganeEquipement`, dto);
    }

    getOrganesForEquipement(ideqpt: number) {
        return this.http.get<any[]>(`${environment.apiUrl}/OrganeEquipement/equipement/${ideqpt}`);
    }

    getCaracteristiquesForEquipement(ideqpt: number) {
        return this.http.get<any[]>(`${environment.apiUrl}/CaracteristiqueEquipement/equipement/${ideqpt}?showValue=true`);
    }

    postAffectation(dto: { ideqpt: number, idunite: number, dateaffec: string }) {
        return this.http.post(`${environment.apiUrl}/Affectation`, dto);
    }
} 