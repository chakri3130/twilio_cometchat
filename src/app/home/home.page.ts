import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { CometChat } from "@cometchat-pro/cordova-ionic-chat";

declare var cordova: any;

@Component({
  selector: 'app-home',
  templateUrl: 'home.page.html',
  styleUrls: ['home.page.scss'],
})
export class HomePage {

  constructor(private router: Router) {
  }
  authKey = "658ee5230a305a2196bc8891ef02b7c0ae43954f";
  uid = "superhero2";
  name = "Captain America";
  connectToCommetchat() {
    console.log('connectToCommetchat');
    CometChat.getLoggedinUser().then(
      (user) => {
        if (!user) {
          CometChat.login(this.uid, this.authKey).then(
            user => {
              console.log("Login Successful:", JSON.stringify(user));
              this.router.navigate(['/list-of-users']);
            }, error => {
              console.log("Login failed with exception:", { error });
            }
          );
        } else {
          console.log("User already logged in:", { user });
          this.router.navigate(['/list-of-users']);
        }
      }, error => {
        console.log("Some Error Occured", { error });
      }
    );
  }
  connectToTwilio() {
    console.log('connectToTwilio');
    cordova.plugins.videocall.new_activity('example', 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCIsImN0eSI6InR3aWxpby1mcGE7dj0xIn0.eyJqdGkiOiJTS2VlM2Y5ZGFmN2JlMTQxNjEwNWUwMjlhMjgwN2ZhOTA5LTE3MDE5NDQ2MDIiLCJncmFudHMiOnsiaWRlbnRpdHkiOiJjaGV0YW4iLCJ2aWRlbyI6eyJyb29tIjoiZXhhbXBsZSJ9fSwiaWF0IjoxNzAxOTQ0NjAyLCJleHAiOjE3MDE5NDgyMDIsImlzcyI6IlNLZWUzZjlkYWY3YmUxNDE2MTA1ZTAyOWEyODA3ZmE5MDkiLCJzdWIiOiJBQzkwMzZiYmYxZjljYTczMmQzZWQxMTc2YjkwNjliNzFjIn0.NmBOBuYWnQcoAQKS5d2fbNiXJ3p5veYKsqoh9etYrto').then((result: any) => {
      console.log('result', result);
    }).catch((error: any) => {
      console.log('error', error);
    });

  }
  login() {
  }
}
