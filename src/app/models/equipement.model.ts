export interface Equipement {
    idEqpt: number;
    idType: number;
    typeDesignation?: string;
    idCat: number;
    categorieDesignation?: string;
    idMarq: number;
    marqueNom?: string;
    codeEqp: string;
    design: string;
    idGrpIdq?: number;
    groupeIdentiqueDesignation?: string;
    etat?: string;
    numserie: string;
    position_physique: string;
    dateMiseService?: Date;
    anneeFabrication?: number;
    dateAcquisition?: Date;
    valeurAcquisition?: number;
    idunite?: number;
    uniteDesignation?: string;
    dateaffec?: Date;
    num_decision_affectation?: string;
    num_ordre?: string;
    observation?: string;
    caracteristiques?: any[];
    organes?: any[];
}

export interface CreateEquipement {
    idType: number;
    idCat: number;
    idMarq: number;
    design: string;
    idGrpIdq?: number;
    etat?: string;
    numserie: string;
    position_physique: string;
    dateMiseService?: Date;
    anneeFabrication?: number;
    dateAcquisition?: Date;
    valeurAcquisition?: number;
    idunite?: number;
    dateaffec?: Date;
    num_decision_affectation?: string;
    num_ordre?: string;
    observation?: string;
}

export interface UpdateEquipement {
    idType: number;
    idCat: number;
    idMarq: number;
    design: string;
    idGrpIdq?: number;
    etat?: string;
    numserie: string;
    position_physique: string;
    dateMiseService?: Date;
    anneeFabrication?: number;
    dateAcquisition?: Date;
    valeurAcquisition?: number;
    idunite?: number;
}

export interface EquipementFilter {
    idCat?: number;
    etat?: string;
    idMarq?: number;
    idType?: number;
    idGrpIdq?: number;
    numserie?: string;
    position_physique?: string;
    dateMiseService?: Date;
    anneeFabrication?: number;
    dateAcquisition?: Date;
    valeurAcquisition?: number;
    searchTerm?: string;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    ascending?: boolean;
} 