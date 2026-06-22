import React from 'react';
import {
  BarChart3,
  Users,
  TrendingUp,
  BookOpen,
  Settings2,
  LogOut,
  Menu,
  MessageSquare,
  Sparkles,
  ArrowRight,
  ChevronLeft,
  Shield,
  AlertTriangle,
  ArrowUp,
  ArrowDown,
  Check,
  Plus,
  X,
  Bot,
  Search,
  Star,
  Globe,
  RefreshCw,
  Info,
  Book,
  HelpCircle
} from 'lucide-react';

interface IconProps {
  name: string;
  className?: string;
  strokeWidth?: number;
}

const lucideMap: Record<string, React.ComponentType<any>> = {
  benchmark: BarChart3,
  students: Users,
  analytics: TrendingUp,
  library: BookOpen,
  settings: Settings2,
  logout: LogOut,
  menu: Menu,
  chat: MessageSquare,
  brain: Sparkles,
  arrowRight: ArrowRight,
  chevronLeft: ChevronLeft,
  admin: Shield,
  alert: AlertTriangle,
  arrowUp: ArrowUp,
  arrowDown: ArrowDown,
  trendUp: TrendingUp,
  trendDown: TrendingUp,
  trendStable: ArrowRight,
  check: Check,
  plus: Plus,
  close: X,
  robot: Bot,
  search: Search,
  star: Star,
  shield: Shield,
  globe: Globe,
  refresh: RefreshCw,
  info: Info,
  book: Book,
  help: HelpCircle
};

export const Icon: React.FC<IconProps> = ({ name, className = 'w-6 h-6', strokeWidth = 1.5 }) => {
  const LucideIcon = lucideMap[name];
  if (!LucideIcon) return null;
  return <LucideIcon className={className} strokeWidth={strokeWidth} />;
};
