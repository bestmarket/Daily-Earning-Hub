import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Home from "@/pages/Home";
import Admin from "@/pages/Admin";
import FreeTools from "@/pages/FreeTools";
import CRM from "@/pages/CRM";
import About from "@/pages/About";
import CustomRequest from "@/pages/CustomRequest";
import Software from "@/pages/Software";
import SoftwareDetail from "@/pages/SoftwareDetail";
import PrivacyPolicy from "@/pages/PrivacyPolicy";
import Terms from "@/pages/Terms";
import Refund from "@/pages/Refund";
import ToolsHub from "@/pages/tools/ToolsHub";
import WebsiteGrader from "@/pages/tools/WebsiteGrader";
import SeoChecker from "@/pages/tools/SeoChecker";
import BusinessNameGenerator from "@/pages/tools/BusinessNameGenerator";
import InvoiceGenerator from "@/pages/tools/InvoiceGenerator";
import ProfitMarginCalculator from "@/pages/tools/ProfitMarginCalculator";
import NichesIndex from "@/pages/tools/niches/NichesIndex";
import NicheGrader from "@/pages/tools/niches/NicheGrader";

const queryClient = new QueryClient({
  defaultOptions: { queries: { retry: 1, refetchOnWindowFocus: false } },
});

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/custom-request" component={CustomRequest} />
      <Route path="/software" component={Software} />
      <Route path="/software/:id" component={SoftwareDetail} />
      <Route path="/free-tools" component={FreeTools} />
      <Route path="/tools" component={ToolsHub} />
      <Route path="/tools/website-grader" component={WebsiteGrader} />
      <Route path="/tools/website-grader/industries" component={NichesIndex} />
      <Route path="/tools/website-grader/:niche" component={NicheGrader} />
      <Route path="/tools/seo-checker" component={SeoChecker} />
      <Route path="/tools/business-name-generator" component={BusinessNameGenerator} />
      <Route path="/tools/invoice-generator" component={InvoiceGenerator} />
      <Route path="/tools/profit-margin-calculator" component={ProfitMarginCalculator} />
      <Route path="/privacy-policy" component={PrivacyPolicy} />
      <Route path="/terms" component={Terms} />
      <Route path="/refund" component={Refund} />
      <Route path="/admin" component={Admin} />
      <Route path="/admin/crm" component={CRM} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Router />
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
