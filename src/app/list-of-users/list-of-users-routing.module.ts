import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ListOfUsersPage } from './list-of-users.page';

const routes: Routes = [
  {
    path: '',
    component: ListOfUsersPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ListOfUsersPageRoutingModule {}
