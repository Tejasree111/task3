import { Component, OnInit } from "@angular/core";
import { SocketService } from "../../../../../core/services/socket.service";

@Component({
  selector: "app-chat",
  templateUrl: "./chat.component.html",
})
export class ChatComponent implements OnInit {
  messages: any[] = [];
  message: string = "";
  userId = sessionStorage.getItem("user_id");

  constructor(private socketService: SocketService) {}

  ngOnInit() {
    this.socketService.receiveMessage((message) => {
      this.messages.push(message);
    });
  }

  sendMessage() {
    this.socketService.sendMessage(Number(this.userId), null, 1, this.message); // Group chat example
    this.message = "";
  }
}
