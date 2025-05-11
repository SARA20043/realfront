import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { Equipement, CreateEquipement, UpdateEquipement, EquipementFilter } from '../models/equipement.model';

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
} 