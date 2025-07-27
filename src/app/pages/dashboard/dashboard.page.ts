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
import { DataService } from "../../providers/data.service";
import { ChatbotComponent } from "../chatbot/chatbot.component";

@Component({
  selector: "app-dashboard",
  templateUrl: "./dashboard.page.html",
  styleUrls: ["./dashboard.page.scss"],
  standalone: true,
  imports: [CommonModule, IonicModule, ChatbotComponent],
})
export class DashboardPage implements OnInit {
  occupancyData: any[] = [];
  analyticsData: any = {
    total_visitors: 0,
    visitor_change: 0,
    peak_capacity: 0,
    leading_zone: "",
    incidents_today: 0,
    resolved_incidents: 0,
  };
  anomalyAlerts: any[] = [];
  activeAlerts: number = 0;

  // Live feed data
  liveFeeds = [
    { id: "CAM-01", location: "MAIN GATE", status: "LIVE", type: "camera" },
    { id: "CAM-02", location: "ZONE A", status: "LIVE", type: "camera" },
    { id: "DRONE-01", location: "AERIAL", status: "PATROL", type: "drone" },
    { id: "CAM-03", location: "ZONE B", status: "LIVE", type: "camera" },
  ];

  isChatOpen = false;

  constructor(private dataService: DataService) {}

  ngOnInit() {
    // Start generating dummy data when app loads
    this.dataService.startDataGeneration();

    // Subscribe to real-time data updates
    this.subscribeToData();
  }

  private subscribeToData() {
    // Real-time occupancy status
    this.dataService.getOccupancyStatus().subscribe((data) => {
      this.occupancyData = data;
      this.updateDashboardMetrics();
    });

    // Real-time analytics data
    this.dataService.getAnalyticsData().subscribe((data) => {
      if (data && data.length > 0) {
        this.analyticsData = data[0];
      }
    });

    // Real-time anomaly alerts
    this.dataService.getAnomalyAlerts().subscribe((data) => {
      this.anomalyAlerts = data;
      this.activeAlerts = data.filter(
        (alert) => alert.status === "active"
      ).length;
    });
  }

  private updateDashboardMetrics() {
    if (this.occupancyData.length > 0) {
      // Calculate total visitors from all zones
      this.analyticsData.total_visitors = this.occupancyData.reduce(
        (total, zone) => total + (zone.current_count || 0),
        0
      );

      // Find peak capacity zone
      const maxZone = this.occupancyData.reduce((max, zone) =>
        (zone.current_count || 0) > (max.current_count || 0) ? zone : max
      );
      this.analyticsData.leading_zone = maxZone.location_zone || "Zone A";

      // Calculate peak capacity percentage
      this.analyticsData.peak_capacity = Math.max(
        ...this.occupancyData.map((zone) =>
          Math.round(((zone.current_count || 0) / 70) * 100)
        )
      );
    }
  }

  // Helper methods for zone display
  getZoneCardColor(zone: any): string {
    if (zone.alert_triggered) return "danger";
    if (zone.density_level === "high") return "warning";
    return "success";
  }

  getCountColor(count: number): string {
    if (count > 50) return "danger";
    if (count > 30) return "warning";
    return "success";
  }

  getDensityColor(density: string): string {
    switch (density) {
      case "high":
        return "danger";
      case "medium":
        return "warning";
      default:
        return "success";
    }
  }

  getCapacityPercentage(count: number): number {
    return Math.min(Math.round((count / 70) * 100), 100);
  }

  getThresholdClass(count: number): string {
    if (count > 50) return "critical";
    if (count > 30) return "warning";
    return "normal";
  }

  // Manual data generation for demo
  generateDemoData() {
    this.dataService.generateDemoData();
  }

  // Format numbers for display
  formatNumber(num: number): string {
    return num?.toLocaleString() || "0";
  }

  // Get high priority alerts count
  getHighPriorityAlerts(): number {
    return this.anomalyAlerts.filter(
      (alert) => alert.severity === "high" || alert.severity === "critical"
    ).length;
  }

  toggleChat() {
    this.isChatOpen = !this.isChatOpen;
  }

  closeChat() {
    this.isChatOpen = false;
  }

  // Get data for chatbot
  getChatbotData() {
    return {
      total_visitors: this.analyticsData.total_visitors,
      peak_capacity: this.analyticsData.peak_capacity,
      leading_zone: this.analyticsData.leading_zone,
      activeAlerts: this.activeAlerts,
      highPriorityAlerts: this.getHighPriorityAlerts(),
      incidents_today: this.analyticsData.incidents_today,
      resolved_incidents: this.analyticsData.resolved_incidents,
    };
  }
}
