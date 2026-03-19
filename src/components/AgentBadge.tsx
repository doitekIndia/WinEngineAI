import React from "react";
import { 
  AlertCircle, 
  Zap, 
  Settings, 
  Wifi, 
  ShieldCheck, 
  BookOpen,
  LucideIcon
} from "lucide-react";

interface AgentBadgeProps {
  agent: string;
}

const agentConfig: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  error_diagnosis: { label: "Error Diagnosis", icon: AlertCircle, color: "bg-red-500/10 text-red-500 border-red-500/20" },
  optimization: { label: "Optimization", icon: Zap, color: "bg-amber-500/10 text-amber-500 border-amber-500/20" },
  tweak: { label: "Tweak & Customization", icon: Settings, color: "bg-blue-500/10 text-blue-500 border-blue-500/20" },
  network: { label: "Network", icon: Wifi, color: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" },
  security: { label: "Security", icon: ShieldCheck, color: "bg-purple-500/10 text-purple-500 border-purple-500/20" },
  guide: { label: "Guide & Tutorial", icon: BookOpen, color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" },
};

export const AgentBadge: React.FC<AgentBadgeProps> = ({ agent }) => {
  const config = agentConfig[agent] || { label: agent, icon: AlertCircle, color: "bg-zinc-500/10 text-zinc-500 border-zinc-500/20" };
  const Icon = config.icon;

  return (
    <div className={`flex items-center gap-1.5 px-2 py-1 rounded-full border text-[10px] font-medium uppercase tracking-wider ${config.color}`}>
      <Icon size={12} />
      {config.label}
    </div>
  );
};
