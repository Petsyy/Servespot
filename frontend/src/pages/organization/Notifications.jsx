import React, { useState } from 'react';
import { Bell, Calendar, FileText, CheckCircle, Award, Mail, AlertCircle, Menu, X } from 'lucide-react';

const NotificationItem = ({ notification }) => {
  const iconMap = {
    reminder: <Calendar className="w-5 h-5" />,
    update: <FileText className="w-5 h-5" />,
    confirmation: <CheckCircle className="w-5 h-5" />,
    achievement: <Award className="w-5 h-5" />,
    message: <Mail className="w-5 h-5" />,
    alert: <AlertCircle className="w-5 h-5" />
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4 sm:p-5 hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-4 flex-1">
          <div className="flex-shrink-0 w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center text-gray-600">
            {iconMap[notification.type]}
          </div>
          
          <div className="flex-1 min-w-0">
            <h3 className="font-semibold text-gray-900 mb-1">{notification.title}</h3>
            <p className="text-sm text-gray-600 mb-2">{notification.description}</p>
            <p className="text-xs text-gray-500">{notification.time}</p>
          </div>
        </div>

        <button className="flex-shrink-0 text-green-600 hover:text-green-700 font-medium text-sm whitespace-nowrap">
          {notification.action}
        </button>
      </div>
    </div>
  );
};

const Notifications = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const notifications = [
    {
      id: 1,
      type: 'reminder',
      title: 'Upcoming Task Reminder',
      description: 'Your "Park Cleanup" task is scheduled for tomorrow at 9 AM. Don\'t forget to bring gloves!',
      time: '2 hours ago',
      action: 'View Task'
    },
    {
      id: 2,
      type: 'update',
      title: 'Task Status Update',
      description: 'The "Community Garden Planting" task now has more volunteer slots available. Sign up if you\'re interested! Yesterday at 3:15 PM',
      time: '',
      action: 'View Task'
    },
    {
      id: 3,
      type: 'confirmation',
      title: 'Task Completion Confirmed',
      description: 'Your participation in "Food Bank Sorting" has been confirmed. Great job making a difference! Yesterday at 10:00 AM',
      time: '',
      action: 'View Dashboard'
    },
    {
      id: 4,
      type: 'achievement',
      title: 'New Achievement Unlocked!',
      description: 'Congratulations! You\'ve earned the "Community Builder" badge for completing 5 tasks.',
      time: '3 days ago',
      action: 'View Badges'
    },
    {
      id: 5,
      type: 'message',
      title: 'New Message from "Green Earth Org"',
      description: 'The organizer of "Shoe Bank Cleanup" has sent you a new message. Please check your inbox.',
      time: '5 days ago',
      action: 'View Messages'
    },
    {
      id: 6,
      type: 'alert',
      title: 'New Opportunity Alert',
      description: 'A new opportunity, "Local Library Book Drive", has been posted near you. Check it out!',
      time: '1 week ago',
      action: 'View Opportunity'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm sticky top-0 z-50">
        <nav className="w-full mx-auto px-6 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex-shrink-0">
              <h1 className="text-2xl font-bold text-green-600">ServeSpot</h1>
            </div>
            
            <div className="hidden md:flex space-x-8">
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Home</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">Opportunities</a>
              <a href="#" className="text-gray-700 hover:text-green-600 transition-colors">About</a>
            </div>

            <div className="flex items-center gap-3">
              <button className="hidden md:flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </button>

              <button 
                className="md:hidden text-gray-700 hover:text-green-600"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden py-4 border-t border-gray-200">
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600">Home</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600">Opportunities</a>
              <a href="#" className="block py-2 text-gray-700 hover:text-green-600">About</a>
              <button className="w-full mt-2 flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                <Bell className="w-4 h-4 mr-2" />
                Notifications
              </button>
            </div>
          )}
        </nav>
      </header>

      {/* Main Content */}
      <main className="w-full mx-auto px-6 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="mb-8">
          <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">Notifications</h2>
        </div>

        <div className="space-y-4">
          {notifications.map(notification => (
            <NotificationItem key={notification.id} notification={notification} />
          ))}
        </div>

        {notifications.length === 0 && (
          <div className="text-center py-12 bg-white rounded-lg border border-gray-200">
            <Bell className="w-16 h-16 mx-auto text-gray-300 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No notifications yet</h3>
            <p className="text-gray-600">When you receive notifications, they'll appear here.</p>
          </div>
        )}
      </main>
    </div>
  );
};

export default Notifications;