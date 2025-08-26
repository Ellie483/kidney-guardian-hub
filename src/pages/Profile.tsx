import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { User, Edit, Save, X, Calendar, Mail, Phone, MapPin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface UserProfile {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  heightFeet?: number;
  heightInches?: number;
  weight?: number;
  bloodType?: string;
  medicalConditions?: string[];
  familyHistory?: string;
  medications?: string;
  smokeAlcohol?: string;
  registeredAt: string;
}

const Profile = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [editing, setEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState<UserProfile | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchUserProfile();
  }, []);

  const fetchUserProfile = async () => {
    try {
      const response = await fetch('/users/me', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const userData = await response.json();
        setUser(userData);
        setFormData(userData);
      } else {
        toast({
          title: "Error",
          description: "Failed to fetch user profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch user profile",
        variant: "destructive"
      });
    }
  };

  const handleSave = async () => {
    if (!formData) return;

    try {
      setLoading(true);
      const response = await fetch(`/users/${user?._id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        const updatedUser = await response.json();
        setUser(updatedUser);
        setEditing(false);
        toast({
          title: "Success",
          description: "Profile updated successfully"
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to update profile",
          variant: "destructive"
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to update profile",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData(user);
    setEditing(false);
  };

  const updateFormData = (field: keyof UserProfile, value: any) => {
    if (!formData) return;
    setFormData({ ...formData, [field]: value });
  };

  const calculateBMI = () => {
    if (!user?.heightFeet || !user?.heightInches || !user?.weight) return null;
    const totalInches = (user.heightFeet * 12) + user.heightInches;
    const heightInMeters = totalInches * 0.0254;
    const weightInKg = user.weight * 0.453592;
    const bmi = weightInKg / (heightInMeters * heightInMeters);
    return bmi.toFixed(1);
  };

  if (!user) {
    return (
      <div className="min-h-screen bg-gradient-subtle flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading profile...</p>
        </div>
      </div>
    );
  }

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
                  <Save className="h-4 w-4 mr-2" />
                  Save Changes
                </Button>
                <Button variant="outline" onClick={handleCancel}>
                  <X className="h-4 w-4 mr-2" />
                  Cancel
                </Button>
              </>
            ) : (
              <Button onClick={() => setEditing(true)}>
                <Edit className="h-4 w-4 mr-2" />
                Edit Profile
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
              <CardTitle className="text-xl">{user.name}</CardTitle>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center text-sm text-muted-foreground">
                <Calendar className="h-4 w-4 mr-2" />
                Joined {new Date(user.registeredAt).toLocaleDateString()}
              </div>
              
              {user.age && (
                <div className="flex items-center text-sm text-muted-foreground">
                  <User className="h-4 w-4 mr-2" />
                  {user.age} years old
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
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Full Name</Label>
                  {editing ? (
                    <Input
                      id="name"
                      value={formData?.name || ''}
                      onChange={(e) => updateFormData('name', e.target.value)}
                    />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{user.name}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  {editing ? (
                    <Input
                      id="email"
                      type="email"
                      value={formData?.email || ''}
                      onChange={(e) => updateFormData('email', e.target.value)}
                    />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{user.email}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="age">Age</Label>
                  {editing ? (
                    <Input
                      id="age"
                      type="number"
                      value={formData?.age || ''}
                      onChange={(e) => updateFormData('age', parseInt(e.target.value))}
                    />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{user.age || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="gender">Gender</Label>
                  {editing ? (
                    <Select value={formData?.gender || ''} onValueChange={(value) => updateFormData('gender', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Male">Male</SelectItem>
                        <SelectItem value="Female">Female</SelectItem>
                        <SelectItem value="Other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{user.gender || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Height</Label>
                  {editing ? (
                    <div className="flex space-x-2">
                      <Input
                        placeholder="Feet"
                        type="number"
                        value={formData?.heightFeet || ''}
                        onChange={(e) => updateFormData('heightFeet', parseInt(e.target.value))}
                      />
                      <Input
                        placeholder="Inches"
                        type="number"
                        value={formData?.heightInches || ''}
                        onChange={(e) => updateFormData('heightInches', parseInt(e.target.value))}
                      />
                    </div>
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">
                      {user.heightFeet && user.heightInches ? `${user.heightFeet}'${user.heightInches}"` : 'Not specified'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="weight">Weight (lbs)</Label>
                  {editing ? (
                    <Input
                      id="weight"
                      type="number"
                      value={formData?.weight || ''}
                      onChange={(e) => updateFormData('weight', parseInt(e.target.value))}
                    />
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{user.weight ? `${user.weight} lbs` : 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bloodType">Blood Type</Label>
                  {editing ? (
                    <Select value={formData?.bloodType || ''} onValueChange={(value) => updateFormData('bloodType', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select blood type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="A+">A+</SelectItem>
                        <SelectItem value="A-">A-</SelectItem>
                        <SelectItem value="B+">B+</SelectItem>
                        <SelectItem value="B-">B-</SelectItem>
                        <SelectItem value="AB+">AB+</SelectItem>
                        <SelectItem value="AB-">AB-</SelectItem>
                        <SelectItem value="O+">O+</SelectItem>
                        <SelectItem value="O-">O-</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{user.bloodType || 'Not specified'}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="smokeAlcohol">Smoke/Alcohol</Label>
                  {editing ? (
                    <Select value={formData?.smokeAlcohol || ''} onValueChange={(value) => updateFormData('smokeAlcohol', value)}>
                      <SelectTrigger>
                        <SelectValue placeholder="Select option" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Yes">Yes</SelectItem>
                        <SelectItem value="No">No</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <p className="p-2 bg-muted/50 rounded-md">{user.smokeAlcohol || 'Not specified'}</p>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="familyHistory">Family History</Label>
                  {editing ? (
                    <Textarea
                      id="familyHistory"
                      rows={3}
                      value={formData?.familyHistory || ''}
                      onChange={(e) => updateFormData('familyHistory', e.target.value)}
                      placeholder="Describe any relevant family medical history..."
                    />
                  ) : (
                    <p className="p-3 bg-muted/50 rounded-md min-h-[80px]">
                      {user.familyHistory || 'No family history recorded'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="medications">Current Medications</Label>
                  {editing ? (
                    <Textarea
                      id="medications"
                      rows={3}
                      value={formData?.medications || ''}
                      onChange={(e) => updateFormData('medications', e.target.value)}
                      placeholder="List any current medications..."
                    />
                  ) : (
                    <p className="p-3 bg-muted/50 rounded-md min-h-[80px]">
                      {user.medications || 'No medications recorded'}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Medical Conditions</Label>
                  <div className="flex flex-wrap gap-2">
                    {user.medicalConditions && user.medicalConditions.length > 0 ? (
                      user.medicalConditions.map((condition, index) => (
                        <Badge key={index} variant="secondary">
                          {condition}
                        </Badge>
                      ))
                    ) : (
                      <p className="text-muted-foreground text-sm">No medical conditions recorded</p>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Profile;