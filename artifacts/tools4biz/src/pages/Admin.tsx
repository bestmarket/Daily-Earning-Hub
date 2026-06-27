import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { 
  useAdminLogin, 
  useGetAdminSummary, 
  useGetAdminCustomRequests, 
  useGetAdminWaitlist, 
  useListTools,
  useUpdateCustomRequest,
  useDeleteTool,
  useCreateTool,
  getGetAdminSummaryQueryKey,
  getGetAdminCustomRequestsQueryKey,
  getListToolsQueryKey
} from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { LogOut, LayoutDashboard, Wrench, Users, MessageSquare, Link2, Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";

export default function Admin() {
  const [token, setToken] = useState<string | null>(localStorage.getItem('t4b_admin_token'));
  const [password, setPassword] = useState("");
  const loginMutation = useAdminLogin();
  const queryClient = useQueryClient();

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ data: { password } }, {
      onSuccess: (data) => {
        setToken(data.token);
        localStorage.setItem('t4b_admin_token', data.token);
        toast.success("Logged in successfully");
      },
      onError: () => {
        toast.error("Invalid password");
      }
    });
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('t4b_admin_token');
    queryClient.clear();
  };

  if (!token) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/20 px-4">
        <Card className="w-full max-w-md shadow-2xl">
          <CardHeader className="space-y-1 text-center pb-8">
            <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-2xl mx-auto mb-4">
              T
            </div>
            <CardTitle className="text-2xl font-bold">Admin Login</CardTitle>
            <CardDescription>Enter your password to access the dashboard</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <Input 
                  type="password" 
                  placeholder="Password" 
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12"
                />
              </div>
              <Button type="submit" className="w-full h-12 font-bold" disabled={loginMutation.isPending}>
                {loginMutation.isPending ? "Authenticating..." : "Enter Admin"}
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-muted/10 p-4 md:p-8 animate-in fade-in">
      <div className="max-w-7xl mx-auto space-y-8">
        <header className="flex items-center justify-between bg-card p-4 rounded-2xl border border-border/50 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center text-white font-bold text-xl">
              T
            </div>
            <h1 className="text-xl font-bold tracking-tight">Tools4Biz Admin</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-muted-foreground font-semibold">
            <LogOut className="w-4 h-4 mr-2" /> Logout
          </Button>
        </header>

        <AdminDashboard token={token} />
      </div>
    </div>
  );
}

