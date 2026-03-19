export interface AgentResult {
  agent: string;
  response: string;
}

export interface AssistResponse {
  query: string;
  detectedAgents: string[];
  results: AgentResult[];
}

export interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  assistResponse?: AssistResponse;
  timestamp: number;
}
