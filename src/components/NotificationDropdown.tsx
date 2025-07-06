import React, { useState } from 'react';
import { Bell, AlertCircle, Wrench, UserPlus, X, ClockAlert, Info, Warehouse } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card } from '@/components/ui/card';
import axios from 'axios';

function formatDateGroup(date: Date): 'Today' | 'Yesterday' | 'Earlier' {
  const now = new Date();
  const inputDate = new Date(date);
  
  const isToday = inputDate.toDateString() === now.toDateString();
  
  const yesterday = new Date();
  yesterday.setDate(now.getDate() - 1);
  const isYesterday = inputDate.toDateString() === yesterday.toDateString();
  
  if (isToday) return 'Today';
  if (isYesterday) return 'Yesterday';
  return 'Earlier';
}

function formatTime(date: Date): string {
  return new Date(date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
}


interface Notification {
  _id: string;
  type: "info" | "reminder" | "stock_alert" | "error";
  title: string;
  message: string;
  createdAt: Date;
  isRead: boolean;
}

// Mock notification data

interface NotificationIconProps {
  type: 'info' | 'reminder' | 'stock_alert' | "error";
}

const NotificationIcon: React.FC<NotificationIconProps> = ({ type }) => {
  const iconClass = "sm:w-4 sm:h-6 w-3 h-4";
  
  switch (type) {
    case 'reminder':
      return <ClockAlert className={`${iconClass} text-red-500`} />;
    case 'stock_alert':
      return <Warehouse className={`${iconClass} text-orange-500`} />;
    case 'info':
      return <Info  className={`${iconClass} text-green-500`} />;
    default:
      return <Bell className={`${iconClass} text-gray-500`} />;
  }
};

interface NotificationItemProps {
  notification: Notification;
  onMarkAsRead: (id: string) => void;
  isMobile?: boolean;
}

const NotificationItem: React.FC<NotificationItemProps> = ({ notification, onMarkAsRead, isMobile = false }) => {

  

  const getIconBackground = (type: string): string => {
    switch (type) {
      case 'stock_alert':
        return 'bg-red-100';
      case 'reminder':
        return 'bg-orange-100';
      case 'info':
        return 'bg-green-100';
      default:
        return 'bg-gray-100';
    }
  };

  return (
    <div className={`group p-3 border-b last:border-b-0 hover:bg-muted/50 transition-colors ${isMobile ? 'p-4' : ''}`}>
      <div className="flex items-start gap-3">
        <div className={`p-2 rounded-full ${getIconBackground(notification.type)} ${isMobile ? 'p-1' : ''}`}>
          <NotificationIcon type={notification.type} />
        </div>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between">
            <h4 className={`text-sm font-medium ${
              !notification.isRead ? 'font-semibold' : 'font-normal'
            } ${isMobile ? 'text-base' : ''}`}>
              {notification.title}
            </h4>
          </div>
          <p className={`text-sm text-muted-foreground mt-1 ${isMobile ? 'text-base' : ''}`}>
            {notification.message}
          </p>
          <div className='flex justify-between items-center mt-1'>
            <span className="text-xs text-muted-foreground p-1">
              {formatTime(new Date(notification.createdAt))}
            </span>
            <span
              className="hidden group-hover:block hover:bg-gray-200 rounded p-1 relative text-blue-500 text-xs hover:text-blue-600 cursor-pointer transition-all duration-300 sm:text-sm"
              onClick={() => onMarkAsRead(notification._id)}
            >
              Mark as read
            </span>
          </div>      
        </div>
      </div>
    </div>
  );
};

const NotificationsDropdown: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isOpen, setIsOpen] = useState<boolean>(false);
  const [showAllNotifications, setShowAllNotifications] = useState<boolean>(false);
  const [isMobile, setIsMobile] = useState<boolean>(false);

  React.useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const res = await axios.get("/api/get-notifications")
        setNotifications(res.data?.notifications || [])
      } catch (error) {
        console.log("Error fetching notifications: ", error)
      }
    }
    fetchNotifications()
  }, [])

  React.useEffect(() => {
    const checkIsMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    
    checkIsMobile();
    window.addEventListener('resize', checkIsMobile);
    
    return () => window.removeEventListener('resize', checkIsMobile);
  }, []);

  const unreadCount = notifications.filter(n => !n.isRead).length;
  
  // Show only first 3 notifications in dropdown, all in "View All" mode
  const displayedNotifications = showAllNotifications ? notifications : notifications.slice(0, 3);

  const groupedNotifications = displayedNotifications.reduce((groups: Record<string, Notification[]>, notification) => {
  const group = formatDateGroup(new Date(notification.createdAt));
  if (!groups[group]) groups[group] = [];
  groups[group].push(notification);
  return groups;
}, {});

  const markAsRead = async (id: string) => {
    console.log(id)
    try {
      const res = await axios.patch(`/api/read-notifications/${id}`)
      if (res) setNotifications(prev => 
        prev.filter(notification => 
          notification._id !== id)
      );
    } catch (error) {
      console.log("Error marking notification as read: ", error)
    }
  };

  const markAllAsRead = async () => {
    try {
      const res = await axios.patch("/api/read-notifications")
      if(res){
         setNotifications([])
        setIsOpen(false)
        };
    } catch (error) {
      console.log("Error marking notifications as read: ", error)
    }
  };

  const handleViewAllNotifications = (): void => {
    setShowAllNotifications(!showAllNotifications);
  };

  return (
    <DropdownMenu open={isOpen} onOpenChange={setIsOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size={isMobile ? "default" : "sm"} className="relative">
          <Bell className={`${isMobile ? 'w-4 h-4' : 'w-6 h-6'} text-gray-600`} />
          {unreadCount > 0 && (
            <div 
              className={`absolute bg-red-500 text-white rounded-full -top-1 -right-1 flex items-center justify-center text-xs h-5 w-5`}
            >
              {unreadCount}
            </div>
          )}
        </Button>
      </DropdownMenuTrigger>
      
      <DropdownMenuContent 
        className={`p-0 outline-0 ${
          isMobile 
            ? 'w-[calc(100vw-3rem)] max-w-sm h-[70vh] mx-4' 
            : 'w-[318px] h-[454px]'
        }`} 
        align={isMobile ? "center" : "end"}
        side={isMobile ? "bottom" : "bottom"}
        sideOffset={isMobile ? 8 : 4}
      >
        <Card className="p-0 border-0  shadow-none h-full flex flex-col">
          {/* Header */}
          <div className={`border-b shrink-0 ${isMobile ? 'p-3' : 'p-5'}`}>
            <div className="flex items-center justify-between">
              <h3 className={`font-semibold ${isMobile ?  "text-base" : "text-lg"}`}>
                Notifications
              </h3>
              {unreadCount > 0 && (
                <Button
                  variant="ghost"
                  size={isMobile ? "default" : "sm"}
                  onClick={markAllAsRead}
                  className={`text-blue-500 hover:text-blue-600/80 ${isMobile ? 'text-xs' : 'text-base'}`}
                >
                  Mark all as read
                </Button>
              )}
            </div>
          </div>

          {/* Scrollable Notifications List */}
          <div className="flex-1 py-0 overflow-hidden">
            <ScrollArea className="h-full">
              <div className='m-0 p-0'>
                {Object.keys(groupedNotifications).length > 0 ? (
  Object.entries(groupedNotifications).map(([groupTitle, group]) => (
    <div key={groupTitle}>
      <h4 className="px-4 pb-1 pt-0 text-muted-foreground text-xs uppercase font-semibold tracking-wider">
        {groupTitle}
      </h4>
      {group.map((notification) => (
        <NotificationItem
          key={notification._id}
          notification={notification}
          onMarkAsRead={markAsRead}
          isMobile={isMobile}
        />
      ))}
    </div>
  ))
) : (
  <div className={`text-center text-muted-foreground ${!isMobile ? 'p-12' : 'p-8'}`}>
    <Bell className={`mx-auto mb-2 opacity-50 ${!isMobile ? 'w-12 h-12' : 'w-8 h-8'}`} />
    <p className={!isMobile ? 'text-base' : 'text-sm'}>No notifications</p>
  </div>
)}

              </div>
            </ScrollArea>
          </div>

          {/* Footer */}
          {notifications.length > 0 && (
            <div className="shrink-0">
              <Button 
                variant="ghost" 
                className={`w-full justify-center rounded-t-none border-t-[1px] text-primary hover:text-primary/80 hover:bg-muted ${
                  !isMobile ? 'h-16 text-base' : 'h-[60px] text-sm'
                }`}
                onClick={handleViewAllNotifications}
              >
                {showAllNotifications ? 'Show Less' : `View All Notifications`}
              </Button>
            </div>
          )}
        </Card>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default NotificationsDropdown;