function AdminDashboard({ token }: { token: string }) {
  const requestOptions = { request: { headers: { Authorization: `Bearer ${token}` } } };
  const queryClient = useQueryClient();

  const { data: summary } = useGetAdminSummary({ query: { enabled: !!token } }, requestOptions);
  const { data: customRequests } = useGetAdminCustomRequests({ query: { enabled: !!token } }, requestOptions);
  const { data: waitlist } = useGetAdminWaitlist({ query: { enabled: !!token } }, requestOptions);
  const { data: tools } = useListTools({}, requestOptions);
  
  const updateCustomRequest = useUpdateCustomRequest(requestOptions);
  const deleteTool = useDeleteTool(requestOptions);
  const createTool = useCreateTool(requestOptions);

  const [isAddToolOpen, setIsAddToolOpen] = useState(false);
  const [newTool, setNewTool] = useState({
    name: "",
    description: "",
    category: "Make Money Online",
    price: "",
    status: "available",
  });

  const handleCreateTool = (e: React.FormEvent) => {
    e.preventDefault();
    createTool.mutate({
      data: {
        name: newTool.name,
        description: newTool.description,
        category: newTool.category,
        price: Number(newTool.price),
        status: newTool.status as any,
      }
    }, {
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
        queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
        setIsAddToolOpen(false);
        setNewTool({ name: "", description: "", category: "Make Money Online", price: "", status: "available" });
        toast.success("Tool created successfully");
      }
    });
  };

  const handleDeleteTool = (id: number) => {
    if (confirm("Are you sure you want to delete this tool?")) {
      deleteTool.mutate({ id }, {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListToolsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
          toast.success("Tool deleted");
        }
      });
    }
  };

  const handleUpdateStatus = (id: number, status: string) => {
    updateCustomRequest.mutate(
      { id, data: { status: status as any } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminCustomRequestsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
          toast.success("Status updated");
        }
      }
    );
  };

  const handleUpdatePayment = (id: number, paymentAmount: string, paymentMethod: string) => {
    updateCustomRequest.mutate(
      { id, data: { paymentAmount: paymentAmount ? Number(paymentAmount) : null, paymentMethod } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetAdminCustomRequestsQueryKey() });
          queryClient.invalidateQueries({ queryKey: getGetAdminSummaryQueryKey() });
          toast.success("Payment details updated");
        }
      }
    );
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success("Link copied to clipboard");
  };

  const baseUrl = typeof window !== "undefined" ? window.location.origin : "https://tools4biz.com";

  const staticLinks = [
    { label: "All Tools Catalog", path: "/tools", description: "Browse all available tools" },
    { label: "Custom Request Form", path: "/custom-request", description: "Request a custom software build" },
    { label: "About Page", path: "/about", description: "Our story and manifesto" },
    { label: "Privacy Policy", path: "/privacy-policy", description: "Data & privacy information" },
    { label: "Terms of Service", path: "/terms", description: "Usage terms and conditions" },
    { label: "Refund Policy", path: "/refund", description: "Refund and return policy" },
  ];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <SummaryCard 
          title="Total Revenue" 
          value={`$${summary?.totalRevenue || 0}`} 
          icon={<LayoutDashboard className="w-5 h-5 text-green-500" />} 
        />
        <SummaryCard 
          title="Custom Requests" 
          value={summary?.totalCustomRequests || 0} 
          subtitle={`${summary?.newCustomRequests || 0} new`}
          icon={<MessageSquare className="w-5 h-5 text-blue-500" />} 
        />
        <SummaryCard 
          title="Waitlist Signups" 
          value={summary?.totalWaitlist || 0} 
          icon={<Users className="w-5 h-5 text-orange-500" />} 
        />
        <SummaryCard 
          title="Total Tools" 
          value={summary?.totalTools || 0} 
          icon={<Wrench className="w-5 h-5 text-primary" />} 
        />
      </div>

      <Tabs defaultValue="requests" className="space-y-6">
        <TabsList className="bg-card border border-border/50 h-14 w-full justify-start overflow-x-auto rounded-xl shadow-sm p-1">
          <TabsTrigger value="requests" className="h-10 rounded-lg px-6 font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Custom Requests
          </TabsTrigger>
          <TabsTrigger value="waitlist" className="h-10 rounded-lg px-6 font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Waitlist Signups
          </TabsTrigger>
          <TabsTrigger value="tools" className="h-10 rounded-lg px-6 font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            Tools Catalog
          </TabsTrigger>
          <TabsTrigger value="links" className="h-10 rounded-lg px-6 font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Link2 className="w-4 h-4 mr-2" />Page Links
          </TabsTrigger>
        </TabsList>

        <TabsContent value="requests" className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-muted/20">
            <h2 className="text-xl font-bold tracking-tight">Custom Requests</h2>
            <p className="text-sm text-muted-foreground mt-1">Manage inbound requests for custom software builds.</p>
          </div>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Client Info</TableHead>
                  <TableHead>Type & Budget</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Payment Info</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {customRequests?.map((req) => (
                  <TableRow key={req.id}>
                    <TableCell>
                      <div className="font-semibold">{req.name || 'Anonymous'}</div>
                      <div className="text-sm text-muted-foreground">{req.email}</div>
                      {req.whatsapp && <div className="text-xs text-primary/80 mt-1">WA: {req.whatsapp}</div>}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">{req.businessType || 'N/A'}</Badge>
                      <div className="text-sm font-medium mt-2 text-muted-foreground">{req.budget || 'Not sure'}</div>
                    </TableCell>
                    <TableCell className="max-w-xs">
                      <div className="truncate text-sm" title={req.description}>
                        {req.description}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Select 
                        value={req.status} 
                        onValueChange={(val) => handleUpdateStatus(req.id, val)}
                      >
                        <SelectTrigger className="w-[140px] h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">New</SelectItem>
                          <SelectItem value="contacted">Contacted</SelectItem>
                          <SelectItem value="quoted">Quoted</SelectItem>
                          <SelectItem value="paid">Paid</SelectItem>
                          <SelectItem value="delivered">Delivered</SelectItem>
                          <SelectItem value="cancelled">Cancelled</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <div className="space-y-2">
                        <Input 
                          placeholder="Amount ($)" 
                          className="h-8 w-24 text-sm" 
                          defaultValue={req.paymentAmount?.toString() || ""}
                          onBlur={(e) => handleUpdatePayment(req.id, e.target.value, req.paymentMethod || "")}
                        />
                        <Input 
                          placeholder="Method" 
                          className="h-8 w-24 text-sm" 
                          defaultValue={req.paymentMethod || ""}
                          onBlur={(e) => handleUpdatePayment(req.id, req.paymentAmount?.toString() || "", e.target.value)}
                        />
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {(!customRequests || customRequests.length === 0) && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                      No custom requests found.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </TabsContent>

        <TabsContent value="waitlist" className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-muted/20">
            <h2 className="text-xl font-bold tracking-tight">Waitlist Signups</h2>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead>Name</TableHead>
                <TableHead>Tool Interested In</TableHead>
                <TableHead>Date</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {waitlist?.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.email}</TableCell>
                  <TableCell>{entry.name || '-'}</TableCell>
                  <TableCell>
                    {entry.toolName ? (
                      <Badge variant="secondary" className="font-mono text-xs">{entry.toolName}</Badge>
                    ) : '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-sm">
                    {new Date(entry.createdAt).toLocaleDateString()}
                  </TableCell>
                </TableRow>
              ))}
              {(!waitlist || waitlist.length === 0) && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-8 text-muted-foreground">
                    No waitlist entries found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="tools" className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-muted/20 flex justify-between items-center">
            <div>
              <h2 className="text-xl font-bold tracking-tight">Tools Catalog</h2>
              <p className="text-sm text-muted-foreground mt-1">Manage your software products.</p>
            </div>
            <Dialog open={isAddToolOpen} onOpenChange={setIsAddToolOpen}>
              <DialogTrigger asChild>
                <Button>Add Tool</Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                  <DialogTitle>Add New Tool</DialogTitle>
                </DialogHeader>
                <form onSubmit={handleCreateTool} className="space-y-4 pt-4">
                  <div className="space-y-2">
                    <Input placeholder="Name" value={newTool.name} onChange={e => setNewTool({...newTool, name: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Textarea placeholder="Description" value={newTool.description} onChange={e => setNewTool({...newTool, description: e.target.value})} required />
                  </div>
                  <div className="space-y-2">
                    <Select value={newTool.category} onValueChange={v => setNewTool({...newTool, category: v})}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Make Money Online">Make Money Online</SelectItem>
                        <SelectItem value="Grow on Social Media">Grow on Social Media</SelectItem>
                        <SelectItem value="Start a SaaS">Start a SaaS</SelectItem>
                        <SelectItem value="Lead Generation">Lead Generation</SelectItem>
                        <SelectItem value="Sell Digital Products">Sell Digital Products</SelectItem>
                        <SelectItem value="Business Growth">Business Growth</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Input type="number" placeholder="Price ($)" value={newTool.price} onChange={e => setNewTool({...newTool, price: e.target.value})} required />
                    </div>
                    <div className="space-y-2">
                      <Select value={newTool.status} onValueChange={v => setNewTool({...newTool, status: v})}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          <SelectItem value="available">Available</SelectItem>
                          <SelectItem value="coming_soon">Coming Soon</SelectItem>
                          <SelectItem value="beta">Beta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <Button type="submit" className="w-full" disabled={createTool.isPending}>
                    {createTool.isPending ? "Saving..." : "Create Tool"}
                  </Button>
                </form>
              </DialogContent>
            </Dialog>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tool</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {tools?.map((tool) => (
                <TableRow key={tool.id}>
                  <TableCell>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center">{tool.emoji || '🚀'}</div>
                      <span className="font-bold">{tool.name}</span>
                    </div>
                  </TableCell>
                  <TableCell><Badge variant="outline">{tool.category}</Badge></TableCell>
                  <TableCell className="font-mono">${tool.price}</TableCell>
                  <TableCell>
                    <Badge className={tool.status === 'available' ? 'bg-green-100 text-green-700 hover:bg-green-100 border-green-200' : 'bg-orange-100 text-orange-700 hover:bg-orange-100 border-orange-200'}>
                      {tool.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" className="text-destructive" onClick={() => handleDeleteTool(tool.id)} disabled={deleteTool.isPending}>Delete</Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TabsContent>

        <TabsContent value="links" className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-6 border-b border-border/50 bg-muted/20">
            <h2 className="text-xl font-bold tracking-tight">All Page Links</h2>
            <p className="text-sm text-muted-foreground mt-1">Quick access to every public page URL for sharing and marketing.</p>
          </div>

          <div className="p-6 space-y-6">
            <div>
              <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                <Link2 className="w-4 h-4" /> Static Pages
              </h3>
              <div className="space-y-3">
                {staticLinks.map((link) => {
                  const fullUrl = `${baseUrl}${link.path}`;
                  return (
                    <div key={link.path} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/40 gap-4">
                      <div className="min-w-0">
                        <p className="font-semibold text-sm text-foreground">{link.label}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{link.description}</p>
                        <p className="text-xs font-mono text-primary/70 mt-1 truncate">{fullUrl}</p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="h-8 w-8 p-0"
                          onClick={() => copyToClipboard(fullUrl)}
                          title="Copy link"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </Button>
                        <a href={link.path} target="_blank" rel="noopener noreferrer">
                          <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Open in new tab">
                            <ExternalLink className="w-3.5 h-3.5" />
                          </Button>
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {tools && tools.length > 0 && (
              <div>
                <h3 className="text-sm font-bold uppercase tracking-widest text-muted-foreground mb-3 flex items-center gap-2">
                  <Wrench className="w-4 h-4" /> Tool Detail Pages
                </h3>
                <div className="space-y-3">
                  {tools.map((tool) => {
                    const fullUrl = `${baseUrl}/tools/${tool.id}`;
                    return (
                      <div key={tool.id} className="flex items-center justify-between p-4 bg-muted/30 rounded-xl border border-border/40 gap-4">
                        <div className="min-w-0 flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-background border border-border/50 flex items-center justify-center text-sm shrink-0">
                            {tool.emoji || '🚀'}
                          </div>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm text-foreground">{tool.name}</p>
                            <div className="flex items-center gap-2 mt-0.5">
                              <Badge
                                className={`text-xs h-5 ${tool.status === 'available' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-orange-100 text-orange-700 border-orange-200'}`}
                              >
                                {tool.status.replace("_", " ")}
                              </Badge>
                              <span className="text-xs text-muted-foreground font-mono truncate">{fullUrl}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-2 shrink-0">
                          <Button
                            variant="ghost"
                            size="sm"
                            className="h-8 w-8 p-0"
                            onClick={() => copyToClipboard(fullUrl)}
                            title="Copy link"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </Button>
                          <a href={`/tools/${tool.id}`} target="_blank" rel="noopener noreferrer">
                            <Button variant="ghost" size="sm" className="h-8 w-8 p-0" title="Open in new tab">
                              <ExternalLink className="w-3.5 h-3.5" />
                            </Button>
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function SummaryCard({ title, value, subtitle, icon }: { title: string, value: string | number, subtitle?: string, icon: React.ReactNode }) {
  return (
    <Card className="shadow-sm border-border/50">
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-sm font-semibold text-muted-foreground">{title}</CardTitle>
        <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center">
          {icon}
        </div>
      </CardHeader>
      <CardContent>
        <div className="text-3xl font-extrabold">{value}</div>
        {subtitle && <p className="text-sm text-primary font-medium mt-1">{subtitle}</p>}
      </CardContent>
    </Card>
  );
}
