import { Component, inject, OnInit } from "@angular/core";
import { RouterLink } from "@angular/router";
import {
  IonAvatar,
  IonBadge,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent,
  IonFab,
  IonFabButton,
  IonGrid,
  IonHeader,
  IonIcon,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { GuardService } from "../../providers/guard.service";

export interface Guard {
  id: string;
  name: string;
  position: string;
  profilePic: string;
  status: "on-duty" | "off-duty" | "break" | "patrol";
  currentZone: string;
  shiftStart: string;
  shiftEnd: string;
  experience: number;
  contactNumber: string;
  emergencyContact: string;
  certifications: string[];
  lastActivity: Date;
  performanceRating: number;
}

@Component({
  selector: "page-guard-list",
  templateUrl: "guard-list.html",
  styleUrls: ["./guard-list.scss"],
  imports: [
    IonHeader,
    IonToolbar,
    IonButtons,
    IonMenuButton,
    IonTitle,
    IonContent,
    IonGrid,
    IonRow,
    IonCol,
    IonCard,
    IonCardHeader,
    IonItem,
    IonAvatar,
    IonLabel,
    IonBadge,
    IonCardContent,
    IonList,
    IonIcon,
    IonFab,
    IonFabButton,
    RouterLink,
  ],
})
export class GuardListPage implements OnInit {
  private guardService = inject(GuardService);

  guards: Guard[] = [];

  ngOnInit() {
    this.loadGuards();
  }

  ionViewDidEnter() {
    this.loadGuards();
  }

  loadGuards() {
    this.guardService.getGuards().subscribe((guards) => {
      this.guards = guards;
    });
  }

  getStatusColor(status: string): string {
    switch (status) {
      case "on-duty":
        return "success";
      case "patrol":
        return "primary";
      case "break":
        return "warning";
      case "off-duty":
        return "medium";
      default:
        return "medium";
    }
  }

  addNewGuard() {
    // Navigate to add guard page or open modal
    console.log("Add new guard");
  }
}
