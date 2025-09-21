import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Link } from "wouter";

export default function AdminPanel() {
  const { data: issues, isLoading } = useQuery({
    queryKey: ["/api/issues", { limit: 10 }],
    queryFn: async () => {
      const response = await fetch("/api/issues?limit=10");
      if (!response.ok) throw new Error("Failed to fetch issues");
      return response.json();
    },
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

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
        return "bg-secondary/10 text-secondary";
      case "closed":
        return "bg-muted/10 text-muted-foreground";
      default:
        return "bg-muted/10 text-muted-foreground";
    }
  };

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Administrative Dashboard</h2>
          <p className="text-lg text-muted-foreground">
            Efficient tools for municipal staff to manage and track civic issues
          </p>
        </div>

        <Card className="overflow-hidden">
          {/* Admin Header */}
          <div className="bg-primary p-6 text-primary-foreground">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="text-xl font-semibold">Admin Control Panel</h3>
                <p className="text-primary-foreground/80">Manage civic issues across all departments</p>
              </div>
              <div className="flex gap-3">
                <Button 
                  variant="secondary"
                  className="bg-white/20 hover:bg-white/30 text-primary-foreground border-white/30"
                  data-testid="button-admin-export"
                >
                  Export Data
                </Button>
                <Button 
                  className="bg-accent hover:bg-accent/90 text-accent-foreground"
                  data-testid="button-admin-generate-report"
                >
                  Generate Report
                </Button>
              </div>
            </div>
          </div>

          <CardContent className="p-6">
            {/* Department Overview */}
            {stats && (
              <div className="grid md:grid-cols-4 gap-4 mb-8">
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-primary mb-1" data-testid="stat-public-works">
                      {stats.byCategory?.roads || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Public Works</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-secondary mb-1" data-testid="stat-sanitation">
                      {stats.byCategory?.sanitation || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Sanitation</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-accent mb-1" data-testid="stat-electricity">
                      {stats.byCategory?.electricity || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Electricity</div>
                  </CardContent>
                </Card>
                
                <Card>
                  <CardContent className="p-4 text-center">
                    <div className="text-2xl font-bold text-destructive mb-1" data-testid="stat-water">
                      {stats.byCategory?.water || 0}
                    </div>
                    <div className="text-sm text-muted-foreground">Water Dept.</div>
                  </CardContent>
                </Card>
              </div>
            )}

            {/* Issue Management Table */}
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Issue ID</TableHead>
                    <TableHead>Category</TableHead>
                    <TableHead>Location</TableHead>
                    <TableHead>Priority</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Assigned To</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        Loading issues...
                      </TableCell>
                    </TableRow>
                  ) : issues && issues.length > 0 ? (
                    issues.slice(0, 5).map((issue: any) => (
                      <TableRow key={issue.id} className="hover:bg-muted/20" data-testid={`admin-row-${issue.id}`}>
                        <TableCell className="font-mono text-sm">
                          #{issue.id.slice(-8)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline" className="capitalize">
                            {issue.category}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-32 truncate">{issue.location}</TableCell>
                        <TableCell>
                          <Badge className={getPriorityColor(issue.priority)}>
                            {issue.priority}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge className={getStatusColor(issue.status)}>
                            {issue.status.replace('_', ' ')}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm">
                          {issue.assignedTo || "Unassigned"}
                        </TableCell>
                        <TableCell>
                          <Button variant="ghost" size="sm" data-testid={`admin-view-${issue.id}`}>
                            View
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={7} className="text-center py-8">
                        No issues found.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Quick Actions */}
            <div className="mt-8 flex flex-wrap gap-4">
              <Button 
                className="bg-primary text-primary-foreground hover:bg-primary/90"
                data-testid="button-admin-bulk-assign"
              >
                Bulk Assign
              </Button>
              <Button 
                className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
                data-testid="button-admin-mark-resolved"
              >
                Mark Resolved
              </Button>
              <Button 
                variant="outline"
                data-testid="button-admin-filter"
              >
                Filter Issues
              </Button>
              <Link href="/admin">
                <Button 
                  variant="outline"
                  data-testid="button-admin-full-panel"
                >
                  Full Admin Panel
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
