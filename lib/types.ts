export interface Poll {
  id: string;
  creator_id: string;
  question: string;
  description: string | null;
  status: "active" | "closed" | "draft";
  is_public: boolean;
  allow_multiple_votes: boolean;
  expires_at: string | null;
  created_at: string;
  updated_at: string;
  options: PollOption[];
  total_votes?: number;
}

export interface PollOption {
  id: string;
  option_text: string;
  display_order: number;
  vote_count?: number;
}

export interface User {
  id: string;
  name: string;
  email: string;
}
