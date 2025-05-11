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
    dateMiseService?: Date;
    AnnéeFabrication?: number;
    dateAcquisition?: Date;
    valeurAcquisition?: number;
    idunite?: number;
    uniteDesignation?: string;
}

export interface CreateEquipement {
    idType: number;
    idCat: number;
    idMarq: number;
    design: string;
    idGrpIdq?: number;
    etat?: string;
    dateMiseService?: Date;
    AnnéeFabrication?: number;
    dateAcquisition?: Date;
    valeurAcquisition?: number;
    idunite?: number;
}

export interface UpdateEquipement {
    idType: number;
    idCat: number;
    idMarq: number;
    design: string;
    idGrpIdq?: number;
    etat?: string;
    dateMiseService?: Date;
    AnnéeFabrication?: number;
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
    dateMiseService?: Date;
    AnnéeFabrication?: number;
    dateAcquisition?: Date;
    valeurAcquisition?: number;
    searchTerm?: string;
    search?: string;
    sortBy?: string;
    sortDir?: 'asc' | 'desc';
    ascending?: boolean;
} 