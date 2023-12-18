import { Component, OnInit, ViewChild } from '@angular/core';
import { CometChat } from "@cometchat-pro/cordova-ionic-chat";
import { FileOpener } from "@awesome-cordova-plugins/file-opener/ngx";
import { Chooser } from "@awesome-cordova-plugins/chooser/ngx";
import { File, FileEntry } from "@awesome-cordova-plugins/file/ngx";
import { Platform } from "@ionic/angular";
import validator from "validator";
import { Router } from "@angular/router";
import { ImagePicker } from "@awesome-cordova-plugins/image-picker/ngx";
import { EmailComposer } from "@awesome-cordova-plugins/email-composer/ngx";
import { HttpClient, HttpEventType } from "@angular/common/http";
import {
  ToastController,
  NavController,
  IonContent,
  ActionSheetController,
  ModalController,
  AlertController,
} from "@ionic/angular";
import * as moment from "moment";

declare var cordova: any;
@Component({
  selector: 'app-chat-ui',
  templateUrl: './chat-ui.page.html',
  styleUrls: ['./chat-ui.page.scss'],
  providers: [FileOpener, File]
})
export class ChatUiPage implements OnInit {
  @ViewChild(IonContent, { read: IonContent, static: false })
  content: any;
  loggedInUserData: any
  socket: any;
  Object_recived: any;
  userMessages: any = [];
  messageStatus: any;
  currentUserStatus: any;
  messagesRequest: any;

  EditedMessage: any;
  sendMessagestatus: boolean = true;
  public messageMedia: any;
  previousMessageDate: any;
  listenerId = "OneOnOneMessageListners";
  currentData: any;
  Object: any;
  Details: any
  presentMessageDate: any;
  messageText: any = "";
  message: any = '';
  ROOM_ID_CHAT: any;
  constructor(private router: Router,
    private chooser: Chooser,
    private imagePicker: ImagePicker,
    private emailComposer: EmailComposer,
    private file: File,
    private http: HttpClient,
    private platform: Platform,
    private actionSheetController: ActionSheetController,
    private modalController: ModalController,
    private alertController: AlertController,
    private fileOpener: FileOpener) {
    this.Object = this.router.getCurrentNavigation()?.extras.state;
    this.Object_recived = this.Object.chatObject;
    this.Details = this.Object_recived;
    this.ROOM_ID_CHAT = this.generateId(5);
  }

  ionViewWillEnter() {
    CometChat.getLoggedinUser().then((user) => {
      if (user) {
        this.loggedInUserData = user;
        setTimeout(() => {
          this.content.scrollToBottom(300);
        }, 2000);
      }
    });
  }
  addMessageEventListner() {
    CometChat.addMessageListener(
      this.listenerId,
      new CometChat.MessageListener({
        onTextMessageReceived: (textMessage: any) => {
          if (
            textMessage.receiverId === this.loggedInUserData.getUid() &&
            textMessage.sender.uid === this.currentData.uid
          ) {
            if (
              validator.isEmail(textMessage.text) ||
              validator.isURL(textMessage.text)
            ) {
              textMessage["isURL"] = true;
            } else {
              textMessage["isURL"] = false;
            }
            this.userMessages.push(textMessage);
            this.sendReadReceipts(textMessage);
            this.moveToBottom();
          }
        },
        onMediaMessageReceived: (mediaMessage: any) => {
          if (
            mediaMessage.receiverId === this.loggedInUserData.getUid() &&
            mediaMessage.sender.uid === this.currentData.uid
          ) {
            mediaMessage["isURL"] = false;

            this.userMessages.push(mediaMessage);
            this.sendReadReceipts(mediaMessage);
            this.moveToBottom();
          }
        },
        onCutomMessageReceived: (customMessage: any) => {
          // Handle custom message
        },
        onMessageDelivered: (messageReceipt: any) => {
          this.updateDeliveredAt(messageReceipt);
          this.messageStatus = "";
        },
        onMessageRead: (messageReceipt: any) => {
          this.updatedeReadAt(messageReceipt);
          this.messageStatus = "";
        },
        onTypingStarted: (typingIndicator: any) => {
          if (typingIndicator.sender.uid === this.currentData.uid) {
            this.currentUserStatus = "typing....";
          }
        },
        onTypingEnded: (typingIndicator: any) => {
          if (typingIndicator.sender.uid === this.currentData.uid) {
            this.currentUserStatus = this.currentData.status;
          }
        },
        onMessageDeleted: (message: any) => {
          console.log("Deleted Message", message);
        },
      })
    );
  }

