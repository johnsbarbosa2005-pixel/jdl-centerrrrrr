
import React from 'react';
import { Appointment } from '../types';
import { Calendar, Clock, MapPin, User, Trash2 } from 'lucide-react';

interface Props {
  appointment: Appointment;
  onDelete: (id: string) => void;
}

export const AppointmentCard: React.FC<Props> = ({ appointment, onDelete }) => {
  const statusColors = {
    confirmed: 'bg-green-100 text-green-800 border-green-200',
    pending: 'bg-amber-100 text-amber-800 border-amber-200',
    cancelled: 'bg-red-100 text-red-800 border-red-200',
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-all">
      <div className="flex justify-between items-start mb-4">
        <span className={`px-3 py-1 rounded-full text-xs font-semibold border ${statusColors[appointment.status]}`}>
          {appointment.status.toUpperCase()}
        </span>
        <button 
          onClick={() => onDelete(appointment.id)}
          className="text-slate-400 hover:text-red-500 transition-colors"
        >
          <Trash2 size={18} />
        </button>
      </div>
      
      <h3 className="text-lg font-bold text-slate-800 mb-2">{appointment.service}</h3>
      
      <div className="space-y-2 text-sm text-slate-600">
        <div className="flex items-center gap-2">
          <User size={16} className="text-blue-600" />
          <span>{appointment.name}</span>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={16} className="text-blue-600" />
          <span>{new Date(appointment.date).toLocaleDateString()}</span>
        </div>
        <div className="flex items-center gap-2">
          <Clock size={16} className="text-blue-600" />
          <span>{appointment.time}</span>
        </div>
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-blue-600" />
          <span>JDL Center, VSU Campus</span>
        </div>
      </div>
      
      {appointment.notes && (
        <div className="mt-4 pt-4 border-t border-slate-100">
          <p className="text-xs text-slate-500 italic">"{appointment.notes}"</p>
        </div>
      )}
    </div>
  );
};

// Lucide Icons Mock (Since we can't import actual lucide-react easily without knowing availability, 
// I'll define simple SVG wrappers or use emojis if needed, but the prompt says popular libraries)
// Actually, I'll use standard SVG for robustness.
