import { useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSubmitCustomRequest } from "@workspace/api-client-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { CheckCircle2, Rocket } from "lucide-react";

const formSchema = z.object({
  name: z.string().optional(),
  email: z.string().email({ message: "Invalid email address." }),
  whatsapp: z.string().optional(),
  businessType: z.string().optional(),
  description: z.string().min(10, { message: "Please describe what you want us to build in more detail." }),
  budget: z.string().optional(),
});

export default function CustomRequest() {
  const [submitted, setSubmitted] = useState(false);
  const submitRequest = useSubmitCustomRequest();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      whatsapp: "",
      businessType: "",
      description: "",
      budget: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    submitRequest.mutate({
      data: {
        name: values.name || null,
        email: values.email,
        whatsapp: values.whatsapp || null,
        businessType: values.businessType || null,
        description: values.description,
        budget: values.budget || null,
      }
    }, {
      onSuccess: () => setSubmitted(true),
    });
  }

  return (
    <div className="flex-1 w-full bg-background animate-in fade-in duration-500 py-16 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="text-center space-y-4 mb-12">
          <div className="w-16 h-16 bg-primary/10 text-primary rounded-2xl mx-auto flex items-center justify-center mb-6">
             <Rocket className="w-8 h-8" />
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight">Custom Request</h1>
          <p className="text-xl text-muted-foreground font-medium max-w-2xl mx-auto">
            We build ANY business tool for you. Describe what you need, get a quote in 24 hours.
          </p>
        </div>

        <div className="bg-card border border-border/50 shadow-xl shadow-primary/5 rounded-3xl p-8 md:p-12 relative overflow-hidden">
          {submitted ? (
            <div className="text-center py-16 animate-in zoom-in-95 duration-500">
              <CheckCircle2 className="w-20 h-20 text-green-500 mx-auto mb-6" />
              <h3 className="text-3xl font-bold tracking-tight mb-4">Request Received!</h3>
              <p className="text-lg text-muted-foreground font-medium max-w-md mx-auto">
                We'll review your requirements and get back to you with a quote within 24 hours. Keep an eye on your inbox (or WhatsApp).
              </p>
              <Button 
                variant="outline" 
                className="mt-8 rounded-full font-bold px-8 h-12"
                onClick={() => {
                  setSubmitted(false);
                  form.reset();
                }}
              >
                Submit another request
              </Button>
            </div>
          ) : (
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Name (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="John Doe" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Email *</FormLabel>
                        <FormControl>
                          <Input placeholder="john@example.com" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="whatsapp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>WhatsApp Number (optional)</FormLabel>
                        <FormControl>
                          <Input placeholder="+1 234 567 8900" className="h-12 rounded-xl" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Business Type</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="h-12 rounded-xl">
                              <SelectValue placeholder="Select business type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="Freelancer">Freelancer</SelectItem>
                            <SelectItem value="E-commerce">E-commerce</SelectItem>
                            <SelectItem value="Content Creator">Content Creator</SelectItem>
                            <SelectItem value="Agency">Agency</SelectItem>
                            <SelectItem value="Startup">Startup</SelectItem>
                            <SelectItem value="Other">Other</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What do you want us to build? *</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Describe the tool, the problem it solves, and the key features you need..." 
                          className="min-h-[150px] rounded-xl resize-y" 
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="budget"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Budget Range</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger className="h-12 rounded-xl">
                            <SelectValue placeholder="Select budget range" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="Under $50">Under $50</SelectItem>
                          <SelectItem value="$50-$150">$50-$150</SelectItem>
                          <SelectItem value="$150-$500">$150-$500</SelectItem>
                          <SelectItem value="$500+">$500+</SelectItem>
                          <SelectItem value="Not sure">Not sure</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button 
                  type="submit" 
                  size="lg" 
                  className="w-full h-14 text-lg font-bold rounded-xl mt-4 shadow-xl hover:shadow-primary/25 transition-all"
                  disabled={submitRequest.isPending}
                >
                  {submitRequest.isPending ? "Submitting..." : "Get a Quote"}
                </Button>
              </form>
            </Form>
          )}
        </div>
      </div>
    </div>
  );
}
