import { useState } from "react";
import { useJoinWaitlist } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Globe, CreditCard } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  toolId?: number;
  toolName?: string;
  isAvailable?: boolean;
  price?: number;
}

export default function ActionModal({ isOpen, onOpenChange, toolId, toolName, isAvailable, price }: ActionModalProps) {
  const { toast } = useToast();
  const joinWaitlist = useJoinWaitlist();
  
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    joinWaitlist.mutate(
      { data: { email, name, toolId, message } },
      {
        onSuccess: () => {
          toast({
            title: isAvailable ? "Request Received!" : "You're on the list!",
            description: isAvailable 
              ? "I'll be in touch shortly with access details and payment links." 
              : "We'll notify you the moment this drops.",
          });
          onOpenChange(false);
          setEmail("");
          setName("");
          setMessage("");
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Something went wrong.",
            description: "Please try again later.",
          });
        }
      }
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        <div className="bg-primary p-6 text-primary-foreground relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-10">
            <ShieldCheck className="w-32 h-32 rotate-12" />
          </div>
          <DialogHeader className="relative z-10">
            <DialogTitle className="text-2xl font-bold tracking-tight">
              {isAvailable ? `Get ${toolName || 'Access'}` : `Waitlist for ${toolName || 'Tool'}`}
            </DialogTitle>
            <DialogDescription className="text-primary-foreground/80 mt-2 font-medium">
              {isAvailable 
                ? "Drop your email below and I'll send you an invoice to finalize your purchase." 
                : "Be the first to know when this powerful tool launches."}
            </DialogDescription>
          </DialogHeader>
        </div>
        
        <div className="p-6 bg-card">
          <form onSubmit={handleSubmit} className="space-y-4">
            {isAvailable && price !== undefined && (
              <div className="flex items-center justify-between p-4 bg-muted/50 rounded-xl border border-border/50 mb-6">
                <div>
                  <p className="text-sm font-semibold text-foreground">Total due today</p>
                  <div className="flex items-center gap-2 mt-1 text-xs text-muted-foreground font-medium">
                    <Globe className="w-3 h-3" /> Global payments
                    <span className="mx-1">•</span>
                    <CreditCard className="w-3 h-3" /> Paystack OK
                  </div>
                </div>
                <div className="text-2xl font-bold tracking-tight">${price}</div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email" className="font-semibold">Email address</Label>
              <Input
                id="email"
                type="email"
                required
                placeholder="founder@startup.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-11 rounded-lg bg-background"
                data-testid="input-modal-email"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="name" className="font-semibold">Name (Optional)</Label>
              <Input
                id="name"
                type="text"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-11 rounded-lg bg-background"
                data-testid="input-modal-name"
              />
            </div>
            
            {isAvailable && (
              <div className="space-y-2">
                <Label htmlFor="message" className="font-semibold">Any notes? (Optional)</Label>
                <Textarea
                  id="message"
                  placeholder="Need a specific integration?"
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  className="rounded-lg bg-background resize-none"
                  rows={2}
                  data-testid="input-modal-message"
                />
              </div>
            )}

            <Button 
              type="submit" 
              className="w-full h-11 rounded-xl font-bold text-md mt-2 shadow-sm" 
              disabled={joinWaitlist.isPending}
              data-testid="button-modal-submit"
            >
              {joinWaitlist.isPending ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : isAvailable ? (
                "Request Invoice"
              ) : (
                "Join Waitlist"
              )}
            </Button>
            
            <p className="text-xs text-center text-muted-foreground font-medium mt-4">
              I respect your inbox. No spam, ever.
            </p>
          </form>
        </div>
      </DialogContent>
    </Dialog>
  );
}
