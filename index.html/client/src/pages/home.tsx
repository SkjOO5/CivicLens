import HeroSection from "@/components/hero-section";
import LocationSelector from "@/components/location-selector";
import IssueForm from "@/components/issue-form";
import LiveDashboard from "@/components/live-dashboard";
import { useQuery } from "@tanstack/react-query";
import IssueCard from "@/components/issue-card";
import AdminPanel from "@/components/admin-panel";
import Footer from "@/components/ui/footer";

export default function Home() {
  const { data: issues } = useQuery({
    queryKey: ["/api/issues"],
    queryFn: async () => {
      const response = await fetch("/api/issues?limit=6");
      if (!response.ok) throw new Error("Failed to fetch issues");
      return response.json();
    },
  });

  return (
    <main>
      <HeroSection />
      <LocationSelector />
      <IssueForm />
      <LiveDashboard />
      
      {/* Recent Reports Section */}
      <section className="py-16 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center mb-8">
            <h2 className="text-3xl font-bold text-foreground">Recent Reports</h2>
            <button 
              className="text-primary hover:underline"
              data-testid="view-all-issues"
            >
              View All
            </button>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {issues && issues.length > 0 ? (
              issues.map((issue: any) => (
                <IssueCard key={issue.id} issue={issue} />
              ))
            ) : (
              <div className="col-span-full text-center py-8">
                <p className="text-muted-foreground">No issues reported yet. Be the first to report a civic issue!</p>
              </div>
            )}
          </div>
        </div>
      </section>

      <AdminPanel />
      <Footer />
    </main>
  );
}