  sendReadReceipts(message: any) {
    for (let i = 0; i < this.userMessages.length; i++) {
      if (
        this.userMessages[i].id === message.id &&
        this.userMessages[i].sender.uid !== this.loggedInUserData.getUid()
      ) {
        // CometChat.markAsRead(
        //   this.userMessages[i].id,
        //   this.userMessages[i].sender.uid,
        //   this.userMessages[i].receiverType
        // );
        CometChat.markAsRead(this.userMessages[i]);
      }
    }
  }

  sendReadBulkReceipts() {
    for (let i = 0; i < this.userMessages.length; i++) {
      if (this.userMessages[i].receiver !== this.currentData) {
        // CometChat.markAsRead(
        //   this.userMessages[i].id,
        //   this.userMessages[i].sender.uid,
        //   this.userMessages[i].receiverType
        // );
        CometChat.markAsRead(this.userMessages[i]);
      }
    }
  }

  ionViewWillLeave() {
    CometChat.removeMessageListener(this.listenerId);
  }

  async ngOnInit() {
    const limit = 30;
    this.currentData = this.Object_recived.cometChat_ID;
    await CometChat.getUser(this.currentData).then(
      (user) => {
        this.currentData = user;
        console.log(user);
      },
      (error) => {
        console.log("User details fetching failed with error:", error);
      }
    );

    this.messagesRequest = new CometChat.MessagesRequestBuilder()
      .setLimit(limit)
      .setUID(this.currentData.uid)
      .build();
    this.loadMessages();
    this.addMessageEventListner();
    this.currentUserStatus = this.currentData.status;
    this.addUserEventListner();
    CometChat.getUnreadMessageCountForUser(this.currentData.uid).then(
      (array) => {
        console.log("Message count fetched", array);
      },
      (error) => {
        console.log("Error in getting message count", error);
      }
    );
  }

  loadMessages() {
    this.messagesRequest.fetchPrevious().then(
      (messages: any) => {
        console.log("Message list fetched:", messages);
        if (messages.length > 0) {
          console.log(messages);
          //this.userMessages = messages;
          for (let i = 0; i < messages.length; i++) {
            const date = new Date(messages[i].sentAt * 1000);
            console.log("date", date);

            if (i == 0) {
              messages[i]["date"] = moment(date).format("MM/DD/YYYY");
              console.log(messages[i]["date"]);
              if (messages[i].category != "action") {
                if (messages[i].deletedAt) {
                  delete messages[i];
                  console.log(this.userMessages);
                } else {
                  this.userMessages.push(messages[i]);
                  this.previousMessageDate = messages[i]["date"];
                  this.ValidateMessage(messages[i]);
                }
              }
            } else {
              const date = new Date(messages[i].sentAt * 1000);
              this.presentMessageDate = moment(date).format("MM/DD/YYYY");
              if (this.previousMessageDate == this.presentMessageDate) {
                messages[i]["date"] = "";
                if (messages[i].category != "action") {
                  if (messages[i].deletedAt) {
                    delete messages[i];
                    console.log(this.userMessages);
                  } else {
                    this.userMessages.push(messages[i]);
                    this.ValidateMessage(messages[i]);
                  }
                }
              } else {
                messages[i]["date"] = this.presentMessageDate;
                if (messages[i].category != "action") {
                  if (messages[i].deletedAt) {
                    delete messages[i];
                    console.log(this.userMessages);
                  } else {
                    this.userMessages.push(messages[i]);
                    this.previousMessageDate = this.presentMessageDate;
                    this.ValidateMessage(messages[i]);
                  }
                }
              }
            }
          }
        } else {
          console.log("empty");
          this.userMessages = [];
        }
        console.log(this.currentData.uid);
        this.sendReadBulkReceipts();
        this.moveToBottom();
        for (let j = 0; j < this.userMessages.length; j++) {
          console.log(this.userMessages[j].deletedAt);
          if (this.userMessages[j].deletedAt) {
            // delete this.userMessages[j];
            console.log(this.userMessages);
          }
        }
        //console.log(this.userMessages);
      },
      (error: any) => {
        console.log("Message fetching failed with error:", error);
      }
    );
  }
  addUserEventListner() {
    const listenerID = "UserEventsListner";

    CometChat.addUserListener(
      listenerID,
      new CometChat.UserListener({
        onUserOnline: (onlineUser: any) => {
          if (onlineUser.uid === this.currentData.uid) {
            this.currentUserStatus = "Online";
          }
        },
        onUserOffline: (offlineUser: any) => {
          if (offlineUser.uid === this.currentData.uid) {
            this.currentUserStatus = "Offline";
          }
        },
      })
    );
  }

