export interface StrategicMapSection {
  id: string;
  section_type: string;
  content: any;
  is_ai_generated: boolean;
  created_at: string;
  updated_at: string;
}

export interface StrategicMap {
  id: string;
  business_id: string;
  quarter: string;
  status: 'pending' | 'generating' | 'completed' | 'failed';
  created_at: string;
  updated_at: string;
}

export interface GetStrategicMapResponse {
  strategic_map: StrategicMap;
  sections: StrategicMapSection[];
}