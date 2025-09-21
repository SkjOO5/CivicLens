import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function Admin() {
  const [filters, setFilters] = useState({
    status: "",
    category: "",
  });
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: issues, isLoading } = useQuery({
    queryKey: ["/api/issues", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") params.append(key, value);
      });
      
      const response = await fetch(`/api/issues?${params}`);
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

  const updateIssueMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: any }) => {
      return await apiRequest("PATCH", `/api/issues/${id}`, updates);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics/stats"] });
      toast({
        title: "Issue Updated",
        description: "Issue status has been updated successfully.",
      });
    },
    onError: () => {
      toast({
        title: "Error",
        description: "Failed to update issue.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (issueId: string, newStatus: string) => {
    updateIssueMutation.mutate({
      id: issueId,
      updates: { status: newStatus },
    });
  };

  const handleAssignDepartment = (issueId: string, department: string) => {
    updateIssueMutation.mutate({
      id: issueId,
      updates: { assignedTo: department },
    });
  };

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
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Administrative Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Efficient tools for municipal staff to manage and track civic issues
        </p>
      </div>

      {/* Department Overview */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-4 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Public Works</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.byCategory?.roads || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Sanitation</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.byCategory?.sanitation || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Electricity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.byCategory?.electricity || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Water Dept.</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-destructive">{stats.byCategory?.water || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex justify-between items-center">
            <CardTitle>Issue Management</CardTitle>
            <div className="flex gap-3">
              <Button 
                variant="outline"
                data-testid="button-export"
              >
                Export Data
              </Button>
              <Button 
                className="bg-accent text-accent-foreground hover:bg-accent/90"
                data-testid="button-generate-report"
              >
                Generate Report
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-2 gap-4 mb-6">
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({...filters, status: value})}
                data-testid="filter-admin-status"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Status</SelectItem>
                  <SelectItem value="new">New</SelectItem>
                  <SelectItem value="in_progress">In Progress</SelectItem>
                  <SelectItem value="resolved">Resolved</SelectItem>
                  <SelectItem value="closed">Closed</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters({...filters, category: value})}
                data-testid="filter-admin-category"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="roads">Roads</SelectItem>
                  <SelectItem value="sanitation">Sanitation</SelectItem>
                  <SelectItem value="electricity">Electricity</SelectItem>
                  <SelectItem value="water">Water</SelectItem>
                  <SelectItem value="traffic">Traffic</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Issue Management Table */}
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Issue ID</TableHead>
                  <TableHead>Title</TableHead>
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
                    <TableCell colSpan={8} className="text-center py-8">
                      Loading issues...
                    </TableCell>
                  </TableRow>
                ) : issues && issues.length > 0 ? (
                  issues.map((issue: any) => (
                    <TableRow key={issue.id} className="hover:bg-muted/20">
                      <TableCell className="font-mono text-sm">
                        #{issue.id.slice(-8)}
                      </TableCell>
                      <TableCell className="max-w-48 truncate">{issue.title}</TableCell>
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
                        <Select
                          value={issue.status}
                          onValueChange={(value) => handleStatusChange(issue.id, value)}
                          data-testid={`select-status-${issue.id}`}
                        >
                          <SelectTrigger className="w-32">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="new">New</SelectItem>
                            <SelectItem value="in_progress">In Progress</SelectItem>
                            <SelectItem value="resolved">Resolved</SelectItem>
                            <SelectItem value="closed">Closed</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Select
                          value={issue.assignedTo || ""}
                          onValueChange={(value) => handleAssignDepartment(issue.id, value)}
                          data-testid={`select-department-${issue.id}`}
                        >
                          <SelectTrigger className="w-40">
                            <SelectValue placeholder="Assign..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Public Works Dept.">Public Works</SelectItem>
                            <SelectItem value="Sanitation Dept.">Sanitation</SelectItem>
                            <SelectItem value="Electricity Board">Electricity</SelectItem>
                            <SelectItem value="Water Department">Water Dept.</SelectItem>
                            <SelectItem value="Traffic Police">Traffic</SelectItem>
                            <SelectItem value="Environment Dept.">Environment</SelectItem>
                          </SelectContent>
                        </Select>
                      </TableCell>
                      <TableCell>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          data-testid={`button-view-${issue.id}`}
                        >
                          View
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={8} className="text-center py-8">
                      No issues found matching your filters.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 flex gap-4">
            <Button 
              className="bg-primary text-primary-foreground hover:bg-primary/90"
              data-testid="button-bulk-assign"
            >
              Bulk Assign
            </Button>
            <Button 
              className="bg-secondary text-secondary-foreground hover:bg-secondary/90"
              data-testid="button-mark-resolved"
            >
              Mark Resolved
            </Button>
            <Button 
              variant="outline"
              data-testid="button-filter-issues"
            >
              Advanced Filter
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