  sendMessage() {
    if (this.messageText !== "") {
      var receiverType = CometChat.RECEIVER_TYPE.USER;
      const textMessage = new CometChat.TextMessage(
        this.currentData.uid,
        this.messageText,
        receiverType
      );
      var messageText = this.messageText;

      CometChat.sendMessage(textMessage).then(
        (message: any) => {
          console.log("Message sent successfully:", message);
          const date = new Date(message.sentAt * 1000);
          this.presentMessageDate = moment(date).format("MM/DD/YYYY");
          if (this.previousMessageDate == this.presentMessageDate) {
            message["date"] = "";
          } else {
            message["date"] = this.presentMessageDate;
            this.previousMessageDate = this.presentMessageDate;
          }
          if (
            validator.isEmail(this.messageText) ||
            validator.isURL(this.messageText)
          ) {
            message["isURL"] = true;
          } else {
            message["isURL"] = false;
          }
          this.userMessages.push(message);
          this.messageText = "";

          this.moveToBottom();
        },
        (error) => {
          console.log("Message sending failed with error:", error);
        }
      );
    }
  }

  moveToBottom() {
    //this.content.scrollToBottom(1500);
    // let yOffset =
    //   document.getElementById("messageList").offsetTop +
    //   document.getElementById("messageList").offsetHeight;
    // this.content.scrollToPoint(0, yOffset, 500);
  }

  logScrollStart() {
    console.log("logScrollStart : When Scroll Starts");
  }

  logScrolling($event: any) {
    if ($event.detail.scrollTop === 0) {
      this.loadPreviousMessages();
    }
  }

  loadPreviousMessages() {
    this.messagesRequest.fetchPrevious().then(
      (messages: any) => {
        const newMessages = messages;
        if (newMessages !== "") {
          this.userMessages = newMessages.concat(this.userMessages);
        }
      },
      (error: any) => {
        console.log("Message fetching failed with error:", error);
      }
    );
  }

  logScrollEnd() {
    console.log("logScrollEnd : When Scroll Ends");
  }

  MessageSent(Message: any, jsonObj: any) {
    this.message = "";
    this.socket.emit("SEND_MESSAGE", {
      author: this.Details.author,
      message: Message, //"wants to chat with you !! please"
      timestamp: moment().format(),
      to: this.Details.to,
      files: "",
      type: "chat",
      sender_id: this.Details.sender_id,
      reciver_id: this.Details.reciver_id,
      name_sender: this.Details.name_sender,
      name_reciver: this.Details.name_reciver,
      sender_imgurl: this.Details.sender_imgurl,
      reciver_imgurl: this.Details.reciver_imgurl,
      room_id: this.ROOM_ID_CHAT, //this.utils.generateId(5),
    });
  }

  checkBlur() {
    const receiverId = this.currentData.uid;
    const receiverType = CometChat.RECEIVER_TYPE.USER;
    const typingNotification = new CometChat.TypingIndicator(
      receiverId,
      receiverType
    );
    CometChat.endTyping(typingNotification);
  }

  checkFocus() {
    console.log("checkFocus called");
  }

  checkInput() {
    const receiverId = this.currentData.uid;
    const receiverType = CometChat.RECEIVER_TYPE.USER;
    const typingNotification = new CometChat.TypingIndicator(
      receiverId,
      receiverType
    );
    CometChat.startTyping(typingNotification);
  }

