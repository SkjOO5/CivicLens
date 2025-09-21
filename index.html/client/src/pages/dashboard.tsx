import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import IssueCard from "@/components/issue-card";
import { useState } from "react";

export default function Dashboard() {
  const [filters, setFilters] = useState({
    category: "",
    status: "",
    state: "",
  });

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

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground mb-4">Issue Dashboard</h1>
        <p className="text-lg text-muted-foreground">
          Track and monitor civic issues in real-time
        </p>
      </div>

      {/* Stats Cards */}
      {stats && (
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Total Issues</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.total}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">New Reports</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-accent">{stats.byStatus?.new || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">In Progress</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.byStatus?.in_progress || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm text-muted-foreground">Resolved</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-secondary">{stats.byStatus?.resolved || 0}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filters */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Filter Issues</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium mb-2">Category</label>
              <Select 
                value={filters.category} 
                onValueChange={(value) => setFilters({...filters, category: value})}
                data-testid="filter-category"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="roads">Roads & Infrastructure</SelectItem>
                  <SelectItem value="sanitation">Sanitation & Waste</SelectItem>
                  <SelectItem value="electricity">Electricity & Lighting</SelectItem>
                  <SelectItem value="water">Water Supply</SelectItem>
                  <SelectItem value="traffic">Traffic & Transportation</SelectItem>
                  <SelectItem value="environment">Environment</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-2">Status</label>
              <Select 
                value={filters.status} 
                onValueChange={(value) => setFilters({...filters, status: value})}
                data-testid="filter-status"
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
              <label className="block text-sm font-medium mb-2">State</label>
              <Select 
                value={filters.state} 
                onValueChange={(value) => setFilters({...filters, state: value})}
                data-testid="filter-state"
              >
                <SelectTrigger>
                  <SelectValue placeholder="All States" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All States</SelectItem>
                  <SelectItem value="maharashtra">Maharashtra</SelectItem>
                  <SelectItem value="karnataka">Karnataka</SelectItem>
                  <SelectItem value="delhi">Delhi</SelectItem>
                  <SelectItem value="rajasthan">Rajasthan</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Issues Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {isLoading ? (
          Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="bg-card rounded-xl shadow-lg h-80 animate-pulse" />
          ))
        ) : issues && issues.length > 0 ? (
          issues.map((issue: any) => (
            <IssueCard key={issue.id} issue={issue} />
          ))
        ) : (
          <div className="col-span-full text-center py-8">
            <p className="text-muted-foreground">No issues found matching your filters.</p>
          </div>
        )}
      </div>
    </div>
  );
}
