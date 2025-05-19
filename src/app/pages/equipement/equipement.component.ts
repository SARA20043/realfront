import { Component, OnInit, HostListener, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../environments/environment';
import { Equipement, CreateEquipement, UpdateEquipement, EquipementFilter } from '../../models/equipement.model';
import { TypeEqpt } from '../../models/typeeq.model';
import { Marque } from '../../models/marque.model';
import { EquipementService } from '../../services/equipement.service';
import { Caracteristique } from '../../models/caracteristique.model';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { TypeService } from '../../services/type-equip.service';
import { CategorieService } from '../../services/categorie.service';
import { MarqueService } from '../../services/marque.service';
import { UniteService } from '../../services/unite.service';
import { CaracteristiqueService } from '../../services/caracteristique.service';
import { OrganeService } from '../../services/organe.service';
import { RouterModule } from '@angular/router';

interface AffectationRequest {
    ideqpt: number;
    idunite: number;
    dateaffec: string;
    num_decision_affectation: string;
    num_ordre: string;
}

interface Category {
    idcategorie: number;
    design: string;
}

@Component({
    selector: 'app-equipement',
    standalone: true,
    imports: [
        CommonModule, 
        FormsModule, 
        ReactiveFormsModule,
        RouterModule,
        MatFormFieldModule,
        MatInputModule,
        MatSelectModule
    ],
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
    categories: Category[] = [];
    marques: Marque[] = [];
    isLoading = false;
    showDeleteConfirm = false;
    equipementToDelete: Equipement | null = null;
    profileOpen = false;
    username = 'Utilisateur';
    caracteristiques: (Caracteristique & { checked?: boolean, valeur?: string })[] = [];
    organes: { id_organe: number, libelle_organe: string, checked?: boolean, numserie?: string }[] = [];
    showAffectModal = false;
    affectEquipement: Equipement | null = null;
    affectUnite: number | null = null;
    affectDate: string = '';
    affectDecision: string = 'INCONNU';
    affectOrdre: string = 'INCONNU';
    unites: any[] = [];
    form!: FormGroup;
    isEditMode = false;
    selectedId: number | null = null;
    groupesIdentiques: any[] = [];
    selectedGroupe: any = null;

    private equipementService = inject(EquipementService);
    private http = inject(HttpClient);
    private fb = inject(FormBuilder);
    private snackBar = inject(MatSnackBar);
    private typeService = inject(TypeService);
    private categorieService = inject(CategorieService);
    private marqueService = inject(MarqueService);
    private uniteService = inject(UniteService);
    private caracteristiqueService = inject(CaracteristiqueService);
    private organeService = inject(OrganeService);

    ngOnInit(): void {
        this.initializeForm();
        this.form.get('anneeFabrication')?.valueChanges.subscribe(value => {
            if (value === '') {
                this.form.get('anneeFabrication')?.setValue(null);
            }
        });
        console.log('Form controls initialized:', this.form.controls);
        this.loadEquipements();
        this.loadTypes();
        this.loadCategories();
        this.loadMarques();
        this.loadGroupesIdentiques();
        this.loadUnites();
    }

    private initializeForm() {
        this.form = this.fb.group({
            design: ['', Validators.required],
            etat: ['', Validators.required],
            numserie: ['', Validators.required],
            position_physique: ['', Validators.required],
            idType: ['', Validators.required],
            idCat: ['', Validators.required],
            idMarq: ['', Validators.required],
            dateMiseService: ['', Validators.required],
            anneeFabrication: [null, Validators.required],
            dateAcquisition: ['', Validators.required],
            valeurAcquisition: ['', Validators.required],
            idGrpIdq: [''],
            // Affectation fields
            idunite: [''],
            dateaffec: [''],
            num_decision_affectation: [''],
            num_ordre: [''],
            // Observation field
            observation: ['INCONNU', Validators.required]
        });
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
                    this.snackBar.open('Erreur lors du chargement des équipements', 'Fermer', { duration: 3000 });
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
        this.typeService.getAllTypes().subscribe({
            next: (data: TypeEqpt[]) => {
                this.types = data;
            },
            error: (error: any) => {
                console.error('Error loading types:', error);
                this.types = [];
                this.snackBar.open('Erreur lors du chargement des types', 'Fermer', { duration: 3000 });
            }
        });
    }

    loadCategories() {
        this.categorieService.getAll().subscribe({
            next: (data: any[]) => {
                console.log('Raw Categories data:', data);
                this.categories = data.map(cat => ({
                    idcategorie: cat.idcategorie,
                    design: cat.design || cat.designation // handle both possible property names
                }));
                console.log('Processed categories:', this.categories);
            },
            error: (error: any) => {
                console.error('Error loading categories:', error);
                this.categories = [];
                this.snackBar.open('Erreur lors du chargement des catégories', 'Fermer', { duration: 3000 });
            }
        });
    }

    loadMarques() {
        this.marqueService.getAll().subscribe({
            next: (data: any[]) => {
                this.marques = data as Marque[];
            },
            error: (error: any) => {
                console.error('Error loading marques:', error);
                this.marques = [];
                this.snackBar.open('Erreur lors du chargement des marques', 'Fermer', { duration: 3000 });
            }
        });
    }

    openForm(equipement?: Equipement) {
        this.selectedEquipement = equipement || null;
        this.showForm = true;
        this.caracteristiques = [];
        this.organes = [];
        this.loadUnites();

        if (equipement) {
            this.form.patchValue({
                design: equipement.design,
                etat: equipement.etat,
                numserie: equipement.numserie || '',
                position_physique: equipement.position_physique || '',
                idType: equipement.idType,
                idCat: equipement.idCat,
                idMarq: equipement.idMarq,
                dateMiseService: equipement.dateMiseService,
                anneeFabrication: equipement.anneeFabrication,
                dateAcquisition: equipement.dateAcquisition,
                valeurAcquisition: equipement.valeurAcquisition,
                idGrpIdq: equipement.idGrpIdq,
                idunite: equipement.idunite,
                dateaffec: equipement.dateaffec,
                num_decision_affectation: equipement.num_decision_affectation,
                num_ordre: equipement.num_ordre,
                observation: equipement.observation || ''
            });
            this.isEditMode = true;
            this.selectedId = equipement.idEqpt;
        } else {
            this.form.reset({
                design: '',
                etat: '',
                numserie: '',
                position_physique: '',
                idType: '',
                idCat: '',
                idMarq: '',
                dateMiseService: '',
                anneeFabrication: '',
                dateAcquisition: '',
                valeurAcquisition: '',
                idGrpIdq: '',
                idunite: '',
                dateaffec: '',
                num_decision_affectation: '',
                num_ordre: '',
                observation: ''
            });
            this.isEditMode = false;
            this.selectedId = null;
        }

        if (this.form.get('idType')?.value && this.form.get('idMarq')?.value) {
            this.loadCaracteristiques(this.form.get('idType')?.value, this.form.get('idMarq')?.value);
            this.loadOrganes(this.form.get('idType')?.value, this.form.get('idMarq')?.value);
        }
    }

    closeForm() {
        this.selectedEquipement = null;
        this.showForm = false;
        this.form.reset({
            design: '',
            etat: '',
            numserie: '',
            position_physique: '',
            idType: '',
            idCat: '',
            idMarq: '',
            dateMiseService: '',
            anneeFabrication: '',
            dateAcquisition: '',
            valeurAcquisition: '',
            idGrpIdq: '',
            idunite: '',
            dateaffec: '',
            num_decision_affectation: '',
            num_ordre: '',
            observation: ''
        });
        this.isEditMode = false;
        this.selectedId = null;
        this.caracteristiques = [];
        this.organes = [];
    }

    onTypeOrMarqueChange() {
        const typeId = this.form.get('idType')?.value;
        const marqueId = this.form.get('idMarq')?.value;
        console.log('Type ID:', typeId, 'Marque ID:', marqueId);

        if (typeId && marqueId) {
            // Get caractéristiques
            this.http.get<any[]>(`${environment.apiUrl}/Caracteristique/type/${typeId}/marque/${marqueId}`).subscribe({
                next: (data: any[]) => {
                    if (data && data.length > 0) {
                        this.caracteristiques = data.map(carac => ({ 
                            ...carac, 
                            checked: false, 
                            valeur: '' 
                        }));
                    } else {
                        this.http.get<any[]>(`${environment.apiUrl}/Caracteristique`).subscribe({
                            next: (allData: any[]) => {
                                this.caracteristiques = allData.map(carac => ({ 
                                    ...carac, 
                                    checked: false, 
                                    valeur: '' 
                                }));
                            },
                            error: (err: any) => {
                                console.error('Error loading all caractéristiques:', err);
                                this.caracteristiques = [];
                            }
                        });
                    }
                },
                error: (err: any) => {
                    console.error('Error loading caractéristiques:', err);
                    this.caracteristiques = [];
                }
            });

            // Get organes
            this.http.get<any[]>(`${environment.apiUrl}/Organe/type/${typeId}/marque/${marqueId}`).subscribe({
                next: (data: any[]) => {
                    if (data && data.length > 0) {
                        this.organes = data.map(org => ({ 
                            ...org, 
                            checked: false, 
                            numserie: '' 
                        }));
                    } else {
                        this.http.get<any[]>(`${environment.apiUrl}/Organe`).subscribe({
                            next: (allData: any[]) => {
                                this.organes = allData.map(org => ({ 
                                    ...org, 
                                    checked: false, 
                                    numserie: '' 
                                }));
                            },
                            error: (err: any) => {
                                console.error('Error loading all organes:', err);
                                this.organes = [];
                            }
                        });
                    }
                },
                error: (err: any) => {
                    console.error('Error loading organes:', err);
                    this.organes = [];
                }
            });

            // Load groupe identique
            const url = `${environment.apiUrl}/GroupeIdentique/byTypeAndMarque?typeId=${typeId}&marqueId=${marqueId}`;
            console.log('Calling API:', url);

            this.http.get<any[]>(url).subscribe({
                next: (data: any[]) => {
                    console.log('API Response:', data);
                    if (data && data.length > 0) {
                        this.selectedGroupe = data[0];
                        console.log('Selected Groupe:', this.selectedGroupe);
                        this.form.patchValue({
                            idGrpIdq: this.selectedGroupe.Id
                        });
                    } else {
                        console.log('No groupe found');
                        this.selectedGroupe = null;
                        this.form.patchValue({
                            idGrpIdq: null
                        });
                    }
                },
                error: (error: any) => {
                    console.error('Error loading groupe identique:', error);
                    this.selectedGroupe = null;
                    this.form.patchValue({
                        idGrpIdq: null
                    });
                }
            });
        } else {
            this.caracteristiques = [];
            this.organes = [];
            this.selectedGroupe = null;
            this.form.patchValue({
                idGrpIdq: null
            });
        }
    }

    loadCaracteristiques(typeId: number, marqueId: number) {
        this.http.get<any[]>(`${environment.apiUrl}/Caracteristique/type/${typeId}/marque/${marqueId}`).subscribe({
            next: (data: any[]) => {
                this.caracteristiques = data.map(carac => ({ ...carac, checked: false, valeur: '' }));
            },
            error: (err: any) => {
                this.caracteristiques = [];
            }
        });
    }

    loadOrganes(typeId: number, marqueId: number) {
        this.http.get<any[]>(`${environment.apiUrl}/Organe/type/${typeId}/marque/${marqueId}`).subscribe({
            next: (data: any[]) => {
                this.organes = data.map(org => ({ ...org, checked: false, numserie: '' }));
            },
            error: (err: any) => {
                this.organes = [];
            }
        });
    }

    saveEquipement() {
        const validEtats = ["En Service", "En panne", "En stock", "Réformé", "Prêt"];
        
        // Log form state before getting values
        console.log('Form controls before getting values:', this.form.controls);
        console.log('Form value before getRawValue:', this.form.value);
        
        // Get form values
        const formValue = this.form.getRawValue();
        console.log('Form raw values:', formValue);
        
        // Get observation value directly from form
        const observationControl = this.form.get('observation');
        let observationValue = observationControl?.value || 'INCONNU';
        console.log('Observation value:', observationValue);
        
        // Ensure observation is a string and not null
        if (!observationValue || observationValue.trim() === '') {
            observationControl?.setValue('INCONNU');
            observationValue = 'INCONNU';
        }
        
        // Make sure the observation is a string
        if (typeof observationValue !== 'string') {
            observationValue = String(observationValue);
        }
        
        if (!formValue.design || !formValue.etat || !formValue.idType || !formValue.idCat || !formValue.idMarq) {
            alert('Veuillez remplir tous les champs obligatoires.');
            return;
        }
        if (!validEtats.includes(formValue.etat)) {
            alert('L\'état doit être l\'une des valeurs suivantes : ' + validEtats.join(', '));
            return;
        }
        this.isLoading = true;
        // Create equipementData with explicit observation
        const equipementData: CreateEquipement = {
            design: formValue.design,
            etat: formValue.etat,
            idType: Number(formValue.idType),
            idCat: Number(formValue.idCat),
            idMarq: Number(formValue.idMarq),
            dateMiseService: formValue.dateMiseService ? new Date(formValue.dateMiseService) : undefined,
            anneeFabrication: formValue.anneeFabrication || undefined,
            dateAcquisition: formValue.dateAcquisition ? new Date(formValue.dateAcquisition) : undefined,
            valeurAcquisition: formValue.valeurAcquisition || undefined,
            idGrpIdq: undefined,
            idunite: undefined,
            numserie: formValue.numserie || 'INCONNU',
            position_physique: formValue.position_physique || 'INCONNU',
            observation: observationValue.trim() || 'INCONNU'  // Use the processed value
        };

        // Debug logs
        console.log('EquipementData created:', equipementData);
        console.log('Observation value in equipementData:', equipementData.observation);

        // Debug logs
        console.log('EquipementData created:', equipementData);
        console.log('EquipementData observation:', equipementData.observation);
        console.log('✅ Valeur finale observation :', equipementData.observation);

        // Ensure the observation is included in the form value
        this.form.patchValue({
            observation: String(observationValue)
        });

        // Get the final form value to send
        const finalFormValue = this.form.getRawValue();
        console.log('Final form value:', finalFormValue);
        
        // Ensure observation is a string
        if (typeof equipementData.observation !== 'string') {
            equipementData.observation = String(equipementData.observation || 'INCONNU');
        }
        
        // Detailed logging of equipementData
        console.log('EquipementData created:', equipementData);
        console.log('EquipementData observation:', equipementData.observation);
        console.log('EquipementData keys:', Object.keys(equipementData));
        console.log('EquipementData has observation:', 'observation' in equipementData);
        
        // Final payload logging
        console.log('Données préparées pour l\'API:', equipementData);
        console.log('Observation value:', observationValue);
        console.log('Payload à envoyer:', JSON.stringify(equipementData, null, 2));
        console.log('Payload type:', typeof equipementData);
        console.log('Payload observation type:', typeof equipementData.observation);
        console.log('Final payload with any:', JSON.stringify(equipementData as any, null, 2));
        
        // 1. Create equipement - bypass TypeScript strict typing
        this.equipementService.create(equipementData as any)
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
                                            this.snackBar.open('Erreur lors de l\'enregistrement des organes', 'Fermer', { duration: 3000 });
                                        }
                                    });
                                }
                            },
                            error: () => {
                                this.isLoading = false;
                                this.snackBar.open('Erreur lors de l\'enregistrement des caractéristiques', 'Fermer', { duration: 3000 });
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
                                    this.snackBar.open('Erreur lors de l\'enregistrement des organes', 'Fermer', { duration: 3000 });
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
                    this.snackBar.open(errorMsg, 'Fermer', { duration: 3000 });
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
                        this.snackBar.open('Erreur lors de la suppression de l\'équipement', 'Fermer', { duration: 3000 });
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
        this.affectDecision = 'INCONNU';
        this.affectOrdre = 'INCONNU';
        this.showAffectModal = true;
        this.loadUnites();
    }

    closeAffectModal() {
        this.showAffectModal = false;
        this.affectEquipement = null;
        this.affectUnite = null;
        this.affectDate = '';
        this.affectDecision = 'INCONNU';
        this.affectOrdre = 'INCONNU';
    }

    loadUnites() {
        this.http.get<any[]>(`${environment.apiUrl}/Unite?ascending=true`).subscribe({
            next: (data: any[]) => {
                this.unites = data;
                console.log('Loaded unites:', this.unites);
            },
            error: (error: any) => {
                console.error('Error loading unites:', error);
                this.snackBar.open('Erreur lors du chargement des unités', 'Fermer', { duration: 3000 });
            }
        });
    }

    submitAffectation() {
        if (!this.affectEquipement || !this.affectUnite || !this.affectDate) {
            this.snackBar.open('Veuillez remplir tous les champs obligatoires.', 'Fermer', { duration: 3000 });
            return;
        }
        this.isLoading = true;
        const affectationRequest: AffectationRequest = {
            ideqpt: this.affectEquipement.idEqpt,
            idunite: this.affectUnite,
            dateaffec: new Date(this.affectDate).toISOString().split('T')[0],
            num_decision_affectation: this.affectDecision || 'INCONNU',
            num_ordre: this.affectOrdre || 'INCONNU'
        };
        
        console.log('Sending affectation request:', affectationRequest);
        
        // First, try to verify the backend is accessible
        this.http.options(`${environment.apiUrl}/Affectation`).subscribe({
            next: () => {
                // If OPTIONS request succeeds, proceed with POST
                this.equipementService.postAffectation(affectationRequest).subscribe({
                    next: (response) => {
                        console.log('Affectation success:', response);
                        this.loadEquipements();
                        this.closeAffectModal();
                        this.isLoading = false;
                        this.snackBar.open('Affectation réussie', 'Fermer', { duration: 3000 });
                    },
                    error: (error) => {
                        console.error('Error during affectation:', error);
                        this.isLoading = false;
                        let errorMessage = 'Erreur lors de l\'affectation: ';
                        if (error.error?.message) {
                            errorMessage += error.error.message;
                        } else if (error.status === 0) {
                            errorMessage += 'Impossible de contacter le serveur';
                        } else {
                            errorMessage += 'Erreur inconnue';
                        }
                        this.snackBar.open(errorMessage, 'Fermer', { duration: 5000 });
                    }
                });
            },
            error: (error) => {
                console.error('CORS pre-flight check failed:', error);
                this.isLoading = false;
                this.snackBar.open('Erreur de connexion au serveur (CORS)', 'Fermer', { duration: 5000 });
            }
        });
    }

    loadEquipement(id: number) {
        this.equipementService.getById(id).subscribe({
            next: (data) => {
                this.form.patchValue({
                    idType: data.idType,
                    idCat: data.idCat,
                    idMarq: data.idMarq,
                    design: data.design,
                    idGrpIdq: data.idGrpIdq,
                    etat: data.etat,
                    numserie: data.numserie,
                    position_physique: data.position_physique,
                    dateMiseService: data.dateMiseService,
                    anneeFabrication: data.anneeFabrication,
                    dateAcquisition: data.dateAcquisition,
                    valeurAcquisition: data.valeurAcquisition,
                    idunite: data.idunite,
                    observation: data.observation
                });
                this.isEditMode = true;
                this.selectedId = id;
            },
            error: (error) => {
                console.error('Error loading equipment:', error);
                this.snackBar.open('Erreur lors du chargement de l\'équipement', 'Fermer', { duration: 3000 });
            }
        });
    }

    onSubmit() {
        console.log('Début onSubmit - Form Values:', this.form.value);
        console.log('Form Valid Status:', this.form.valid);
        console.log('Form Errors:', this.form.errors);

        if (this.form.valid) {
            console.log('Formulaire valide - Préparation des données');
            const formData = this.form.value;
            
            // Validate etat
            const validEtats = ['operationnel', 'En panne', 'pre_reforme', 'reforme'];
            if (!validEtats.includes(formData.etat)) {
                console.error('État invalide:', formData.etat);
                this.snackBar.open('État invalide. Les états valides sont: operationnel, En panne, pre_reforme, reforme', 'Fermer', { duration: 5000 });
                return;
            }

            console.log('Préparation des données de l\'équipement:', formData);
            const equipementData: CreateEquipement = {
                idType: formData.idType,
                idCat: formData.idCat,
                idMarq: formData.idMarq,
                design: formData.design,
                idGrpIdq: formData.idGrpIdq || undefined,
                etat: formData.etat,
                numserie: formData.numserie || '',
                position_physique: formData.position_physique || '',
                dateMiseService: formData.dateMiseService || undefined,
                anneeFabrication: formData.anneeFabrication || undefined,
                dateAcquisition: formData.dateAcquisition || undefined,
                valeurAcquisition: formData.valeurAcquisition || undefined,
                idunite: undefined,
                observation: formData.observation || ''
            };

            console.log('Données préparées pour l\'API:', equipementData);

            // Create equipment first
            this.equipementService.create(equipementData).subscribe({
                next: (createdEquipement) => {
                    console.log('Équipement créé avec succès:', createdEquipement);
                    
                    // Handle characteristics
                    const selectedCaracteristiques = this.caracteristiques
                        .filter(c => c.checked)
                        .map(c => ({ idcarac: c.id_caracteristique, valeur: c.valeur || '' }));
                    
                    console.log('Caractéristiques sélectionnées:', selectedCaracteristiques);

                    // Handle organs
                    const selectedOrganes = this.organes
                        .filter(o => o.checked)
                        .map(o => ({ idorg: o.id_organe, numsérie: o.numserie || '' }));
                    
                    console.log('Organes sélectionnés:', selectedOrganes);

                    // Create a promise chain to handle all operations
                    let operationsChain = Promise.resolve();

                    // Add characteristics if any are selected
                    if (selectedCaracteristiques.length > 0) {
                        console.log('Ajout des caractéristiques...');
                        operationsChain = operationsChain.then(() => 
                            new Promise<void>((resolve, reject) => {
                                this.equipementService.bulkCreateCaracteristiqueEquipement({
                                    ideqpt: createdEquipement.idEqpt,
                                    caracteristiques: selectedCaracteristiques
                                }).subscribe({
                                    next: () => {
                                        console.log('Caractéristiques ajoutées avec succès');
                                        resolve();
                                    },
                                    error: (error) => {
                                        console.error('Erreur lors de l\'ajout des caractéristiques:', error);
                                        reject(error);
                                    }
                                });
                            })
                        );
                    }

                    // Add organs if any are selected
                    if (selectedOrganes.length > 0) {
                        console.log('Ajout des organes...');
                        operationsChain = operationsChain.then(() => 
                            new Promise<void>((resolve, reject) => {
                                this.equipementService.postOrganeEquipement({
                                    ideqpt: createdEquipement.idEqpt,
                                    organes: selectedOrganes
                                }).subscribe({
                                    next: () => {
                                        console.log('Organes ajoutés avec succès');
                                        resolve();
                                    },
                                    error: (error) => {
                                        console.error('Erreur lors de l\'ajout des organes:', error);
                                        reject(error);
                                    }
                                });
                            })
                        );
                    }

                    // Add affectation if unit is selected
                    if (formData.idunite && formData.dateaffec) {
                        console.log('Ajout de l\'affectation...');
                        operationsChain = operationsChain.then(() => 
                            new Promise<void>((resolve, reject) => {
                                const affectationRequest = {
                                    ideqpt: createdEquipement.idEqpt,
                                    idunite: formData.idunite,
                                    dateaffec: new Date(formData.dateaffec).toISOString().split('T')[0],
                                    num_decision_affectation: formData.num_decision_affectation || 'INCONNU',
                                    num_ordre: formData.num_ordre || 'INCONNU'
                                };
                                
                                console.log('Données d\'affectation:', affectationRequest);
                                
                                this.equipementService.postAffectation(affectationRequest).subscribe({
                                    next: () => {
                                        console.log('Affectation ajoutée avec succès');
                                        resolve();
                                    },
                                    error: (error) => {
                                        console.error('Erreur lors de l\'ajout de l\'affectation:', error);
                                        reject(error);
                                    }
                                });
                            })
                        );
                    }

                    // Execute all operations
                    operationsChain
                        .then(() => {
                            console.log('Toutes les opérations terminées avec succès');
                            this.snackBar.open('Équipement créé avec succès avec toutes les données associées', 'Fermer', { duration: 3000 });
                            this.loadEquipements();
                            this.closeForm();
                        })
                        .catch((error) => {
                            console.error('Erreur pendant le processus de création:', error);
                            this.snackBar.open('Erreur lors de la création complète de l\'équipement', 'Fermer', { duration: 5000 });
                        });
                },
                error: (error) => {
                    console.error('Erreur lors de la création de l\'équipement:', error);
                    console.error('Détails de l\'erreur:', {
                        status: error.status,
                        message: error.message,
                        error: error.error
                    });
                    this.snackBar.open('Erreur lors de la création de l\'équipement: ' + (error.error?.message || error.message), 'Fermer', { duration: 3000 });
                }
            });
        } else {
            console.error('Formulaire invalide - Erreurs:', this.getFormValidationErrors());
            this.snackBar.open('Veuillez remplir tous les champs obligatoires correctement', 'Fermer', { duration: 3000 });
        }
    }

    // Nouvelle méthode pour obtenir les erreurs de validation détaillées
    private getFormValidationErrors() {
        const errors: any = {};
        Object.keys(this.form.controls).forEach(key => {
            const controlErrors = this.form.get(key)?.errors;
            if (controlErrors != null) {
                errors[key] = controlErrors;
            }
        });
        return errors;
    }

    resetForm() {
        this.form.reset();
        this.isEditMode = false;
        this.selectedId = null;
    }

    loadGroupesIdentiques() {
        this.http.get<any[]>(`${environment.apiUrl}/GroupeIdentique`).subscribe({
            next: (data) => {
                this.groupesIdentiques = data;
            },
            error: (error) => {
                console.error('Error loading groupes identiques:', error);
                this.snackBar.open('Erreur lors du chargement des groupes identiques', 'Fermer', { duration: 3000 });
            }
        });
    }

    getStatusClass(etat: string | undefined): string {
        if (!etat) return '';
        
        switch (etat.toLowerCase()) {
            case 'operationnel':
                return 'status-operationnel';
            case 'en panne':
                return 'status-en-panne';
            case 'reforme':
                return 'status-reforme';
            case 'pre_reforme':
                return 'status-pre-reforme';
            default:
                return '';
        }
    }
} 