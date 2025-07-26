export interface OccupancyData {
  timestamp: string;
  location_zone: string;
  camera_id: string;
  current_count: number;
  density_level: string;
  threshold_status: {
    warning_exceeded: boolean;
    critical_exceeded: boolean;
  };
  people_flow: {
    entering: number;
    exiting: number;
    net_change: number;
  };
  alert_triggered: boolean;
}

export interface AnomalyData {
  timestamp: string;
  anomaly_type: string;
  confidence_score: number;
  location: {
    lat: number;
    lng: number;
  };
  camera_id: string;
  priority: number;
  status: string;
  message: string;
}

export interface SOSRequest {
  message: string;
  user_id: string;
  position: {
    lat: number;
    lng: number;
  };
  priority: number;
  status: string;
  response_status: string;
  timestamp: any;
  created_at: string;
}
