// app.routes.ts
import { Routes } from '@angular/router';
import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { AdminGuard } from './guards/admin.guard';

export const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },

  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent },
  {
    path: 'user-management',
    component: UserManagementComponent,
    canActivate: [AdminGuard],
  },

  {
    path: 'movements',
    loadComponent: () =>
      import('./components/movement-management.component').then(
        (m) => m.MovementManagementComponent
      ),
  },
  {
    path: 'movements/pret',
    loadComponent: () =>
      import('./components/pret-management/pret-management.component').then(
        (m) => m.PretManagementComponent
      ),
  },
  {
    path: 'equipment',
    loadComponent: () =>
      import('./components/equipment-management.component').then(
        (m) => m.EquipmentManagementComponent
      ),
  },
  {
    path: 'codification',
    loadComponent: () =>
      import('./components/codification-management.component').then(
        (m) => m.CodificationManagementComponent
      ),
  },

  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./components/unauthorized/unauthorized.component').then(
        (m) => m.UnauthorizedComponent
      ),
  },

  // Codification pages
  {
    path: 'marque',
    loadComponent: () =>
      import('./pages/marque/marque.component').then(
        (m) => m.MarqueComponent
      ),
  },
  {
    path: 'typeeq',
    loadComponent: () =>
      import('./pages/typeeq/typeeq.component').then(
        (m) => m.TypeEqptComponent
      ),
  },
  {
    path: 'unite',
    loadComponent: () =>
      import('./pages/unite/unite.component').then(
        (m) => m.UniteComponent
      ),
  },
  {
    path: 'caracteristique',
    loadComponent: () =>
      import('./pages/caracteristique/caracteristique.component').then(
        (m) => m.CaracteristiqueComponent
      ),
  },
  {
    path: 'organe',
    loadComponent: () =>
      import('./pages/organe/organe.component').then(
        (m) => m.OrganeComponent
      ),
  },
  {
    path: 'categorie',
    loadComponent: () =>
      import('./pages/categorie/categorie.component').then(
        (m) => m.CategorieComponent
      ),
  },
  {
    path: 'groupeidentique',
    loadComponent: () =>
      import('./pages/groupe-identique/groupe-identique.component').then(
        (m) => m.GroupeIdentiqueComponent
      ),
  },
  {
    path: 'equipement',
    loadComponent: () =>
      import('./pages/equipement/equipement.component').then(
        (m) => m.EquipementComponent
      ),
  },

  { path: '**', redirectTo: '/login' },
];
