import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { useVoiceInput } from "@/hooks/use-voice-input";
import { useGeolocation } from "@/hooks/use-geolocation";
import { Mic, MapPin, Upload } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

const reportSchema = z.object({
  title: z.string().min(5, "Title must be at least 5 characters"),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.string().min(1, "Please select a category"),
  priority: z.enum(["low", "medium", "high"]),
  state: z.string().min(1, "Please select a state"),
  district: z.string().min(1, "Please select a district"),
  location: z.string().min(5, "Please provide a detailed location"),
  coordinates: z.object({
    lat: z.number(),
    lng: z.number(),
  }).optional(),
});

type ReportFormData = z.infer<typeof reportSchema>;

export default function ReportIssue() {
  const [selectedImage, setSelectedImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { startListening, isListening } = useVoiceInput();
  const { getCurrentLocation, isLoading: locationLoading } = useGeolocation();

  const form = useForm<ReportFormData>({
    resolver: zodResolver(reportSchema),
    defaultValues: {
      title: "",
      description: "",
      category: "",
      priority: "medium",
      state: "",
      district: "",
      location: "",
    },
  });

  const selectedState = form.watch("state");

  // Fetch states
  const { data: states } = useQuery({
    queryKey: ["/api/states"],
    queryFn: async () => {
      const response = await fetch("/api/states");
      if (!response.ok) throw new Error("Failed to fetch states");
      return response.json();
    },
  });

  // Fetch districts based on selected state
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

  const createIssueMutation = useMutation({
    mutationFn: async (data: ReportFormData & { image?: File }) => {
      const formData = new FormData();
      
      // Add all form fields
      Object.entries(data).forEach(([key, value]) => {
        if (key === "coordinates" && value) {
          formData.append(key, JSON.stringify(value));
        } else if (key !== "image" && value !== undefined) {
          formData.append(key, value.toString());
        }
      });

      // Add image if present
      if (data.image) {
        formData.append("image", data.image);
      }

      const response = await fetch("/api/issues", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        throw new Error("Failed to create issue");
      }

      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Issue Reported Successfully",
        description: "Your civic issue has been submitted and will be reviewed by the relevant department.",
      });
      form.reset();
      setSelectedImage(null);
      setImagePreview(null);
      queryClient.invalidateQueries({ queryKey: ["/api/issues"] });
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to submit issue. Please try again.",
        variant: "destructive",
      });
    },
  });

  const handleImageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setSelectedImage(file);
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleVoiceInput = (field: "title" | "description") => {
    startListening((transcript) => {
      form.setValue(field, transcript);
    });
  };

  const handleGetLocation = async () => {
    try {
      const position = await getCurrentLocation();
      form.setValue("coordinates", {
        lat: position.coords.latitude,
        lng: position.coords.longitude,
      });
      
      // Use reverse geocoding to get address (would need Google Maps API)
      form.setValue("location", `Coordinates: ${position.coords.latitude}, ${position.coords.longitude}`);
      
      toast({
        title: "Location Retrieved",
        description: "Your current location has been added to the report.",
      });
    } catch (error) {
      toast({
        title: "Location Error",
        description: "Failed to get your location. Please enter manually.",
        variant: "destructive",
      });
    }
  };

  const onSubmit = (data: ReportFormData) => {
    createIssueMutation.mutate({
      ...data,
      image: selectedImage || undefined,
    });
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="text-center mb-12">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Report an Issue</h1>
        <p className="text-lg text-muted-foreground">
          Help improve your community by reporting civic issues
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Issue Details</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              {/* Title */}
              <FormField
                control={form.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Title</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input 
                          placeholder="Brief title describing the issue" 
                          {...field}
                          data-testid="input-title"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="absolute right-2 top-1/2 -translate-y-1/2 p-1"
                          onClick={() => handleVoiceInput("title")}
                          disabled={isListening}
                          data-testid="button-voice-title"
                        >
                          <Mic className={`h-4 w-4 ${isListening ? 'text-destructive animate-pulse' : ''}`} />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Category */}
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Category</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange} data-testid="select-category">
                        <SelectTrigger>
                          <SelectValue placeholder="Select category..." />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="roads">Roads & Infrastructure</SelectItem>
                          <SelectItem value="sanitation">Sanitation & Waste</SelectItem>
                          <SelectItem value="electricity">Electricity & Lighting</SelectItem>
                          <SelectItem value="water">Water Supply</SelectItem>
                          <SelectItem value="traffic">Traffic & Transportation</SelectItem>
                          <SelectItem value="environment">Environment</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Description */}
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Textarea
                          placeholder="Describe the issue in detail..."
                          className="min-h-24 resize-none"
                          {...field}
                          data-testid="textarea-description"
                        />
                        <Button
                          type="button"
                          size="sm"
                          variant="ghost"
                          className="absolute bottom-2 right-2 p-1"
                          onClick={() => handleVoiceInput("description")}
                          disabled={isListening}
                          data-testid="button-voice-description"
                        >
                          <Mic className={`h-4 w-4 ${isListening ? 'text-destructive animate-pulse' : ''}`} />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* State and District */}
              <div className="grid md:grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="state"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>State</FormLabel>
                      <FormControl>
                        <Select value={field.value} onValueChange={field.onChange} data-testid="select-state">
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="district"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>District</FormLabel>
                      <FormControl>
                        <Select 
                          value={field.value} 
                          onValueChange={field.onChange}
                          disabled={!selectedState}
                          data-testid="select-district"
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
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              {/* Location */}
              <FormField
                control={form.control}
                name="location"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Location</FormLabel>
                    <FormControl>
                      <div className="flex gap-3">
                        <Input
                          placeholder="Enter address or landmark"
                          className="flex-1"
                          {...field}
                          data-testid="input-location"
                        />
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleGetLocation}
                          disabled={locationLoading}
                          data-testid="button-get-location"
                        >
                          <MapPin className="h-4 w-4" />
                        </Button>
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Image Upload */}
              <div>
                <Label className="block text-sm font-medium mb-2">Upload Photo</Label>
                <div className="border-2 border-dashed border-border rounded-lg p-6 text-center hover:border-primary transition-colors cursor-pointer">
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                    id="image-upload"
                    data-testid="input-image"
                  />
                  <label htmlFor="image-upload" className="cursor-pointer">
                    {imagePreview ? (
                      <img
                        src={imagePreview}
                        alt="Preview"
                        className="max-h-40 mx-auto mb-4 rounded-lg"
                      />
                    ) : (
                      <Upload className="w-12 h-12 text-muted-foreground mb-4 mx-auto" />
                    )}
                    <p className="text-foreground font-medium">
                      {selectedImage ? selectedImage.name : "Click to upload or drag and drop"}
                    </p>
                    <p className="text-muted-foreground text-sm">PNG, JPG or JPEG (max 10MB)</p>
                  </label>
                </div>
              </div>

              {/* Priority */}
              <FormField
                control={form.control}
                name="priority"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Priority Level</FormLabel>
                    <FormControl>
                      <RadioGroup
                        value={field.value}
                        onValueChange={field.onChange}
                        className="grid grid-cols-3 gap-3"
                        data-testid="radio-priority"
                      >
                        <div>
                          <RadioGroupItem value="low" id="low" className="peer sr-only" />
                          <Label
                            htmlFor="low"
                            className="border-2 border-border rounded-lg p-4 text-center cursor-pointer peer-checked:border-secondary peer-checked:bg-secondary/10 transition-colors flex flex-col items-center"
                          >
                            <div className="w-4 h-4 bg-secondary rounded-full mb-2"></div>
                            <span className="text-sm font-medium">Low</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="medium" id="medium" className="peer sr-only" />
                          <Label
                            htmlFor="medium"
                            className="border-2 border-border rounded-lg p-4 text-center cursor-pointer peer-checked:border-accent peer-checked:bg-accent/10 transition-colors flex flex-col items-center"
                          >
                            <div className="w-4 h-4 bg-accent rounded-full mb-2"></div>
                            <span className="text-sm font-medium">Medium</span>
                          </Label>
                        </div>
                        <div>
                          <RadioGroupItem value="high" id="high" className="peer sr-only" />
                          <Label
                            htmlFor="high"
                            className="border-2 border-border rounded-lg p-4 text-center cursor-pointer peer-checked:border-destructive peer-checked:bg-destructive/10 transition-colors flex flex-col items-center"
                          >
                            <div className="w-4 h-4 bg-destructive rounded-full mb-2"></div>
                            <span className="text-sm font-medium">High</span>
                          </Label>
                        </div>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {/* Submit Buttons */}
              <div className="flex gap-4">
                <Button
                  type="submit"
                  className="flex-1 bg-primary text-primary-foreground hover:bg-primary/90"
                  disabled={createIssueMutation.isPending}
                  data-testid="button-submit"
                >
                  {createIssueMutation.isPending ? "Submitting..." : "Submit Report"}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => form.reset()}
                  data-testid="button-save-draft"
                >
                  Clear Form
                </Button>
              </div>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
