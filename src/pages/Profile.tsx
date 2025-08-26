import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Edit, Save, X, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import type { AppUser } from "../App";

// interface UserProfile {
//   _id: string;
//   name: string;
//   email: string;
//   password?: string;
//   age?: number;
//   gender?: string;
//   heightFeet?: number;
//   heightInches?: number;
//   weight?: number;
//   bloodType?: string;
//   medicalConditions?: string[];
//   familyHistory?: string;
//   physicalActivity?: string;
//   smoke?: string;
//   registeredAt: string;
// }

interface ProfileProps {
  user: AppUser;
  onUpdateUser: (updatedUser: AppUser) => void;
}

const Profile: React.FC<ProfileProps> = ({ user, onUpdateUser }) => {
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<AppUser>(user);
  const { toast } = useToast();

  const handleSave = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/users/${user._id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();

        // 🔑 Update App.tsx global state + localStorage
        onUpdateUser(updatedUser);
        localStorage.setItem("kidneyguard_user", JSON.stringify(updatedUser));

        setEditing(false);
        toast({ title: "Success", description: "Profile updated successfully" });
      } else {
        toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
      }
    } catch (error) {
      toast({ title: "Error", description: "Failed to update profile", variant: "destructive" });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setEditing(false);
  };

  const updateFormData = (field: keyof AppUser, value: string | number | string[]) => {
    setFormData({ ...formData, [field]: value });
  };


  const calculateBMI = () => {
    if (!formData.heightFeet || !formData.heightInches || !formData.weight) return null;
    const totalInches = (formData.heightFeet * 12) + formData.heightInches;
    const heightInMeters = totalInches * 0.0254;
    const weightInKg = formData.weight * 0.453592;
    return (weightInKg / (heightInMeters * heightInMeters)).toFixed(1);
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">My Profile</h1>
            <p className="text-muted-foreground">Manage your personal information and health data</p>
          </div>
          <div className="flex space-x-2">
            {editing ? (
              <>
                <Button onClick={handleSave} disabled={loading}>
                  <Save className="h-4 w-4 mr-2" /> Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" /> Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" /> Edit Profile
              </Button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Profile Overview */}
          <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="text-center">
              <Avatar className="h-24 w-24 mx-auto mb-4">
                <AvatarFallback className="text-2xl bg-primary/10 text-primary">
                  {user.name.charAt(0).toUpperCase()}
                </AvatarFallback>
              </Avatar>
              <CardTitle className="text-xl">{formData.name}</CardTitle>
              <CardDescription>{formData.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Joined {new Date(user.registeredAt).toLocaleDateString()}
              </div>
              {formData.age && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  {formData.age} years old
                </div>
              )}
              {calculateBMI() && (
                <div className="p-3 bg-primary/5 rounded-lg">
                  <p className="text-sm font-medium">BMI</p>
                  <p className="text-2xl font-bold text-primary">{calculateBMI()}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Personal Information */}
          <Card className="lg:col-span-2 bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader>
              <CardTitle>Personal Information</CardTitle>
              <CardDescription>Your basic personal details</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Full Name + Email */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editing ? (
                    <Input id="name" value={formData.name} onChange={(e) => updateFormData('name', e.target.value)} />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{formData.name}</p>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {editing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData.email || ''}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{formData.email}</p>
                  )}
                </div>
              </div>

              {/* Age + Gender */}
              <div className="flex flex-col lg:flex-row gap-4">
                <div className="flex-1 space-y-2">
                  <Label htmlFor="age">Age</Label>
                  {editing ? (
                    <Input
                      id="age"
                      type="number"
                      value={formData.age || ''}
                      onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                    />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{formData.age || 'Not specified'}</p>
                  )}
                </div>

                <div className="flex-1 space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  {editing ? (
                    <Select value={formData.gender || ''} onValueChange={(value) => updateFormData('gender', value)}>
                      <SelectTrigger><SelectValue placeholder="Select gender" /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{formData.gender || 'Not specified'}</p>
                  )}
                </div>
              </div>
                
              {/* Height & Weight */}
              <div className="space-y-2">
                <Label>Height</Label>
                {editing ? (
                  <div className="flex gap-2">
                    <Input placeholder="Feet" type="number" value={formData.heightFeet || ''} onChange={(e) => updateFormData('heightFeet', parseInt(e.target.value))} />
                    <Input placeholder="Inches" type="number" value={formData.heightInches || ''} onChange={(e) => updateFormData('heightInches', parseInt(e.target.value))} />
                  </div>
                ) : (
                  <p className="p-2 bg-muted/50 rounded-md">
                    {formData.heightFeet && formData.heightInches ? `${formData.heightFeet}'${formData.heightInches}"` : 'Not specified'}
                  </p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="weight">Weight (lbs)</Label>
                {editing ? (
                  <Input id="weight" type="number" value={formData.weight || ''} onChange={(e) => updateFormData('weight', parseInt(e.target.value))} />
                ) : (
                  <p className="p-2 bg-muted/50 rounded-md">{formData.weight ? `${formData.weight} lbs` : 'Not specified'}</p>
                )}
              </div>

              {/* Smoke */}
              <div className="space-y-2">
                <Label>Smoke</Label>
                {editing ? (
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-1">
                        <input type="radio" name="smoke" value={opt} checked={formData.smoke === opt} onChange={(e) => updateFormData('smoke', e.target.value)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="p-2 bg-muted/50 rounded-md">{formData.smoke || 'Not specified'}</p>
                )}
              </div>

              {/* Family History */}
              <div className="space-y-2">
                <Label>Family History</Label>
                {editing ? (
                  <div className="flex gap-4">
                    {['Yes', 'No'].map((opt) => (
                      <label key={opt} className="flex items-center gap-1">
                        <input type="radio" name="familyHistory" value={opt} checked={formData.familyHistory === opt} onChange={(e) => updateFormData('familyHistory', e.target.value)} />
                        {opt}
                      </label>
                    ))}
                  </div>
                ) : (
                  <p className="p-2 bg-muted/50 rounded-md">{formData.familyHistory || 'Not specified'}</p>
                )}
              </div>

              {/* Physical Activity */}
              <div className="space-y-2">
                <Label>Physical Activity</Label>
                {editing ? (
                  <Select
                    value={formData.physicalActivity || ""}
                    onValueChange={(value: string) => updateFormData("physicalActivity", value)}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select activity level" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Low">Low</SelectItem>
                      <SelectItem value="Moderate">Moderate</SelectItem>
                      <SelectItem value="High">High</SelectItem>
                    </SelectContent>
                  </Select>

                ) : (
                  <p className="p-2 bg-muted/50 rounded-md">{formData.physicalActivity || 'Not specified'}</p>
                )}
              </div>

              {/* Medical Conditions */}
              <div className="space-y-2">
                <Label>Medical Conditions</Label>
                {editing ? (
                  <div className="flex gap-2">
                    {['Hypertension', 'Diabetes'].map((cond) => (
                      <label key={cond} className="flex items-center gap-1">
                        <input
                          type="checkbox"
                          checked={formData.medicalConditions?.includes(cond) || false}
                          onChange={(e) => {
                            let updated = formData.medicalConditions || [];
                            if (e.target.checked) updated.push(cond);
                            else updated = updated.filter(c => c !== cond);
                            updateFormData('medicalConditions', updated);
                          }}
                        />
                        {cond}
                      </label>
                    ))}
                  </div>
                ) : (
                  <div className="flex gap-2">
                    {formData.medicalConditions?.length
                      ? formData.medicalConditions.map((cond, idx) => (
                        <Badge key={idx} variant="secondary">{cond}</Badge>
                      ))
                      : <p className="text-muted-foreground text-sm">No medical conditions</p>
                    }
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;
