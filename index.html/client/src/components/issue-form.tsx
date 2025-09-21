import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function IssueForm() {
  return (
    <section className="py-16 bg-background">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Report an Issue</h2>
          <p className="text-lg text-muted-foreground">
            Help improve your community by reporting civic issues
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Issue Reporting Form</CardTitle>
          </CardHeader>
          <CardContent className="text-center py-12">
            <p className="text-muted-foreground mb-6">
              Ready to report a civic issue? Our comprehensive form makes it easy to submit detailed reports with photos, location data, and voice input.
            </p>
            <div className="space-y-4">
              <div className="flex flex-wrap justify-center gap-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-primary rounded-full"></div>
                  <span className="text-sm">Photo Upload</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-secondary rounded-full"></div>
                  <span className="text-sm">Location Tagging</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-accent rounded-full"></div>
                  <span className="text-sm">Voice Input</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-destructive rounded-full"></div>
                  <span className="text-sm">AI Categorization</span>
                </div>
              </div>
              <Link href="/report">
                <Button 
                  className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 py-3"
                  data-testid="button-start-reporting"
                >
                  Start Reporting
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  );
}