  updatedeReadAt(messageReceipt: any) {
    for (let i = 0; i < this.userMessages.length; i++) {
      if (this.userMessages[i].id === messageReceipt.messageId) {
        const timestamp = Number(messageReceipt.timestamp);
        this.userMessages[i].readAt = timestamp;
      }
    }
  }

  updateDeliveredAt(messageReceipt: any) {
    for (let i = 0; i < this.userMessages.length; i++) {
      if (this.userMessages[i].id === messageReceipt.messageId) {
        const timestamp = Number(messageReceipt.timestamp);
        this.userMessages[i].deliveredAt = timestamp;
      }
    }
  }

  addDeliveryReadEventListners() {
    const listenerId = "OneOnOneMessageDeliveryReadListners";

    CometChat.addMessageListener(
      listenerId,
      new CometChat.MessageListener({
        onMessageDelivered: (messageReceipt: any) => {
          this.updateDeliveredAt(messageReceipt);
          this.messageStatus = "";
        },
        onMessageRead: (messageReceipt: any) => {
          this.updatedeReadAt(messageReceipt);
          this.messageStatus = "";
        },
      })
    );
  }

  addTypingListner() {
    const listenerId = "OneOnOneTypingListner";

    CometChat.addMessageListener(
      listenerId,
      new CometChat.MessageListener({
        onTypingStarted: (typingIndicator: any) => {
          if (typingIndicator.sender.uid === this.currentData.uid) {
            this.currentUserStatus = "typing....";
          }
        },
        onTypingEnded: (typingIndicator: any) => {
          if (typingIndicator.sender.uid === this.currentData.uid) {
            this.currentUserStatus = "online";
          }
        },
      })
    );
  }

  // async showToast(msg:any) {
  //   let toast = await this.toastCtrl.create({
  //     message: msg,
  //     position: "top",
  //     duration: 2000,
  //   });
  //   toast.present();
  // }
  EditMessage(MessageId: any) {
    this.messageText = MessageId.text;
    // this.editMessage = true;
    this.EditedMessage = MessageId;
    this.sendMessagestatus = false;
  }

  async showActionSheet() {
    const actionSheet = await this.actionSheetController.create({
      header: "Actions",
      buttons: [
        {
          text: "Image",
          handler: () => {
            console.log("IMAGE PICKER CLICKED");
            this.ImagePicker();
          },
        },
        {
          text: "Document",
          handler: () => {
            console.log("DOCUMENT PICKER CLICKED");
            this.DocumentPicker();
          },
        },
        {
          text: "Cancel",
          role: "cancel",
          handler: () => {
            console.log("Cancel clicked");
          },
        },
      ],
    });
    await actionSheet.present();
  }

  DocumentPicker() {
    // this.chooser.getFile('all')
    this.chooser
      .getFile()
      .then((response: any) => {
        const blob_nw = this.dataURItoBlob(response.dataURI);

        const file = {
          file: blob_nw,
          type: response.mediaType,
          name: response.name,
        };

        this.messageMedia = file;
        this.sendMediaMessage();
      })
      .catch((e) => console.log(e));
  }

  ImagePicker() {
    const options = {
      outputType: 1,
      disable_popover: true,
    };
    this.imagePicker.getPictures(options).then(
      (results) => {
        results[0] = "data:image/jpeg;base64," + results[0];
        const blob_nw = this.dataURItoBlob(results[0]);
        const date = new Date();
        const file = {
          file: blob_nw,
          type: "image/jpeg",
          name: "temp_img" + date.getTime(),
        };

        this.messageMedia = file;
        this.sendMediaMessage();
      },
      (err) => {
        console.log(err);
      }
    );
  }

  dataURItoBlob(dataURI: any) {
    const byteString = atob(dataURI.split(",")[1]);
    const mimeString = dataURI.split(",")[0].split(":")[1].split(";")[0];
    const ab = new ArrayBuffer(byteString.length);
    const ia = new Uint8Array(ab);
    for (let i = 0; i < byteString.length; i++) {
      ia[i] = byteString.charCodeAt(i);
    }
    const bb = new Blob([ab], { type: mimeString });
    return bb;
  }

