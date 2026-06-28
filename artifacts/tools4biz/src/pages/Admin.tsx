import { useState, useEffect } from "react";
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
import { LogOut, LayoutDashboard, Wrench, Users, MessageSquare, Link2, Copy, ExternalLink, Target, Send, Plus, Trash2, Mail, RefreshCw, CheckCircle2, Clock, AlertCircle, Key, Eye, EyeOff, ShieldCheck, Zap, CreditCard, Brain } from "lucide-react";
import { toast } from "sonner";
import API_BASE from "@/lib/api";

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
          <TabsTrigger value="outreach" className="h-10 rounded-lg px-6 font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Target className="w-4 h-4 mr-2" />Outreach
          </TabsTrigger>
          <TabsTrigger value="api-keys" className="h-10 rounded-lg px-6 font-semibold data-[state=active]:bg-primary/10 data-[state=active]:text-primary">
            <Key className="w-4 h-4 mr-2" />API Keys
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

        <TabsContent value="outreach">
          <OutreachTab />
        </TabsContent>

        <TabsContent value="api-keys">
          <ApiKeysTab token={token} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function OutreachTab() {
  const [leads, setLeads] = useState<Lead[]>(() => {
    try { return JSON.parse(localStorage.getItem('t4b_leads') || '[]'); } catch { return []; }
  });
  const [emailTemplate, setEmailTemplate] = useState(() =>
    localStorage.getItem('t4b_email_template') ||
`Hi {{name}},

I came across your business and thought you'd be interested in a tool I built specifically for people like you.

{{tool}} — {{tagline}}

It's a one-time purchase (no monthly fees) and it helps you {{benefit}}.

Would you like a quick demo or more info?

Best,
[Your Name]
Tools4Biz — tools4biz.com`
  );
  const [newLead, setNewLead] = useState({ name: '', email: '', company: '', role: '', tool: '', note: '' });
  const [isAddOpen, setIsAddOpen] = useState(false);
  const [composing, setComposing] = useState<Lead | null>(null);
  const [composedEmail, setComposedEmail] = useState('');

  const saveLeads = (updated: Lead[]) => {
    setLeads(updated);
    localStorage.setItem('t4b_leads', JSON.stringify(updated));
  };

  const addLead = () => {
    if (!newLead.email) { toast.error('Email is required'); return; }
    const lead: Lead = { ...newLead, id: Date.now(), status: 'new', addedAt: new Date().toISOString() };
    saveLeads([lead, ...leads]);
    setNewLead({ name: '', email: '', company: '', role: '', tool: '', note: '' });
    setIsAddOpen(false);
    toast.success('Lead added');
  };

  const removeLead = (id: number) => {
    if (confirm('Remove this lead?')) saveLeads(leads.filter(l => l.id !== id));
  };

  const updateLeadStatus = (id: number, status: Lead['status']) => {
    saveLeads(leads.map(l => l.id === id ? { ...l, status } : l));
  };

  const composeEmail = (lead: Lead) => {
    const body = emailTemplate
      .replace(/\{\{name\}\}/g, lead.name || 'there')
      .replace(/\{\{tool\}\}/g, lead.tool || '[Tool Name]')
      .replace(/\{\{tagline\}\}/g, '[tagline]')
      .replace(/\{\{benefit\}\}/g, '[describe benefit]')
      .replace(/\{\{company\}\}/g, lead.company || '[Company]');
    setComposedEmail(body);
    setComposing(lead);
  };

  const openMailto = (lead: Lead) => {
    const subject = encodeURIComponent(`A tool built for ${lead.company || 'your business'}`);
    const body = encodeURIComponent(composedEmail);
    window.open(`mailto:${lead.email}?subject=${subject}&body=${body}`, '_blank');
    updateLeadStatus(lead.id, 'contacted');
    setComposing(null);
    toast.success('Email client opened — status updated to Contacted');
  };

  const statusCounts = {
    new: leads.filter(l => l.status === 'new').length,
    contacted: leads.filter(l => l.status === 'contacted').length,
    replied: leads.filter(l => l.status === 'replied').length,
    converted: leads.filter(l => l.status === 'converted').length,
  };

  return (
    <div className="space-y-6">
      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { label: 'New Leads', count: statusCounts.new, color: 'text-blue-500', bg: 'bg-blue-50', icon: <Target className="w-4 h-4" /> },
          { label: 'Contacted', count: statusCounts.contacted, color: 'text-yellow-600', bg: 'bg-yellow-50', icon: <Mail className="w-4 h-4" /> },
          { label: 'Replied', count: statusCounts.replied, color: 'text-purple-600', bg: 'bg-purple-50', icon: <RefreshCw className="w-4 h-4" /> },
          { label: 'Converted', count: statusCounts.converted, color: 'text-green-600', bg: 'bg-green-50', icon: <CheckCircle2 className="w-4 h-4" /> },
        ].map(s => (
          <div key={s.label} className={`flex items-center gap-3 p-4 rounded-xl border border-border/40 ${s.bg}`}>
            <div className={`${s.color}`}>{s.icon}</div>
            <div>
              <div className={`text-2xl font-extrabold ${s.color}`}>{s.count}</div>
              <div className="text-xs font-semibold text-muted-foreground">{s.label}</div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Leads list */}
        <div className="lg:col-span-2 bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
          <div className="p-5 border-b border-border/50 bg-muted/20 flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold tracking-tight flex items-center gap-2"><Target className="w-5 h-5 text-primary" /> Lead List</h2>
              <p className="text-xs text-muted-foreground mt-0.5">{leads.length} leads tracked</p>
            </div>
            <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
              <DialogTrigger asChild>
                <Button size="sm" className="font-semibold gap-1.5"><Plus className="w-4 h-4" />Add Lead</Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader><DialogTitle>Add New Lead</DialogTitle></DialogHeader>
                <div className="space-y-3 mt-2">
                  {[
                    { key: 'name', placeholder: 'Contact name', label: 'Name' },
                    { key: 'email', placeholder: 'email@company.com', label: 'Email *' },
                    { key: 'company', placeholder: 'Company name', label: 'Company' },
                    { key: 'role', placeholder: 'CEO, Founder, Manager…', label: 'Role' },
                    { key: 'tool', placeholder: 'Which tool are you pitching?', label: 'Tool to pitch' },
                  ].map(f => (
                    <div key={f.key}>
                      <label className="text-xs font-semibold text-muted-foreground mb-1 block">{f.label}</label>
                      <Input
                        placeholder={f.placeholder}
                        value={(newLead as any)[f.key]}
                        onChange={e => setNewLead(p => ({ ...p, [f.key]: e.target.value }))}
                        className="h-10"
                      />
                    </div>
                  ))}
                  <div>
                    <label className="text-xs font-semibold text-muted-foreground mb-1 block">Note</label>
                    <Textarea
                      placeholder="Any context about this lead…"
                      value={newLead.note}
                      onChange={e => setNewLead(p => ({ ...p, note: e.target.value }))}
                      rows={2}
                    />
                  </div>
                  <Button onClick={addLead} className="w-full font-semibold">Add Lead</Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>

          {leads.length === 0 ? (
            <div className="py-16 text-center text-muted-foreground">
              <Target className="w-10 h-10 mx-auto mb-3 opacity-20" />
              <p className="font-medium">No leads yet. Add your first prospect.</p>
            </div>
          ) : (
            <div className="divide-y divide-border/40">
              {leads.map(lead => (
                <div key={lead.id} className="p-4 flex items-start gap-4 hover:bg-muted/20 transition-colors">
                  <div className="w-9 h-9 rounded-full bg-primary/10 text-primary font-bold text-sm flex items-center justify-center shrink-0">
                    {(lead.name || lead.email).slice(0, 2).toUpperCase()}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{lead.name || '—'}</span>
                      <span className="text-xs text-muted-foreground">{lead.email}</span>
                      {lead.company && <Badge variant="outline" className="text-xs h-5">{lead.company}</Badge>}
                    </div>
                    {lead.tool && <p className="text-xs text-primary/80 font-medium mt-0.5">Pitch: {lead.tool}</p>}
                    {lead.note && <p className="text-xs text-muted-foreground mt-0.5 truncate">{lead.note}</p>}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Select value={lead.status} onValueChange={v => updateLeadStatus(lead.id, v as Lead['status'])}>
                      <SelectTrigger className={`w-[110px] h-7 text-xs font-semibold ${
                        lead.status === 'converted' ? 'text-green-700 border-green-200 bg-green-50' :
                        lead.status === 'replied' ? 'text-purple-700 border-purple-200 bg-purple-50' :
                        lead.status === 'contacted' ? 'text-yellow-700 border-yellow-200 bg-yellow-50' :
                        'text-blue-700 border-blue-200 bg-blue-50'
                      }`}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="new">🔵 New</SelectItem>
                        <SelectItem value="contacted">📧 Contacted</SelectItem>
                        <SelectItem value="replied">💬 Replied</SelectItem>
                        <SelectItem value="converted">✅ Converted</SelectItem>
                      </SelectContent>
                    </Select>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs font-semibold gap-1" onClick={() => composeEmail(lead)}>
                      <Send className="w-3 h-3" /> Email
                    </Button>
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0 text-destructive/70 hover:text-destructive" onClick={() => removeLead(lead.id)}>
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Email template / composer */}
        <div className="space-y-4">
          {composing ? (
            <div className="bg-card border border-primary/30 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-primary/5">
                <h3 className="font-bold text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email to {composing.name || composing.email}</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Edit before sending</p>
              </div>
              <div className="p-4 space-y-3">
                <Textarea
                  value={composedEmail}
                  onChange={e => setComposedEmail(e.target.value)}
                  rows={12}
                  className="text-xs font-mono resize-none"
                />
                <div className="flex gap-2">
                  <Button className="flex-1 font-semibold gap-2" onClick={() => openMailto(composing)}>
                    <Send className="w-4 h-4" /> Open in Email App
                  </Button>
                  <Button variant="outline" onClick={() => setComposing(null)}>Cancel</Button>
                </div>
                <p className="text-xs text-muted-foreground text-center">Opens your email client with this message pre-filled</p>
              </div>
            </div>
          ) : (
            <div className="bg-card border border-border/50 rounded-2xl shadow-sm overflow-hidden">
              <div className="p-4 border-b border-border/50 bg-muted/20">
                <h3 className="font-bold text-sm flex items-center gap-2"><Mail className="w-4 h-4 text-primary" /> Email Template</h3>
                <p className="text-xs text-muted-foreground mt-0.5">Auto-saved. Uses {'{{name}}'}, {'{{tool}}'}, {'{{company}}'} tokens.</p>
              </div>
              <div className="p-4 space-y-3">
                <Textarea
                  value={emailTemplate}
                  onChange={e => {
                    setEmailTemplate(e.target.value);
                    localStorage.setItem('t4b_email_template', e.target.value);
                  }}
                  rows={14}
                  className="text-xs font-mono resize-none"
                  placeholder="Write your cold email template here…"
                />
                <p className="text-xs text-muted-foreground">Click <strong>Email</strong> next to any lead to compose and send.</p>
              </div>
            </div>
          )}

          <div className="bg-card border border-border/50 rounded-2xl p-4 shadow-sm space-y-2">
            <h4 className="text-xs font-bold uppercase tracking-widest text-muted-foreground">Lead Hunting Tips</h4>
            {[
              { icon: <Target className="w-3.5 h-3.5 text-blue-500" />, tip: 'Search LinkedIn for "Founder" + your niche to find warm prospects' },
              { icon: <AlertCircle className="w-3.5 h-3.5 text-yellow-500" />, tip: 'Add a personal note about their business to boost reply rates' },
              { icon: <Clock className="w-3.5 h-3.5 text-purple-500" />, tip: 'Send emails Tue–Thu, 8–10am for highest open rates' },
              { icon: <CheckCircle2 className="w-3.5 h-3.5 text-green-500" />, tip: 'Follow up once after 3 days if no reply — most deals close on follow-up' },
            ].map((item, i) => (
              <div key={i} className="flex items-start gap-2">
                <div className="mt-0.5 shrink-0">{item.icon}</div>
                <p className="text-xs text-muted-foreground leading-relaxed">{item.tip}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

interface Lead {
  id: number;
  name: string;
  email: string;
  company: string;
  role: string;
  tool: string;
  note: string;
  status: 'new' | 'contacted' | 'replied' | 'converted';
  addedAt: string;
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

// ─── API Keys Tab ─────────────────────────────────────────────────────────────

type KeyStatus = { masked: string; set: boolean };
type KeyStatuses = Record<string, KeyStatus>;

const KEY_GROUPS = [
  {
    label: "AI / Gemini",
    icon: <Brain className="w-5 h-5 text-purple-500" />,
    color: "from-purple-50 to-indigo-50 border-purple-200",
    badge: "bg-purple-100 text-purple-700",
    desc: "Powers SEO checker, business name generator, website grader, and AI recommendations.",
    keys: [
      { key: "GEMINI_API_KEY", label: "Gemini API Key", hint: "Get from console.cloud.google.com → APIs & Services → Credentials" },
    ],
  },
  {
    label: "Stripe Payments",
    icon: <CreditCard className="w-5 h-5 text-blue-500" />,
    color: "from-blue-50 to-cyan-50 border-blue-200",
    badge: "bg-blue-100 text-blue-700",
    desc: "Accept card payments. Get keys from dashboard.stripe.com → Developers → API Keys.",
    keys: [
      { key: "STRIPE_SECRET_KEY", label: "Secret Key", hint: "Starts with sk_live_ or sk_test_" },
      { key: "STRIPE_PUBLISHABLE_KEY", label: "Publishable Key", hint: "Starts with pk_live_ or pk_test_" },
    ],
  },
  {
    label: "PayPal",
    icon: <Zap className="w-5 h-5 text-amber-500" />,
    color: "from-amber-50 to-yellow-50 border-amber-200",
    badge: "bg-amber-100 text-amber-700",
    desc: "Accept PayPal payments. Get keys from developer.paypal.com → My Apps & Credentials.",
    keys: [
      { key: "PAYPAL_CLIENT_ID", label: "Client ID", hint: "From PayPal Developer Dashboard" },
      { key: "PAYPAL_SECRET", label: "Client Secret", hint: "From PayPal Developer Dashboard" },
    ],
  },
];

function ApiKeysTab({ token }: { token: string }) {
  const [statuses, setStatuses] = useState<KeyStatuses>({});
  const [values, setValues] = useState<Record<string, string>>({});
  const [visible, setVisible] = useState<Record<string, boolean>>({});
  const [saving, setSaving] = useState(false);
  const [loading, setLoading] = useState(true);
  const [dirtyKeys, setDirtyKeys] = useState<Set<string>>(new Set());

  const authHeader = { Authorization: `Bearer ${token}` };

  useEffect(() => {
    fetch(`${API_BASE}/api/admin/api-keys`, { headers: authHeader })
      .then(r => r.json())
      .then((data: KeyStatuses) => { setStatuses(data); setLoading(false); })
      .catch(() => { toast.error("Failed to load API key statuses"); setLoading(false); });
  }, []);

  const handleChange = (key: string, val: string) => {
    setValues(v => ({ ...v, [key]: val }));
    setDirtyKeys(d => new Set(d).add(key));
  };

  const handleSave = async () => {
    const toSave: Record<string, string> = {};
    for (const k of dirtyKeys) {
      if (values[k]?.trim()) toSave[k] = values[k].trim();
    }
    if (Object.keys(toSave).length === 0) { toast.error("No new keys to save"); return; }
    setSaving(true);
    try {
      const res = await fetch(`${API_BASE}/api/admin/api-keys`, {
        method: "POST",
        headers: { "Content-Type": "application/json", ...authHeader },
        body: JSON.stringify(toSave),
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      toast.success(`Saved: ${data.saved.join(", ")}`);
      setValues({});
      setDirtyKeys(new Set());
      const fresh = await fetch(`${API_BASE}/api/admin/api-keys`, { headers: authHeader }).then(r => r.json());
      setStatuses(fresh);
    } catch {
      toast.error("Failed to save API keys");
    } finally {
      setSaving(false);
    }
  };

  const handleClear = async (key: string) => {
    if (!confirm(`Remove the stored ${key}?`)) return;
    try {
      await fetch(`${API_BASE}/api/admin/api-keys/${key}`, { method: "DELETE", headers: authHeader });
      toast.success(`${key} removed`);
      setStatuses(s => ({ ...s, [key]: { masked: "", set: false } }));
    } catch {
      toast.error("Failed to remove key");
    }
  };

  const hasDirty = dirtyKeys.size > 0 && [...dirtyKeys].some(k => values[k]?.trim());

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h2 className="text-xl font-bold tracking-tight flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-primary" /> API Keys
          </h2>
          <p className="text-sm text-muted-foreground mt-1">
            Stored securely in your database. Keys are never shown in full after saving.
          </p>
        </div>
        <Button onClick={handleSave} disabled={saving || !hasDirty} className="font-semibold gap-2">
          {saving ? <RefreshCw className="w-4 h-4 animate-spin" /> : <ShieldCheck className="w-4 h-4" />}
          {saving ? "Saving…" : "Save Keys"}
        </Button>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <div className="space-y-5">
          {KEY_GROUPS.map(group => (
            <div key={group.label} className={`rounded-2xl border bg-gradient-to-br ${group.color} p-5 space-y-4`}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-white/70 border border-white flex items-center justify-center shadow-sm">
                  {group.icon}
                </div>
                <div>
                  <h3 className="font-bold text-sm">{group.label}</h3>
                  <p className="text-xs text-muted-foreground">{group.desc}</p>
                </div>
              </div>

              <div className="space-y-3">
                {group.keys.map(({ key, label, hint }) => {
                  const status = statuses[key];
                  const isSet = status?.set;
                  const inputVal = values[key] ?? "";
                  const show = visible[key];

                  return (
                    <div key={key} className="bg-white/80 rounded-xl border border-white p-4 space-y-2 shadow-sm">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-foreground flex items-center gap-2">
                          <Key className="w-3.5 h-3.5 text-muted-foreground" />
                          {label}
                        </label>
                        {isSet ? (
                          <Badge className="bg-green-100 text-green-700 border-green-200 text-xs gap-1 font-semibold">
                            <CheckCircle2 className="w-3 h-3" /> Active
                          </Badge>
                        ) : (
                          <Badge variant="outline" className="text-xs text-muted-foreground gap-1">
                            <AlertCircle className="w-3 h-3" /> Not set
                          </Badge>
                        )}
                      </div>

                      {isSet && (
                        <div className="flex items-center gap-2 px-3 py-2 bg-muted/30 rounded-lg border border-border/40">
                          <span className="font-mono text-xs text-muted-foreground flex-1">{status.masked}</span>
                          <Button
                            variant="ghost" size="sm" className="h-6 px-2 text-xs text-destructive/70 hover:text-destructive"
                            onClick={() => handleClear(key)}
                          >
                            <Trash2 className="w-3 h-3 mr-1" /> Remove
                          </Button>
                        </div>
                      )}

                      <div className="relative">
                        <Input
                          type={show ? "text" : "password"}
                          placeholder={isSet ? "Enter new key to replace…" : "Paste your key here…"}
                          value={inputVal}
                          onChange={e => handleChange(key, e.target.value)}
                          className="pr-10 font-mono text-sm h-10"
                        />
                        <button
                          type="button"
                          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                          onClick={() => setVisible(v => ({ ...v, [key]: !v[key] }))}
                        >
                          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-xs text-muted-foreground">{hint}</p>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
