"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Button } from "@/components/ui/button"
import {
    Popover,
    PopoverContent,
    PopoverTrigger,
} from "@/components/ui/popover"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { formatDistanceToNow } from "date-fns"
import { pl } from "date-fns/locale"

interface Notification {
    id: string
    title: string
    body: string
    readAt: string | null
    createdAt: string
    href?: string
}

export function NotificationBell() {
    const [unreadCount, setUnreadCount] = useState(0)
    const [notifications, setNotifications] = useState<Notification[]>([])
    const [isOpen, setIsOpen] = useState(false)

    // Polling unread count
    useEffect(() => {
        const fetchCount = async () => {
            try {
                const res = await fetch("/api/notifications/unread-count")
                const data = await res.json()
                setUnreadCount(data.count)
            } catch (error) {
                console.error("Failed to fetch notification count", error)
            }
        }

        fetchCount()
        const interval = setInterval(fetchCount, 15000) // Poll every 15s
        return () => clearInterval(interval)
    }, [])

    // Fetch notifications when popover opens
    useEffect(() => {
        if (isOpen) {
            const fetchNotifications = async () => {
                try {
                    const res = await fetch("/api/notifications/latest")
                    const data = await res.json()
                    setNotifications(data)
                } catch (error) {
                    console.error("Failed to fetch notifications", error)
                }
            }
            fetchNotifications()
        }
    }, [isOpen])

    const markAsRead = async (id?: string) => {
        try {
            await fetch("/api/notifications/mark-read", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(id ? { notificationIds: [id] } : { markAll: true })
            })

            // Update local state optimistic
            if (id) {
                setNotifications(prev => prev.map(n => n.id === id ? { ...n, readAt: new Date().toISOString() } : n))
                setUnreadCount(prev => Math.max(0, prev - 1))
            } else {
                setNotifications(prev => prev.map(n => ({ ...n, readAt: new Date().toISOString() })))
                setUnreadCount(0)
            }
        } catch (error) {
            console.error("Failed to mark as read", error)
        }
    }

    return (
        <Popover open={isOpen} onOpenChange={setIsOpen}>
            <PopoverTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute top-2 right-2 h-2 w-2 rounded-full bg-destructive animate-pulse ring-2 ring-background" />
                    )}
                    <span className="sr-only">Powiadomienia</span>
                </Button>
            </PopoverTrigger>
            <PopoverContent className="w-80 p-0" align="end">
                <div className="flex items-center justify-between p-4 border-b">
                    <h4 className="font-semibold text-sm">Powiadomienia</h4>
                    {unreadCount > 0 && (
                        <Button
                            variant="ghost"
                            size="sm"
                            className="h-auto px-2 text-xs text-muted-foreground hover:text-foreground"
                            onClick={() => markAsRead()}
                        >
                            Oznacz wszystkie jako przeczytane
                        </Button>
                    )}
                </div>
                <ScrollArea className="h-[300px]">
                    {notifications.length === 0 ? (
                        <div className="flex flex-col items-center justify-center h-full p-4 text-center text-muted-foreground">
                            <Bell className="h-8 w-8 mb-2 opacity-20" />
                            <p className="text-sm">Brak nowych powiadomień</p>
                        </div>
                    ) : (
                        <div className="divide-y relative">
                            {notifications.map((notification) => (
                                <div
                                    key={notification.id}
                                    className={cn(
                                        "p-4 transition-colors hover:bg-muted/50 cursor-pointer",
                                        !notification.readAt && "bg-muted/20"
                                    )}
                                    // onClick={() => !notification.readAt && markAsRead(notification.id)}
                                    onMouseEnter={() => !notification.readAt && markAsRead(notification.id)}
                                >
                                    <div className="flex gap-3 items-start">
                                        {!notification.readAt && (
                                            <div className="mt-1.5 h-2 w-2 shrink-0 rounded-full bg-blue-500" />
                                        )}
                                        <div className="flex-1 space-y-1">
                                            <p className={cn("text-sm font-medium leading-none", !notification.readAt && "text-blue-600 dark:text-blue-400")}>
                                                {notification.title}
                                            </p>
                                            <p className="text-sm text-muted-foreground break-words line-clamp-3">
                                                {notification.body}
                                            </p>
                                            <p className="text-[10px] text-muted-foreground pt-1">
                                                {formatDistanceToNow(new Date(notification.createdAt), { addSuffix: true, locale: pl })}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </ScrollArea>
            </PopoverContent>
        </Popover>
    )
}
