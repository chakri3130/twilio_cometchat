import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { FileOpener } from "@awesome-cordova-plugins/file-opener/ngx";
import { Chooser } from "@awesome-cordova-plugins/chooser/ngx";
import { File, FileEntry } from "@awesome-cordova-plugins/file/ngx";
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { ImagePicker } from "@awesome-cordova-plugins/image-picker/ngx";
import { EmailComposer } from "@awesome-cordova-plugins/email-composer/ngx";
import { AppComponent } from './app.component';
import { AppRoutingModule } from './app-routing.module';
import { FCM } from "cordova-plugin-fcm-with-dependecy-updated/ionic/ngx";
import { HttpClient, HttpClientModule, HttpEventType } from "@angular/common/http";
@NgModule({
  declarations: [AppComponent],
  imports: [BrowserModule, HttpClientModule, IonicModule.forRoot(), AppRoutingModule],
  providers: [FileOpener, ImagePicker, Chooser, EmailComposer, File, FCM, { provide: RouteReuseStrategy, useClass: IonicRouteStrategy }],
  bootstrap: [AppComponent],
})
export class AppModule { }