  sendMediaMessage() {
    let messageType = CometChat.MESSAGE_TYPE.IMAGE;
    if (this.messageMedia.type.split("/")[0] === "image") {
      messageType = CometChat.MESSAGE_TYPE.IMAGE;
    } else if (this.messageMedia.type.split("/")[0] === "video") {
      messageType = CometChat.MESSAGE_TYPE.VIDEO;
    } else {
      messageType = CometChat.MESSAGE_TYPE.FILE;
    }
    const receiverType = CometChat.RECEIVER_TYPE.USER;
    const mediaMessage = new CometChat.MediaMessage(
      this.currentData.uid,
      this.messageMedia.file,
      messageType,
      receiverType
    );
    CometChat.sendMessage(mediaMessage).then(
      (message: any) => {
        message["isURL"] = false;
        this.userMessages.push(message);
        this.messageMedia = {};
        this.moveToBottom();
      },
      (error) => {
        console.log("Media message sending failed with error", error);
      }
    );
  }

  // async viewImage(src: any) {
  //   console.log("related to image", src);
  //   const modal = await this.modalController.create({
  //     component: ImageViewerComponent,
  //     componentProps: {
  //       imgSource: src.data.url,
  //       imageInfo: src,
  //     },
  //     cssClass: "modal-fullscreen",
  //     keyboardClose: true,
  //     showBackdrop: true,
  //   });
  //   modal.onDidDismiss().then((result) => {
  //     console.log("id", result);
  //     if (result.data != undefined) {
  //       this.deleteAImage(result.data);
  //     }
  //   });

  //   return await modal.present();
  // }

  openLink(url: any, isEmail: any) {
    console.log("URL", url);
    if (isEmail && validator.isEmail(url)) {
      this.emailComposer
        .requestPermission()
        .then((result) => {
          cordova.plugins.email.open({
            to: url,
            subject: "From Cloud 9",
            body: "How are you?",
          });
        })
        .catch((error) => {
          console.log("email error", error);
        });

      // cordova.plugins.email.open();
      // this.emailComposer.open({to: url, subject: 'From Cloud9', body: 'How are you?'}, true);
    } else {
      //this.iab.create(url, '_system');
      this.downloadFile(url);
    }
  }

  //********************************************* To Delete a Message **********************************/

  deleteAMessage(selectedMessage: any) {
    if (
      selectedMessage.sender.uid == this.loggedInUserData.getUid() &&
      selectedMessage.text != undefined
    ) {
      this
        .alertWithConformation(
          "Cloud 9",
          "Are you sure you want to delete this message?",
          "Yes",
          "No"
        )
        .then((result: any) => {
          if (result == true) {
            console.log("selected Message details", selectedMessage.id);
            let messageId = selectedMessage.id;

            CometChat.deleteMessage(messageId).then(
              (message: any) => {
                console.log("Message deleted", message);
                for (let i = 0; i < this.userMessages.length; i++) {
                  if (this.userMessages[i].id == message.id) {
                    this.userMessages[i].text = message.text;
                  }
                }
                console.log(this.userMessages);
              },
              (error) => {
                console.log("Message delete failed with error:", error);
              }
            );
          }
        });
    }
  }

  //**************************************** Delete a Image ******************************/
  deleteAImage(messageId: any) {
    this
      .alertWithConformation(
        "Cloud 9",
        "Are you sure you want to delete this attachment?",
        "Yes",
        "No"
      )
      .then((result: any) => {
        if (result == true) {
          CometChat.deleteMessage(messageId).then(
            (message: any) => {
              console.log("Message deleted", message);
              for (let i = 0; i < this.userMessages.length; i++) {
                if (this.userMessages[i].id == message.id) {
                  this.userMessages[i].data.type = "";
                }
              }
              //this.loadMessages();
              console.log(this.userMessages);
            },
            (error) => {
              console.log("Message delete failed with error:", error);
              if (error.code == "ERR_MESSAGE_NOT_A_SENDER") {
                this.alertWithTitle(
                  "You are not a sender for this selected message."
                );
              }
            }
          );
        }
      });
  }

