
import React, { useState, useEffect, useMemo } from 'react';
import { Appointment, StaffUser } from './types';
import { TrashIcon, ClockIcon } from './components/Icons';
import { AIChatAssistant } from './components/AIChatAssistant';

const VSU_DOMAIN = '@valdosta.edu';
const START_HOUR = 8;
const END_HOUR = 16;
const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

// Using a relative path as primary with a fallback URL per technical specification
const LOCAL_LOGO_PATH = "./vsu-logo.png"; 
const FALLBACK_LOGO_URL = "https://upload.wikimedia.org/wikipedia/en/thumb/5/5e/Valdosta_State_Blazers_logo.svg/1200px-Valdosta_State_Blazers_logo.svg.png";

const App: React.FC = () => {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [isStaffPortal, setIsStaffPortal] = useState(false);
  const [staffUser, setStaffUser] = useState<StaffUser | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [appIsLoading, setAppIsLoading] = useState(true);
  
  // Modals / Selection States
  const [showBookingModal, setShowBookingModal] = useState<{ date: string; time: string } | null>(null);
  const [editingAppointment, setEditingAppointment] = useState<Appointment | null>(null);
  
  // Form states
  const [userName, setUserName] = useState('');
  const [userEmail, setUserEmail] = useState('');
  const [roomMessage, setRoomMessage] = useState('');
  const [isStaffBlockInput, setIsStaffBlockInput] = useState(false);
  const [editDate, setEditDate] = useState('');
  const [editTime, setEditTime] = useState('');

  // Login states
  const [loginEmail, setLoginEmail] = useState('');
  const [loginName, setLoginName] = useState('');
  const [bookingSuccess, setBookingSuccess] = useState(false);

  useEffect(() => {
    // Simulate initial loading to ensure branding is visible and scripts are ready
    const timer = setTimeout(() => {
      const saved = localStorage.getItem('vsu-room-appts');
      if (saved) setAppointments(JSON.parse(saved));
      
      const savedStaff = localStorage.getItem('vsu-staff-user');
      if (savedStaff) setStaffUser(JSON.parse(savedStaff));
      
      setAppIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    localStorage.setItem('vsu-room-appts', JSON.stringify(appointments));
  }, [appointments]);

  const handleStaffLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail.toLowerCase().endsWith(VSU_DOMAIN)) {
      alert(`Access restricted to VSU Staff (${VSU_DOMAIN} email required).`);
      return;
    }
    const user = { email: loginEmail, name: loginName };
    setStaffUser(user);
    setIsStaffPortal(false);
    localStorage.setItem('vsu-staff-user', JSON.stringify(user));
  };

  const handleLogout = () => {
    setStaffUser(null);
    localStorage.removeItem('vsu-staff-user');
    setIsMobileMenuOpen(false);
  };

  const submitBooking = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isStaffBlockInput && roomMessage.length < 10) {
      alert("Room reservation message must be at least 10 characters.");
      return;
    }

    const finalDate = editingAppointment ? editDate : showBookingModal?.date;
    const finalTime = editingAppointment ? editTime : showBookingModal?.time;

    if (finalDate && finalTime) {
      if (editingAppointment && (finalDate !== editingAppointment.date || finalTime !== editingAppointment.time)) {
        const conflict = appointments.find(a => a.date === finalDate && a.time === finalTime && a.id !== editingAppointment.id);
        if (conflict) {
          alert("This slot is already occupied. Please choose a different time.");
          return;
        }
      }

      const newAppt: Appointment = {
        id: editingAppointment?.id || Math.random().toString(36).substr(2, 9),
        name: isStaffBlockInput ? "VSU STAFF" : userName,
        email: isStaffBlockInput ? (staffUser?.email || "staff@valdosta.edu") : userEmail,
        date: finalDate,
        time: finalTime,
        roomMessage: isStaffBlockInput ? (roomMessage || "Reserved for Center Event / Maintenance") : roomMessage,
        status: 'occupied',
        isStaffBlock: isStaffBlockInput
      };

      if (editingAppointment) {
        setAppointments(appointments.map(a => a.id === editingAppointment.id ? newAppt : a));
      } else {
        setAppointments([...appointments, newAppt]);
      }
      
      setBookingSuccess(true);
      setTimeout(() => {
        setBookingSuccess(false);
        setShowBookingModal(null);
        setEditingAppointment(null);
        resetForm();
      }, 1500);
    }
  };

  const resetForm = () => {
    setUserName('');
    setUserEmail('');
    setRoomMessage('');
    setIsStaffBlockInput(false);
    setEditDate('');
    setEditTime('');
  };

  const deleteAppointment = (id: string) => {
    if (window.confirm("Are you sure you want to cancel this reservation?")) {
      setAppointments(appointments.filter(a => a.id !== id));
      setEditingAppointment(null);
      resetForm();
    }
  };

  const getAppointmentAt = (date: string, time: string) => {
    return appointments.find(a => a.date === date && a.time === time);
  };

  const weekDays = useMemo(() => {
    const today = new Date();
    const day = today.getDay();
    const diff = today.getDate() - day + (day === 0 ? -6 : 1);
    const monday = new Date(today.setDate(diff));
    
    return DAYS.map((name, i) => {
      const d = new Date(monday);
      d.setDate(monday.getDate() + i);
      return { name, dateStr: d.toISOString().split('T')[0], displayDate: d.toLocaleDateString() };
    });
  }, []);

  const todayStr = new Date().toISOString().split('T')[0];

  const handleSlotClick = (dayStr: string, timeStr: string) => {
    const existing = getAppointmentAt(dayStr, timeStr);
    if (staffUser) {
      if (existing) {
        setEditingAppointment(existing);
        setUserName(existing.name);
        setUserEmail(existing.email);
        setRoomMessage(existing.roomMessage);
        setIsStaffBlockInput(!!existing.isStaffBlock);
        setEditDate(existing.date);
        setEditTime(existing.time);
      } else {
        setShowBookingModal({ date: dayStr, time: timeStr });
        setEditDate(dayStr);
        setEditTime(timeStr);
      }
    } else {
      if (!existing) {
        setShowBookingModal({ date: dayStr, time: timeStr });
      }
    }
  };

  const timeOptions = Array.from({ length: END_HOUR - START_HOUR + 1 }).map((_, i) => {
    const hour = START_HOUR + i;
    return `${hour < 10 ? '0' + hour : hour}:00`;
  });

  const goHome = () => {
    setIsStaffPortal(false);
    setShowBookingModal(null);
    setEditingAppointment(null);
    setIsMobileMenuOpen(false);
  };

  if (appIsLoading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white">
        <div className="vsu-spinner mb-4"></div>
        <p className="text-[10px] font-black uppercase text-vsuRed tracking-widest animate-pulse">Initializing VSU Portal...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-['Inter']">
      {/* Global Header - Stark White background as per spec */}
      <header className="bg-white text-vsuBlack border-b-4 border-vsuRed sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 py-3 flex justify-between items-center h-[80px]">
          {/* Logo Section - Top Left, Center Aligned */}
          <div className="flex items-center gap-4 md:gap-6">
            <button onClick={goHome} className="block transition-transform hover:scale-105 active:scale-95">
              <img 
                src={LOCAL_LOGO_PATH} 
                alt="JDL Entrepreneurship Center - Valdosta State University" 
                className="h-[60px] w-auto object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement;
                  if (target.src !== FALLBACK_LOGO_URL) {
                    target.src = FALLBACK_LOGO_URL;
                  } else {
                    target.style.display = 'none';
                    target.parentElement!.innerHTML = '<span class="font-black text-vsuRed text-xs">JDL CENTER</span>';
                  }
                }}
              />
            </button>
            <div className="h-10 w-[1px] bg-slate-200 hidden md:block"></div>
            <div className="hidden sm:block">
              <h1 className="text-lg md:text-xl font-black tracking-tighter uppercase leading-none">JDL Entrepreneurship Center</h1>
              <p className="text-[10px] text-vsuRed font-bold uppercase tracking-widest mt-1">Official University Portal</p>
            </div>
          </div>
          
          {/* Desktop Navigation - Center Aligned vertically with Logo */}
          <div className="hidden md:flex items-center gap-4">
            {!staffUser ? (
              <button 
                onClick={() => setIsStaffPortal(!isStaffPortal)}
                className={`px-6 py-2.5 border-2 font-black transition-all uppercase text-xs rounded-none shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] ${isStaffPortal ? 'bg-vsuBlack text-white border-vsuBlack' : 'border-vsuBlack hover:bg-vsuBlack hover:text-white'}`}
              >
                {isStaffPortal ? 'Return to Home' : 'Staff Login'}
              </button>
            ) : (
              <div className="flex items-center gap-6">
                <div className="text-right">
                  <p className="text-[9px] font-black uppercase text-vsuRed tracking-widest">Authorized Access</p>
                  <p className="text-xs font-bold">{staffUser.name}</p>
                </div>
                <button 
                  onClick={handleLogout}
                  className="px-6 py-2.5 bg-vsuRed text-white font-black hover:bg-vsuBlack transition-all uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-[2px] hover:translate-y-[2px] border-2 border-vsuRed"
                >
                  Logout
                </button>
              </div>
            )}
          </div>

          {/* Mobile Hamburger - Right Side */}
          <button 
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            className="md:hidden p-2 text-vsuBlack hover:text-vsuRed transition-colors"
            aria-label="Toggle Menu"
          >
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="square">
              <line x1="3" y1="12" x2="21" y2="12"></line>
              <line x1="3" y1="6" x2="21" y2="6"></line>
              <line x1="3" y1="18" x2="21" y2="18"></line>
            </svg>
          </button>
        </div>

        {/* Mobile Menu Dropdown */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-b-4 border-vsuRed p-4 animate-in slide-in-from-top duration-200 shadow-xl">
            <div className="flex flex-col gap-4">
              <div className="border-b border-slate-100 pb-2 mb-2">
                <h2 className="text-sm font-black uppercase">JDL Center</h2>
                <p className="text-[10px] text-vsuRed font-bold uppercase tracking-widest">Valdosta State University</p>
              </div>
              {!staffUser ? (
                <button 
                  onClick={() => { setIsStaffPortal(!isStaffPortal); setIsMobileMenuOpen(false); }}
                  className="w-full py-3 bg-vsuBlack text-white font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(204,0,0,1)]"
                >
                  {isStaffPortal ? 'Return Home' : 'Staff Login'}
                </button>
              ) : (
                <>
                  <div className="bg-slate-50 p-3">
                    <p className="text-[10px] font-black text-vsuRed uppercase mb-1 tracking-widest">Authenticated User</p>
                    <p className="text-sm font-bold">{staffUser.name}</p>
                  </div>
                  <button 
                    onClick={handleLogout}
                    className="w-full py-3 bg-vsuRed text-white font-black uppercase text-xs shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]"
                  >
                    Logout
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-8">
        {isStaffPortal && !staffUser ? (
          <div className="max-w-md mx-auto mt-12 p-10 border-4 border-vsuBlack animate-in fade-in slide-in-from-bottom-4 shadow-2xl bg-white relative">
            <div className="absolute -top-6 -right-6 bg-vsuRed text-white p-3 font-black text-xs uppercase transform rotate-12 shadow-lg z-10">VSU Internal</div>
            <h2 className="text-2xl font-black mb-6 uppercase border-b-4 border-vsuRed pb-2">Staff Portal</h2>
            <form onSubmit={handleStaffLogin} className="space-y-4">
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-vsuBlack tracking-widest">Authorized Name</label>
                <input required type="text" value={loginName} onChange={e => setLoginName(e.target.value)} className="w-full border-2 border-vsuBlack p-3 focus:border-vsuRed outline-none font-bold" placeholder="Full Name"/>
              </div>
              <div>
                <label className="block text-[10px] font-black uppercase mb-1 text-vsuBlack tracking-widest">Staff Email</label>
                <input required type="email" value={loginEmail} onChange={e => setLoginEmail(e.target.value)} className="w-full border-2 border-vsuBlack p-3 focus:border-vsuRed outline-none font-bold" placeholder="username@valdosta.edu"/>
              </div>
              <button className="w-full bg-vsuBlack text-white py-4 font-black uppercase hover:bg-vsuRed transition-colors shadow-[8px_8px_0px_0px_rgba(204,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1 mt-6">Login to Management</button>
            </form>
          </div>
        ) : (
          <div className="animate-in fade-in duration-500">
            <div className="flex flex-col md:flex-row justify-between items-end mb-8 gap-6">
              <div>
                <h2 className="text-4xl md:text-5xl font-black uppercase leading-tight tracking-tighter">
                  {staffUser ? 'Center Command' : 'Booking Portal'}
                </h2>
                <div className="flex items-center gap-3 mt-2">
                  <div className="h-[2px] w-8 bg-vsuRed"></div>
                  <p className="text-vsuRed font-bold uppercase text-xs tracking-[0.2em]">
                    {staffUser ? 'System Control Active' : 'Select a Slot to Request Space'}
                  </p>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-4 bg-white p-4 border-4 border-vsuBlack shadow-[4px_4px_0px_0px_rgba(0,0,0,1)]">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-vsuRed border-2 border-vsuBlack"></div>
                  <span className="text-[10px] font-black uppercase text-vsuBlack">Closed</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-vsuBlack border-2 border-vsuBlack"></div>
                  <span className="text-[10px] font-black uppercase text-vsuBlack">Booked</span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-vsuRed bg-white"></div>
                  <span className="text-[10px] font-black uppercase text-vsuBlack">Open</span>
                </div>
              </div>
            </div>

            {/* Calendar Grid Container */}
            <div className="relative overflow-x-auto pb-6 scrollbar-thin">
              <div className="min-w-[950px] grid grid-cols-6 border-4 border-vsuBlack bg-vsuBlack shadow-2xl">
                {/* Header Row */}
                <div className="bg-vsuBlack text-white p-5 font-black uppercase text-[10px] tracking-widest flex items-center justify-center border-b-2 border-white border-opacity-10">Schedule</div>
                {weekDays.map(day => (
                  <div key={day.dateStr} className={`p-5 font-black uppercase text-xs flex flex-col items-center justify-center border-l-2 border-vsuBlack border-b-2 border-white border-opacity-10 transition-colors ${day.dateStr === todayStr ? 'bg-vsuRed text-white' : 'bg-vsuBlack text-white'}`}>
                    <span className="tracking-widest">{day.name}</span>
                    <span className="text-[9px] opacity-70 mt-1 font-bold">{day.displayDate}</span>
                  </div>
                ))}

                {/* Slots Rows */}
                {timeOptions.map((timeStr) => {
                  const hourNum = parseInt(timeStr.split(':')[0]);
                  const displayTime = `${hourNum > 12 ? hourNum - 12 : hourNum}:00 ${hourNum >= 12 ? 'PM' : 'AM'}`;
                  
                  return (
                    <React.Fragment key={timeStr}>
                      <div className="bg-white p-4 border-t-2 border-vsuBlack font-black text-center text-xs flex items-center justify-center uppercase tracking-tighter">
                        {displayTime}
                      </div>
                      {weekDays.map(day => {
                        const appt = getAppointmentAt(day.dateStr, timeStr);
                        const isOccupied = !!appt;
                        
                        let cellClass = "border-t-2 border-l-2 border-vsuBlack h-28 p-3 transition-all flex flex-col items-center justify-center group relative cursor-pointer overflow-hidden";
                        
                        if (staffUser) {
                          if (appt?.isStaffBlock) cellClass += " bg-vsuRed text-white hover:bg-red-800";
                          else if (isOccupied) cellClass += " bg-vsuBlack text-white hover:bg-slate-800";
                          else cellClass += " bg-white border-2 border-vsuRed hover:bg-vsuRed hover:bg-opacity-10";
                        } else {
                          if (isOccupied) cellClass += " bg-slate-100 cursor-not-allowed pointer-events-none";
                          else cellClass += " bg-white hover:bg-vsuRed hover:bg-opacity-5";
                        }

                        return (
                          <div key={`${day.dateStr}-${timeStr}`} onClick={() => handleSlotClick(day.dateStr, timeStr)} className={cellClass}>
                            {isOccupied ? (
                              <div className="text-center w-full animate-in fade-in zoom-in-95 duration-300">
                                {staffUser ? (
                                  <div className="bg-white bg-opacity-10 p-2 border border-white border-opacity-20 shadow-inner">
                                    <p className="text-[10px] font-black uppercase truncate mb-1 border-b border-white border-opacity-30 pb-1">{appt.name}</p>
                                    <p className="text-[9px] opacity-90 leading-tight line-clamp-2 italic font-medium">"{appt.roomMessage}"</p>
                                  </div>
                                ) : (
                                  <div className="flex flex-col items-center opacity-40">
                                    <ClockIcon size={16} className="mb-1" />
                                    <span className="text-[9px] font-black uppercase tracking-widest">Reserved</span>
                                  </div>
                                )}
                              </div>
                            ) : (
                              <div className="flex flex-col items-center">
                                <span className="opacity-0 group-hover:opacity-100 bg-vsuRed text-white px-4 py-2 text-[10px] font-black uppercase shadow-lg transform translate-y-2 group-hover:translate-y-0 transition-all">Request Slot</span>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </React.Fragment>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Booking / Management Modal */}
      {(showBookingModal || editingAppointment) && (
        <div className="fixed inset-0 bg-vsuBlack bg-opacity-90 flex items-center justify-center z-[60] p-4 backdrop-blur-md">
          <div className="bg-white w-full max-w-xl border-[10px] border-vsuRed p-8 animate-in zoom-in-95 duration-200 shadow-[0_0_50px_rgba(204,0,0,0.5)]">
            {bookingSuccess ? (
              <div className="text-center py-12 flex flex-col items-center">
                <div className="w-24 h-24 bg-vsuRed text-white flex items-center justify-center mb-6 text-5xl animate-bounce border-4 border-vsuBlack">✓</div>
                <h3 className="text-3xl font-black uppercase mb-2 tracking-tighter">Sync Verified</h3>
                <p className="text-vsuBlack font-bold max-w-xs uppercase text-[10px] tracking-widest opacity-60">System records updated successfully.</p>
              </div>
            ) : (
              <>
                <div className="flex justify-between items-start mb-8 border-b-4 border-vsuBlack pb-6">
                  <div>
                    <h3 className="text-3xl font-black uppercase leading-none tracking-tighter">
                      {editingAppointment ? 'Update Entry' : 'New Request'}
                    </h3>
                    <div className="flex items-center gap-3 mt-4">
                      <div className="bg-vsuRed text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-md">
                        {editingAppointment?.date || showBookingModal?.date}
                      </div>
                      <div className="bg-vsuBlack text-white px-3 py-1 text-[10px] font-black uppercase tracking-widest shadow-md">
                        {editingAppointment?.time || showBookingModal?.time}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => { setShowBookingModal(null); setEditingAppointment(null); resetForm(); }} className="text-4xl font-light hover:text-vsuRed transition-colors leading-none" aria-label="Close">×</button>
                </div>

                <form onSubmit={submitBooking} className="space-y-6">
                  {staffUser && (
                    <div className="flex items-center gap-4 bg-vsuRed bg-opacity-5 p-5 border-2 border-vsuRed border-dashed">
                      <input 
                        type="checkbox" 
                        id="staffBlock" 
                        checked={isStaffBlockInput} 
                        onChange={e => setIsStaffBlockInput(e.target.checked)}
                        className="w-7 h-7 accent-vsuRed cursor-pointer border-2 border-vsuBlack"
                      />
                      <div>
                        <label htmlFor="staffBlock" className="text-[11px] font-black uppercase cursor-pointer text-vsuRed block">Administrative Override</label>
                        <p className="text-[9px] text-vsuRed opacity-60 font-bold uppercase tracking-widest">Mark as closed for maintenance or events.</p>
                      </div>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {staffUser && editingAppointment && (
                      <>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">Reschedule Date</label>
                          <input type="date" value={editDate} onChange={e => setEditDate(e.target.value)} className="w-full border-4 border-vsuBlack p-3 font-bold focus:border-vsuRed outline-none bg-slate-50"/>
                        </div>
                        <div className="space-y-1">
                          <label className="block text-[10px] font-black uppercase text-slate-500 tracking-widest">Reschedule Time</label>
                          <select value={editTime} onChange={e => setEditTime(e.target.value)} className="w-full border-4 border-vsuBlack p-3 font-bold focus:border-vsuRed outline-none bg-slate-50">
                            {timeOptions.map(t => <option key={t} value={t}>{t}</option>)}
                          </select>
                        </div>
                      </>
                    )}
                  </div>

                  {!isStaffBlockInput && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-vsuBlack tracking-widest">Requestor Name</label>
                        <input required type="text" value={userName} onChange={e => setUserName(e.target.value)} className="w-full border-4 border-vsuBlack p-4 font-black focus:border-vsuRed outline-none bg-white text-sm" placeholder="Full Name"/>
                      </div>
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black uppercase text-vsuBlack tracking-widest">Contact Email</label>
                        <input required type="email" value={userEmail} onChange={e => setUserEmail(e.target.value)} className="w-full border-4 border-vsuBlack p-4 font-black focus:border-vsuRed outline-none bg-white text-sm" placeholder="user@valdosta.edu"/>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1">
                    <label className="block text-[10px] font-black uppercase text-vsuBlack tracking-widest">
                      {isStaffBlockInput ? 'Closure Documentation' : 'Meeting Agenda'}
                    </label>
                    <textarea 
                      required={!isStaffBlockInput}
                      rows={4}
                      value={roomMessage}
                      onChange={e => setRoomMessage(e.target.value)}
                      className="w-full border-4 border-vsuBlack p-4 font-black focus:border-vsuRed outline-none resize-none bg-white text-sm" 
                      placeholder={isStaffBlockInput ? "State reason for block..." : "Describe your purpose for the space."}
                    />
                    {!isStaffBlockInput && <p className="text-[9px] text-slate-400 mt-2 font-bold uppercase tracking-widest opacity-60">Validation requirement: Minimum 10 characters.</p>}
                  </div>

                  <div className="flex gap-4 pt-6">
                    <button className="flex-1 bg-vsuBlack text-white py-5 text-xl font-black uppercase hover:bg-vsuRed transition-all shadow-[8px_8px_0px_0px_rgba(204,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1 tracking-tighter">
                      {editingAppointment ? 'Save Updates' : 'Submit Request'}
                    </button>
                    {editingAppointment && staffUser && (
                      <button 
                        type="button"
                        onClick={() => deleteAppointment(editingAppointment.id)}
                        className="bg-vsuRed text-white px-8 hover:bg-vsuBlack transition-colors border-4 border-vsuRed shadow-[8px_8px_0px_0px_rgba(0,0,0,1)] hover:shadow-none hover:translate-x-1 hover:translate-y-1"
                        title="Delete Entry"
                      >
                        <TrashIcon size={28} />
                      </button>
                    )}
                  </div>
                </form>
              </>
            )}
          </div>
        </div>
      )}

      {/* Subtle University Texture Background */}
      <div className="fixed inset-0 pointer-events-none opacity-[0.02] z-[-1]" style={{backgroundImage: 'radial-gradient(var(--vsu-black) 1px, transparent 1px)', backgroundSize: '24px 24px'}}></div>

      <AIChatAssistant />
    </div>
  );
};

export default App;
