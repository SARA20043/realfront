export interface Caracteristique {
  id_caracteristique: number;
  libelle: string;
}

export interface OrganeCaracteristique {
  idcaracteristique: number; // Ajouté !
  nomCaracteristique: string; 
  valeur: string;  
}

export interface Marque {
  idmarque: number;
  codemarque: string;   // il y a aussi codemarque dans ta réponse
  nom_fabriquant: string;
}

export interface Organe {
  id_organe: number;
  code_organe: string;
  libelle_organe: string;
  id_marque: number;
  nom_marque: string;
  modele: string; 
  caracteristiques: OrganeCaracteristique[];  // Liste des caractéristiques liées à l'organe
}

export interface Organee {
  id_organe: number;
  libelle_organe: string;
}

export interface OrganeEquipement {
    idorg: number;
    ideqpt: number;
    'numsérie'?: string;  // Using quotes to handle special character
    nomOrgane: string;
}