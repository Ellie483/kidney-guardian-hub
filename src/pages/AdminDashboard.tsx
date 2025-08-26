import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Plus, Edit, Trash2, Database, BookOpen, Shield, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  registeredAt: string;
  isAdmin?: boolean;
}

interface MythFact {
  _id: string;
  type: 'myth' | 'fact';
  title: string;
  description: string;
  category: string;
}

const AdminDashboard = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [myths, setMyths] = useState<MythFact[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    newUsersThisMonth: 0,
    totalAnalyses: 0
  });
  const [loading, setLoading] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [newMythFact, setNewMythFact] = useState({
    type: 'myth' as 'myth' | 'fact',
    title: '',
    description: '',
    category: 'general'
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchUsers();
    fetchStats();
    fetchMythsFacts();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch('/users', {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setUsers(data);
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to fetch users",
        variant: "destructive"
      });
    }
  };

  const fetchStats = async () => {
    setStats({
      totalUsers: users.length,
      activeUsers: users.filter(u => new Date(u.registeredAt) > new Date(Date.now() - 30*24*60*60*1000)).length,
      newUsersThisMonth: users.filter(u => new Date(u.registeredAt) > new Date(Date.now() - 30*24*60*60*1000)).length,
      totalAnalyses: 0 // This would come from actual analytics
    });
  };

  const fetchMythsFacts = async () => {
    // Simulate fetching myths and facts
    setMyths([
      {
        _id: '1',
        type: 'myth',
        title: 'Drinking lots of water can cure kidney disease',
        description: 'While staying hydrated is important, excessive water intake cannot cure kidney disease and may actually be harmful in advanced stages.',
        category: 'treatment'
      },
      {
        _id: '2',
        type: 'fact',
        title: 'Early detection can slow kidney disease progression',
        description: 'Regular screening and early intervention can significantly slow the progression of kidney disease.',
        category: 'prevention'
      }
    ]);
  };

  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Are you sure you want to delete this user?')) return;
    
    try {
      setLoading(true);
      // API call would go here
      setUsers(users.filter(u => u._id !== userId));
      toast({
        title: "Success",
        description: "User deleted successfully"
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete user",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMythFact = async () => {
    if (!newMythFact.title || !newMythFact.description) {
      toast({
        title: "Error",
        description: "Please fill in all fields",
        variant: "destructive"
      });
      return;
    }

    try {
      setLoading(true);
      const newEntry = {
        ...newMythFact,
        _id: Date.now().toString()
      };
      setMyths([...myths, newEntry]);
      setNewMythFact({
        type: 'myth',
        title: '',
        description: '',
        category: 'general'
      });
      toast({
        title: "Success",
        description: `${newMythFact.type} added successfully`
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to add entry",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, content, and system data</p>
          </div>
          <Shield className="h-8 w-8 text-primary" />
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.activeUsers}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Plus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.newUsersThisMonth}</div>
            </CardContent>
          </Card>

          <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Analyses</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalAnalyses}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content Tabs */}
        <Tabs defaultValue="users" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3 bg-card/50 backdrop-blur-sm">
            <TabsTrigger value="users" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              User Management
            </TabsTrigger>
            <TabsTrigger value="content" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Content Management
            </TabsTrigger>
            <TabsTrigger value="data" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
              Data Management
            </TabsTrigger>
          </TabsList>

          {/* Users Tab */}
          <TabsContent value="users">
            <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
              <CardHeader>
                <CardTitle>User Management</CardTitle>
                <CardDescription>Manage registered users and their permissions</CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Age</TableHead>
                      <TableHead>Gender</TableHead>
                      <TableHead>Registered</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user._id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>{user.age || 'N/A'}</TableCell>
                        <TableCell>{user.gender || 'N/A'}</TableCell>
                        <TableCell>{new Date(user.registeredAt).toLocaleDateString()}</TableCell>
                        <TableCell>
                          <Badge variant={user.isAdmin ? "default" : "secondary"}>
                            {user.isAdmin ? 'Admin' : 'User'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Button size="sm" variant="outline" onClick={() => setEditingUser(user)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              size="sm" 
                              variant="destructive" 
                              onClick={() => handleDeleteUser(user._id)}
                              disabled={loading}
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab */}
          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
                <CardHeader>
                  <CardTitle>Add Myth/Fact</CardTitle>
                  <CardDescription>Add educational content for users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      value={newMythFact.type}
                      onChange={(e) => setNewMythFact({...newMythFact, type: e.target.value as 'myth' | 'fact'})}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="myth">Myth</option>
                      <option value="fact">Fact</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      value={newMythFact.title}
                      onChange={(e) => setNewMythFact({...newMythFact, title: e.target.value})}
                      placeholder="Enter title..."
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      value={newMythFact.description}
                      onChange={(e) => setNewMythFact({...newMythFact, description: e.target.value})}
                      placeholder="Enter description..."
                      rows={4}
                    />
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      value={newMythFact.category}
                      onChange={(e) => setNewMythFact({...newMythFact, category: e.target.value})}
                      className="w-full p-2 border border-border rounded-md bg-background"
                    >
                      <option value="general">General</option>
                      <option value="prevention">Prevention</option>
                      <option value="treatment">Treatment</option>
                      <option value="diet">Diet</option>
                    </select>
                  </div>
                  
                  <Button onClick={handleAddMythFact} disabled={loading} className="w-full">
                    <Plus className="h-4 w-4 mr-2" />
                    Add {newMythFact.type}
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
                <CardHeader>
                  <CardTitle>Existing Content</CardTitle>
                  <CardDescription>Manage myths and facts</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4 max-h-96 overflow-y-auto">
                    {myths.map((item) => (
                      <div key={item._id} className="p-4 border border-border rounded-lg bg-background/50">
                        <div className="flex items-start justify-between">
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Badge variant={item.type === 'myth' ? "destructive" : "default"}>
                                {item.type}
                              </Badge>
                              <Badge variant="outline">{item.category}</Badge>
                            </div>
                            <h4 className="font-semibold">{item.title}</h4>
                            <p className="text-sm text-muted-foreground">{item.description}</p>
                          </div>
                          <div className="flex space-x-1">
                            <Button size="sm" variant="outline">
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button size="sm" variant="destructive">
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
            <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
              <CardHeader>
                <CardTitle>Data Management</CardTitle>
                <CardDescription>Manage datasets and system data</CardDescription>
              </CardHeader>
              <CardContent>
                <Alert className="mb-6">
                  <Database className="h-4 w-4" />
                  <AlertDescription>
                    Dataset management features will be implemented based on your specific data requirements.
                    This could include patient data imports, lab result templates, and reference ranges.
                  </AlertDescription>
                </Alert>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Button variant="outline" className="h-20 flex flex-col">
                    <Database className="h-6 w-6 mb-2" />
                    Import Dataset
                  </Button>
                  <Button variant="outline" className="h-20 flex flex-col">
                    <BookOpen className="h-6 w-6 mb-2" />
                    Manage Templates
                  </Button>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;