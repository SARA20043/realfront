import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import { TypeEqpt } from '../models/typeeq.model';

@Injectable({
  providedIn: 'root'
})
export class TypeService {
  private apiUrl = 'http://localhost:5186/api/typeequip';

  constructor(private http: HttpClient) {}

  getAllTypes(searchTerm = '', sortBy = 'idtypequip', ascending = true): Observable<TypeEqpt[]> {
    const params = new HttpParams()
      .set('searchTerm', searchTerm)
      .set('sortBy', sortBy)
      .set('ascending', ascending.toString());

    return this.http.get<TypeEqpt[]>(this.apiUrl, { params });
  }

  createType(type: Partial<TypeEqpt>): Observable<any> {
    return this.http.post(this.apiUrl, type);
  }

  updateType(type: TypeEqpt): Observable<any> {
    return this.http.put(`${this.apiUrl}/${type.idtypequip}`, type);
  }
  canDelete(id: number): Observable<boolean> {
    return this.http.get<boolean>(`${this.apiUrl}/canDelete/${id}`);
  }

  deleteType(id: number): Observable<any> {
    return this.http.delete(`${this.apiUrl}/${id}`);
  }
  getTypeCount(): Observable<number> {
    return this.http.get<number>(`${this.apiUrl}/count`);
  }
}
