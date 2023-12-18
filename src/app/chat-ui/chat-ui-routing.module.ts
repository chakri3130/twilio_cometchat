import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { ChatUiPage } from './chat-ui.page';

const routes: Routes = [
  {
    path: '',
    component: ChatUiPage
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class ChatUiPageRoutingModule {}
