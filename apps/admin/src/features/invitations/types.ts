export type InvitationRoleType = 'user' | 'author' | 'publisher';
export type InvitationStatus = 'draft' | 'sent' | 'accepted' | 'expired';

export interface AdminInvitation {
  id: string;
  recipientName: string;
  recipientEmail: string;
  roleType: InvitationRoleType;
  roleLabel: string;
  subject: string;
  message: string;
  invitationToken: string;
  status: InvitationStatus;
  expiresAt: string;
  createdBy: string | null;
  sentAt: string | null;
  acceptedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface InvitationTemplate {
  roleType: InvitationRoleType;
  subject: string;
  message: string;
}

export interface InvitationsListResponse {
  items: AdminInvitation[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  storage?: 'database' | 'file';
}

export interface InvitationAcceptInfo {
  recipientName: string;
  recipientEmail: string;
  roleType: InvitationRoleType;
  roleLabel: string;
  expiresAt: string;
  appRole: string;
}
