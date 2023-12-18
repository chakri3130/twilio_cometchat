import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute, NavigationExtras } from '@angular/router';
import { CometChat } from "@cometchat-pro/cordova-ionic-chat";

@Component({
  selector: 'app-list-of-users',
  templateUrl: './list-of-users.page.html',
  styleUrls: ['./list-of-users.page.scss'],
})
export class ListOfUsersPage implements OnInit {
  users: any = [];
  constructor(private router: Router) { }

  ngOnInit() {
  }

  ionViewWillEnter() {
    let limit = 30;
    let usersRequest = new CometChat.UsersRequestBuilder()
      .setLimit(limit)
      .build();

    usersRequest.fetchNext().then(
      userList => {
        console.log("User list received:", userList);
        this.users = userList;
      }, error => {
        console.log("User list fetching failed with error:", error);
      }
    );
    console.log('usersRequest', usersRequest);
  }

  chatwithSelectedUser(user: any) {

    console.log('chatwithSelectedUser', user);
    var chatObj = {
      "cometChat_ID": user.uid,
      "name": user.name,
      "avatar": user.avatar,
      "status": user.status,
      "conversationId": user.conversationId
    }
    let navParams: NavigationExtras = {
      state: {
        chatObject: chatObj,
      },
    };
    this.router.navigate(['/chat-ui'], navParams);
  }

}
