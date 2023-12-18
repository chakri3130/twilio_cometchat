import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ListOfUsersPageRoutingModule } from './list-of-users-routing.module';

import { ListOfUsersPage } from './list-of-users.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ListOfUsersPageRoutingModule
  ],
  declarations: [ListOfUsersPage]
})
export class ListOfUsersPageModule {}
