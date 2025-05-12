import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Equipement, CreateEquipement, UpdateEquipement, EquipementFilter } from '../../models/equipement.model';
import { TypeEqpt } from '../../models/typeeq.model';
import { Marque } from '../../models/marque.model';
import { EquipementService } from '../../services/equipement.service';
import { Caracteristique } from '../../models/caracteristique.model';

@Component({
    selector: 'app-equipement',
    standalone: true,
    imports: [CommonModule, FormsModule],
    templateUrl: './equipement.component.html',
    styleUrls: ['./equipement.component.scss']
})
export class EquipementComponent implements OnInit {
    equipements: Equipement[] = [];
    searchTerm = '';
    sortBy = 'codeEqp';
    ascending = true;
    selectedEquipement: Equipement | null = null;
    showForm = false;
    design_input = '';
    etat_input = '';
    idType_input: number | null = null;
    idCat_input: number | null = null;
    idMarq_input: number | null = null;
    dateMiseService_input = '';
    anneeFabrication_input: number | null = null;
    dateAcquisition_input = '';
    valeurAcquisition_input: number | null = null;
    types: TypeEqpt[] = [];
    categories: any[] = [];
    marques: Marque[] = [];
    isLoading = false;
    showDeleteConfirm = false;
    equipementToDelete: Equipement | null = null;
    profileOpen = false;
    username = 'Utilisateur'; // Replace with actual username if available
    caracteristiques: (Caracteristique & { checked?: boolean, valeur?: string })[] = [];
    organes: { id_organe: number, libelle_organe: string, checked?: boolean, numserie?: string }[] = [];
    showAffectModal = false;
    affectEquipement: Equipement | null = null;
    affectUnite: number | null = null;
    affectDate: string = '';
    unites: any[] = [];

    private equipementService = inject(EquipementService);
    private http = inject(HttpClient);

    ngOnInit(): void {
        this.loadEquipements();
        this.loadTypes();
        this.loadCategories();
        this.loadMarques();
    }

    loadEquipements() {
        this.isLoading = true;
        const filter: EquipementFilter = {
            search: this.searchTerm || undefined,
            sortBy: this.sortBy,
            ascending: this.ascending
        };
        this.equipementService.getAll(filter)
            .subscribe({
                next: (data) => {
                    this.equipements = data;
                    // Fetch organes and caractéristiques for each equipment
                    this.equipements.forEach(eq => {
                        this.equipementService.getOrganesForEquipement(eq.idEqpt).subscribe({
                            next: (orgs) => { eq.organes = orgs; },
                            error: () => { eq.organes = []; }
                        });
                        this.equipementService.getCaracteristiquesForEquipement(eq.idEqpt).subscribe({
                            next: (caracs) => { eq.caracteristiques = caracs; },
                            error: () => { eq.caracteristiques = []; }
                        });
                    });
                    this.isLoading = false;
                },
                error: (error) => {
                    console.error('Error loading equipements:', error);
                    this.isLoading = false;
                    alert('Une erreur est survenue lors du chargement des équipements.');
                }
            });
    }

    search() {
        this.loadEquipements();
    }

    toggleSort(column: string) {
        if (this.sortBy === column) {
            this.ascending = !this.ascending;
        } else {
            this.sortBy = column;
            this.ascending = true;
        }
        this.loadEquipements();
    }

    loadTypes() {
        this.http.get<TypeEqpt[]>(`${environment.apiUrl}/TypeEquip`).subscribe({
            next: (data) => {
                this.types = data;
            },
            error: (error) => {
                console.error('Error loading types:', error);
                this.types = [];
            }
        });
    }

    loadCategories() {
        this.http.get<any[]>(`${environment.apiUrl}/categorie`).subscribe({
            next: (data) => {
                console.log('Categories loaded:', data);
                this.categories = data.map(cat => ({
                    idcategorie: cat.idcategorie,
                    design: cat.design || cat.designation
                }));
                console.log('Processed categories:', this.categories);
            },
            error: (error) => {
                console.error('Error loading categories:', error);
                this.categories = [];
            }
        });
    }

    loadMarques() {
        this.http.get<Marque[]>(`${environment.apiUrl}/marque`).subscribe({
            next: (data) => {
                this.marques = data;
            },
            error: (error) => {
                console.error('Error loading marques:', error);
                this.marques = [];
            }
        });
    }