  //************************** Check the message is URL or Not  *******************************/

  ValidateMessage(message: any) {
    if (message.type == "text") {
      if (message.text == undefined) {
        message["isURL"] = false;
      } else {
        if (validator.isEmail(message.text) || validator.isURL(message.text)) {
          message["isURL"] = true;
        } else {
          message["isURL"] = false;
        }
      }
    }
  }



  extractExtensionFromMime(Mime: any) {
    let types: { [key: string]: string } = {
      "text/html": ".html",
      "text/css": ".css",
      "text/xml": ".xml",
      "image/gif": ".gif",
      "image/jpeg": ".jpeg",
      "application/x-javascript": ".js",
      "application/atom+xml": ".atom",
      "application/rss+xml": ".rss",
      "text/mathml": ".mml",
      "text/plain": ".txt",
      "text/vnd.sun.j2me.app-descriptor": ".jad",
      "text/vnd.wap.wml": ".wml",
      "text/x-component": ".htc",
      "image/png": ".png",
      "image/tiff": ".tif",
      "image/vnd.wap.wbmp": ".wbmp",
      "image/x-icon": ".ico",
      "image/x-jng": ".jng",
      "image/x-ms-bmp": ".bmp",
      "image/svg+xml": ".svg",
      "image/webp": ".webp",
      "application/java-archive": ".jar",
      "application/mac-binhex40": ".hqx",
      "application/msword": ".doc",
      "application/pdf": ".pdf",
      "application/postscript": ".ps",
      "application/rtf": ".rtf",
      "application/vnd.ms-excel": ".xls",
      "application/vnd.ms-powerpoint": ".ppt",
      "application/vnd.wap.wmlc": ".wmlc",
      "application/vnd.google-earth.kml+xml": ".kml",
      "application/vnd.google-earth.kmz": ".kmz",
      "application/x-7z-compressed": ".7z",
      "application/x-cocoa": "cco",
      "application/x-java-archive-diff": ".jardiff",
      "application/x-java-jnlp-file": ".jnlp",
      "application/x-makeself": ".run",
      "application/x-perl": ".pl",
      "application/x-pilot": ".prc",
      "application/x-rar-compressed": ".rar",
      "application/x-redhat-package-manager": ".rpm",
      "application/x-sea": ".sea",
      "application/x-shockwave-flash": ".swf",
      "application/x-stuffit": ".sit",
      "application/x-tcl": ".tcl",
      "application/x-x509-ca-cert": ".der",
      "application/x-xpinstall": ".xpi",
      "application/xhtml+xml": ".xhtml",
      "application/zip": "zip",
      "application/octet-stream": ".bin",
      "audio/midi": ".mid",
      "audio/mpeg": ".mp3",
      "audio/ogg": ".ogg",
      "audio/x-realaudio": ".ra",
      "video/3gpp": ".3gp",
      "video/mpeg": ".mpg",
      "video/quicktime": ".mov",
      "video/x-flv": ".flv",
      "video/x-mng": ".mng",
      "video/x-ms-asf": ".asx",
      "video/x-ms-wmv": ".wmv",
      "video/x-msvideo": ".avi",
      "video/mp4": ".mp4",
    };


    return types[Mime];
  }

