-- Habilitar extensões necessárias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";
CREATE EXTENSION IF NOT EXISTS "btree_gin";

-- Configurar timezone
SET timezone = 'America/Sao_Paulo';

-- Criar ENUMs
CREATE TYPE user_role AS ENUM ('admin', 'manager', 'user', 'viewer');
CREATE TYPE business_status AS ENUM ('Reunião de briefing', 'Agendamentos', 'Entrega final', 'Finalizado');
CREATE TYPE creator_status AS ENUM ('Ativo', 'Não parceiro', 'Precisa engajar', 'Inativo');
CREATE TYPE campaign_status AS ENUM ('Reunião de briefing', 'Agendamentos', 'Entrega final', 'Finalizado');
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'review', 'done');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

-- 1. TABELA ORGANIZATIONS (Multi-tenancy)
CREATE TABLE organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  domain VARCHAR(255) UNIQUE,
  settings JSONB DEFAULT '{
    "timezone": "America/Sao_Paulo",
    "currency": "BRL",
    "date_format": "DD/MM/YYYY",
    "features": {
      "campaigns": true,
      "leads": true,
      "tasks": true,
      "analytics": true
    }
  }'::jsonb,
  subscription_plan VARCHAR(50) DEFAULT 'basic',
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. TABELA USERS
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  email VARCHAR(255) UNIQUE NOT NULL,
  full_name VARCHAR(255) NOT NULL,
  avatar_url TEXT,
  role user_role DEFAULT 'user',
  permissions JSONB DEFAULT '{
    "businesses": {"read": true, "write": false, "delete": false},
    "campaigns": {"read": true, "write": false, "delete": false},
    "creators": {"read": true, "write": false, "delete": false},
    "leads": {"read": true, "write": false, "delete": false},
    "tasks": {"read": true, "write": true, "delete": false}
  }'::jsonb,
  preferences JSONB DEFAULT '{
    "theme": "light",
    "language": "pt-BR",
    "notifications": {
      "email": true,
      "push": true,
      "in_app": true
    }
  }'::jsonb,
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. TABELA BUSINESS_CATEGORIES
CREATE TABLE business_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  color VARCHAR(7), -- hex color
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. TABELA PLANS
CREATE TABLE plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(100) NOT NULL,
  description TEXT,
  price DECIMAL(10,2),
  features JSONB,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. TABELA BUSINESSES
