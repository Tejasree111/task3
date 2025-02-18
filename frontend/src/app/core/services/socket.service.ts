import { Injectable } from "@angular/core";
import { io, Socket } from "socket.io-client";

@Injectable({
  providedIn: "root",
})
export class SocketService {
  private socket: Socket;

  constructor() {
    this.socket = io('http://localhost:3000', {
        transports: ['websocket'],
        withCredentials: true,
      });
  
  }

  joinRoom(groupId: string) {
    this.socket.emit("joinRoom", { group_id: groupId });
  }

  sendMessage(senderId: number, receiverId: number | null, groupId: number | null, message: string) {
    this.socket.emit("sendMessage", { sender_id: senderId, receiver_id: receiverId, group_id: groupId, message });
  }

  receiveMessage(callback: (message: any) => void) {
    this.socket.on("receiveMessage", callback);
  }
}
