import { useState } from 'react';
import type { User, Driver, Booking } from '../types';
import { Calendar, MapPin, CheckCircle, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import ProfileCard from './profile/ProfileCard';
import DriverStats from './dashboard/DriverStats';
import UpcomingTrips from './dashboard/UpcomingTrips';
import AvailableJobs from './dashboard/AvailableJobs';
import ChatList from './chat/ChatList';
import ChatWindow from './chat/ChatWindow';

interface DriverDashboardProps {
  user: User;
  driver: Driver;
  bookings: Booking[];
  onUpdateAvailability: (available: boolean) => void;
  onUpdateBookingStatus: (bookingId: string, status: Booking['status']) => void;
  onUpdateDriver?: (updatedDriver: Driver) => void;
  allUsers: User[]; // Add this prop for chat functionality
}

export default function DriverDashboard({
  user,
  driver,
  bookings,
  onUpdateAvailability,
  onUpdateBookingStatus,
  onUpdateDriver,
  allUsers,
}: DriverDashboardProps) {
  const [activeSection, setActiveSection] = useState<'schedule' | 'jobs'>('schedule');
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [messages, setMessages] = useState<any[]>([]);
  const pendingBookings = bookings.filter((b) => b.status === 'pending');
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed');
  const completedBookings = bookings.filter((b) => b.status === 'completed');

  const handleSendMessage = (content: string) => {
    if (selectedUser) {
      const newMessage = {
        id: Math.random().toString(),
        sender: user.id,
        receiver: selectedUser.id,
        content,
        createdAt: new Date().toISOString(),
        read: false,
      };
      setMessages([...messages, newMessage]);
      // Here you would also emit the message via Socket.IO
    }
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex gap-8">
        {/* Main Content */}
        <div className="flex-1">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left Column - Profile and Stats */}
            <div className="lg:col-span-1 space-y-8">
              <ProfileCard
                driver={driver}
                onViewSection={setActiveSection}
                activeSection={activeSection}
                onUpdateDriver={onUpdateDriver}
              />
              <DriverStats
                totalTrips={completedBookings.length}
                pendingRequests={pendingBookings.length}
                activeTrips={confirmedBookings.length}
                rating={driver.rating}
              />
            </div>

            {/* Right Column - Main Content */}
            <div className="lg:col-span-2 space-y-8">
              {activeSection === 'schedule' ? (
                <UpcomingTrips
                  bookings={confirmedBookings}
                  onUpdateStatus={onUpdateBookingStatus}
                />
              ) : (
                <AvailableJobs
                  driver={driver}
                  onUpdateAvailability={onUpdateAvailability}
                />
              )}

              {/* Pending Requests Section */}
              <div className="bg-white rounded-lg shadow-lg overflow-hidden">
                <div className="p-6">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Pending Requests</h3>
                  <div className="space-y-4">
                    {pendingBookings.map((booking) => (
                      <div key={booking.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-4">
                          <div className="flex items-center">
                            <Calendar className="h-5 w-5 text-gray-400" />
                            <span className="ml-2 text-sm text-gray-600">
                              {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                            </span>
                          </div>
                          <div className="flex space-x-2">
                            <button
                              onClick={() => onUpdateBookingStatus(booking.id, 'confirmed')}
                              className="p-2 text-green-600 hover:bg-green-50 rounded-full transition-colors"
                            >
                              <CheckCircle className="h-5 w-5" />
                            </button>
                            <button
                              onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-full transition-colors"
                            >
                              <XCircle className="h-5 w-5" />
                            </button>
                          </div>
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center">
                            <MapPin className="h-5 w-5 text-gray-400" />
                            <span className="ml-2 text-sm text-gray-600">{booking.route}</span>
                          </div>
                          {booking.requirements && (
                            <p className="text-sm text-gray-600 ml-7">{booking.requirements}</p>
                          )}
                        </div>
                      </div>
                    ))}
                    {pendingBookings.length === 0 && (
                      <p className="text-gray-500 text-center py-4">No pending requests</p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Chat Sidebar */}
        <div className="w-80 flex flex-col space-y-4">
          <ChatList
            users={allUsers.filter(u => u.id !== user.id)}
            onSelectUser={setSelectedUser}
            currentUser={user}
          />
          {selectedUser && (
            <ChatWindow
              currentUser={user}
              otherUser={selectedUser}
              messages={messages.filter(
                m => (m.sender === user.id && m.receiver === selectedUser.id) ||
                     (m.sender === selectedUser.id && m.receiver === user.id)
              )}
              onSendMessage={handleSendMessage}
              onClose={() => setSelectedUser(null)}
            />
          )}
        </div>
      </div>
    </div>
  );
}