import { Component } from '@angular/core';
import { Platform, ToastController } from '@ionic/angular';
import { CometChat } from "@cometchat-pro/cordova-ionic-chat";
import { FCM } from 'cordova-plugin-fcm-with-dependecy-updated/ionic/ngx';
import { Router, NavigationExtras } from '@angular/router';


@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
})
export class AppComponent {
  appID = "24895648347f7602";
  region = "IN";
  constructor(private platform: Platform, private fcm: FCM, private router: Router, private toastController: ToastController) {
    this.initialzeapp();
  }
  initialzeapp() {
    this.platform.ready().then(async () => {
      console.log('platform ready');

      var appSetting = new CometChat.AppSettingsBuilder()
        .subscribePresenceForAllUsers()
        .setRegion(this.region)
        .autoEstablishSocketConnection(true)
        .build();
      await CometChat.init(this.appID, appSetting).then(
        () => {
          console.log("Initialization completed successfully");
          this.fcm
            .requestPushPermission()
            .then((result) => {
              console.log("requestPushPermission", result);
              if (result == false) {
                localStorage.setItem("ispusnotoficationRejected", "true");
              } else {
                this.fcm.getToken().then(async (token) => {
                  console.log("registred device token", token);
                  // if (token != '' || token != undefined) {
                  localStorage.setItem("fcmdeviceToken", token);
                  this.fcm
                    .createNotificationChannel({
                      id: "defaultChannel",
                      name: "default",
                      importance: "high",
                      sound: "msgtone",
                    })
                    .then((result: any) => {
                      console.log("channel registred");
                    });
                  await CometChat.registerTokenForPushNotification(token).then(
                    (result) => {
                      console.log("Token inserted successfully");
                    }
                  );

                  // }
                });
              }
            })
            .catch((error: any) => {
              console.log(error);
              localStorage.setItem("ispusnotoficationRejected", "true");
            });
          // You can now call login function.
        },
        (error) => {
          console.log("Initialization failed with error:", error);
          // Check the reason for error and take appropriate action.
        }
      );
      await this.fcm.getInitialPushPayload().then((data: any) => {
        console.log("app killed state", data);

        if (data.message) {
          var message_details = JSON.parse(data.message);
          console.log("message details", message_details);
          var chatObj = {
            name_reciver: message_details.data.entities.sender.entity.name,
            mobile_num: "",
            cometChat_ID: message_details.sender,
            from: "notification",
          };
          let navParams: NavigationExtras = {
            state: {
              chatObject: chatObj,
            },
          };
          this.router.navigate(["/chat-ui"], navParams);
        }
      });

      await this.fcm.onNotification().subscribe(async (data: any) => {
        console.log("data received before", JSON.stringify(data));


        if (data.wasTapped) {
          console.log("data received fcm");

          if (data.message) {
            var message_details = JSON.parse(data.message);
            console.log("message details", message_details);
            var chatObj = {
              name_reciver: message_details.data.entities.sender.entity.name,
              mobile_num: "",
              cometChat_ID: message_details.sender,
              from: "notification",
            };
            let navParams: NavigationExtras = {
              state: {
                chatObject: chatObj,
              },
            };
            this.router.navigate(["/chat-ui"], navParams);
          }
        } else {
          console.log(
            "a new notification has been received",
            JSON.stringify(data)
          );
          if (data.message) {
            if (this.router.url === "/chat-ui") {
            } else {
              if (this.platform.is("ios")) {

              } else {
                this.PushNotificationforCometChat(
                  "New message received from " + data.title,
                  data
                );
              }
            }
          }
        }
      });
    });



  }

  async PushNotificationforCometChat(title: any, cometChatNotification: any) {
    const toast = await this.toastController.create({
      message: title,
      duration: 8000,
      position: "top",

      buttons: [
        {
          side: "start",
          text: "Open",
          handler: () => {
            var message_details = JSON.parse(cometChatNotification.message);
            console.log("message details", message_details);
            var chatObj = {
              name_reciver: message_details.data.entities.sender.entity.name,
              mobile_num: "",
              cometChat_ID: message_details.sender,
              from: "notification",
            };
            let navParams: NavigationExtras = {
              state: {
                chatObject: chatObj,
              },
            };
            this.router.navigate(["/chat-ui"], navParams);
          },
        },
      ],
    });
    toast.present();
  }



}
