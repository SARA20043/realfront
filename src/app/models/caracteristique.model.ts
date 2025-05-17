export interface Caracteristique {
    id_caracteristique: number;
    libelle: string;
  }
  
export interface CaracteristiqueEquipement {
    ideqpt: number;
    idcarac: number;
    designation: string;
    valeur: string;
    nomcarac: string;
}
  
  