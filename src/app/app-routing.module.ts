import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

import { LoginComponent } from './components/login/login.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { UserManagementComponent } from './components/user-management/user-management.component';
import { UnauthorizedComponent } from './components/unauthorized/unauthorized.component';
import { EquipementComponent } from './pages/equipement/equipement.component';
import { FicheEquipementComponent } from './pages/fiche-equipement/fiche-equipement.component';

import { AuthGuard } from './guards/auth.guard';
import { AdminGuard } from './guards/admin.guard';

const routes: Routes = [
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: 'login', component: LoginComponent },
  { path: 'dashboard', component: DashboardComponent, canActivate: [AuthGuard] },
  { path: 'equipement', component: EquipementComponent, canActivate: [AuthGuard] },
  { path: 'fiche-equipement', component: FicheEquipementComponent, canActivate: [AuthGuard] },
  { path: 'fiche-equipement/:id', component: FicheEquipementComponent, canActivate: [AuthGuard] },
  {
    path: "users",
    loadComponent: () =>
      import("./components/user-management/user-management.component").then(
        (m) => m.UserManagementComponent
      ),
    canActivate: [AdminGuard],
  },
  { path: 'unauthorized', component: UnauthorizedComponent },
  { path: '**', redirectTo: '/login' }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {}