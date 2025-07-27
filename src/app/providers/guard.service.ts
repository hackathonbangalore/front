// src/app/services/guard.service.ts
import { Injectable } from "@angular/core";
import { Observable, BehaviorSubject } from "rxjs";

@Injectable({
  providedIn: "root",
})
export class GuardService {
  private guardsSubject = new BehaviorSubject<any[]>([]);

  constructor() {
    // Initialize with dummy data
    this.initializeDummyData();
  }

  // Get guards observable
  getGuards(): Observable<any[]> {
    return this.guardsSubject.asObservable();
  }

  // Get guard by ID
  getGuardById(id: string): Observable<any | undefined> {
    return new Observable((observer) => {
      const guards = this.guardsSubject.value;
      const guard = guards.find((g) => g.id === id);
      observer.next(guard);
      observer.complete();
    });
  }

  // Add new guard
  addGuard(guard: any): void {
    const currentGuards = this.guardsSubject.value;
    this.guardsSubject.next([...currentGuards, guard]);
  }

  // Update guard
  updateGuard(updatedGuard: any): void {
    const currentGuards = this.guardsSubject.value;
    const index = currentGuards.findIndex((g) => g.id === updatedGuard.id);
    if (index !== -1) {
      currentGuards[index] = updatedGuard;
      this.guardsSubject.next([...currentGuards]);
    }
  }

  // Initialize with dummy data
  private initializeDummyData(): void {
    const dummyGuards: any[] = [
      {
        id: "1",
        name: "Rajesh Kumar",
        position: "Senior Security Officer",
        profilePic: "https://randomuser.me/api/portraits/men/1.jpg",
        status: "on-duty",
        currentZone: "Main Entrance",
        shiftStart: "08:00",
        shiftEnd: "16:00",
        experience: 8,
        contactNumber: "+91 9876543210",
        emergencyContact: "+91 9876543211",
        certifications: ["Basic Security", "Fire Safety", "First Aid"],
        lastActivity: new Date(),
        performanceRating: 4.5,
      },
      {
        id: "2",
        name: "Priya Sharma",
        position: "Security Supervisor",
        profilePic: "https://randomuser.me/api/portraits/women/2.jpg",
        status: "patrol",
        currentZone: "Zone A - East Wing",
        shiftStart: "16:00",
        shiftEnd: "00:00",
        experience: 6,
        contactNumber: "+91 9876543220",
        emergencyContact: "+91 9876543221",
        certifications: [
          "Advanced Security",
          "CCTV Operations",
          "Emergency Response",
        ],
        lastActivity: new Date(),
        performanceRating: 4.8,
      },
      {
        id: "3",
        name: "Mohammed Ali",
        position: "Security Guard",
        profilePic: "https://randomuser.me/api/portraits/men/3.jpg",
        status: "break",
        currentZone: "Zone B - West Wing",
        shiftStart: "00:00",
        shiftEnd: "08:00",
        experience: 3,
        contactNumber: "+91 9876543230",
        emergencyContact: "+91 9876543231",
        certifications: ["Basic Security", "Access Control"],
        lastActivity: new Date(),
        performanceRating: 4.2,
      },
      {
        id: "4",
        name: "Anita Singh",
        position: "Security Guard",
        profilePic: "https://randomuser.me/api/portraits/women/4.jpg",
        status: "on-duty",
        currentZone: "Parking Area",
        shiftStart: "06:00",
        shiftEnd: "14:00",
        experience: 2,
        contactNumber: "+91 9876543240",
        emergencyContact: "+91 9876543241",
        certifications: ["Basic Security", "Vehicle Inspection"],
        lastActivity: new Date(),
        performanceRating: 4.0,
      },
      {
        id: "5",
        name: "Vikram Patel",
        position: "Security Officer",
        profilePic: "https://randomuser.me/api/portraits/men/5.jpg",
        status: "off-duty",
        currentZone: "Zone C - North Wing",
        shiftStart: "14:00",
        shiftEnd: "22:00",
        experience: 5,
        contactNumber: "+91 9876543250",
        emergencyContact: "+91 9876543251",
        certifications: [
          "Security Management",
          "Crowd Control",
          "Emergency Response",
        ],
        lastActivity: new Date(),
        performanceRating: 4.3,
      },
      {
        id: "6",
        name: "Sunita Devi",
        position: "Security Guard",
        profilePic: "https://randomuser.me/api/portraits/women/6.jpg",
        status: "patrol",
        currentZone: "Perimeter",
        shiftStart: "22:00",
        shiftEnd: "06:00",
        experience: 4,
        contactNumber: "+91 9876543260",
        emergencyContact: "+91 9876543261",
        certifications: [
          "Basic Security",
          "Night Patrol",
          "Incident Reporting",
        ],
        lastActivity: new Date(),
        performanceRating: 4.4,
      },
    ];

    // Set the dummy data
    this.guardsSubject.next(dummyGuards);
  }

  // Generate demo data for testing
  generateDemoData(): void {
    this.initializeDummyData();
  }

  // Update guard status
  updateGuardStatus(
    guardId: string,
    status: "on-duty" | "off-duty" | "break" | "patrol"
  ): void {
    const currentGuards = this.guardsSubject.value;
    const guardIndex = currentGuards.findIndex((g) => g.id === guardId);

    if (guardIndex !== -1) {
      currentGuards[guardIndex].status = status;
      currentGuards[guardIndex].lastActivity = new Date();
      this.guardsSubject.next([...currentGuards]);
    }
  }

  // Update guard zone
  updateGuardZone(guardId: string, zone: string): void {
    const currentGuards = this.guardsSubject.value;
    const guardIndex = currentGuards.findIndex((g) => g.id === guardId);

    if (guardIndex !== -1) {
      currentGuards[guardIndex].currentZone = zone;
      currentGuards[guardIndex].lastActivity = new Date();
      this.guardsSubject.next([...currentGuards]);
    }
  }

  // Get guards by status
  getGuardsByStatus(status: string): Observable<any[]> {
    return new Observable((observer) => {
      const guards = this.guardsSubject.value;
      const filteredGuards = guards.filter((g) => g.status === status);
      observer.next(filteredGuards);
      observer.complete();
    });
  }

  // Get guards by zone
  getGuardsByZone(zone: string): Observable<any[]> {
    return new Observable((observer) => {
      const guards = this.guardsSubject.value;
      const filteredGuards = guards.filter((g) =>
        g.currentZone.toLowerCase().includes(zone.toLowerCase())
      );
      observer.next(filteredGuards);
      observer.complete();
    });
  }
}
