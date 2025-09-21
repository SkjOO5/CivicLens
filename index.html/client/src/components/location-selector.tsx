import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Button } from "@/components/ui/button";
import { Link } from "wouter";

export default function LocationSelector() {
  const [selectedState, setSelectedState] = useState("");
  const [selectedDistrict, setSelectedDistrict] = useState("");

  const { data: states } = useQuery({
    queryKey: ["/api/states"],
    queryFn: async () => {
      const response = await fetch("/api/states");
      if (!response.ok) throw new Error("Failed to fetch states");
      return response.json();
    },
  });

  const { data: districts } = useQuery({
    queryKey: ["/api/districts", selectedState],
    queryFn: async () => {
      if (!selectedState) return [];
      const response = await fetch(`/api/districts/${selectedState}`);
      if (!response.ok) throw new Error("Failed to fetch districts");
      return response.json();
    },
    enabled: !!selectedState,
  });

  const popularCities = [
    { name: "Mumbai", state: "Maharashtra" },
    { name: "Delhi", state: "Delhi" },
    { name: "Bangalore", state: "Karnataka" },
    { name: "Chennai", state: "Tamil Nadu" },
  ];

  return (
    <section className="py-16 bg-muted/30">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Choose Your Location</h2>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Select your state and district to start reporting issues in your area
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-12 items-start">
          {/* Interactive India Map */}
          <div className="bg-card rounded-xl p-6 shadow-lg">
            <h3 className="text-xl font-semibold mb-4 text-center">Interactive India Map</h3>
            <div className="relative bg-gradient-to-b from-blue-50 to-green-50 rounded-lg p-8 h-96 flex items-center justify-center border-2 border-border">
              <svg viewBox="0 0 400 500" className="w-full h-full text-primary">
                <path 
                  d="M120 50 L180 60 L220 40 L280 45 L320 80 L340 120 L350 180 L360 240 L350 300 L320 340 L280 380 L240 420 L200 440 L160 450 L120 440 L80 420 L60 380 L50 340 L40 300 L45 240 L55 180 L70 120 L90 80 Z" 
                  fill="currentColor" 
                  opacity="0.2" 
                  stroke="currentColor" 
                  strokeWidth="2"
                />
                
                {/* Clickable state regions */}
                <circle cx="150" cy="150" r="8" fill="#ef4444" className="cursor-pointer hover:r-10 transition-all" data-state="rajasthan" data-testid="map-rajasthan" />
                <circle cx="200" cy="120" r="8" fill="#ef4444" className="cursor-pointer hover:r-10 transition-all" data-state="delhi" data-testid="map-delhi" />
                <circle cx="250" cy="200" r="8" fill="#ef4444" className="cursor-pointer hover:r-10 transition-all" data-state="maharashtra" data-testid="map-maharashtra" />
                <circle cx="180" cy="250" r="8" fill="#ef4444" className="cursor-pointer hover:r-10 transition-all" data-state="karnataka" data-testid="map-karnataka" />
                <circle cx="300" cy="180" r="8" fill="#ef4444" className="cursor-pointer hover:r-10 transition-all" data-state="west-bengal" data-testid="map-west-bengal" />
                <circle cx="120" cy="300" r="8" fill="#ef4444" className="cursor-pointer hover:r-10 transition-all" data-state="kerala" data-testid="map-kerala" />
                <circle cx="280" cy="250" r="8" fill="#ef4444" className="cursor-pointer hover:r-10 transition-all" data-state="tamil-nadu" data-testid="map-tamil-nadu" />
                <circle cx="220" cy="180" r="8" fill="#ef4444" className="cursor-pointer hover:r-10 transition-all" data-state="madhya-pradesh" data-testid="map-madhya-pradesh" />
              </svg>
              
              <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-sm text-muted-foreground bg-white/80 px-3 py-1 rounded-full">
                Click on any state
              </div>
            </div>
          </div>

          {/* State and District Selection */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Select State</CardTitle>
              </CardHeader>
              <CardContent>
                <Select value={selectedState} onValueChange={setSelectedState} data-testid="select-location-state">
                  <SelectTrigger>
                    <SelectValue placeholder="Choose your state..." />
                  </SelectTrigger>
                  <SelectContent>
                    {states?.map((state: any) => (
                      <SelectItem key={state.value} value={state.value}>
                        {state.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Select District</CardTitle>
              </CardHeader>
              <CardContent>
                <Select 
                  value={selectedDistrict} 
                  onValueChange={setSelectedDistrict}
                  disabled={!selectedState}
                  data-testid="select-location-district"
                >
                  <SelectTrigger>
                    <SelectValue placeholder={selectedState ? "Choose district..." : "First select a state..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {districts?.map((district: any) => (
                      <SelectItem key={district.value} value={district.value}>
                        {district.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-sm text-muted-foreground mt-2">
                  District options will appear after selecting a state
                </p>
              </CardContent>
            </Card>

            <Link href="/dashboard">
              <Button 
                className="w-full bg-primary text-primary-foreground hover:bg-primary/90"
                disabled={!selectedState || !selectedDistrict}
                data-testid="button-continue-dashboard"
              >
                Continue to Dashboard
              </Button>
            </Link>

            {/* Quick Access Popular Cities */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Access - Popular Cities</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-3">
                  {popularCities.map((city) => (
                    <button
                      key={city.name}
                      className="text-left p-3 rounded-lg border border-border hover:bg-muted transition-colors"
                      data-testid={`quick-city-${city.name.toLowerCase()}`}
                    >
                      <div className="font-medium">{city.name}</div>
                      <div className="text-sm text-muted-foreground">{city.state}</div>
                    </button>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </section>
  );
}
