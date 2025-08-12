import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock, Users } from "lucide-react";

interface ScheduleItem {
  id: string;
  time: string;
  title: string;
  passengers: number;
  type: 'pickup' | 'dropoff';
}

const mockScheduleData = {
  day: [
    { id: '1', time: '08:00', title: 'Morning Pickup Route A', passengers: 12, type: 'pickup' as const },
    { id: '2', time: '09:30', title: 'Airport Transfer', passengers: 3, type: 'pickup' as const },
    { id: '3', time: '11:00', title: 'Downtown Dropoff', passengers: 8, type: 'dropoff' as const },
    { id: '4', time: '14:00', title: 'Lunch Route', passengers: 15, type: 'pickup' as const },
    { id: '5', time: '17:30', title: 'Evening Dropoff Route B', passengers: 20, type: 'dropoff' as const },
  ],
  week: [
    { id: '6', time: 'Mon 08:00', title: 'Weekly Route A', passengers: 45, type: 'pickup' as const },
    { id: '7', time: 'Tue 09:00', title: 'Corporate Shuttle', passengers: 25, type: 'pickup' as const },
    { id: '8', time: 'Wed 10:30', title: 'Medical Appointments', passengers: 8, type: 'pickup' as const },
    { id: '9', time: 'Thu 15:00', title: 'School Pickup', passengers: 30, type: 'pickup' as const },
    { id: '10', time: 'Fri 18:00', title: 'Weekend Prep', passengers: 12, type: 'dropoff' as const },
  ]
};

export default function ScheduleCard() {
  const [activeTab, setActiveTab] = useState<'day' | 'week'>('day');
  
  const scheduleData = mockScheduleData[activeTab];

  return (
    <Card className="bg-white shadow-xl border border-gray-100">
      <CardHeader className="bg-gradient-to-r from-indigo-600 to-purple-600 text-white">
        <CardTitle className="flex items-center gap-2 text-xl">
          <Calendar className="h-6 w-6" />
          Schedule Overview
        </CardTitle>
        <div className="flex gap-2 mt-3">
          <button
            onClick={() => setActiveTab('day')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'day' 
                ? 'bg-white text-indigo-600' 
                : 'bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
            }`}
          >
            Today
          </button>
          <button
            onClick={() => setActiveTab('week')}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
              activeTab === 'week' 
                ? 'bg-white text-indigo-600' 
                : 'bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30'
            }`}
          >
            This Week
          </button>
        </div>
      </CardHeader>
      
      <CardContent className="p-6">
        <div className="space-y-4 max-h-96 overflow-y-auto">
          {scheduleData.map((item) => (
            <div 
              key={item.id} 
              className="flex items-center gap-4 p-4 rounded-lg bg-gradient-to-r from-indigo-50 to-purple-50 border border-indigo-100"
            >
              <div className="flex items-center justify-center w-12 h-12 rounded-full bg-indigo-100">
                <Clock className="h-5 w-5 text-indigo-600" />
              </div>
              
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-gray-900">{item.title}</h3>
                  <span 
                    className={`px-2 py-1 rounded-full text-xs font-medium ${
                      item.type === 'pickup' 
                        ? 'bg-green-100 text-green-700' 
                        : 'bg-blue-100 text-blue-700'
                    }`}
                  >
                    {item.type}
                  </span>
                </div>
                <div className="flex items-center gap-4 mt-1 text-sm text-gray-600">
                  <span className="font-medium">{item.time}</span>
                  <div className="flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    <span>{item.passengers} passengers</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
        
        {scheduleData.length === 0 && (
          <div className="text-center py-8 text-gray-500">
            <Calendar className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>No scheduled trips for this period</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}