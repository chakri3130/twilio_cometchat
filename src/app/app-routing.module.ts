import { NgModule } from '@angular/core';
import { PreloadAllModules, RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then( m => m.HomePageModule)
  },
  {
    path: '',
    redirectTo: 'home',
    pathMatch: 'full'
  },
  {
    path: 'list-of-users',
    loadChildren: () => import('./list-of-users/list-of-users.module').then( m => m.ListOfUsersPageModule)
  },
  {
    path: 'chat-ui',
    loadChildren: () => import('./chat-ui/chat-ui.module').then( m => m.ChatUiPageModule)
  },
];

@NgModule({
  imports: [
    RouterModule.forRoot(routes, { preloadingStrategy: PreloadAllModules })
  ],
  exports: [RouterModule]
})
export class AppRoutingModule { }
