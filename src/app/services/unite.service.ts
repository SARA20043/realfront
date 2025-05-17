import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Unite, Region, Wilaya } from '../models/unite.model';

@Injectable({
  providedIn: 'root'
})
export class UniteService {
  private apiUrl = 'http://localhost:5186/api/unite';

  constructor(private http: HttpClient) {}

  getUnites(searchTerm = '', sortBy = 'idunite', ascending = true): Observable<Unite[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('sortBy', sortBy)
      .set('ascending', ascending.toString());

    return this.http.get<Unite[]>(this.apiUrl, { params });
  }
  createUnite(dto: { designation: string, idwilaya: number, idregion: number }): Observable<Unite> {
    return this.http.post<Unite>(this.apiUrl, dto);
  }

  updateUnite(id: number, dto: { designation: string, idwilaya: number, idregion: number }): Observable<Unite> {
    return this.http.put<Unite>(`${this.apiUrl}/${id}`, dto);
  }
  canDelete(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/canDelete/${id}`);
  }


  deleteUnite(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  getWilayas(): Observable<Wilaya[]> {
    return this.http.get<Wilaya[]>(`${this.apiUrl}/wilayas`);
  }

  getRegions(): Observable<Region[]> {
    return this.http.get<Region[]>(`${this.apiUrl}/regions`);
  }

  getUniteById(id: number): Observable<Unite> {
    return this.http.get<Unite>(`${this.apiUrl}/${id}`);
  }
  getUniteCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
  
}




