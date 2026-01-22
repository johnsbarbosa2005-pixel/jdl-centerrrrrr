
import React, { useState } from 'react';
import { ServiceType } from '../types';

interface Props {
  onBook: (data: { name: string; email: string; service: ServiceType; date: string; time: string; notes: string }) => void;
}

export const BookingForm: React.FC<Props> = ({ onBook }) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    service: 'Mentorship' as ServiceType,
    date: '',
    time: '',
    notes: ''
  });

  const services: ServiceType[] = ['Mentorship', 'Co-working Space', '3D Printer', 'Workshop', 'Pitch Review'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onBook(formData);
    // Reset
    setFormData({
      name: '',
      email: '',
      service: 'Mentorship',
      date: '',
      time: '',
      notes: ''
    });
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 space-y-4">
      <h2 className="text-xl font-bold text-slate-800 mb-4">Book a Resource</h2>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Full Name</label>
          <input
            required
            type="text"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="John Doe"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Email Address</label>
          <input
            required
            type="email"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            placeholder="john@vsu.edu"
            value={formData.email}
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Resource / Service</label>
        <select
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          value={formData.service}
          onChange={(e) => setFormData({ ...formData, service: e.target.value as ServiceType })}
        >
          {services.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Date</label>
          <input
            required
            type="date"
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.date}
            onChange={(e) => setFormData({ ...formData, date: e.target.value })}
          />
        </div>
        
        <div className="space-y-1">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Time Slot</label>
          <select
            required
            className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
            value={formData.time}
            onChange={(e) => setFormData({ ...formData, time: e.target.value })}
          >
            <option value="">Select Time</option>
            <option value="09:00 AM">09:00 AM</option>
            <option value="10:30 AM">10:30 AM</option>
            <option value="01:00 PM">01:00 PM</option>
            <option value="02:30 PM">02:30 PM</option>
            <option value="04:00 PM">04:00 PM</option>
          </select>
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Meeting Goals / Notes</label>
        <textarea
          rows={3}
          className="w-full p-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="Briefly describe what you'd like to achieve..."
          value={formData.notes}
          onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
        />
      </div>

      <button
        type="submit"
        className="w-full bg-blue-800 text-white font-bold py-3 rounded-lg hover:bg-blue-900 transition-colors shadow-lg shadow-blue-900/10"
      >
        Confirm Booking
      </button>
    </form>
  );
};
