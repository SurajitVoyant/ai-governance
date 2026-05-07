import type {
  AiUseCase, Workflow, IntegrationMapping, DecisionEvent,
  ReviewTask, CandidateNotice, DashboardSummary, Tenant, DemoUser
} from "@/types/governance";

export const TENANTS: Tenant[] = [
  { id: "tenant_acme", name: "Acme Hiring Ltd.", default: true },
  { id: "tenant_northwind", name: "Northwind HR" },
  { id: "tenant_initech", name: "Initech People Ops" },
];

export const DEMO_USERS: DemoUser[] = [
  { id: "user_admin", name: "Alex Tenant-Admin", role: "tenant_admin" },
  { id: "user_amelia", name: "Amelia Compliance", role: "compliance_manager" },
  { id: "user_riley", name: "Riley Reviewer", role: "reviewer" },
  { id: "user_priya", name: "Priya Recruiter", role: "reviewer" },
];

export const USE_CASES: AiUseCase[] = [
  {
    id: "uc_01", key: "candidate-shortlisting-v1",
    name: "Candidate Shortlisting",
    description: "Generates a ranked shortlist for a job from applicants.",
    businessArea: "Talent Acquisition", category: "Shortlisting",
    riskLevel: "high", impactLevel: "decision_support",
    humanReviewRequired: true, candidateNoticeRequired: true,
    status: "active",
    createdAt: "2026-04-12T10:14:00Z", updatedAt: "2026-05-04T12:00:00Z",
  },
  {
    id: "uc_02", key: "resume-screening-v1",
    name: "Resume Screening",
    description: "Automated pass/fail screen on inbound resumes.",
    businessArea: "Talent Acquisition", category: "Screening",
    riskLevel: "medium", impactLevel: "decision_support",
    humanReviewRequired: true, candidateNoticeRequired: false,
    status: "active",
    createdAt: "2026-04-15T09:00:00Z", updatedAt: "2026-05-01T08:00:00Z",
  },
  {
    id: "uc_03", key: "interview-ranking-v1",
    name: "Interview Ranking",
    description: "Ranks candidates after structured interviews.",
    businessArea: "Talent Acquisition", category: "Ranking",
    riskLevel: "high", impactLevel: "decision_replacement",
    humanReviewRequired: true, candidateNoticeRequired: true,
    status: "active",
    createdAt: "2026-04-20T14:00:00Z", updatedAt: "2026-05-02T10:00:00Z",
  },
  {
    id: "uc_04", key: "job-fit-summary-v1",
    name: "Job Fit Summary",
    description: "Generates a narrative fit summary for hiring managers.",
    businessArea: "People Ops", category: "Summary",
    riskLevel: "low", impactLevel: "decision_support",
    humanReviewRequired: false, candidateNoticeRequired: false,
    status: "active",
    createdAt: "2026-05-01T11:00:00Z", updatedAt: "2026-05-05T09:00:00Z",
  },
  {
    id: "uc_05", key: "candidate-comms-v1",
    name: "Candidate Communications",
    description: "AI-drafted rejection and update messages.",
    businessArea: "Talent Acquisition", category: "Comms",
    riskLevel: "low", impactLevel: "decision_support",
    humanReviewRequired: false, candidateNoticeRequired: false,
    status: "draft",
    createdAt: "2026-05-06T15:00:00Z", updatedAt: "2026-05-06T15:00:00Z",
  },
];

