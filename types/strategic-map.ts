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

// Market Analysis Types
export interface MarketSearchTerm {
  term: string;
  volume: 'high' | 'medium' | 'low';
}

export interface MarketAnalysisContent {
  market_size?: string;
  growth_rate?: string;
  competition_level?: string;
  main_trends?: string[];
  target_segments?: string[];
  market_share?: string;
  search_terms?: MarketSearchTerm[];
  main_opportunity?: string;
  competitive_advantage?: string;
}

// ICP Personas Types
export interface PersonaDetail {
  label: string;
  value: string;
}

export interface Persona {
  name: string;
  icon?: string;
  status?: string;
  details?: PersonaDetail[];
  motivations?: string;
  pains?: string;
  channels?: string;
  quote?: string;
}

export interface ICPMatrix {
  core?: string;
  premium?: string;
  volume?: string;
  anti?: string;
}

export interface ICPPersonasContent {
  personas?: Persona[];
  matrix?: ICPMatrix;
}

// Legacy format for backward compatibility
export interface ICPPersonasLegacyContent {
  primary_persona?: {
    name: string;
    description: string;
    pain_points: string[];
    needs: string[];
    behaviors: string[];
    demographics: {
      age_range: string;
      income_level: string;
      occupation: string;
      location: string;
    };
  };
  secondary_personas?: any[];
  target_audience_summary?: string;
}