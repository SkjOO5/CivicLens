import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface GeolocationPosition {
  coords: {
    latitude: number;
    longitude: number;
    accuracy: number;
    altitude?: number | null;
    altitudeAccuracy?: number | null;
    heading?: number | null;
    speed?: number | null;
  };
  timestamp: number;
}

interface GeolocationError {
  code: number;
  message: string;
}

export function useGeolocation() {
  const [isLoading, setIsLoading] = useState(false);
  const [isSupported, setIsSupported] = useState(typeof navigator !== 'undefined' && 'geolocation' in navigator);
  const { toast } = useToast();

  const getCurrentLocation = useCallback((): Promise<GeolocationPosition> => {
    return new Promise((resolve, reject) => {
      if (!isSupported) {
        const error = new Error("Geolocation is not supported by this browser");
        toast({
          title: "Location Not Supported",
          description: "Your browser doesn't support location services. Please enter location manually.",
          variant: "destructive",
        });
        reject(error);
        return;
      }

      setIsLoading(true);

      const options: PositionOptions = {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000, // 5 minutes
      };

      navigator.geolocation.getCurrentPosition(
        (position) => {
          setIsLoading(false);
          resolve(position);
        },
        (error: GeolocationPositionError) => {
          setIsLoading(false);
          
          let errorMessage = "Unable to retrieve your location.";
          
          switch (error.code) {
            case error.PERMISSION_DENIED:
              errorMessage = "Location access denied. Please enable location permissions and try again.";
              break;
            case error.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable. Please check your connection.";
              break;
            case error.TIMEOUT:
              errorMessage = "Location request timed out. Please try again.";
              break;
          }

          toast({
            title: "Location Error",
            description: errorMessage,
            variant: "destructive",
          });

          reject(new Error(errorMessage));
        },
        options
      );
    });
  }, [isSupported, toast]);

  const watchPosition = useCallback((
    onSuccess: (position: GeolocationPosition) => void,
    onError?: (error: GeolocationError) => void
  ): number | null => {
    if (!isSupported) {
      toast({
        title: "Location Not Supported",
        description: "Your browser doesn't support location services.",
        variant: "destructive",
      });
      return null;
    }

    const options: PositionOptions = {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 300000,
    };

    return navigator.geolocation.watchPosition(
      onSuccess,
      (error: GeolocationPositionError) => {
        let errorMessage = "Unable to watch your location.";
        
        switch (error.code) {
          case error.PERMISSION_DENIED:
            errorMessage = "Location access denied.";
            break;
          case error.POSITION_UNAVAILABLE:
            errorMessage = "Location information is unavailable.";
            break;
          case error.TIMEOUT:
            errorMessage = "Location request timed out.";
            break;
        }

        if (onError) {
          onError({ code: error.code, message: errorMessage });
        } else {
          toast({
            title: "Location Watch Error",
            description: errorMessage,
            variant: "destructive",
          });
        }
      },
      options
    );
  }, [isSupported, toast]);

  const clearWatch = useCallback((watchId: number) => {
    if (isSupported && watchId) {
      navigator.geolocation.clearWatch(watchId);
    }
  }, [isSupported]);

  return {
    isLoading,
    isSupported,
    getCurrentLocation,
    watchPosition,
    clearWatch,
  };
}
