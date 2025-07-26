import { Component, OnInit } from "@angular/core";
import { CommonModule } from "@angular/common";
import { FormsModule } from "@angular/forms";
import { IonicModule } from "@ionic/angular";
import {
  IonAvatar,
  IonButton,
  IonButtons,
  IonCard,
  IonCardContent,
  IonCardHeader,
  IonCol,
  IonContent,
  IonGrid,
  IonHeader,
  IonItem,
  IonLabel,
  IonList,
  IonMenuButton,
  IonRow,
  IonTitle,
  IonToolbar,
} from "@ionic/angular/standalone";
import { RouterLink } from "@angular/router";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule],
})
export class DashboardPage implements OnInit {
  dashboardData = {
    totalVisitors: 2847,
    visitorChange: 247,
    activeAlerts: 7,
    highPriority: 3,
    peakCapacity: 89,
    leadingZone: "Zone B",
    incidentsToday: 3,
    resolved: 2,
  };

  liveFeeds = [
    { id: "CAM-01", location: "ZONE A", status: "LIVE", type: "camera" },
    { id: "CAM-02", location: "", status: "LIVE", type: "camera" },
  ];
  constructor() {}

  ngOnInit() {}
}
