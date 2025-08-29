"use client";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "./auth-provider";

export function UserProfile() {
  const { user, userProfile, updateProfile, refreshUser } = useAuth();
  const [fullName, setFullName] = useState(userProfile?.full_name || "");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const handleUpdateProfile = async () => {
    if (!fullName.trim()) return;
    
    setLoading(true);
    setMessage("");

    const { error } = await updateProfile({ full_name: fullName.trim() });

    if (error) {
      setMessage(`Error: ${error}`);
    } else {
      setMessage("Profile updated successfully!");
      await refreshUser();
    }

    setLoading(false);
  };

  if (!user) {
    return null;
  }

  return (
    <Card className="max-w-md mx-auto">
      <CardHeader>
        <CardTitle>User Profile</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            value={user.email || ""}
            disabled
            className="bg-gray-50"
          />
        </div>
        
        <div className="space-y-2">
          <Label htmlFor="fullName">Full Name</Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            placeholder="Enter your full name"
          />
        </div>

        {message && (
          <div className={`p-3 text-sm rounded-md ${
            message.startsWith("Error") 
              ? "text-red-600 bg-red-50" 
              : "text-green-600 bg-green-50"
          }`}>
            {message}
          </div>
        )}

        <Button 
          onClick={handleUpdateProfile} 
          disabled={loading || !fullName.trim()}
          className="w-full"
        >
          {loading ? "Updating..." : "Update Profile"}
        </Button>

        <div className="text-xs text-gray-500">
          User ID: {user.id}
        </div>
      </CardContent>
    </Card>
  );
}


