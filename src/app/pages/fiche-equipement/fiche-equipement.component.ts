import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { Equipement } from '../../models/equipement.model';
import { Affectation } from '../../models/affectation.model';
import { OrganeEquipement } from '../../models/organe.model';
import { CaracteristiqueEquipement } from '../../models/caracteristique.model';
import { EquipementService } from '../../services/equipement.service';
import { AffectationService } from '../../services/affectation.service';
import { OrganeService } from '../../services/organe.service';
import { CaracteristiqueService } from '../../services/caracteristique.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { forkJoin } from 'rxjs';

@Component({
  selector: 'app-fiche-equipement',
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    ReactiveFormsModule,
    RouterModule
  ],
  templateUrl: './fiche-equipement.component.html',
  styleUrls: ['./fiche-equipement.component.scss']
})
export class FicheEquipementComponent implements OnInit {
  equipements: Equipement[] = [];
  displayedEquipements: Equipement[] = [];
  equipement: Equipement | null = null;
  affectation: Affectation | null = null;
  organes: OrganeEquipement[] = [];
  caracteristiques: CaracteristiqueEquipement[] = [];
  isLoading = false;
  profileOpen = false;
  username = 'Utilisateur';
  selectedEquipementId: number | null = null;

  // Pagination
  currentPage = 1;
  pageSize = 10;
  totalItems = 0;
  totalPages = 1;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private equipementService: EquipementService,
    private affectationService: AffectationService,
    private organeService: OrganeService,
    private caracteristiqueService: CaracteristiqueService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit() {
    this.loadEquipements();
    
    // Load specific equipment if ID is in URL
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.selectEquipement(params['id']);
      }
    });
  }

  loadEquipements() {
    this.isLoading = true;
    this.equipementService.getAll().subscribe({
      next: (data) => {
        console.log('Loaded equipements:', data); // Debug log
        this.equipements = data;
        this.totalItems = data.length;
        this.totalPages = Math.ceil(this.totalItems / this.pageSize);
        this.updateDisplayedEquipements();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading equipments:', error);
        this.snackBar.open('Erreur lors du chargement des équipements', 'Fermer', { duration: 3000 });
        this.isLoading = false;
      }
    });
  }

  updateDisplayedEquipements() {
    const start = (this.currentPage - 1) * this.pageSize;
    const end = start + this.pageSize;
    this.displayedEquipements = this.equipements.slice(start, end);
    console.log('Updated displayed equipements:', this.displayedEquipements); // Debug log
  }

  changePage(page: number) {
    if (page >= 1 && page <= this.totalPages) {
      this.currentPage = page;
      this.updateDisplayedEquipements();
    }
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    for (let i = 1; i <= this.totalPages; i++) {
      pages.push(i);
    }
    return pages;
  }

  selectEquipement(id: number) {
    if (this.selectedEquipementId === id) return;
    
    this.selectedEquipementId = id;
    this.isLoading = true;
    console.log('Selecting equipment with ID:', id);

    forkJoin({
      equipment: this.equipementService.getById(id),
      affectation: this.affectationService.getByEquipementId(id),
      organes: this.organeService.getByEquipementId(id),
      caracteristiques: this.caracteristiqueService.getByEquipementId(id)
    }).subscribe({
      next: (data) => {
        console.log('Received equipment data:', data.equipment);
        console.log('Received affectation data:', data.affectation);
        console.log('Received organes data:', data.organes);
        console.log('Received caracteristiques data:', data.caracteristiques);
        
        this.equipement = data.equipment;
        this.affectation = data.affectation;
        this.organes = data.organes || [];
        this.caracteristiques = data.caracteristiques || [];
        
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading data:', error);
        if (error.error && this.equipement) {
          // If we at least have the equipment data, show what we can
          this.affectation = null;
          this.organes = [];
          this.caracteristiques = [];
          this.isLoading = false;
        } else {
          this.snackBar.open('Erreur lors du chargement des données', 'Fermer', { duration: 3000 });
          this.isLoading = false;
        }
      }
    });
  }

  getStatusClass(etat: string | undefined): string {
    if (!etat) return '';
    
    switch (etat.toLowerCase()) {
      case 'operationnel':
        return 'status-operational';
      case 'en panne':
        return 'status-panne';
      case 'reforme':
        return 'status-reforme';
      case 'pre_reforme':
        return 'status-pre-reforme';
      default:
        return '';
    }
  }

  logout() {
    localStorage.clear();
    this.router.navigate(['/login']);
  }
} 