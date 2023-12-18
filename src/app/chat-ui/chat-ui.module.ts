import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

import { IonicModule } from '@ionic/angular';

import { ChatUiPageRoutingModule } from './chat-ui-routing.module';

import { ChatUiPage } from './chat-ui.page';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ChatUiPageRoutingModule
  ],
  declarations: [ChatUiPage]
})
export class ChatUiPageModule {}