export const WORKFLOWS: Workflow[] = [
  {
    id: "wf_01", name: "Candidate Shortlisting Workflow",
    description: "Governs AI-assisted shortlist generation and human review.",
    businessArea: "Talent Acquisition", type: "shortlisting",
    linkedUseCaseId: "uc_01", active: true,
    stages: [
      { id: "st_01", name: "Shortlist Requested", key: "shortlist-requested", order: 1, aiAssisted: false, reviewRequired: false, candidateNoticeRequired: false, actionOnEnter: "LOG_EVENT" },
      { id: "st_02", name: "AI Shortlist Generated", key: "ai-shortlist-generated", order: 2, aiAssisted: true, reviewRequired: true, candidateNoticeRequired: true, actionOnEnter: "CREATE_REVIEW_TASK" },
      { id: "st_03", name: "Shortlist Review Pending", key: "shortlist-review-pending", order: 3, aiAssisted: false, reviewRequired: true, candidateNoticeRequired: false, actionOnEnter: "LOG_EVENT" },
      { id: "st_04", name: "Shortlist Reviewed", key: "shortlist-reviewed", order: 4, aiAssisted: false, reviewRequired: false, candidateNoticeRequired: false, actionOnEnter: "LOG_EVENT" },
      { id: "st_05", name: "Candidate Notice Logged", key: "candidate-notice-logged", order: 5, aiAssisted: false, reviewRequired: false, candidateNoticeRequired: true, actionOnEnter: "LOG_EVENT" },
      { id: "st_06", name: "Audit Ready", key: "audit-ready", order: 6, aiAssisted: false, reviewRequired: false, candidateNoticeRequired: false, actionOnEnter: "LOG_EVENT" },
    ],
  },
  {
    id: "wf_02", name: "Resume Screening Workflow",
    description: "Automated screening with compliance checkpoints.",
    businessArea: "Talent Acquisition", type: "screening",
    linkedUseCaseId: "uc_02", active: true,
    stages: [
      { id: "st_10", name: "Application Received", key: "application-received", order: 1, aiAssisted: false, reviewRequired: false, candidateNoticeRequired: false, actionOnEnter: "LOG_EVENT" },
      { id: "st_11", name: "AI Screen Applied", key: "ai-screen-applied", order: 2, aiAssisted: true, reviewRequired: true, candidateNoticeRequired: false, actionOnEnter: "CREATE_DECISION_EVENT" },
      { id: "st_12", name: "Screening Complete", key: "screening-complete", order: 3, aiAssisted: false, reviewRequired: false, candidateNoticeRequired: false, actionOnEnter: "LOG_EVENT" },
    ],
  },
  {
    id: "wf_03", name: "Interview Ranking Workflow",
    description: "Post-interview AI ranking and decision audit.",
    businessArea: "Talent Acquisition", type: "interview",
    linkedUseCaseId: "uc_03", active: false,
    stages: [
      { id: "st_20", name: "Interviews Complete", key: "interviews-complete", order: 1, aiAssisted: false, reviewRequired: false, candidateNoticeRequired: false, actionOnEnter: "LOG_EVENT" },
      { id: "st_21", name: "AI Ranking Generated", key: "ai-ranking-generated", order: 2, aiAssisted: true, reviewRequired: true, candidateNoticeRequired: true, actionOnEnter: "CREATE_REVIEW_TASK" },
      { id: "st_22", name: "Ranking Reviewed", key: "ranking-reviewed", order: 3, aiAssisted: false, reviewRequired: false, candidateNoticeRequired: false, actionOnEnter: "LOG_EVENT" },
    ],
  },
];

export const MAPPINGS: IntegrationMapping[] = [
  {
    id: "map_01", source: "greenhouse",
    externalEventType: "application.stage_changed",
    externalStageId: "stage_4421", externalStageName: "AI Shortlist",
    externalStatus: null,
    workflowId: "wf_01", workflowStageKey: "ai-shortlist-generated",
    useCaseId: "uc_01",
    aiAssisted: true, reviewRequired: true, candidateNoticeRequired: true,
    action: "CREATE_REVIEW_TASK", active: true,
  },
  {
    id: "map_02", source: "smartrecruiters",
    externalEventType: "candidate.status_changed",
    externalStageId: "sr_pipeline_review", externalStageName: "In Review",
    externalStatus: "IN_REVIEW",
    workflowId: "wf_01", workflowStageKey: "ai-shortlist-generated",
    useCaseId: "uc_01",
    aiAssisted: true, reviewRequired: true, candidateNoticeRequired: true,
    action: "CREATE_REVIEW_TASK", active: true,
  },
  {
    id: "map_03", source: "greenhouse",
    externalEventType: "application.stage_changed",
    externalStageId: "stage_recruiter_screen", externalStageName: "Recruiter Screen",
    externalStatus: null,
    workflowId: "wf_01", workflowStageKey: "shortlist-review-pending",
    useCaseId: null,
    aiAssisted: false, reviewRequired: false, candidateNoticeRequired: false,
    action: "LOG_EVENT", active: true,
  },
  {
    id: "map_04", source: "lever",
    externalEventType: "application.stage_changed",
    externalStageId: "lever_screen_01", externalStageName: "AI Screen",
    externalStatus: null,
    workflowId: "wf_02", workflowStageKey: "ai-screen-applied",
    useCaseId: "uc_02",
    aiAssisted: true, reviewRequired: true, candidateNoticeRequired: false,
    action: "CREATE_DECISION_EVENT", active: true,
  },
  {
    id: "map_05", source: "mock_ats",
    externalEventType: "application.stage_changed",
    externalStageId: "mock_ai_shortlist", externalStageName: "Mock AI Shortlist",
    externalStatus: null,
    workflowId: "wf_01", workflowStageKey: "ai-shortlist-generated",
    useCaseId: "uc_01",
    aiAssisted: true, reviewRequired: true, candidateNoticeRequired: true,
    action: "CREATE_REVIEW_TASK", active: true,
  },
];

