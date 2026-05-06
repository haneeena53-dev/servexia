"use client";

import { useNotifications } from "@/context/NotificationContext";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { AuthGuard } from "@/components/layout/AuthGuard";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { 
  Bell, Check, Calendar, MessageSquare, 
  Info, AlertTriangle, ShieldCheck, Clock,
  MoreVertical, CheckCheck
} from "lucide-react";
import { cn, formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/badge";

const iconMap: Record<string, any> = {
  booking: Calendar,
  chat: MessageSquare,
  system: Info,
  alert: AlertTriangle,
  verification: ShieldCheck,
};

export default function NotificationsPage() {
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <SiteHeader />
        
        <main className="flex-grow mx-auto max-w-3xl w-full px-4 py-12 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h1 className="text-3xl font-bold tracking-tight">Notifications</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Stay updated with your bookings and messages
              </p>
            </div>
            {unreadCount > 0 && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="gap-2 text-primary font-bold"
                onClick={markAllAsRead}
              >
                <CheckCheck className="h-4 w-4" /> Mark all as read
              </Button>
            )}
          </div>

          <div className="space-y-4">
            {notifications.length > 0 ? (
              notifications.map((n) => {
                const Icon = iconMap[n.type] || Bell;
                return (
                  <Card 
                    key={n.id} 
                    className={cn(
                      "p-5 transition-all border-border/50 hover:shadow-card relative overflow-hidden group",
                      !n.read ? "bg-primary/5 border-primary/20" : "bg-card"
                    )}
                  >
                    {!n.read && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-primary" />
                    )}
                    
                    <div className="flex gap-4">
                      <div className={cn(
                        "h-12 w-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm",
                        !n.read ? "bg-primary text-primary-foreground" : "bg-secondary text-muted-foreground"
                      )}>
                        <Icon className="h-6 w-6" />
                      </div>
                      
                      <div className="flex-grow min-w-0 pr-6">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className={cn(
                            "font-bold text-sm",
                            !n.read ? "text-foreground" : "text-muted-foreground"
                          )}>
                            {n.title}
                          </h3>
                          <span className="text-[10px] font-medium text-muted-foreground flex items-center gap-1 shrink-0">
                            <Clock className="h-3 w-3" /> {formatDate(n.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-muted-foreground leading-relaxed">
                          {n.message}
                        </p>
                        
                        {!n.read && (
                          <Button 
                            variant="link" 
                            size="sm" 
                            className="h-auto p-0 mt-3 text-[10px] font-bold text-primary"
                            onClick={() => markAsRead(n.id)}
                          >
                            Mark as read
                          </Button>
                        )}
                      </div>
                      
                      <Button variant="ghost" size="icon" className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </div>
                  </Card>
                );
              })
            ) : (
              <div className="py-20 text-center">
                <div className="h-20 w-20 rounded-full bg-secondary flex items-center justify-center mx-auto mb-6">
                  <Bell className="h-10 w-10 text-muted-foreground opacity-20" />
                </div>
                <h3 className="text-xl font-bold">All caught up!</h3>
                <p className="text-muted-foreground text-sm mt-2">
                  No new notifications at the moment. We&apos;ll notify you when something important happens.
                </p>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </AuthGuard>
  );
}
