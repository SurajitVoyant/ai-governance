export type RiskLevel = "low" | "medium" | "high";
export type ImpactLevel = "decision_support" | "decision_replacement";
export type EntityStatus = "draft" | "active" | "inactive";
export type AtsSource = "greenhouse" | "lever" | "smartrecruiters" | "mock_ats";
export type MappingAction = "LOG_EVENT" | "CREATE_DECISION_EVENT" | "CREATE_REVIEW_TASK";
export type ReviewStatus = "pending" | "in_review" | "accepted" | "overridden" | "rejected" | "more_info";
export type NoticeStatus = "not_required" | "required" | "logged" | "sent_manually" | "acknowledged";
export type ReasonCode = "data_incomplete" | "model_unreliable" | "bias_concern" | "business_judgment" | "policy_override" | "other";
export type Role = "tenant_admin" | "compliance_manager" | "reviewer";

export interface Tenant {
  id: string;
  name: string;
  default?: boolean;
}

export interface DemoUser {
  id: string;
  name: string;
  role: Role;
}

export interface Session {
  tenantId: string;
  tenantName: string;
  role: Role;
  userId: string;
  userName: string;
  loggedInAt: string;
}

export interface AiUseCase {
  id: string;
  key: string;
  name: string;
  description: string;
  businessArea: string;
  category: string;
  riskLevel: RiskLevel;
  impactLevel: ImpactLevel;
  humanReviewRequired: boolean;
  candidateNoticeRequired: boolean;
  status: EntityStatus;
  createdAt: string;
  updatedAt: string;
}

export interface WorkflowStage {
  id: string;
  name: string;
  key: string;
  order: number;
  aiAssisted: boolean;
  reviewRequired: boolean;
  candidateNoticeRequired: boolean;
  actionOnEnter: MappingAction;
}

export interface Workflow {
  id: string;
  name: string;
  description: string;
  businessArea: string;
  type: string;
  linkedUseCaseId: string | null;
  active: boolean;
  stages: WorkflowStage[];
}

export interface IntegrationMapping {
  id: string;
  source: AtsSource;
  externalEventType: string;
  externalStageId: string;
  externalStageName: string;
  externalStatus: string | null;
  workflowId: string;
  workflowStageKey: string;
  useCaseId: string | null;
  aiAssisted: boolean;
  reviewRequired: boolean;
  candidateNoticeRequired: boolean;
  action: MappingAction;
  active: boolean;
}

export interface DecisionEvent {
  id: string;
  source: AtsSource;
  candidateHash: string;
  applicationId: string;
  jobId: string;
  jobTitle: string;
  useCaseId: string;
  workflowStageKey: string;
  aiScore: number | null;
  aiRecommendation: string | null;
  reviewRequired: boolean;
  noticeRequired: boolean;
  status: "open" | "in_review" | "closed";
  createdAt: string;
  rawEventId: string;
}

export interface ReviewTask {
  id: string;
  decisionEventId: string;
  candidateHash: string;
  jobTitle: string;
  useCaseId: string;
  workflowStageKey: string;
  aiScore: number | null;
  aiRecommendation: string | null;
  status: ReviewStatus;
  assignedTo: string | null;
  createdAt: string;
  decidedAt: string | null;
  reasonCode: ReasonCode | null;
  comment: string | null;
  finalDecision: string | null;
}

export interface CandidateNotice {
  id: string;
  candidateHash: string;
  applicationId: string;
  jobTitle: string;
  useCaseId: string;
  required: boolean;
  status: NoticeStatus;
  templateVersion: string;
  loggedAt: string | null;
  sentAt: string | null;
}

export interface DashboardSummary {
  metrics: {
    useCasesTotal: number;
    useCasesActive: number;
    workflowsActive: number;
    decisionEvents30d: number;
    reviewsPending: number;
    reviewsCompleted30d: number;
    noticesRequired: number;
    noticesLogged: number;
    auditReadinessScore: number;
  };
  reviewStatus: {
    pending: number;
    inReview: number;
    accepted: number;
    overridden: number;
    rejected: number;
  };
  noticeSummary: {
    required: number;
    logged: number;
    sentManually: number;
    acknowledged: number;
  };
  recentActivity: Array<{
    id: string;
    at: string;
    kind: string;
    actorRole?: string;
    summary: string;
  }>;
}

export interface AuditReport {
  id: string;
  scope: {
    from: string;
    to: string;
    useCaseIds: string[];
    workflowIds: string[];
    sources: AtsSource[];
  };
  score: {
    overall: number;
    sub: {
      oversight: number;
      notices: number;
      mappings: number;
      data: number;
    };
  };
  summary: {
    useCases: Array<{
      key: string;
      events: number;
      overrideRate: number;
      noticeRate: number;
    }>;
    reviews: {
      total: number;
      accepted: number;
      overridden: number;
      rejected: number;
      medianMinutesToDecide: number;
    };
    notices: {
      required: number;
      logged: number;
      sent: number;
      acknowledged: number;
    };
  };
  missing: Array<{
    kind: string;
    count: number;
    sampleIds: string[];
  }>;
  checklist: Array<{
    key: string;
    pass: boolean;
  }>;
  generatedAt: string;
}
