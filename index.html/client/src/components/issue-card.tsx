import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Issue {
  id: string;
  title: string;
  description: string;
  category: string;
  priority: string;
  status: string;
  location: string;
  imageUrl?: string;
  createdAt: string;
}

interface IssueCardProps {
  issue: Issue;
}

export default function IssueCard({ issue }: IssueCardProps) {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive/10 text-destructive";
      case "medium":
        return "bg-accent/10 text-accent";
      case "low":
        return "bg-secondary/10 text-secondary";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "new":
        return "bg-accent/10 text-accent";
      case "in_progress":
        return "bg-primary/10 text-primary";
      case "resolved":
        return "bg-secondary/10 text-secondary pulse";
      case "closed":
        return "bg-muted/10 text-muted-foreground";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffTime = Math.abs(now.getTime() - date.getTime());
    const diffHours = Math.floor(diffTime / (1000 * 60 * 60));
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffHours < 24) {
      return `${diffHours} hours ago`;
    } else {
      return `${diffDays} days ago`;
    }
  };

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case "roads":
        return "🛣️";
      case "sanitation":
        return "🗑️";
      case "electricity":
        return "💡";
      case "water":
        return "💧";
      case "traffic":
        return "🚦";
      case "environment":
        return "🌱";
      default:
        return "📋";
    }
  };

  return (
    <Card className="bg-card rounded-xl shadow-lg overflow-hidden issue-card" data-testid={`issue-card-${issue.id}`}>
      {issue.imageUrl && (
        <img 
          src={issue.imageUrl} 
          alt={issue.title}
          className="w-full h-48 object-cover"
          data-testid={`issue-image-${issue.id}`}
        />
      )}
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-3">
          <Badge className={getPriorityColor(issue.priority)} data-testid={`priority-${issue.priority}`}>
            {issue.priority} Priority
          </Badge>
          <Badge className={`status-indicator ${getStatusColor(issue.status)}`} data-testid={`status-${issue.status}`}>
            {issue.status.replace('_', ' ')}
          </Badge>
        </div>
        
        <h3 className="font-semibold text-lg mb-2 line-clamp-2" data-testid={`title-${issue.id}`}>
          {issue.title}
        </h3>
        
        <p className="text-muted-foreground text-sm mb-4 line-clamp-3" data-testid={`description-${issue.id}`}>
          {issue.description}
        </p>
        
        <div className="flex items-center justify-between text-sm text-muted-foreground">
          <span className="flex items-center gap-1" data-testid={`location-${issue.id}`}>
            📍 {issue.location}
          </span>
          <span data-testid={`created-${issue.id}`}>
            {formatDate(issue.createdAt)}
          </span>
        </div>
        
        <div className="flex items-center gap-2 mt-3">
          <span className="text-lg">{getCategoryIcon(issue.category)}</span>
          <Badge variant="outline" className="capitalize" data-testid={`category-${issue.category}`}>
            {issue.category}
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
