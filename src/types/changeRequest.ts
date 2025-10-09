export interface ChangeRequest {
  id: string;
  member_id: string;
  requested_by: string;
  requested_at: string;
  status: 'pending' | 'approved' | 'rejected';
  changes: Record<string, any>;
  reviewed_by: string | null;
  reviewed_at: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
  
  // Joined data (populated from queries)
  member_name?: string;
  requester_email?: string;
  reviewer_email?: string;
}

export interface ChangeRequestWithMember extends ChangeRequest {
  member: {
    nama: string;
    npa: string;
    cabang: string;
  };
}