  downloadFile(msgObj: any): Promise<{ fileEntry: FileEntry; type: string }> {
    //you will need to pass message object in this method.
    let fileURL = msgObj.url; //url of file.
    let mimeType = msgObj.mimeType; //type of file;
    let folderName = "ionic-Download"; //you can replace with the folder name you want to create inside the path mentioned
    // you can replace below fileName with the nam eyou are passing. Default eg- file121343435.pdf
    let fileName =
      "file" + new Date().getTime() + this.extractExtensionFromMime(mimeType); //extracting file extension from MimeType(no need to use this method if you are passing name with file extension)
    console.log("FileName: ", fileName);
    return new Promise((resolve, reject) => {
      // Get the file from the given URL argument. Note responseType is set to 'blob'.
      // It can also be set to 'arraybuffer', but response.body will be of different
      // type and needs to be handled slightly differently.
      this.http
        .get(fileURL, {
          observe: "response",
          responseType: "blob",
        })
        .subscribe(
          (response: any) => {
            if (response.type === HttpEventType.DownloadProgress) {
              // you can use this to show download percentage on screen.
              let progress =
                Math.round((100 * response.loaded) / response.total) +
                "% completed";
              console.log(progress);
            } else if (response.type === HttpEventType.Response) {
              /**
                   * paths you can choose to store files- 
                   * this.file.applicationDirectory - "file:///android_asset/"
                   * this.file.applicationStorageDirectory: "file:///data/user/0/com.example.app/"
                     this.file.cacheDirectory: "file:///data/user/0/com.example.app/cache/" 
                     this.file.dataDirectory: "file:///data/user/0/com.example.app/files/" 
                     this.file.externalApplicationStorageDirectory: "file:///storage/emulated/0/Android/data/com.example.app/"
                     this.file.externalCacheDirectory: "file:///storage/emulated/0/Android/data/com.example.app/cache/"
                     this.file.externalDataDirectory: "file:///storage/emulated/0/Android/data/com.example.app/files/"
                     this.file.externalRootDirectory: "file:///storage/emulated/0/" --(default)
                     this.filesyncedDataDirectory //ios
                     this.filetempDirectory //ios
                     this.file.documentsDirectory //ios  -- (default)
                   */
              let path = this.platform.is("ios")
                ? this.file.documentsDirectory
                : this.file.dataDirectory; //set path for android and ios
              // Create /Download folder if it doesn't exist
              //  You can remove this createDir method and directly pass the path to in writeFile if you have.
              console.log("Path ->", path);
              this.file
                .createDir(path, folderName, true)
                .then((de) => {
                  // ** de refers to the directory of the system.
                  // Write the downloaded Blob as the file. Note that the file will
                  // be overwritten if it already exists!
                  this.file
                    .writeFile(de.nativeURL, fileName, response.body, {
                      replace: true,
                    })
                    .then((fe) => {
                      // remove this if you do not want to open the file after downloading.
                      let pathWithName = path + folderName + "/" + fileName;
                      this.fileOpener
                        .open(pathWithName, mimeType)
                        .then(() => console.log("file opened"))
                        .catch((err) => console.log(err));
                      // All went well, resolve the Promise.
                      return resolve({
                        fileEntry: fe, // FileEntry instance
                        type: response.body.type, // Content-Type for the file
                      });
                    })
                    .catch((err) => {
                      // writeFile failed
                      reject(err);
                    });
                })
                .catch((err) => {
                  // createDir failed
                  reject(err);
                });
            }
          },
          (err) => {
            // Download failed
            reject(err);
          }
        );
    });
  }

  async alertWithTitle(_header: string) {
    if (_header == "Cannot read property 'length' of null") {
      const alert = await this.alertController.create({
        header: "Signed Out",
        buttons: [
          {
            text: "Ok",
          },
        ],
        backdropDismiss: true,
      });
      await alert.present();
    } else {
      const alert = await this.alertController.create({
        header: _header,
        buttons: [
          {
            text: "Ok",
          },
        ],
        backdropDismiss: true,
      });
      await alert.present();
    }
  }

  public alertWithConformation(
    _header: string,
    _message: string,
    _okText: string,
    _cancelText: string
  ) {
    return new Promise((resolve, reject) => {
      console.log("resolve", resolve, reject);
      this.alertController
        .create({
          header: _header,
          message: _message,
          buttons: [
            {
              text: _cancelText,
              role: "cancel",
              handler: () => reject(false),
            },
            {
              text: _okText,
              handler: () => resolve(true),
            },
          ],
          backdropDismiss: true,
        })
        .then((alert: any) => {
          // Now we just need to present the alert
          alert.present();
        });
    });
  }
  dec2hex(dec: any) {
    return dec < 10 ? "0" + String(dec) : dec.toString(16);
  }
  public generateId(len: any) {
    var arr = new Uint8Array((len || 40) / 2);
    window.crypto.getRandomValues(arr);
    return Array.from(arr, this.dec2hex).join("");
  }

  logout() {
    CometChat.disconnect();
    localStorage.clear();
    this.router.navigate(["/home"]);
  }

}
