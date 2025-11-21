import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Auth from "./pages/Auth";
import Dashboard from "./pages/Dashboard";
import CreateListing from "./pages/CreateListing";
import EditListing from "./pages/EditListing";
import Browse from "./pages/Browse";
import ListingDetail from "./pages/ListingDetail";
import Chat from "./pages/Chat";
import Analytics from "./pages/Analytics";
import MapView from "./pages/MapView";
import CommunityFeed from "./pages/CommunityFeed";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/auth" element={<Auth />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-listing" element={<CreateListing />} />
          <Route path="/browse" element={<Browse />} />
          <Route path="/listing/:id" element={<ListingDetail />} />
          <Route path="/edit-listing/:id" element={<EditListing />} />
          <Route path="/chat/:userId" element={<Chat />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/map" element={<MapView />} />
          <Route path="/community" element={<CommunityFeed />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
