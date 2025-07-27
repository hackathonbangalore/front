// src/app/services/data.service.ts
import { Injectable } from "@angular/core";
import {
  Firestore,
  collection,
  doc,
  setDoc,
  collectionData,
} from "@angular/fire/firestore";
import { Observable } from "rxjs";

@Injectable({ providedIn: "root" })
export class DataService {
  constructor(private firestore: Firestore) {}

  // Start generating all types of data when app loads
  startDataGeneration() {
    // Generate initial data immediately
    this.generateOccupancyData();
    this.generateAnalyticsData();
    this.generateAnomalyData();

    setInterval(() => {
      this.generateOccupancyData();
    }, 120000); //120000

    setInterval(() => {
      this.generateAnalyticsData();
    }, 120000); // 500000

    setInterval(() => {
      this.generateAnomalyData();
    }, 120000); //500000
  }

  // Generate occupancy status data
  private generateOccupancyData() {
    const zones = ["zone_a", "zone_b", "zone_c", "main_gate"];

    zones.forEach((zone) => {
      const personCount = Math.floor(Math.random() * 60) + 10;
      const dummyData = {
        location_zone: zone,
        current_count: personCount,
        timestamp: new Date(),
        camera_id: `CAM-${zone.slice(-1).toUpperCase()}1`,
        density_level: this.calculateDensityLevel(personCount),
        threshold_status: {
          warning_exceeded: personCount > 40,
          critical_exceeded: personCount > 60,
        },
        people_flow: {
          entering: Math.floor(Math.random() * 10),
          exiting: Math.floor(Math.random() * 8),
          net_change: Math.floor(Math.random() * 5) - 2,
        },
        alert_triggered: personCount > 40,
        last_updated: new Date(),
      };

      setDoc(doc(this.firestore, "occupancy_status", zone), dummyData);
    });

    console.log("Generated occupancy data for all zones");
  }

  // Generate analytics data
  private generateAnalyticsData() {
    const analyticsData = {
      time_period: new Date().toISOString(),
      total_visitors: Math.floor(Math.random() * 3000) + 2000,
      visitor_change: Math.floor(Math.random() * 500) + 100,
      peak_capacity: Math.floor(Math.random() * 30) + 70,
      leading_zone: ["Zone A", "Zone B", "Zone C"][
        Math.floor(Math.random() * 3)
      ],
      incidents_today: Math.floor(Math.random() * 5),
      resolved_incidents: Math.floor(Math.random() * 3),
      last_updated: new Date(),
    };

    setDoc(doc(this.firestore, "occupancy_analytics", "latest"), analyticsData);
    console.log("Generated analytics data");
  }

  // Generate anomaly detection data
  private generateAnomalyData() {
    const anomalyTypes = [
      "overcrowding",
      "suspicious_behavior",
      "unauthorized_access",
    ];
    const severityLevels = ["high", "medium", "critical"];

    const anomalyData = {
      anomaly_type:
        anomalyTypes[Math.floor(Math.random() * anomalyTypes.length)],
      location_zone: ["zone_a", "zone_b", "restricted_area"][
        Math.floor(Math.random() * 3)
      ],
      camera_id: `CAM-0${Math.floor(Math.random() * 4) + 1}`,
      confidence_score: 0.75 + Math.random() * 0.25,
      severity:
        severityLevels[Math.floor(Math.random() * severityLevels.length)],
      message: "Auto-generated anomaly detection alert",
      person_count: Math.floor(Math.random() * 70) + 1,
      threshold_exceeded: Math.random() > 0.5,
      timestamp: new Date(),
      status: "active",
    };

    // Add to anomaly collection with auto-generated ID
    const anomalyId = `anomaly_${Date.now()}`;
    setDoc(doc(this.firestore, "anomaly_detection", anomalyId), anomalyData);
    console.log("Generated anomaly data");
  }

  // Helper function to calculate density level
  private calculateDensityLevel(personCount: number): string {
    if (personCount < 20) return "low";
    if (personCount < 40) return "medium";
    return "high";
  }

  // Observable methods to get real-time data for dashboard
  getOccupancyStatus(): Observable<any[]> {
    return collectionData(collection(this.firestore, "occupancy_status"), {
      idField: "zone_id",
    });
  }

  getAnalyticsData(): Observable<any> {
    return collectionData(collection(this.firestore, "occupancy_analytics"));
  }

  getAnomalyAlerts(): Observable<any[]> {
    return collectionData(collection(this.firestore, "anomaly_detection"), {
      idField: "alert_id",
    });
  }

  // Manual data generation for demo
  generateDemoData() {
    this.generateOccupancyData();
    this.generateAnalyticsData();
    this.generateAnomalyData();
  }
}