export const DECISION_EVENTS: DecisionEvent[] = [
  {
    id: "de_01", source: "greenhouse",
    candidateHash: "sha256:a1b2c3d4e5f6", applicationId: "app_88231",
    jobId: "job_4501", jobTitle: "Senior Product Manager",
    useCaseId: "uc_01", workflowStageKey: "ai-shortlist-generated",
    aiScore: 0.82, aiRecommendation: "shortlist",
    reviewRequired: true, noticeRequired: true,
    status: "in_review", createdAt: "2026-05-07T09:14:01Z", rawEventId: "raw_01",
  },
  {
    id: "de_02", source: "greenhouse",
    candidateHash: "sha256:b2c3d4e5f6a1", applicationId: "app_88232",
    jobId: "job_4501", jobTitle: "Senior Product Manager",
    useCaseId: "uc_01", workflowStageKey: "ai-shortlist-generated",
    aiScore: 0.61, aiRecommendation: "hold",
    reviewRequired: true, noticeRequired: true,
    status: "open", createdAt: "2026-05-07T08:51:00Z", rawEventId: "raw_02",
  },
  {
    id: "de_03", source: "smartrecruiters",
    candidateHash: "sha256:c3d4e5f6a1b2", applicationId: "app_77110",
    jobId: "job_3302", jobTitle: "Data Engineer",
    useCaseId: "uc_01", workflowStageKey: "ai-shortlist-generated",
    aiScore: 0.91, aiRecommendation: "shortlist",
    reviewRequired: true, noticeRequired: true,
    status: "closed", createdAt: "2026-05-06T14:22:00Z", rawEventId: "raw_03",
  },
  {
    id: "de_04", source: "lever",
    candidateHash: "sha256:d4e5f6a1b2c3", applicationId: "app_55003",
    jobId: "job_2201", jobTitle: "Engineering Manager",
    useCaseId: "uc_02", workflowStageKey: "ai-screen-applied",
    aiScore: 0.45, aiRecommendation: "reject",
    reviewRequired: true, noticeRequired: false,
    status: "open", createdAt: "2026-05-06T11:00:00Z", rawEventId: "raw_04",
  },
  {
    id: "de_05", source: "greenhouse",
    candidateHash: "sha256:e5f6a1b2c3d4", applicationId: "app_99301",
    jobId: "job_5501", jobTitle: "UX Designer",
    useCaseId: "uc_01", workflowStageKey: "ai-shortlist-generated",
    aiScore: 0.74, aiRecommendation: "shortlist",
    reviewRequired: true, noticeRequired: true,
    status: "open", createdAt: "2026-05-05T16:30:00Z", rawEventId: "raw_05",
  },
];

