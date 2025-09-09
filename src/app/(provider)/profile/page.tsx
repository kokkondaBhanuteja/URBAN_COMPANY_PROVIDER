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
interface ProfileData {
  name: string;
  email: string;
  phone: string;
  bio: string;
  location: string;
  services: string[];
}

// Function to fetch the profile
const fetchProfile = async (): Promise<ProfileData> => {
  const token = localStorage.getItem("provider_token");
  const res = await fetch("/api/provider/profile", {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) {
    throw new Error("Failed to fetch profile");
  }
  return res.json();
};

// Function to update the profile
const updateProfile = async (
  updatedProfile: ProfileData
): Promise<ProfileData> => {
    const token = localStorage.getItem("provider_token");
  const res = await fetch("/api/provider/profile", {
    method: "PUT",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
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
  });

  const [newService, setNewService] = useState("");
  const [isEditing, setIsEditing] = useState(false);

  // Fetch profile data using useQuery
  const { data: initialProfile, isLoading, isError, error, refetch } = useQuery({
    queryKey: ["profile"],
    queryFn: fetchProfile,
  });

  // Update profile data using useMutation
  const mutation = useMutation({
    mutationFn: updateProfile,
    onSuccess: () => {
      // Invalidate and refetch the profile query to get fresh data
      queryClient.invalidateQueries({ queryKey: ["profile"] });
      setIsEditing(false);
      // You can add a success toast notification here
    },
    onError: (error) => {
      console.error("Failed to update profile:", error);
      // You can add an error toast notification here
    },
  });

  // Set the local profile state when the initial data is fetched
  useEffect(() => {
    if (initialProfile) {
      setProfile(initialProfile);
    }
  }, [initialProfile]);

  const handleInputChange = (field: string, value: string | number) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const addService = () => {
    if (newService.trim() && !(profile.services || []).includes(newService.trim())) {
      setProfile((prev) => ({
        ...prev,
        services: [...(prev.services || []), newService.trim()],
      }));
      setNewService("");
    }
  };

  const removeService = (service: string) => {
    setProfile((prev) => ({
      ...prev,
      services: prev.services.filter((s) => s !== service),
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
              {isEditing
                ? mutation.isPending
                  ? "Saving..."
                  : "Save Changes"
                : "Edit Profile"}
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={profile.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={profile.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  value={profile.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  disabled={!isEditing}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={profile.location}
                  onChange={(e) =>
                    handleInputChange("location", e.target.value)
                  }
                  disabled={!isEditing}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                value={profile.bio}
                onChange={(e) => handleInputChange("bio", e.target.value)}
                disabled={!isEditing}
                rows={3}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Services Offered</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            {(profile.services || []).map((service) => (
              <Badge
                key={service}
                variant="secondary"
                className="flex items-center gap-2"
              >
                {service}
                {isEditing && (
                  <button
                    onClick={() => removeService(service)}
                    className="ml-1 hover:text-red-500"
                  >
                    <X className="h-3 w-3" />
                  </button>
                )}
              </Badge>
            ))}
          </div>
          {isEditing && (
            <div className="flex gap-2">
              <Input
                placeholder="Add new service"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addService()}
              />
              <Button onClick={addService} size="sm">
                <Plus className="h-4 w-4" />
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}