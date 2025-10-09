import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  color?: "blue" | "green" | "orange" | "purple" | "red" | "yellow";
}

const colorClasses = {
  blue: {
    border: "border-l-blue-500",
    gradient: "from-blue-500/5",
    iconBg: "bg-blue-500/20",
    iconColor: "text-blue-600",
    textColor: "text-blue-600",
  },
  green: {
    border: "border-l-green-500",
    gradient: "from-green-500/5",
    iconBg: "bg-green-500/20",
    iconColor: "text-green-600",
    textColor: "text-green-600",
  },
  orange: {
    border: "border-l-orange-500",
    gradient: "from-orange-500/5",
    iconBg: "bg-orange-500/20",
    iconColor: "text-orange-600",
    textColor: "text-orange-600",
  },
  purple: {
    border: "border-l-purple-500",
    gradient: "from-purple-500/5",
    iconBg: "bg-purple-500/20",
    iconColor: "text-purple-600",
    textColor: "text-purple-600",
  },
  red: {
    border: "border-l-red-500",
    gradient: "from-red-500/5",
    iconBg: "bg-red-500/20",
    iconColor: "text-red-600",
    textColor: "text-red-600",
  },
  yellow: {
    border: "border-l-yellow-500",
    gradient: "from-yellow-500/5",
    iconBg: "bg-yellow-500/20",
    iconColor: "text-yellow-600",
    textColor: "text-yellow-600",
  },
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  color = "blue"
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className={`border-l-4 ${colors.border} to-transparent`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <div className={`rounded-full ${colors.iconBg} p-2`}>
          <Icon className={`h-4 w-4 ${colors.iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${colors.textColor}`}>
          {value}
        </div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
      </CardContent>
    </Card>
  );
}
