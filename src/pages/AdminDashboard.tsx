import React, { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Users, Trash2, Database, BookOpen, Shield, Activity } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash, ChevronLeft, ChevronRight } from "lucide-react";
import { LogOut } from "lucide-react";


// at top of the file
const API_BASE = import.meta.env.VITE_API_BASE || 'http://localhost:5000';

// type RoleFilter = 'any' | 'admin' | 'user';
const DATE_FIELD: 'registeredAt' | 'createdAt' = 'registeredAt'; // change to 'createdAt' if needed

interface User {
  _id: string;
  name: string;
  email: string;
  age?: number;
  gender?: string;
  registeredAt?: string; // optional if you actually use createdAt
  createdAt?: string;    // optional
  lastLogin?: string;
  isAdmin?: boolean;
}

interface MythFact {
  _id: string;
  type: 'myth' | 'fact';
  title: string;
  description: string;
  category: string;
}
async function readJson(res: Response) {
  const ct = res.headers.get('content-type') || '';
  const text = await res.text(); // always read as text first
  if (!res.ok) {
    throw new Error(`${res.status} ${res.statusText} — ${text.slice(0, 200)}`);
  }
  if (!ct.includes('application/json')) {
    throw new Error(`Expected JSON but got ${ct || 'no content-type'} — ${text.slice(0, 200)}`);
  }
  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`Bad JSON: ${text.slice(0, 200)}`);
  }
}

const AdminDashboard: React.FC = () => {
  // ===== Filters & paging =====
  const [search, setSearch] = useState('');
  // const [role, setRole] = useState<RoleFilter>('any');
  const [from, setFrom] = useState<string>(''); // yyyy-mm-dd
  const [to, setTo] = useState<string>('');     // yyyy-mm-dd
  const [page, setPage] = useState(1);
  const [limit] = useState(10);
  const [total, setTotal] = useState(0);

  // ===== Data =====
  const [users, setUsers] = useState<User[]>([]);
  const [myths, setMyths] = useState<MythFact[]>([]);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalPatients: 0,
  });

  // ===== UI =====
  // within your AdminDashboard component, add state + handlers near others
// state
const [importing, setImporting] = useState(false);
const [dryRun, setDryRun] = useState(true);

// merge strategy
type MergeMode = "insert" | "upsert";
const [mergeMode, setMergeMode] = useState<MergeMode>("insert");
const [upsertBy, setUpsertBy] = useState(""); // empty unless upsert chosen
const [importSummary, setImportSummary] = useState<any | null>(null);
const fileInputRef = React.useRef<HTMLInputElement>(null);

//==================Import Dataset Function============================
// state (add)
const jsonInputRef = React.useRef<HTMLInputElement>(null);


const pickJson = () => jsonInputRef.current?.click();

const handleJsonChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const file = e.target.files?.[0];
  if (!file) return;
  try {
    setImporting(true);
    const text = await file.text();
    let payload;
    try {
      payload = JSON.parse(text);
    } catch {
      throw new Error("Selected file is not valid JSON.");
    }
    const res = await fetch(`${API_BASE}/admin/data/patients/import-json`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload) // must be an array
    });
    const data = await readJson(res);
    setImportSummary(data);

    // refresh stats
    try {
      const s = await fetchUserStats();
      setStats({ totalUsers: s.totalUsers ?? 0, totalPatients: s.totalPatients ?? 0 });
    } catch {}
    toast({ title: "Import complete", description: `Inserted ${data.insertedCount || 0} records` });
  } catch (err: any) {
    toast({ title: "Import failed", description: err?.message || "Upload error", variant: "destructive" });
  } finally {
    setImporting(false);
    if (jsonInputRef.current) jsonInputRef.current.value = "";
  }
};

