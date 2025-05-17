import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Organe, Caracteristique, Marque, OrganeEquipement } from '../models/organe.model';

@Injectable({
  providedIn: 'root'
})
export class OrganeService {
  private baseUrl = 'http://localhost:5186/api/organe'; // Attention casse correcte: "organe"
  private apiUrl = 'http://localhost:5186/api/OrganeEquipement';

  constructor(private http: HttpClient) {}

  // Récupérer tous les organes avec recherche + tri
  getOrganes(search = '', sortBy = '', ascending = true): Observable<Organe[]> {
    let params = new HttpParams();
    if (search) params = params.set('searchTerm', search);
    if (sortBy) params = params.set('sortBy', sortBy);
    params = params.set('ascending', ascending.toString());

    return this.http.get<Organe[]>(`${this.baseUrl}`, { params });
  }

  // Créer un nouvel organe - Le code est AUTO-GÉNÉRÉ par le backend, donc on ne l'envoie pas
  createOrgane(data: {
    libelle_organe: string;
    id_marque: number;
    caracteristiques: { id_caracteristique: number; valeur: string }[];
  }): Observable<any> {
    return this.http.post(`${this.baseUrl}`, data);
  }

  //  Modifier un organe existant
  updateOrgane(id: number, data: {
    libelle_organe: string;
    id_marque: number;
    caracteristiques: { id_caracteristique: number; valeur: string }[];
  }): Observable<any> {
    return this.http.put(`${this.baseUrl}/${id}`, data);
  }

  //  Supprimer un organe
  deleteOrgane(id: number): Observable<any> {
    return this.http.delete(`${this.baseUrl}/${id}`);
  }

  // Vérifier si l'organe peut être supprimé (pas lié à un équipement)
  canDelete(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.baseUrl}/canDelete/${id}`);
  }

  
  getCaracteristiques(): Observable<Caracteristique[]> {
    return this.http.get<Caracteristique[]>('http://localhost:5186/api/caracteristique');
  }

  getMarques(): Observable<Marque[]> {
    return this.http.get<Marque[]>('http://localhost:5186/api/marque');
  }

  getOrganeCount(): Observable<number> {
    return this.http.get<number>(`${this.baseUrl}/count`);
  }

  getByEquipementId(equipementId: number): Observable<OrganeEquipement[]> {
    return this.http.get<OrganeEquipement[]>(`${this.apiUrl}/equipement/${equipementId}`);
  }
}
