// src/app/components/chatbot/chatbot.component.ts
import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  ViewEncapsulation,
} from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import { ChatService } from "../../providers/chat.service";
import { addIcons } from "ionicons";
import {
  arrowForward,
  close,
  paperPlane,
  shieldCheckmark,
} from "ionicons/icons";

@Component({
  selector: "app-chatbot",
  templateUrl: "./chatbot.component.html",
  styleUrls: ["./chatbot.component.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  encapsulation: ViewEncapsulation.None,
})
export class ChatbotComponent implements OnInit {
  @Input() isOpen = false;
  @Input() dashboardData: any = {};
  @Output() closeChat = new EventEmitter<void>();

  currentMessage = "";
  isTyping = false;
  messages: any[] = [];

  constructor(private chatService: ChatService) {
    addIcons({
      shieldCheckmark,
      paperPlane,
      close,
    });
  }

  ngOnInit() {
    console.log("Chatbot initialized, isOpen:", this.isOpen);

    // Initialize with welcome message
    this.messages = [
      {
        type: "bot",
        text: "Hello! I'm your Security Assistant. Ask me about occupancy status, alerts, or security summaries.",
        timestamp: new Date(),
      },
    ];
  }

  onCloseChat() {
    this.closeChat.emit();
  }

  sendMessage() {
    if (!this.currentMessage?.trim()) return;

    // Add user message
    this.messages.push({
      type: "user",
      text: this.currentMessage,
      timestamp: new Date(),
    });

    const userMessage = this.currentMessage;
    this.currentMessage = "";

    // Show typing indicator
    this.isTyping = true;

    // Call the API
    this.chatService.sendMessage(userMessage).subscribe({
      next: (response) => {
        this.isTyping = false;

        // Add bot response
        this.messages.push({
          type: "bot",
          text: response,
          timestamp: new Date(),
        });

        this.scrollToBottom();
      },
      error: (error) => {
        this.isTyping = false;

        // Add error message as bot response
        this.messages.push({
          type: "bot",
          text:
            error.message || "Sorry, I encountered an error. Please try again.",
          timestamp: new Date(),
        });

        this.scrollToBottom();
      },
    });

    this.scrollToBottom();
  }

  sendQuickMessage(message: string) {
    this.currentMessage = message;
    this.sendMessage();
  }

  private scrollToBottom() {
    setTimeout(() => {
      const chatMessages = document.querySelector(".chat-messages");
      if (chatMessages) {
        chatMessages.scrollTop = chatMessages.scrollHeight;
      }
    }, 100);
  }
}
