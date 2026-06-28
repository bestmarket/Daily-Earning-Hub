import { useState } from "react";
import { useJoinWaitlist } from "@workspace/api-client-react";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { Loader2, ShieldCheck, Landmark, Bitcoin, CreditCard, Wallet } from "lucide-react";

interface ActionModalProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  toolId?: number;
  toolName?: string;
  isAvailable?: boolean;
  price?: number;
}

const PAYMENT_METHODS = [
  { icon: <CreditCard className="w-4 h-4" />, label: "Lemon Squeezy", sub: "Card / global" },
  { icon: <Wallet className="w-4 h-4" />, label: "Paystack", sub: "Africa / card" },
  { icon: <Landmark className="w-4 h-4" />, label: "Bank Transfer", sub: "All countries" },
  { icon: <Bitcoin className="w-4 h-4" />, label: "Crypto", sub: "USDT / BTC / ETH" },
];

export default function ActionModal({ isOpen, onOpenChange, toolId, toolName, isAvailable, price }: ActionModalProps) {
  const { toast } = useToast();
  const joinWaitlist = useJoinWaitlist();

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;

    joinWaitlist.mutate(
      { data: { email, name, toolId, message } },
      {
        onSuccess: () => {
          setDone(true);
        },
        onError: () => {
          toast({
            variant: "destructive",
            title: "Something went wrong.",
            description: "Please try again later.",
          });
        },
      }
    );
  };

  const handleClose = (open: boolean) => {
    onOpenChange(open);
    if (!open) {
      setTimeout(() => {
        setDone(false);
        setEmail("");
        setName("");
        setMessage("");
      }, 300);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-[440px] p-0 overflow-hidden border-none shadow-2xl rounded-2xl">
        {done ? (
          <div className="p-10 text-center flex flex-col items-center gap-4">
            <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mb-2">
              <ShieldCheck className="w-8 h-8 text-green-600" />
            </div>
            <h3 className="text-2xl font-bold tracking-tight">
              {isAvailable ? "Request received!" : "You're on the list!"}
            </h3>
            <p className="text-muted-foreground font-medium leading-relaxed">
              {isAvailable
                ? "I'll reply within 24 hours with a payment link. You can pay via Paystack, Lemon Squeezy, bank transfer, or crypto — whichever works best for you."
                : "You'll be the first to know when this tool launches. I'll send you early-bird pricing too."}
            </p>
            <Button className="rounded-full mt-2 font-bold px-8" onClick={() => handleClose(false)}>
              Done
            </Button>
          </div>
        ) : (
          <>
            <div className="bg-primary p-6 text-primary-foreground relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10">
                <ShieldCheck className="w-32 h-32 rotate-12" />
              </div>
              <DialogHeader className="relative z-10">
                <DialogTitle className="text-2xl font-bold tracking-tight">
                  {isAvailable ? `Get ${toolName || "Access"}` : `Join waitlist — ${toolName || "Tool"}`}
                </DialogTitle>
                <DialogDescription className="text-primary-foreground/80 mt-2 font-medium">
                  {isAvailable
                    ? "Leave your email and I'll send you a payment link within 24 hours."
                    : "Be the first to know when this launches, with early-bird pricing."}
                </DialogDescription>
              </DialogHeader>
            </div>

            <div className="p-6 bg-card">
              {isAvailable && price !== undefined && (
                <div className="mb-6 p-4 bg-muted/40 rounded-xl border border-border/50">
                  <div className="flex items-center justify-between mb-3">
                    <p className="text-sm font-bold text-foreground">Total</p>
                    <p className="text-2xl font-extrabold tracking-tight">${price} USD</p>
                  </div>
                  <p className="text-xs font-semibold text-muted-foreground mb-2">We accept:</p>
                  <div className="grid grid-cols-2 gap-2">
                    {PAYMENT_METHODS.map((pm) => (
                      <div key={pm.label} className="flex items-center gap-2 bg-background rounded-lg px-3 py-2 border border-border/50">
                        <span className="text-primary">{pm.icon}</span>
                        <div>
                          <p className="text-xs font-bold leading-none">{pm.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-none mt-0.5">{pm.sub}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name" className="font-semibold">Name (optional)</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Jane Doe"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="h-11 rounded-lg bg-background"
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email" className="font-semibold">Email address *</Label>
                  <Input
                    id="email"
                    type="email"
                    required
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="h-11 rounded-lg bg-background"
                  />
                </div>

                {isAvailable && (
                  <div className="space-y-2">
                    <Label htmlFor="message" className="font-semibold">Any notes? (optional)</Label>
                    <Textarea
                      id="message"
                      placeholder="Preferred payment method, questions, custom requirements..."
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      className="rounded-lg bg-background resize-none"
                      rows={2}
                    />
                  </div>
                )}

                <Button
                  type="submit"
                  className="w-full h-11 rounded-xl font-bold text-base mt-2 shadow-sm"
                  disabled={joinWaitlist.isPending}
                >
                  {joinWaitlist.isPending ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : isAvailable ? (
                    "Request Access & Payment Link"
                  ) : (
                    "Join Waitlist"
                  )}
                </Button>

                <p className="text-xs text-center text-muted-foreground font-medium">
                  No spam. I'll only contact you about this tool.
                </p>
              </form>
            </div>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
