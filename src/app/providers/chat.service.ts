import { Injectable } from "@angular/core";
import { HttpClient, HttpHeaders } from "@angular/common/http";
import { Observable, throwError } from "rxjs";
import { catchError, map, timeout } from "rxjs/operators";

export interface ChatResponse {
  success: boolean;
  response?: string;
  error?: string;
  timestamp: string;
}

@Injectable({
  providedIn: "root",
})
export class ChatService {
  private apiUrl =
    "http://127.0.0.1:5001/clear-veld-467107-f0/us-central1/chatWithAssistant";

  constructor(private http: HttpClient) {}

  /**
   * Send message to Genkit API and get AI response
   */
  sendMessage(message: string): Observable<string> {
    const payload = {
      message: message.trim(),
    };

    const headers = new HttpHeaders({
      "Content-Type": "application/json",
      Accept: "application/json",
    });

    return this.http.post<ChatResponse>(this.apiUrl, payload, { headers }).pipe(
      timeout(30000), // 30 second timeout
      map((response: ChatResponse) => {
        if (response.success && response.response) {
          return response.response;
        } else {
          throw new Error(response.error || "Unknown error occurred");
        }
      }),
      catchError(this.handleError)
    );
  }

  private handleError(error: any): Observable<never> {
    console.error("Chat API Error:", error);

    let errorMessage = "Sorry, I encountered an error. Please try again.";

    if (error.status === 0) {
      errorMessage =
        "Unable to connect to the chat service. Please check your connection.";
    } else if (error.status === 400) {
      errorMessage = "Invalid message format. Please try again.";
    } else if (error.status === 429) {
      errorMessage = "Too many requests. Please wait a moment and try again.";
    } else if (error.status === 500) {
      errorMessage =
        "The chat service is temporarily unavailable. Please try again later.";
    } else if (error.message) {
      errorMessage = error.message;
    }

    return throwError(() => new Error(errorMessage));
  }
}
