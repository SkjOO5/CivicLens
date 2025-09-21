import { Button } from "@/components/ui/button";
import { Link } from "wouter";
import { useQuery } from "@tanstack/react-query";

export default function HeroSection() {
  const { data: stats } = useQuery({
    queryKey: ["/api/analytics/stats"],
    queryFn: async () => {
      const response = await fetch("/api/analytics/stats");
      if (!response.ok) throw new Error("Failed to fetch stats");
      return response.json();
    },
  });

  return (
    <section className="hero-gradient relative overflow-hidden">
      <div className="absolute inset-0 opacity-10">
        <div className="absolute top-0 left-0 w-full h-1/3 bg-gradient-to-r from-orange-400 to-orange-500"></div>
        <div className="absolute top-1/3 left-0 w-full h-1/3 bg-white"></div>
        <div className="absolute top-2/3 left-0 w-full h-1/3 bg-gradient-to-r from-green-500 to-green-600"></div>
      </div>
      
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center">
          <h1 className="text-4xl md:text-6xl font-bold text-primary-foreground mb-6">
            Building Better India,<br />
            <span className="text-accent">One Report at a Time</span>
          </h1>
          <p className="text-xl md:text-2xl text-primary-foreground/90 mb-8 max-w-3xl mx-auto">
            Report civic issues, track progress, and help create positive change in your community across India.
          </p>
          
          {/* CTA Buttons */}
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Link href="/report">
              <Button 
                className="bg-accent text-accent-foreground px-8 py-4 rounded-lg text-lg font-semibold hover:bg-accent/90 shadow-lg"
                data-testid="button-hero-report"
              >
                Report an Issue
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button 
                variant="secondary"
                className="bg-white/20 backdrop-blur text-primary-foreground border border-white/30 px-8 py-4 rounded-lg text-lg font-semibold hover:bg-white/30"
                data-testid="button-hero-dashboard"
              >
                View Dashboard
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                {stats?.total || 0}
              </div>
              <div className="text-primary-foreground/80">Issues Reported</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">
                {stats?.byStatus?.resolved || 0}
              </div>
              <div className="text-primary-foreground/80">Issues Resolved</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">28</div>
              <div className="text-primary-foreground/80">States Covered</div>
            </div>
            <div className="text-center">
              <div className="text-3xl md:text-4xl font-bold text-accent mb-2">647</div>
              <div className="text-primary-foreground/80">Districts Active</div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