export const REVIEW_TASKS: ReviewTask[] = [
  {
    id: "rt_01", decisionEventId: "de_01",
    candidateHash: "sha256:a1b2c3d4e5f6", jobTitle: "Senior Product Manager",
    useCaseId: "uc_01", workflowStageKey: "ai-shortlist-generated",
    aiScore: 0.82, aiRecommendation: "shortlist",
    status: "pending", assignedTo: "user_amelia",
    createdAt: "2026-05-07T09:14:02Z", decidedAt: null,
    reasonCode: null, comment: null, finalDecision: null,
  },
  {
    id: "rt_02", decisionEventId: "de_02",
    candidateHash: "sha256:b2c3d4e5f6a1", jobTitle: "Senior Product Manager",
    useCaseId: "uc_01", workflowStageKey: "ai-shortlist-generated",
    aiScore: 0.61, aiRecommendation: "hold",
    status: "in_review", assignedTo: "user_riley",
    createdAt: "2026-05-07T08:51:01Z", decidedAt: null,
    reasonCode: null, comment: null, finalDecision: null,
  },
  {
    id: "rt_03", decisionEventId: "de_03",
    candidateHash: "sha256:c3d4e5f6a1b2", jobTitle: "Data Engineer",
    useCaseId: "uc_01", workflowStageKey: "ai-shortlist-generated",
    aiScore: 0.91, aiRecommendation: "shortlist",
    status: "overridden", assignedTo: "user_amelia",
    createdAt: "2026-05-06T14:22:00Z", decidedAt: "2026-05-06T15:10:00Z",
    reasonCode: "bias_concern", comment: "AI ranking appeared to overweight tenure.", finalDecision: "shortlist",
  },
  {
    id: "rt_04", decisionEventId: "de_04",
    candidateHash: "sha256:d4e5f6a1b2c3", jobTitle: "Engineering Manager",
    useCaseId: "uc_02", workflowStageKey: "ai-screen-applied",
    aiScore: 0.45, aiRecommendation: "reject",
    status: "pending", assignedTo: null,
    createdAt: "2026-05-06T11:00:00Z", decidedAt: null,
    reasonCode: null, comment: null, finalDecision: null,
  },
  {
    id: "rt_05", decisionEventId: "de_05",
    candidateHash: "sha256:e5f6a1b2c3d4", jobTitle: "UX Designer",
    useCaseId: "uc_01", workflowStageKey: "ai-shortlist-generated",
    aiScore: 0.74, aiRecommendation: "shortlist",
    status: "accepted", assignedTo: "user_riley",
    createdAt: "2026-05-05T16:30:00Z", decidedAt: "2026-05-05T17:00:00Z",
    reasonCode: null, comment: null, finalDecision: "shortlist",
  },
];

export const CANDIDATE_NOTICES: CandidateNotice[] = [
  {
    id: "cn_01", candidateHash: "sha256:a1b2c3d4e5f6",
    applicationId: "app_88231", jobTitle: "Senior Product Manager",
    useCaseId: "uc_01", required: true, status: "required",
    templateVersion: "notice-shortlist-v2", loggedAt: null, sentAt: null,
  },
  {
    id: "cn_02", candidateHash: "sha256:b2c3d4e5f6a1",
    applicationId: "app_88232", jobTitle: "Senior Product Manager",
    useCaseId: "uc_01", required: true, status: "required",
    templateVersion: "notice-shortlist-v2", loggedAt: null, sentAt: null,
  },
  {
    id: "cn_03", candidateHash: "sha256:c3d4e5f6a1b2",
    applicationId: "app_77110", jobTitle: "Data Engineer",
    useCaseId: "uc_01", required: true, status: "logged",
    templateVersion: "notice-shortlist-v2",
    loggedAt: "2026-05-06T16:00:00Z", sentAt: null,
  },
  {
    id: "cn_04", candidateHash: "sha256:e5f6a1b2c3d4",
    applicationId: "app_99301", jobTitle: "UX Designer",
    useCaseId: "uc_01", required: true, status: "sent_manually",
    templateVersion: "notice-shortlist-v2",
    loggedAt: "2026-05-05T18:00:00Z", sentAt: "2026-05-05T19:00:00Z",
  },
];

export const DASHBOARD_SUMMARY: DashboardSummary = {
  metrics: {
    useCasesTotal: 5, useCasesActive: 4,
    workflowsActive: 3,
    decisionEvents30d: 218,
    reviewsPending: 7, reviewsCompleted30d: 189,
    noticesRequired: 42, noticesLogged: 38,
    auditReadinessScore: 86,
  },
  reviewStatus: { pending: 7, inReview: 3, accepted: 142, overridden: 31, rejected: 16 },
  noticeSummary: { required: 42, logged: 38, sentManually: 22, acknowledged: 11 },
  recentActivity: [
    { id: "act_01", at: "2026-05-07T09:14:00Z", kind: "review_completed", actorRole: "reviewer", summary: "Override on shortlist for cand_8f3a · Senior PM" },
    { id: "act_02", at: "2026-05-07T08:51:00Z", kind: "decision_event_created", summary: "Greenhouse → ai-shortlist-generated · candidate-shortlisting-v1" },
    { id: "act_03", at: "2026-05-07T08:10:00Z", kind: "notice_logged", actorRole: "compliance_manager", summary: "Notice logged for app_77110 · Data Engineer" },
    { id: "act_04", at: "2026-05-06T17:30:00Z", kind: "review_completed", actorRole: "reviewer", summary: "Accepted shortlist for cand_e5f6 · UX Designer" },
    { id: "act_05", at: "2026-05-06T16:22:00Z", kind: "mapping_created", summary: "New mapping: mock_ats → ai-shortlist-generated" },
  ],
};
