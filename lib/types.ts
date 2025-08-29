// Database types
export interface Profile {
  id: string;
  email: string;
  full_name?: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface Poll {
  id: string;
  creator_id: string;
  question: string;
  description?: string;
  status: 'active' | 'closed' | 'draft';
  is_public: boolean;
  allow_multiple_votes: boolean;
  expires_at?: string;
  created_at: string;
  updated_at: string;
}

export interface PollOption {
  id: string;
  poll_id: string;
  option_text: string;
  display_order: number;
  created_at: string;
}

export interface Vote {
  id: string;
  poll_id: string;
  option_id: string;
  voter_id: string;
  created_at: string;
}

// API response types
export interface PollWithOptions {
  poll_id: string;
  question: string;
  description?: string;
  status: 'active' | 'closed' | 'draft';
  is_public: boolean;
  allow_multiple_votes: boolean;
  expires_at?: string;
  created_at: string;
  creator_id: string;
  options: PollOptionWithVotes[];
  total_votes: number;
}

export interface PollOptionWithVotes {
  id: string;
  option_text: string;
  display_order: number;
  vote_count: number;
}

export interface UserPoll {
  poll_id: string;
  question: string;
  description?: string;
  status: 'active' | 'closed' | 'draft';
  is_public: boolean;
  allow_multiple_votes: boolean;
  expires_at?: string;
  created_at: string;
  total_votes: number;
}

export interface PublicPoll {
  id: string;
  question: string;
  description?: string;
  created_at: string;
  expires_at?: string;
  allow_multiple_votes: boolean;
  total_votes: number;
}

// API request types
export interface CreatePollRequest {
  question: string;
  description?: string;
  options: string[];
  allowMultipleVotes?: boolean;
  expiresAt?: string;
  isPublic?: boolean;
}

export interface UpdatePollRequest {
  question?: string;
  description?: string;
  status?: 'active' | 'closed' | 'draft';
  allowMultipleVotes?: boolean;
  expiresAt?: string;
  isPublic?: boolean;
  options?: string[];
}

export interface VoteRequest {
  optionId: string;
}

// API response types
export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  message?: string;
}

export interface PollsResponse {
  polls: UserPoll[];
}

export interface PollResponse {
  poll: PollWithOptions;
}

export interface CreatePollResponse {
  poll: PollWithOptions;
}

export interface VoteResponse {
  message: string;
  poll: PollWithOptions;
}

export interface UserVoteResponse {
  hasVoted: boolean;
  vote: Vote | null;
}

export interface PublicPollsResponse {
  polls: PublicPoll[];
  pagination: {
    limit: number;
    offset: number;
    hasMore: boolean;
  };
}

// Error types
export interface ApiError {
  error: string;
  status: number;
}

// Utility types
export type PollStatus = 'active' | 'closed' | 'draft';