CREATE TABLE businesses (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  category_id UUID REFERENCES business_categories(id),
  current_plan_id UUID REFERENCES plans(id),
  
  contact_info JSONB DEFAULT '{
    "primary_contact": "",
    "whatsapp": "",
    "instagram": "",
    "email": "",
    "phone": "",
    "website": ""
  }'::jsonb,
  
  address JSONB DEFAULT '{
    "street": "",
    "city": "",
    "state": "",
    "zip_code": "",
    "country": "Brasil"
  }'::jsonb,
  
  contract_info JSONB DEFAULT '{
    "signed": false,
    "signature_date": null,
    "valid_until": null,
    "files": [],
    "terms": {}
  }'::jsonb,
  
  status business_status DEFAULT 'Reunião de briefing',
  responsible_user_id UUID REFERENCES users(id),
  tags TEXT[] DEFAULT '{}',
  custom_fields JSONB DEFAULT '{}',
  
  metrics JSONB DEFAULT '{
    "total_campaigns": 0,
    "active_campaigns": 0,
    "total_spent": 0,
    "roi": 0
  }'::jsonb,
  
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. TABELA CREATORS
CREATE TABLE creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  
  social_media JSONB DEFAULT '{
    "instagram": {
      "username": "",
      "followers": 0,
      "engagement_rate": 0,
      "verified": false
    },
    "tiktok": {
      "username": "",
      "followers": 0
    },
    "youtube": {
      "channel": "",
      "subscribers": 0
    }
  }'::jsonb,
  
  contact_info JSONB DEFAULT '{
    "whatsapp": "",
    "email": "",
    "phone": "",
    "preferred_contact": "whatsapp"
  }'::jsonb,
  
  profile_info JSONB DEFAULT '{
    "biography": "",
    "category": "",
    "niche": [],
    "location": {
      "city": "",
      "state": "",
      "country": "Brasil"
    },
    "rates": {
      "post": 0,
      "story": 0,
      "reel": 0,
      "event": 0
    },
    "availability": {
      "weekdays": true,
      "weekends": true,
      "travel": false
    }
  }'::jsonb,
  
  performance_metrics JSONB DEFAULT '{
    "total_campaigns": 0,
    "avg_engagement": 0,
    "completion_rate": 100,
    "rating": 5.0,
    "last_campaign_date": null
  }'::jsonb,
  
  status creator_status DEFAULT 'Ativo',
  tags TEXT[] DEFAULT '{}',
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. TABELA CAMPAIGNS
CREATE TABLE campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  business_id UUID NOT NULL REFERENCES businesses(id) ON DELETE CASCADE,
  
  title VARCHAR(255) NOT NULL,
  slug VARCHAR(255) UNIQUE,
  description TEXT,
  campaign_type VARCHAR(50) DEFAULT 'influencer',
  month VARCHAR(50) NOT NULL,
  start_date DATE,
  end_date DATE,
  budget DECIMAL(12,2) DEFAULT 0,
  spent_amount DECIMAL(12,2) DEFAULT 0,
  status campaign_status DEFAULT 'Reunião de briefing',
  
  objectives JSONB DEFAULT '{
    "primary": "",
    "secondary": [],
    "kpis": {
      "reach": 0,
      "engagement": 0,
      "conversions": 0
    }
  }'::jsonb,
  
  deliverables JSONB DEFAULT '{
    "posts": 0,
    "stories": 0,
    "reels": 0,
    "events": 0,
    "requirements": []
  }'::jsonb,
  
  settings JSONB DEFAULT '{
    "auto_assign_creators": false,
    "require_approval": true,
    "send_notifications": true,
    "track_performance": true
  }'::jsonb,
  
  results JSONB DEFAULT '{
    "reach": 0,
    "impressions": 0,
    "engagement": 0,
    "clicks": 0,
    "conversions": 0,
    "roi": 0
  }'::jsonb,
  
  created_by UUID NOT NULL REFERENCES users(id),
  responsible_user_id UUID REFERENCES users(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 8. TABELA CAMPAIGN_CREATORS (Relacionamento)
CREATE TABLE campaign_creators (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  campaign_id UUID NOT NULL REFERENCES campaigns(id) ON DELETE CASCADE,
  creator_id UUID NOT NULL REFERENCES creators(id) ON DELETE CASCADE,
  
  role VARCHAR(50) DEFAULT 'primary',
  fee DECIMAL(10,2) DEFAULT 0,
  payment_status VARCHAR(50) DEFAULT 'pending',
  status VARCHAR(50) DEFAULT 'Pendente',
  
  deliverables JSONB DEFAULT '{
    "briefing_complete": "Pendente",
    "visit_datetime": null,
    "guest_quantity": 0,
    "visit_confirmed": "Pendente",
    "post_datetime": null,
    "video_approved": "Pendente",
    "video_posted": "Não",
    "content_links": []
  }'::jsonb,
  
  performance_data JSONB DEFAULT '{
    "reach": 0,
    "impressions": 0,
    "engagement": 0,
    "clicks": 0,
    "saves": 0,
    "shares": 0
  }'::jsonb,
  
  notes TEXT,
  assigned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  UNIQUE(campaign_id, creator_id)
);

