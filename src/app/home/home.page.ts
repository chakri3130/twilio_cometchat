import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CometChat } from '@cometchat-pro/cordova-ionic-chat';

declare var cordova: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {
  constructor(private router: Router) {}
  authKey = '658ee5230a305a2196bc8891ef02b7c0ae43954f';
  uid = 'superhero1';
  name = 'Ironman';
  connectToCommetchat() {
    console.log('connectToCommetchat');
    CometChat.getLoggedinUser().then(
      (user) => {
        if (!user) {
          CometChat.login(this.uid, this.authKey).then(
            (user) => {
              console.log('Login Successful:', JSON.stringify(user));
              this.router.navigate(['/list-of-users']);
            },
            (error) => {
              console.log('Login failed with exception:', { error });
            }
          );
        } else {
          console.log('User already logged in:', { user });
          this.router.navigate(['/list-of-users']);
        }
      },
      (error) => {
        console.log('Some Error Occured', { error });
      }
    );
  }
  connectToTwilio() {
    console.log('connectToTwilio');
    cordova.plugins.videocall
      .new_activity('roomName', 'accessToken')
      .then((result: any) => {
        console.log('result', result);
      })
      .catch((error: any) => {
        console.log('error', error);
      });
  }
}