//=============================================
  const [loading, setLoading] = useState(false);
  const [loadingStats, setLoadingStats] = useState(false);
  const { toast } = useToast();

  // ===== Helpers =====
  const fmtDate = (iso?: string) => {
    if (!iso) return '—';
    const d = new Date(iso);
    return isNaN(d.getTime()) ? '—' : d.toLocaleDateString();
  };

  const userDate = (u: User) => fmtDate(u[DATE_FIELD]);

  const buildQuery = (p: Record<string, string | number | undefined>) => {
    const q = new URLSearchParams();
    Object.entries(p).forEach(([k, v]) => {
      if (v === undefined || v === '') return;
      q.set(k, String(v));
    });
    return q.toString();
  };

  const fetchUsers = async (params: {
    search?: string; role?: 'any' | 'admin' | 'user'; from?: string; to?: string; page?: number; limit?: number;
  }) => {
    const q = new URLSearchParams();
    Object.entries(params).forEach(([k, v]) => { if (v !== undefined && v !== '') q.set(k, String(v)); });
    const res = await fetch(`${API_BASE}/admin/users?${q.toString()}`, { credentials: 'include' });
    return await readJson(res);
  };

  const fetchUserStats = async () => {
    const res = await fetch(`${API_BASE}/admin/users/stats`, { credentials: 'include' });
    return await readJson(res);
  };

  const deleteUser = async (id: string) => {
    const res = await fetch(`${API_BASE}/admin/users/${id}`, { method: 'DELETE', credentials: 'include' });
    return await readJson(res);
  };


  // ===== Effects =====
  // Users list: refetch when filters/paging change
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoading(true);
        const data = await fetchUsers({ search, from, to, page, limit });
        if (abort) return;
        setUsers(data.results);
        setTotal(data.total);
      } catch (e: any) {
        if (!abort) {
          toast({ title: 'Error', description: e?.message || 'Failed to fetch users', variant: 'destructive' });
        }
      } finally {
        if (!abort) setLoading(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, [search, from, to, page, limit, toast]);

  // Stats: load once at mount and then whenever filters *aren’t* required (stats are global)
  useEffect(() => {
    let abort = false;
    (async () => {
      try {
        setLoadingStats(true);
        const s = await fetchUserStats();
        if (abort) return;
        setStats({
          totalUsers: s.totalUsers ?? 0,
          totalPatients: s.totalPatients ?? 0,
        });
      } catch {
        /* soft fail */
      } finally {
        if (!abort) setLoadingStats(false);
      }
    })();
    return () => {
      abort = true;
    };
  }, []);

  // Demo content (unchanged)
  useEffect(() => {
    setMyths([
      {
        _id: '1',
        type: 'myth',
        title: 'Drinking lots of water can cure kidney disease',
        description:
          'While staying hydrated is important, excessive water intake cannot cure kidney disease and may actually be harmful in advanced stages.',
        category: 'treatment',
      },
      {
        _id: '2',
        type: 'fact',
        title: 'Early detection can slow kidney disease progression',
        description:
          'Regular screening and early intervention can significantly slow the progression of kidney disease.',
        category: 'prevention',
      },
    ]);
  }, []);

  // ===== Handlers =====
  const handleDeleteUser = async (userId: string) => {
    if (!confirm('Delete this user?')) return;
    try {
      setLoading(true);
      await deleteUser(userId);
      // Refresh current page with current filters
      const data = await fetchUsers({ search, from, to, page, limit });
      setUsers(data.results);
      setTotal(data.total);
      // Also refresh stats
      try {
        const s = await fetchUserStats();
        setStats({
          totalUsers: s.totalUsers,
          totalPatients: s.totalPatients ?? 0,
        });
      } catch { }
      toast({ title: 'Deleted', description: 'User deleted successfully' });
    } catch (e: any) {
      toast({ title: 'Error', description: e?.message || 'Failed to delete user', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleAddMythFact = async () => {
    // unchanged demo handler
    // validate
    const empty = myths.find((m) => !m.title || !m.description);
    if (empty) return;
  };

  // ===== Derived =====
  const showingRange = useMemo(() => {
    if (!total) return 'Showing 0 of 0';
    const start = (page - 1) * limit + 1;
    const end = Math.min(page * limit, total);
    return `Showing ${start}-${end} of ${total}`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, total]);

const API = import.meta.env.VITE_API_BASE || "http://localhost:5000";

  const [type, setType] = useState("myth");
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("general");
  const [contents, setContents] = useState([]);
  const [mythloading, setmythLoading] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  // --- Train model ---
  type TrainResp = {
    message: string;
    samples: number;
    features: string[];     // array coming from API
    tree_saved: boolean;
  };

  const [training, setTraining] = useState(false);
  const [trainResult, setTrainResult] = useState<TrainResp | null>(null);


  const API_URL = "http://localhost:5000/mythfact";

  // Fetch existing content
  const fetchContents = async () => {
    try {
      setmythLoading(true);
      const res = await fetch(API_URL);
      const data = await res.json();
      setContents(data);
      setmythLoading(false);
    } catch (err) {
      console.error(err);
      setmythLoading(false);
    }
  };

  useEffect(() => {
    fetchContents();
  }, []);

  // Add new content
  const handleAdd = async () => {
    if (!title || !description) return alert("Please fill all fields");
    try {
      const res = await fetch(API_URL, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, title, description, category })
      });
      const data = await res.json();
      setContents([data, ...contents]);
      setTitle("");
      setDescription("");
      setType("myth");
      setCategory("general");
    } catch (err) {
      console.error(err);
    }
  };

  const handleTrainModel = async () => {
    try {
      setTraining(true);
      setTrainResult(null);
  
      const res = await fetch(`${API_BASE}/api/lab/trainmodel`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
      });
      const data: TrainResp = await readJson(res);
  
      setTrainResult(data);
      toast({
        title: data.tree_saved ? "Model saved" : "Training finished",
        description: data.message || "Training completed.",
      });
    } catch (e: any) {
      toast({
        title: "Training failed",
        description: e?.message || "Please try again.",
        variant: "destructive",
      });
    } finally {
      setTraining(false);
    }
  };

  // Delete content
  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await fetch(`${API_URL}/${id}`, { method: "DELETE" });
      setContents(contents.filter(c => c._id !== id));
    } catch (err) {
      console.error(err);
    }
  };

   const handleLogout = () => {
    // setUser(null);
    localStorage.removeItem("kidneyguard_user");
    localStorage.removeItem("userId");
    fetch(`${API}/users/logout`, { method: "POST", credentials: "include" }).catch(() => {});
    window.location.href = "/login";
  };




  const indexOfLast = currentPage * itemsPerPage;
  const indexOfFirst = indexOfLast - itemsPerPage;
  const currentItems = contents.slice(indexOfFirst, indexOfLast);
  const totalPages = Math.ceil(contents.length / itemsPerPage);
  return (
    <div className="min-h-screen bg-gradient-subtle p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage users, content, and system data</p>
          </div>
          {/* <Shield className="h-8 w-8 text-primary" /> */}
          <button
  onClick={handleLogout}
  className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-md transition-colors duration-200"
>
  <LogOut className="w-5 h-5" />
  Logout
</button>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {loadingStats ? '—' : stats.totalUsers}
              </div>
            </CardContent>
          </Card>

          {/* <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Users</CardTitle>
              <Activity className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {loadingStats ? '—' : stats.activeUsers}
              </div>
            </CardContent>
          </Card> */}

          {/* <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New This Month</CardTitle>
              <Plus className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">
                {loadingStats ? '—' : stats.newUsersThisMonth}
              </div>
            </CardContent>
          </Card> */}

          <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Patient Records</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-primary">{stats.totalPatients}</div>
            </CardContent>
          </Card>
          
          <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Train New Model</CardTitle>
              <Database className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent className="space-y-3">
              <Button onClick={handleTrainModel} disabled={training} className="w-full">
                {training ? "Training…" : "Start Training"}
              </Button>

              {trainResult && (
                <div className="rounded-md border p-3 text-sm">
                  <div className="font-medium mb-1">{trainResult.message}</div>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-muted-foreground">
                    <div><span className="text-foreground font-medium">Samples:</span> {trainResult.samples}</div>
                    <div>
                      <span className="text-foreground font-medium">Features:</span> {trainResult.features?.length ?? 0}
                    </div>
                    <div>
                      <span className="text-foreground font-medium">Model Saved:</span>{" "}
                      {trainResult.tree_saved ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              )}
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
                {/* Search & Filters */}
                <div className="flex flex-wrap items-end gap-3 mb-4">
                  <div className="flex-1 min-w-[220px]">
                    <Label>Search</Label>
                    <Input
                      value={search}
                      onChange={(e) => { setPage(1); setSearch(e.target.value); }}
                      placeholder="Search name or email..."
                    />
                  </div>

                  {/* <div>
                    <Label>Role</Label>
                    <select
                      className="h-9 px-3 rounded-md border"
                      value={role}
                      onChange={(e) => { setPage(1); setRole(e.target.value as RoleFilter); }}
                    >
                      <option value="any">Any</option>
                      <option value="admin">Admin</option>
                      <option value="user">User</option>
                    </select>
                  </div> */}

                  <div>
                    <Label>From</Label>
                    <Input
                      type="date"
                      value={from}
                      onChange={(e) => { setPage(1); setFrom(e.target.value); }}
                    />
                  </div>
                  <div>
                    <Label>To</Label>
                    <Input
                      type="date"
                      value={to}
                      onChange={(e) => { setPage(1); setTo(e.target.value); }}
                    />
                  </div>

                  {/* <Button
                    variant="outline"
                    onClick={() => { setSearch(''); setRole('any'); setFrom(''); setTo(''); setPage(1); }}
                  >
                    Reset
                  </Button> */}
                </div>

                {/* Table */}
                <div className="rounded-md border">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Name</TableHead>
                        <TableHead>Email</TableHead>
                        <TableHead>Age</TableHead>
                        <TableHead>Gender</TableHead>
                        <TableHead>Registered</TableHead>
                        {/* <TableHead>Role</TableHead> */}
                        <TableHead className="text-right">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {loading ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            Loading…
                          </TableCell>
                        </TableRow>
                      ) : users.length === 0 ? (
                        <TableRow>
                          <TableCell colSpan={7} className="text-center text-muted-foreground">
                            No users found for current filters.
                          </TableCell>
                        </TableRow>
                      ) : (
                        users.map((user) => (
                          <TableRow key={user._id}>
                            <TableCell className="font-medium">{user.name}</TableCell>
                            <TableCell>{user.email}</TableCell>
                            <TableCell>{user.age ?? 'N/A'}</TableCell>
                            <TableCell>{user.gender ?? 'N/A'}</TableCell>
                            <TableCell>{userDate(user)}</TableCell>
                            {/* <TableCell>
                                <Badge variant={user.isAdmin ? 'default' : 'secondary'}>
                                  {user.isAdmin ? 'Admin' : 'User'}
                                </Badge>
                              </TableCell> */}
                            <TableCell className="text-right">
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => handleDeleteUser(user._id)}
                                disabled={loading}
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))
                      )}
                    </TableBody>
                  </Table>
                </div>

                {/* Pagination */}
                <div className="flex items-center justify-between mt-4">
                  <div className="text-sm text-muted-foreground">{showingRange}</div>
                  <div className="flex gap-2">
                    <Button variant="outline" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
                      Prev
                    </Button>
                    <Button variant="outline" disabled={page * limit >= total} onClick={() => setPage((p) => p + 1)}>
                      Next
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Content Tab (kept same; demo only) */}
          <TabsContent value="content">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

              {/* Add Myth/Fact Form */}
              <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
                <CardHeader>
                  <CardTitle>Add Myth/Fact</CardTitle>
                  <CardDescription>Add educational content for users</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="type">Type</Label>
                    <select
                      className="w-full p-2 border border-border rounded-md bg-background"
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="myth">Myth</option>
                      <option value="fact">Fact</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="title">Title</Label>
                    <Input
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Enter title..."
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description</Label>
                    <Textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Enter description..."
                      rows={4}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="category">Category</Label>
                    <select
                      className="w-full p-2 border border-border rounded-md bg-background"
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                    >
                      <option value="general">General</option>
                      <option value="prevention">Prevention</option>
                      <option value="treatment">Treatment</option>
                      <option value="diet">Diet</option>
                    </select>
                  </div>

                  <Button className="w-full" onClick={handleAdd}>
                    <Plus className="h-4 w-4 mr-2" />
                    Add
                  </Button>
                </CardContent>
              </Card>

              {/* Existing Content with Pagination */}
              <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
                <CardHeader>
                  <CardTitle>Existing Content</CardTitle>
                  <CardDescription>Manage myths and facts</CardDescription>
                </CardHeader>
                <CardContent>
                  {mythloading && <p>Loading...</p>}
                  {!mythloading && contents.length === 0 && (
                    <Alert className="mb-0">
                      <AlertDescription>No content found.</AlertDescription>
                    </Alert>
                  )}

                  {!loading && currentItems.map((item) => (
                    <div key={item._id} className="border p-3 mb-2 rounded-md flex justify-between items-start">
                      <div>
                        <p className="font-bold">{item.title} ({item.type})</p>
                        <p className="text-sm">{item.description}</p>
                        <p className="text-xs text-muted-foreground">{item.category}</p>
                      </div>
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => handleDelete(item._id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}

                  {/* Pagination Controls */}
                  {contents.length > itemsPerPage && (
                    <div className="flex justify-center items-center space-x-2 mt-4">
                      <Button
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.max(p - 1, 1))}
                        disabled={currentPage === 1}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <span>Page {currentPage} of {totalPages}</span>
                      <Button
                        size="sm"
                        onClick={() => setCurrentPage(p => Math.min(p + 1, totalPages))}
                        disabled={currentPage === totalPages}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Data Tab */}
          <TabsContent value="data">
  <Card className="bg-card/80 backdrop-blur-sm border-warm shadow-medical">
    <CardHeader>
      <CardTitle>Data Management</CardTitle>
      <CardDescription>Import patient records into <code>Kidney.Patients</code></CardDescription>
    </CardHeader>
    <CardContent className="space-y-6">
    <Button variant="outline" onClick={pickJson} disabled={importing}>
  {importing ? "Uploading…" : "Import JSON"}
</Button>
<input
  ref={jsonInputRef}
  type="file"
  accept="application/json,.json"
  className="hidden"
  onChange={handleJsonChange}
/>

<Alert>
  <AlertDescription className="space-y-2 text-sm">
    <div><strong>Tip:</strong> MongoDB will auto-create a unique <code>_id</code> for every new patient.</div>
    <div><strong>JSON must be an array of patient objects.</strong></div>
    <div><strong>Required keys (20):</strong></div>
    <div className="grid grid-cols-2 md:grid-cols-3 gap-x-6 gap-y-1 text-xs font-mono">
      <div>age_of_the_patient</div>
      <div>smoking_status</div>
      <div>diabetes_mellitus_yesno</div>
      <div>hypertension_yesno</div>
      <div>physical_activity_level</div>
      <div>family_history_of_chronic_kidney_disease</div>
      <div>body_mass_index_bmi</div>
      <div>duration_of_diabetes_mellitus_years</div>
      <div>duration_of_hypertension_years</div>
      <div>coronary_artery_disease_yesno</div>
      <div>serum_creatinine_mgdl</div>
      <div>estimated_glomerular_filtration_rate_egfr</div>
      <div>blood_urea_mgdl</div>
      <div>sodium_level_meql</div>
      <div>potassium_level_meql</div>
      <div>random_blood_glucose_level_mgdl</div>
      <div>albumin_in_urine</div>
      <div>appetite_goodpoor</div>
      <div>anemia_yesno</div>
      <div>target</div>
    </div>
  </AlertDescription>
</Alert>


{importSummary && (
  <div className="rounded-md border p-3 text-sm mt-3">
    <div>Mode: {importSummary.mode}</div>
    <div>Received: {importSummary.received}</div>
    <div>Inserted: {importSummary.insertedCount}</div>
  </div>
)}

    </CardContent>
  </Card>
</TabsContent>

        </Tabs>
      </div>
    </div>
  );
};

export default AdminDashboard;
