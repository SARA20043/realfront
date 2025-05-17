import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map, tap } from 'rxjs';
import { Affectation } from '../models/affectation.model';
import { environment } from '../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class AffectationService {
  private apiUrl = 'http://localhost:5186/api/Affectation';

  constructor(private http: HttpClient) {}

  getAll(): Observable<Affectation[]> {
    return this.http.get<Affectation[]>(`${this.apiUrl}?ascending=true`).pipe(
      tap(data => console.log('All affectations:', data))
    );
  }

  getByEquipementId(equipementId: number): Observable<Affectation | null> {
    return this.http.get<Affectation[]>(`${this.apiUrl}?ascending=true`).pipe(
      tap(data => {
        console.log('All affectations before filtering:', data);
        console.log('Looking for equipment ID:', equipementId);
        data.forEach(a => console.log(`Comparing with affectation - ideqpt: ${a.ideqpt}, equipment ID: ${equipementId}, match: ${a.ideqpt === equipementId}`));
      }),
      map(affectations => {
        const found = affectations.find(a => a.ideqpt === equipementId);
        console.log('Found affectation for equipment', equipementId, ':', found);
        return found || null;
      })
    );
  }
} 