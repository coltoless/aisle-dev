// Request and response shape definitions for Aisle API routes.

export interface ApiError {
  error: string;
  details?: unknown;
  code?: string;
}

export type ApiResponse<T> = T | ApiError;

export function isApiError(res: unknown): res is ApiError {
  return typeof res === "object" && res !== null && "error" in res;
}

// ─── AI BUDDY — POST /api/ai/buddy ───

export type BuddyChatMode = "planning" | "vendor_email" | "vision_board" | "timeline";

export interface BuddyMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  createdAt: string;
  mode: BuddyChatMode;
  /** Persisted row id when loaded from ai_conversations */
  sourceId?: string;
  /** Tool confirmations tied to this assistant turn */
  toolActions?: BuddyToolAction[];
  /** Local-only: proactive / intro bubbles are not saved the same way */
  ephemeral?: boolean;
}

export interface BuddyRequest {
  messages: Array<Pick<BuddyMessage, "role" | "content">>;
  coupleId: string;
  mode: BuddyChatMode;
}

/** NDJSON stream chunks from POST /api/ai/buddy */
export type BuddyStreamChunk =
  | { type: "text"; text: string }
  | { type: "tool_action"; action: BuddyToolAction }
  | BuddyStreamDoneEvent
  | { type: "error"; message: string };

export interface BuddyStreamDoneEvent {
  type: "done";
  toolActions: BuddyToolAction[];
}

export interface BuddyToolAction {
  tool: "add_checklist_item" | "flag_budget_item" | "recommend_venues";
  success: boolean;
  confirmationMessage: string;
  input: Record<string, unknown>;
  /** For undo */
  checklistItemId?: string;
  budgetFlagId?: string;
  /** Client navigation after tool */
  navigateTo?: string;
}

// ─── VENUES — POST /api/ai/venues ───

export interface VenueRecommendationRequest {
  coupleId: string;
  notes?: string;
}

export interface VenueRecommendation {
  name: string;
  location: string;
  venue_type: string;
  estimated_price_low: number;
  estimated_price_high: number;
  description: string;
  website?: string;
  style_tags: string[];
  is_stretch: boolean;
}

export interface VenueRecommendationResponse {
  venues: VenueRecommendation[];
  generated_at: string;
}

// ─── CONTRACT REVIEW — POST /api/ai/contract-review ───

export interface ContractReviewRequest {
  contractId: string;
  coupleId: string;
}

export interface ContractReviewSection {
  heading: string;
  content: string;
}

export interface ContractReviewResponse {
  contractId: string;
  sections: ContractReviewSection[];
  flagCount: number;
  reviewed_at: string;
}

// ─── ONBOARDING — POST /api/onboarding/complete ───

export interface OnboardingCompleteRequest {
  partner1Name: string;
  partner2Name: string;
  weddingDate: string | null;
  locationCity: string;
  locationState: string;
  locationCountry: string;
  guestCountRange: string;
  budgetRange: string;
  budgetExact?: number;
  styleTags: string[];
  priorities: string[];
}

export interface OnboardingCompleteResponse {
  coupleId: string;
  weddingProfileId: string;
  checklistItemsCreated: number;
  budgetItemsCreated: number;
  aiIntroMessage: string;
}

// ─── CHECKLIST — POST /api/checklist/items ───

export interface AddChecklistItemRequest {
  coupleId: string;
  title: string;
  category: string;
  phase: string;
  due_date?: string;
  notes?: string;
  is_custom: boolean;
}

export interface AddChecklistItemResponse {
  id: string;
  title: string;
  phase: string;
  category: string;
  due_date: string | null;
  completed: boolean;
  created_at: string;
}

export type BudgetSeverity = "info" | "warning" | "critical";

// ─── BUDGET FLAG — POST /api/budget/flag ───

export interface BudgetFlagRequest {
  coupleId: string;
  category: string;
  reason: string;
  severity: BudgetSeverity;
}

export interface BudgetFlagResponse {
  flagId: string;
  category: string;
  severity: string;
  created_at: string;
}

// ─── CONTRACTS — POST /api/contracts/upload ───

export interface ContractUploadRequest {
  coupleId: string;
  vendorId?: string;
  vendorName: string;
  contractValue?: number;
  depositAmount?: number;
  depositDueDate?: string;
  balanceDueDate?: string;
  signed: boolean;
}

export interface ContractUploadResponse {
  contractId: string;
  filePath: string;
  vendorName: string;
  uploaded_at: string;
}

export type {
  AIConversationMessage,
  BudgetItem,
  ChecklistItem,
  Contract,
  Couple,
  Vendor,
  VenueStatus,
  WeddingProfile,
} from "./index";

export type { Venue as VenueRecord } from "./index";
export type { VendorStatus } from "@/lib/constants";
