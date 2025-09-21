import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { useState } from "react";

export default function LiveDashboard() {
  const [mapView, setMapView] = useState("street");
  const [filters, setFilters] = useState({
    category: "all",
    status: "all",
    timeRange: "24h",
  });

  const { data: issues } = useQuery({
    queryKey: ["/api/issues", { limit: 20 }],
    queryFn: async () => {
      const response = await fetch("/api/issues?limit=20");
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

  const getMarkerColor = (priority: string) => {
    switch (priority) {
      case "high":
        return "bg-destructive";
      case "medium":
        return "bg-accent";
      case "low":
        return "bg-secondary";
      default:
        return "bg-muted-foreground";
    }
  };

  const recentActivity = issues?.slice(0, 5).map((issue: any) => ({
    id: issue.id,
    title: issue.title,
    status: issue.status,
    timeAgo: new Date(issue.createdAt).toLocaleTimeString(),
  })) || [];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Live Issue Dashboard</h2>
          <p className="text-lg text-muted-foreground">
            Real-time view of reported issues in your area
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Map View */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <div className="flex justify-between items-center">
                  <CardTitle>Issue Map</CardTitle>
                  <div className="flex gap-2">
                    <Button
                      variant={mapView === "satellite" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMapView("satellite")}
                      data-testid="button-satellite-view"
                    >
                      Satellite
                    </Button>
                    <Button
                      variant={mapView === "street" ? "default" : "outline"}
                      size="sm"
                      onClick={() => setMapView("street")}
                      data-testid="button-street-view"
                    >
                      Street
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="bg-gradient-to-br from-blue-50 to-green-50 rounded-lg h-80 relative overflow-hidden border border-border">
                  {/* Street grid pattern */}
                  <svg className="absolute inset-0 w-full h-full opacity-20" viewBox="0 0 400 320">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="#6b7280" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)"/>
                  </svg>
                  
                  {/* Issue markers - positioned based on real issues if available */}
                  {issues?.slice(0, 8).map((issue: any, index: number) => {
                    const positions = [
                      { top: "25%", left: "25%" },
                      { top: "50%", left: "50%" },
                      { top: "75%", left: "66%" },
                      { top: "33%", left: "75%" },
                      { top: "66%", left: "33%" },
                      { top: "20%", left: "60%" },
                      { top: "80%", left: "40%" },
                      { top: "45%", left: "20%" },
                    ];
                    const position = positions[index] || { top: "50%", left: "50%" };
                    
                    return (
                      <div
                        key={issue.id}
                        className={`absolute w-4 h-4 ${getMarkerColor(issue.priority)} rounded-full border-2 border-white shadow-lg cursor-pointer ${
                          issue.priority === "high" ? "animate-pulse" : ""
                        }`}
                        style={position}
                        title={`${issue.priority} Priority: ${issue.title}`}
                        data-testid={`map-marker-${issue.id}`}
                      />
                    );
                  })}
                  
                  {/* Map controls */}
                  <div className="absolute bottom-4 right-4 flex flex-col gap-2">
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0" data-testid="button-zoom-in">+</Button>
                    <Button size="sm" variant="outline" className="w-8 h-8 p-0" data-testid="button-zoom-out">−</Button>
                  </div>
                  
                  {/* Legend */}
                  <div className="absolute bottom-4 left-4 bg-card rounded-lg p-3 shadow-lg border border-border">
                    <div className="text-xs font-medium mb-2">Priority Level</div>
                    <div className="flex flex-col gap-1 text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-destructive rounded-full"></div>
                        <span>High</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-accent rounded-full"></div>
                        <span>Medium</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-secondary rounded-full"></div>
                        <span>Low</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Stats and Filters */}
          <div className="space-y-6">
            {/* Quick Stats */}
            <Card>
              <CardHeader>
                <CardTitle>Today's Stats</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">New Reports</span>
                    <span className="font-semibold text-primary" data-testid="stat-new-reports">
                      {issues?.filter((issue: any) => issue.status === "new").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">In Progress</span>
                    <span className="font-semibold text-accent" data-testid="stat-in-progress">
                      {issues?.filter((issue: any) => issue.status === "in_progress").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">Resolved</span>
                    <span className="font-semibold text-secondary" data-testid="stat-resolved">
                      {issues?.filter((issue: any) => issue.status === "resolved").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-muted-foreground">High Priority</span>
                    <span className="font-semibold text-destructive" data-testid="stat-high-priority">
                      {issues?.filter((issue: any) => issue.priority === "high").length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filter Issues</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">Category</label>
                    <Select 
                      value={filters.category} 
                      onValueChange={(value) => setFilters({...filters, category: value})}
                      data-testid="filter-dashboard-category"
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
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-2">Status</label>
                    <Select 
                      value={filters.status} 
                      onValueChange={(value) => setFilters({...filters, status: value})}
                      data-testid="filter-dashboard-status"
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
                    <label className="block text-sm font-medium mb-2">Time Range</label>
                    <Select 
                      value={filters.timeRange} 
                      onValueChange={(value) => setFilters({...filters, timeRange: value})}
                      data-testid="filter-dashboard-time"
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="24h">Last 24 hours</SelectItem>
                        <SelectItem value="week">Last week</SelectItem>
                        <SelectItem value="month">Last month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Recent Activity */}
            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {recentActivity.length > 0 ? (
                    recentActivity.map((activity: { id: string; title: string; status: string; timeAgo: string }) => (
                      <div key={activity.id} className="flex items-start gap-3" data-testid={`activity-${activity.id}`}>
                        <div className={`w-2 h-2 rounded-full mt-2 ${
                          activity.status === "resolved" ? "bg-secondary" :
                          activity.status === "in_progress" ? "bg-primary" : "bg-accent"
                        }`}></div>
                        <div className="flex-1 text-sm">
                          <div className="font-medium line-clamp-2">{activity.title}</div>
                          <div className="text-muted-foreground">{activity.timeAgo}</div>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-4">
                      <p className="text-muted-foreground text-sm">No recent activity</p>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