    openForm(equipement?: Equipement) {
        this.selectedEquipement = equipement || null;
        this.design_input = equipement?.design || '';
        this.etat_input = equipement?.etat || '';
        this.idType_input = equipement?.idType || null;
        this.idCat_input = equipement?.idCat || null;
        this.idMarq_input = equipement?.idMarq || null;
        this.dateMiseService_input = equipement?.dateMiseService ? new Date(equipement.dateMiseService).toISOString().split('T')[0] : '';
        this.anneeFabrication_input = equipement?.AnnéeFabrication || null;
        this.dateAcquisition_input = equipement?.dateAcquisition ? new Date(equipement.dateAcquisition).toISOString().split('T')[0] : '';
        this.valeurAcquisition_input = equipement?.valeurAcquisition || null;
        this.showForm = true;
        this.caracteristiques = [];
        this.organes = [];
        if (this.idType_input && this.idMarq_input) {
            this.loadCaracteristiques(this.idType_input, this.idMarq_input);
            this.loadOrganes(this.idType_input, this.idMarq_input);
        }
    }

    closeForm() {
        this.selectedEquipement = null;
        this.design_input = '';
        this.etat_input = '';
        this.idType_input = null;
        this.idCat_input = null;
        this.idMarq_input = null;
        this.dateMiseService_input = '';
        this.anneeFabrication_input = null;
        this.dateAcquisition_input = '';
        this.valeurAcquisition_input = null;
        this.showForm = false;
    }

    onTypeOrMarqueChange() {
        if (this.idType_input && this.idMarq_input) {
            this.loadCaracteristiques(this.idType_input, this.idMarq_input);
            this.loadOrganes(this.idType_input, this.idMarq_input);
        } else {
            this.caracteristiques = [];
            this.organes = [];
        }
    }

    loadCaracteristiques(typeId: number, marqueId: number) {
        this.equipementService.getCaracteristiquesByTypeAndMarque(typeId, marqueId).subscribe({
            next: (data) => {
                this.caracteristiques = data.map(carac => ({ ...carac, checked: false, valeur: '' }));
            },
            error: (err) => {
                this.caracteristiques = [];
            }
        });
    }

    loadOrganes(typeId: number, marqueId: number) {
        this.equipementService.getOrganesByTypeAndMarque(typeId, marqueId).subscribe({
            next: (data) => {
                this.organes = data.map(org => ({ ...org, checked: false, numserie: '' }));
            },
            error: (err) => {
                this.organes = [];
            }
        });
    }

