import Link from "next/link";
import { ArrowUpRight } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface StatsCardProps {
  label: string;
  value: number | string;
  icon?: React.ReactNode;
  href?: string;
  description?: string;
}

export function StatsCard({
  label,
  value,
  icon,
  href,
  description,
}: StatsCardProps) {
  const content = (
    <Card
      className={href ? "hover:shadow-lg transition-all cursor-pointer" : ""}
    >
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {label}
        </CardTitle>
        {icon && <div className="text-muted-foreground">{icon}</div>}
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-bold">{value}</div>
        {description && (
          <p className="text-xs text-muted-foreground mt-1">{description}</p>
        )}
        {href && (
          <div className="flex items-center text-xs text-primary mt-2">
            View details <ArrowUpRight className="ml-1 h-3 w-3" />
          </div>
        )}
      </CardContent>
    </Card>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
