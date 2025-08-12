import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, EyeOff, Mail, Lock, Car, Users, MapPin } from "lucide-react";

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log('Login attempt:', { email, password });
    // TODO: Implement actual login logic
  };

  return (
    <div className="min-h-screen flex">
      {/* Left side - Login Form */}
      <div className="flex-1 flex items-center justify-center p-8 bg-gradient-to-br from-gray-50 to-white">
        <div className="w-full max-w-md space-y-8">
          {/* Logo and Header */}
          <div className="text-center space-y-4">
            <div className="mx-auto w-16 h-16 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center">
              <Car className="h-8 w-8 text-white" />
            </div>
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Welcome Back</h1>
              <p className="text-gray-600 mt-2">Sign in to your RideAssign account</p>
            </div>
          </div>

          {/* Login Form */}
          <Card className="border-0 shadow-xl">
            <CardHeader className="space-y-1 pb-6">
              <CardTitle className="text-2xl text-center">Sign In</CardTitle>
              <CardDescription className="text-center">
                Enter your credentials to access the dashboard
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="email" className="text-sm font-medium">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="admin@rideassign.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="pl-10 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                    <Input
                      id="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Enter your password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="pl-10 pr-12 h-12 border-gray-200 focus:border-blue-500 focus:ring-blue-500"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </button>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Checkbox id="remember" />
                    <Label htmlFor="remember" className="text-sm text-gray-600">
                      Remember me
                    </Label>
                  </div>
                  <a href="#" className="text-sm text-blue-600 hover:text-blue-800 font-medium">
                    Forgot password?
                  </a>
                </div>

                <Button 
                  type="submit" 
                  className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                >
                  Sign In
                </Button>

                <div className="text-center">
                  <p className="text-sm text-gray-600">
                    Don't have an account?{' '}
                    <a href="#" className="text-blue-600 hover:text-blue-800 font-medium">
                      Contact Administrator
                    </a>
                  </p>
                </div>
              </form>
            </CardContent>
          </Card>

 
        </div>
      </div>

      {/* Right side - Features/Info */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-700 relative overflow-hidden">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative z-10 flex flex-col justify-center items-center text-white p-12 space-y-8">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Abenezer Holding Dashboard</h2>
            <p className="text-xl text-blue-100">
              Efficiently manage drivers, passengers, and assignments
            </p>
          </div>
          
          <div className="grid gap-6 mt-12">
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Users className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Passenger Management</h3>
                <p className="text-blue-100 text-sm">Track and assign passengers to drivers</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="p-3 bg-white/20 rounded-full">
                <Car className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Driver Coordination</h3>
                <p className="text-blue-100 text-sm">Monitor driver availability and status</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4 bg-white/10 backdrop-blur-sm rounded-lg p-4">
              <div className="p-3 bg-white/20 rounded-full">
                <MapPin className="h-6 w-6" />
              </div>
              <div>
                <h3 className="font-semibold">Real-time Tracking</h3>
                <p className="text-blue-100 text-sm">Live location updates and route optimization</p>
              </div>
            </div>
          </div>
        </div>
        
        {/* Decorative elements */}
        <div className="absolute top-20 right-20 w-32 h-32 bg-white/10 rounded-full blur-xl"></div>
        <div className="absolute bottom-20 left-20 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      </div>
    </div>
  );
};

export default Login;