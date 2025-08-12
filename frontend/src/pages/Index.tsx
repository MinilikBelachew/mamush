import React, { useEffect, useState } from "react";
import { useSelector, useDispatch } from "react-redux";
import { RootState } from "@/store";

import DashboardSummaryCard from "@/components/DashboardSummaryCard";
import { ChartContainer } from "@/components/ui/chart";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, PieChart, Pie, Cell } from "recharts";
import { Users, User, Columns2, Activity } from "lucide-react";
import { Badge, CardContent, CardHeader } from "@mui/material";
import { Card, CardTitle } from "@/components/ui/card";
import io from "socket.io-client";
import ScheduleCard from "@/components/ScheduleCard";

const Dashboard = () => {
  const dispatch = useDispatch();

  // Fake data
  const driver = [
    { id: 1, name: "John Smith" },
    { id: 2, name: "Emma Johnson" },
    { id: 3, name: "Michael Chen" },
    { id: 4, name: "Sarah Williams" },
    { id: 5, name: "David Brown" },
  ];

  const passenger = [
    { id: 1, name: "Alice Davis" },
    { id: 2, name: "Bob Wilson" },
    { id: 3, name: "Carol Taylor" },
    { id: 4, name: "Daniel Martinez" },
    { id: 5, name: "Eve Thompson" },
  ];

  const assignment = [
    { id: 1, driver: driver[0], passenger: passenger[0], status: "In Progress" },
    { id: 2, driver: driver[1], passenger: passenger[1], status: "Completed" },
    { id: 3, driver: driver[2], passenger: passenger[2], status: "In Progress" },
    { id: 4, driver: driver[0], passenger: passenger[3], status: "Pending" },
    { id: 5, driver: driver[3], passenger: passenger[4], status: "Completed" },
    { id: 6, driver: driver[4], passenger: passenger[0], status: "In Progress" },
    { id: 7, driver: driver[1], passenger: passenger[2], status: "Pending" },
  ];

  const liveLocations = {
    "driver-1": { lat: 40.7128, lng: -74.0060 },
    "driver-2": { lat: 40.7282, lng: -73.9876 },
    "driver-3": { lat: 40.7359, lng: -73.9911 },
    "passenger-1": { lat: 40.7484, lng: -73.9857 },
    "passenger-2": { lat: 40.7549, lng: -73.9840 },
  };

  const summaryData = [
    { label: "Total Drivers", value: driver.length, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "Total Passengers", value: passenger.length, icon: User, color: "bg-purple-100 text-purple-600" },
    { label: "Total Assignments", value: assignment.length, icon: Columns2, color: "bg-green-100 text-green-600" },
  ];

  const assignmentStatusData = [
    { name: "In Progress", value: assignment.filter(a => a.status === "In Progress").length },
    { name: "Completed", value: assignment.filter(a => a.status === "Completed").length },
    { name: "Pending", value: assignment.filter(a => a.status === "Pending").length },
  ];

  const connectionStatus = "Connected";

  const pieColors = ["#9b87f5", "#7E69AB", "#FEF7CD", "#D6BCFA", "#F2FCE2"];

  return (
    <div className="p-8 w-full min-h-screen bg-gradient-to-br from-indigo-50 via-white/70 to-purple-100 animate-fade-in">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-4xl font-bold text-indigo-900 tracking-tight">Dashboard</h1>
        <div className="flex items-center gap-2">
          <Activity className={`h-5 w-5 ${connectionStatus === 'Connected' ? 'text-green-500' : 'text-red-500'}`} />
          <Badge variant={connectionStatus === 'Connected' ? 'default' : 'destructive'}>
            Live Tracking: {connectionStatus}
          </Badge>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {summaryData.map(({ label, value, icon, color }) => (
          <DashboardSummaryCard
            key={label}
            label={label}
            value={value}
            icon={icon}
            color={color}
          />
        ))}
      </div>

      <div className="mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-indigo-800">
              <Activity className="h-5 w-5" />
              Real-time Tracking Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-indigo-600">
                  {Object.keys(liveLocations).filter(key => key.startsWith('driver-')).length}
                </div>
                <div className="text-sm text-gray-600">Active Driver Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {Object.keys(liveLocations).filter(key => key.startsWith('passenger-')).length}
                </div>
                <div className="text-sm text-gray-600">Active Passenger Locations</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {assignment.filter(a => a.status === "In Progress").length}
                </div>
                <div className="text-sm text-gray-600">Live Assignments</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Assignment Status PieChart */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="font-semibold text-lg mb-2 text-indigo-800">Assignment Status</h3>
          <ResponsiveContainer width="100%" height={250}>
            <PieChart>
              <Pie data={assignmentStatusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} label>
                {assignmentStatusData.map((entry, idx) => (
                  <Cell key={`cell-${idx}`} fill={pieColors[idx % pieColors.length]} />
                ))}
              </Pie>
              <Legend />
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </div>
        {/* Assignments per Driver BarChart */}
        <div className="rounded-lg bg-white p-6 shadow-lg">
          <h3 className="font-semibold text-lg mb-2 text-indigo-800">Assignments per Driver</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart
              data={driver.map(driver => ({
                name: driver.name,
                assignments: assignment.filter(a => a.driver.id === driver.id).length,
              }))}
              margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="4 4" />
              <XAxis dataKey="name" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Bar dataKey="assignments" fill="#8B5CF6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <ScheduleCard />
      </div>
    </div>
  );
};

export default Dashboard;