-- 9. TABELA LEADS
CREATE TABLE leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255),
  phone VARCHAR(20),
  company VARCHAR(255),
  source VARCHAR(100) DEFAULT 'website',
  status VARCHAR(50) DEFAULT 'new',
  score INTEGER DEFAULT 0,
  assigned_to UUID REFERENCES users(id),
  contact_info JSONB DEFAULT '{}',
  notes TEXT,
  converted_to_business_id UUID REFERENCES businesses(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 10. TABELA TASKS
CREATE TABLE tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  task_type VARCHAR(50) DEFAULT 'campaign',
  priority task_priority DEFAULT 'medium',
  status task_status DEFAULT 'todo',
  assigned_to UUID REFERENCES users(id),
  created_by UUID NOT NULL REFERENCES users(id),
  related_to_type VARCHAR(50),
  related_to_id UUID,
  due_date TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  estimated_hours INTEGER,
  actual_hours INTEGER,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 11. TABELA AUDIT_LOGS
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
  table_name VARCHAR(100) NOT NULL,
  record_id UUID NOT NULL,
  action VARCHAR(50) NOT NULL,
  old_values JSONB,
  new_values JSONB,
  user_id UUID REFERENCES users(id),
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ÍNDICES OTIMIZADOS
-- Organizations
CREATE INDEX idx_organizations_domain ON organizations(domain);
CREATE INDEX idx_organizations_active ON organizations(is_active) WHERE is_active = true;

-- Users
CREATE INDEX idx_users_organization ON users(organization_id);
CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_active ON users(organization_id, is_active) WHERE is_active = true;

-- Businesses
CREATE INDEX idx_businesses_organization ON businesses(organization_id);
CREATE INDEX idx_businesses_status ON businesses(organization_id, status);
CREATE INDEX idx_businesses_responsible ON businesses(responsible_user_id);
CREATE INDEX idx_businesses_category ON businesses(category_id);
CREATE INDEX idx_businesses_active ON businesses(organization_id, is_active) WHERE is_active = true;
CREATE INDEX idx_businesses_name_search ON businesses USING gin(name gin_trgm_ops);
CREATE INDEX idx_businesses_tags ON businesses USING gin(tags);

-- Creators
CREATE INDEX idx_creators_organization ON creators(organization_id);
CREATE INDEX idx_creators_status ON creators(organization_id, status);
CREATE INDEX idx_creators_city ON creators((profile_info->'location'->>'city'));
CREATE INDEX idx_creators_category ON creators((profile_info->>'category'));
CREATE INDEX idx_creators_name_search ON creators USING gin(name gin_trgm_ops);
CREATE INDEX idx_creators_tags ON creators USING gin(tags);
CREATE INDEX idx_creators_social_media ON creators USING gin(social_media);

-- Campaigns
CREATE INDEX idx_campaigns_organization ON campaigns(organization_id);
CREATE INDEX idx_campaigns_business ON campaigns(business_id);
CREATE INDEX idx_campaigns_status ON campaigns(organization_id, status);
CREATE INDEX idx_campaigns_month ON campaigns(organization_id, month);
CREATE INDEX idx_campaigns_dates ON campaigns(start_date, end_date);
CREATE INDEX idx_campaigns_created_by ON campaigns(created_by);

-- Campaign Creators
CREATE INDEX idx_campaign_creators_campaign ON campaign_creators(campaign_id);
CREATE INDEX idx_campaign_creators_creator ON campaign_creators(creator_id);
CREATE INDEX idx_campaign_creators_status ON campaign_creators(campaign_id, status);
CREATE INDEX idx_campaign_creators_role ON campaign_creators(campaign_id, role);

-- Tasks
CREATE INDEX idx_tasks_organization ON tasks(organization_id);
CREATE INDEX idx_tasks_assigned_to ON tasks(assigned_to);
CREATE INDEX idx_tasks_status ON tasks(organization_id, status);
CREATE INDEX idx_tasks_priority ON tasks(organization_id, priority);
CREATE INDEX idx_tasks_due_date ON tasks(due_date) WHERE due_date IS NOT NULL;

-- Audit Logs
CREATE INDEX idx_audit_logs_organization ON audit_logs(organization_id);
CREATE INDEX idx_audit_logs_table_record ON audit_logs(table_name, record_id);
CREATE INDEX idx_audit_logs_user ON audit_logs(user_id);
CREATE INDEX idx_audit_logs_created_at ON audit_logs(created_at);
