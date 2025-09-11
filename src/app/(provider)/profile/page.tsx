"use client";

import { useEffect, useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Save, Plus, X } from "lucide-react";
import Loader from "@/components/shared/Loader";
import ErrorMessage from "@/components/shared/ErrorMessage";

// Define the shape of the profile data
interface Availability {
  startTime: string;
  endTime: string;
}

interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  services: string[];
  availability: Availability[];
}

// Function to fetch the profile
const fetchProfile = async (): Promise<ProfileData> => {
  const res = await fetch("/api/provider/profile");
  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }
  return res.json();
};

// Function to update the profile
const updateProfile = async (
  updatedProfile: ProfileData
): Promise<ProfileData> => {
  const res = await fetch("/api/provider/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(updatedProfile),
  });
  if (!res.ok) {
    throw new Error("Failed to update profile");
  }
  return res.json();
};

export default function ProfilePage() {
  const queryClient = useQueryClient();
  const [profile, setProfile] = useState<ProfileData>({
    name: "",
    email: "",
    phone: "",
    bio: "",
    location: "",
    services: [],
    availability: [],
  });

  const [newService, setNewService] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch profile data using useQuery
  const {
    data: initialProfile,
    isLoading,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  const { data: allServices } = useQuery({
    queryKey: ["allServices"],
    queryFn: async () => {
      const res = await fetch("/api/services");
      if (!res.ok) {
        throw new Error("Failed to fetch services");
      }
      return res.json();
    },
  });

  // Update profile data using useMutation
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
    },
  });

  // Set local profile state and handle default availability
  useEffect(() => {
    if (initialProfile) {
        // If no availability is set, provide a default slot for editing
      if (!initialProfile.availability || initialProfile.availability.length === 0) {
        setProfile({
          ...initialProfile,
          availability: [{ startTime: "09:00", endTime: "17:00" }],
        });
      } else {
        setProfile(initialProfile);
      }
    }
  }, [initialProfile]);

  const handleInputChange = (
    field: string,
    value: string | number,
    index?: number
  ) => {
    if ((field === "startTime" || field === "endTime") && index !== undefined) {
      const newAvailability = [...profile.availability];
      newAvailability[index] = { ...newAvailability[index], [field]: value };
      setProfile((prev) => ({ ...prev, availability: newAvailability }));
    } else {
      setProfile((prev) => ({ ...prev, [field]: value as string }));
    }
  };

  const addService = () => {
    if (newService.trim() && !profile.services.includes(newService.trim())) {
      setProfile((prev) => ({
        ...prev,
        services: [...prev.services, newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (serviceToRemove: string) => {
    setProfile((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== serviceToRemove),
    }));
  };
  
  const addAvailabilitySlot = () => {
    setProfile((prev) => ({
      ...prev,
      availability: [...prev.availability, { startTime: "09:00", endTime: "17:00" }],
    }));
  };

  const removeAvailabilitySlot = (index: number) => {
    setProfile((prev) => ({
      ...prev,
      availability: prev.availability.filter((_, i) => i !== index),
    }));
  };


  const handleSave = () => {
    mutation.mutate(profile);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <Loader />
      </div>
    );
  }

  if (isError) {
    return (
      <div className="flex items-center justify-center h-[calc(100vh-8rem)]">
        <ErrorMessage message={error.message || "Could not load profile."} retry={refetch} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight">Profile</h1>
        <p className="text-muted-foreground">
          Manage your profile information and service offerings.
        </p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Personal Information</CardTitle>
            <Button
              variant={isEditing ? "default" : "outline"}
              onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
              className="flex items-center gap-2"
              disabled={mutation.isPending}
            >
              <Save className="h-4 w-4" />
              {isEditing ? (mutation.isPending ? "Saving..." : "Save Changes") : "Edit Profile"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" value={profile.name} onChange={(e) => handleInputChange("name", e.target.value)} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={profile.email} onChange={(e) => handleInputChange("email", e.target.value)} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input id="phone" value={profile.phone} onChange={(e) => handleInputChange("phone", e.target.value)} disabled={!isEditing} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input id="location" value={profile.location} onChange={(e) => handleInputChange("location", e.target.value)} disabled={!isEditing} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea id="bio" value={profile.bio} onChange={(e) => handleInputChange("bio", e.target.value)} disabled={!isEditing} rows={3} />
            </div>
          </CardContent>
        </Card>

        <Card>
           <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Availability</CardTitle>
            {isEditing && (
              <Button onClick={addAvailabilitySlot} size="sm" variant="outline" className="flex items-center gap-2">
                <Plus className="h-4 w-4" /> Add Slot
              </Button>
            )}
          </CardHeader>
          <CardContent className="space-y-4">
            {profile.availability.length > 0 ? (
              profile.availability.map((slot, index) => (
                <div key={index} className="flex items-end gap-2">
                  <div className="grid flex-1 gap-4 md:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor={`startTime-${index}`}>Start Time</Label>
                      <Input id={`startTime-${index}`} type="time" value={slot.startTime} onChange={(e) => handleInputChange("startTime", e.target.value, index)} disabled={!isEditing} />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor={`endTime-${index}`}>End Time</Label>
                      <Input id={`endTime-${index}`} type="time" value={slot.endTime} onChange={(e) => handleInputChange("endTime", e.target.value, index)} disabled={!isEditing} />
                    </div>
                  </div>
                  {isEditing && (
                    <Button onClick={() => removeAvailabilitySlot(index)} variant="ghost" size="icon" className="text-destructive hover:bg-destructive/10">
                      <X className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">{isEditing ? 'Click "Add Slot" to set your available hours.' : "No availability set."}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Services Offered</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
             <div className="flex flex-wrap gap-2">
                {profile.services?.length > 0 ? (
                    profile.services.map((service) => (
                    <Badge key={service} variant="secondary" className="flex items-center gap-2">
                        {service}
                        {isEditing && (
                        <button onClick={() => removeService(service)} className="ml-1 rounded-full hover:bg-destructive/20 p-0.5">
                            <X className="h-3 w-3" />
                        </button>
                        )}
                    </Badge>
                    ))
                ) : (
                    <p className="text-sm text-muted-foreground">{isEditing ? "Select a service to add from the dropdown below." : "No services offered yet."}</p>
                )}
            </div>

            {isEditing && (
              <div className="flex gap-2">
                <select value={newService} onChange={(e) => setNewService(e.target.value)} className="flex h-9 w-full items-center justify-between whitespace-nowrap rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-ring disabled:cursor-not-allowed disabled:opacity-50">
                  <option value="" disabled>Select a service to add</option>
                  {allServices
                    ?.filter((s: any) => !profile.services.includes(s.serviceName))
                    .map((service: any) => (
                      <option key={service._id} value={service.serviceName}>
                        {service.serviceName}
                      </option>
                    ))}
                </select>
                <Button onClick={addService} size="sm" disabled={!newService}>
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

