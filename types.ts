
export interface SlamBookConfig {
  id: string;
  creatorEmail: string;
  title: string;
  themeColor: string;
  questions: string[];
  createdAt: number;
}

export interface SlamAnswer {
  id: string;
  friendName: string;
  answers: Record<string, string>;
  submittedAt: number;
}

export interface UserSlamData {
  config: SlamBookConfig;
  answers: SlamAnswer[];
}