    saveEquipement() {
        const validEtats = ["En Service", "En panne", "En stock", "Réformé", "Prêt"];
        if (!this.design_input || !this.etat_input || !this.idType_input || !this.idCat_input || !this.idMarq_input) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        if (!validEtats.includes(this.etat_input)) {
            alert('L\'état doit être l\'une des valeurs suivantes : ' + validEtats.join(', '));
            return;
        }
        this.isLoading = true;
        const equipementData: CreateEquipement = {
            design: this.design_input,
            etat: this.etat_input,
            idType: Number(this.idType_input),
            idCat: Number(this.idCat_input),
            idMarq: Number(this.idMarq_input),
            dateMiseService: this.dateMiseService_input ? new Date(this.dateMiseService_input) : undefined,
            AnnéeFabrication: this.anneeFabrication_input || undefined,
            dateAcquisition: this.dateAcquisition_input ? new Date(this.dateAcquisition_input) : undefined,
            valeurAcquisition: this.valeurAcquisition_input || undefined,
            idGrpIdq: undefined,
            idunite: undefined
        };
        // 1. Create equipement
        this.equipementService.create(equipementData)
            .subscribe({
                next: (createdEquipement: any) => {
                    // 2. If characteristics are selected, send them
                    const selectedCaracteristiques = this.caracteristiques
                        .filter(c => c.checked)
                        .map(c => ({ idcarac: c.id_caracteristique, valeur: c.valeur || '' }));
                    if (selectedCaracteristiques.length > 0) {
                        this.equipementService.bulkCreateCaracteristiqueEquipement({
                            ideqpt: createdEquipement.idEqpt,
                            caracteristiques: selectedCaracteristiques
                        }).subscribe({
                            next: () => {
                                // ORGANE LOGIC
                                const selectedOrganes = this.organes
                                    .filter(o => o.checked)
                                    .map(o => ({ idorg: o.id_organe, numserie: o.numserie || '' }));
                                const formattedOrganes = selectedOrganes.map(o => ({
                                    idorg: o.idorg,
                                    numsérie: o.numserie
                                }));
                                if (formattedOrganes.length > 0) {
                                    this.equipementService.postOrganeEquipement({
                                        ideqpt: createdEquipement.idEqpt,
                                        organes: formattedOrganes
                                    }).subscribe({
                                        next: () => {
                                            this.loadEquipements();
                                            this.closeForm();
                                            this.isLoading = false;
                                        },
                                        error: () => {
                                            this.isLoading = false;
                                            alert('Erreur lors de l\'enregistrement des organes.');
                                        }
                                    });
                                }
                            },
                            error: () => {
                                this.isLoading = false;
                                alert('Erreur lors de l\'enregistrement des caractéristiques.');
                            }
                        });
                    } else {
                        // ORGANE LOGIC
                        const selectedOrganes2 = this.organes
                            .filter(o => o.checked)
                            .map(o => ({ idorg: o.id_organe, numserie: o.numserie || '' }));
                        const formattedOrganes2 = selectedOrganes2.map(o => ({
                            idorg: o.idorg,
                            numsérie: o.numserie
                        }));
                        if (formattedOrganes2.length > 0) {
                            this.equipementService.postOrganeEquipement({
                                ideqpt: createdEquipement.idEqpt,
                                organes: formattedOrganes2
                            }).subscribe({
                                next: () => {
                                    this.loadEquipements();
                                    this.closeForm();
                                    this.isLoading = false;
                                },
                                error: () => {
                                    this.isLoading = false;
                                    alert('Erreur lors de l\'enregistrement des organes.');
                                }
                            });
                        }
                    }
                },
                error: (error) => {
                    this.isLoading = false;
                    let errorMsg = 'Une erreur est survenue lors de la création de l\'équipement.';
                    if (error.error) {
                        errorMsg += '\n' + (typeof error.error === 'string' ? error.error : JSON.stringify(error.error));
                    }
                    alert(errorMsg);
                }
            });
    }

    deleteEquipement(equipement: Equipement) {
        this.equipementToDelete = equipement;
        this.showDeleteConfirm = true;
    }

    confirmDelete() {
        if (this.equipementToDelete) {
            this.isLoading = true;
            this.equipementService.delete(this.equipementToDelete.idEqpt)
                .subscribe({
                    next: () => {
                        this.loadEquipements();
                        this.equipementToDelete = null;
                        this.showDeleteConfirm = false;
                        this.isLoading = false;
                    },
                    error: (error) => {
                        console.error('Error deleting equipement:', error);
                        this.isLoading = false;
                        alert('Une erreur est survenue lors de la suppression de l\'équipement.');
                    }
                });
        }
    }

    cancelDelete() {
        this.equipementToDelete = null;
        this.showDeleteConfirm = false;
    }

    onTypeChange() {
        // Optionally handle type change logic here
    }

    logout() {
        // Implement your logout logic here
        localStorage.clear();
        window.location.href = '/login';
    }

    openAffectModal(eq: Equipement) {
        this.affectEquipement = eq;
        this.affectUnite = null;
        this.affectDate = '';
        this.showAffectModal = true;
        this.loadUnites();
    }

    closeAffectModal() {
        this.showAffectModal = false;
        this.affectEquipement = null;
        this.affectUnite = null;
        this.affectDate = '';
    }

    loadUnites() {
        this.http.get<any[]>(`${environment.apiUrl}/unite`).subscribe({
            next: (data) => { this.unites = data; },
            error: () => { this.unites = []; }
        });
    }

    submitAffectation() {
        if (!this.affectEquipement || !this.affectUnite || !this.affectDate) {
            alert('Veuillez remplir tous les champs.');
            return;
        }
        this.isLoading = true;
        this.equipementService.postAffectation({
            ideqpt: this.affectEquipement.idEqpt,
            idunite: this.affectUnite,
            dateaffec: this.affectDate
        }).subscribe({
            next: () => {
                this.loadEquipements();
                this.closeAffectModal();
                this.isLoading = false;
            },
            error: () => {
                alert('Erreur lors de l\'affectation.');
                this.isLoading = false;
            }
        });
    }
} 