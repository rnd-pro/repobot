export interface Config {
  ai?: {
    provider: string;
    apiKey?: string;
    model?: string;
  };
  telegram?: {
    botToken?: string;
    chatId?: string;
    groupId?: string;
  };
  reporting?: {
    schedule?: string;
    template?: string;
  };
  repository?: {
    paths?: {
      todos?: string[];
      documentation?: string[];
    };
  };
} 