
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Index from "./pages/Index";
import Drivers from "./pages/Drivers";
import Passengers from "./pages/Passengers";
import Assignments from "./pages/Assignments";
import NotFound from "./pages/NotFound";
import { Provider } from "react-redux";
import { store } from "./store/index";
import { SidebarProvider, SidebarInset } from "@/components/ui/sidebar";
import AppSidebar from "@/components/AppSidebar";
import Login from "./pages/Login";

const App = () => (
  <Provider store={store}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
       <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/*" element={
            <SidebarProvider>
              <div className="min-h-screen flex w-full bg-gradient-to-br from-indigo-50 via-white to-purple-50">
                <AppSidebar />
                <SidebarInset>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/drivers" element={<Drivers />} />
                    <Route path="/passengers" element={<Passengers />} />
                    <Route path="/assignments" element={<Assignments />} />
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </SidebarInset>
              </div>
            </SidebarProvider>
          } />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </Provider>
);

export default App;
