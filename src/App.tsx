import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import CreateCollection from "./pages/CreateCollection";
import PlanManager from "./pages/PlanManager";

import RestaurantSearch from "./pages/RestaurantSearch";
import TouristAttractionSearch from "./pages/TouristAttractionSearch";
import ProductRecommendations from "./pages/ProductRecommendations";
import MyCollections from "./pages/MyCollections";
import NotFound from "./pages/NotFound";
import AIAssistant from "./components/AIAssistant";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/create-collection" element={<CreateCollection />} />
          <Route path="/plan/:id" element={<PlanManager />} />

          <Route path="/restaurant-search" element={<RestaurantSearch />} />
          <Route path="/tourist-attraction-search" element={<TouristAttractionSearch />} />
          <Route path="/product-recommendations" element={<ProductRecommendations />} />
          <Route path="/my-collections" element={<MyCollections />} />
          {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        <AIAssistant />
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;