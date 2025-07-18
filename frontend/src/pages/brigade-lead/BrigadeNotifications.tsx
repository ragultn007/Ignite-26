import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { notificationsApi } from '@/api/notifications'
import { UserNotification, PaginatedResponse } from '@/types'
import { Search, Bell, CheckCircle, RotateCcw, Shield } from 'lucide-react'
import LoadingSpinner from '@/components/ui/LoadingSpinner'
import { toast } from 'sonner'
import { formatDateTime } from '@/lib/utils'

export default function BrigadeNotifications() {
  const [notifications, setNotifications] = useState<UserNotification[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [showUnreadOnly, setShowUnreadOnly] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  const [pagination, setPagination] = useState({
    currentPage: 1,
    totalPages: 1,
    totalItems: 0,
    itemsPerPage: 10
  })

  useEffect(() => {
    fetchNotifications()
    fetchUnreadCount()
  }, [pagination.currentPage, showUnreadOnly])

  useEffect(() => {
    if (searchTerm) {
      const delayedSearch = setTimeout(() => {
        fetchNotifications()
      }, 300)
      return () => clearTimeout(delayedSearch)
    } else {
      fetchNotifications()
    }
  }, [searchTerm])

  const fetchNotifications = async () => {
    try {
      setLoading(true)
      const response = await notificationsApi.getNotifications({
        page: pagination.currentPage,
        limit: pagination.itemsPerPage,
        unreadOnly: showUnreadOnly
      })
      
      // Filter by search term if provided
      let filteredNotifications = response.data
      if (searchTerm) {
        filteredNotifications = response.data.filter(notification =>
          notification.notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          notification.notification.message.toLowerCase().includes(searchTerm.toLowerCase())
        )
      }
      
      setNotifications(filteredNotifications)
      setPagination(response.pagination)
    } catch (error) {
      toast.error('Failed to fetch notifications')
    } finally {
      setLoading(false)
    }
  }

  const fetchUnreadCount = async () => {
    try {
      const response = await notificationsApi.getUnreadCount()
      setUnreadCount(response.count)
    } catch (error) {
      console.error('Failed to fetch unread count')
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await notificationsApi.markAsRead(id)
      toast.success('Notification marked as read', { duration: 2000 })
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      toast.error('Failed to mark notification as read')
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await notificationsApi.markAllAsRead()
      toast.success('All notifications marked as read', { duration: 2000 })
      fetchNotifications()
      fetchUnreadCount()
    } catch (error) {
      toast.error('Failed to mark all notifications as read')
    }
  }

  const getTypeBadgeVariant = (type: string) => {
    switch (type) {
      case 'SUCCESS': return 'default'
      case 'WARNING': return 'secondary'
      case 'ERROR': return 'destructive'
      case 'INFO': return 'outline'
      default: return 'outline'
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'SUCCESS': return '✅'
      case 'WARNING': return '⚠️'
      case 'ERROR': return '❌'
      case 'INFO': return 'ℹ️'
      default: return 'ℹ️'
    }
  }

  const getPriorityIcon = (targetRole: string | undefined, isGlobal: boolean) => {
    if (isGlobal) return '🌐'
    if (targetRole === 'BRIGADE_LEAD') return '🎯'
    return ''
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <div className="flex items-center gap-3">
            <Shield className="h-8 w-8 text-blue-600" />
            <div>
              <h1 className="text-3xl font-bold text-gray-900">Brigade Notifications</h1>
              <p className="text-gray-600 mt-1">
                Leadership announcements and important updates
                {unreadCount > 0 && (
                  <span className="ml-2 text-blue-600 font-medium">
                    ({unreadCount} unread)
                  </span>
                )}
              </p>
            </div>
          </div>
        </div>
        {unreadCount > 0 && (
          <Button onClick={handleMarkAllAsRead} variant="outline">
            <CheckCircle className="h-4 w-4 mr-2" />
            Mark All as Read
          </Button>
        )}
      </div>

      {/* Filters and Search */}
      <Card>
        <CardContent className="p-6">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search notifications..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex items-center gap-4">
              <Button
                variant={showUnreadOnly ? "default" : "outline"}
                onClick={() => setShowUnreadOnly(!showUnreadOnly)}
                className="whitespace-nowrap"
              >
                <RotateCcw className="h-4 w-4 mr-2" />
                {showUnreadOnly ? 'Show All' : 'Unread Only'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Notifications List */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Bell className="h-5 w-5" />
            Brigade Notifications
          </CardTitle>
          <CardDescription>
            {pagination.totalItems} total notifications
            {showUnreadOnly && ' (unread only)'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex justify-center py-8">
              <LoadingSpinner />
            </div>
          ) : notifications.length === 0 ? (
            <div className="text-center py-8">
              <Bell className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500">
                {showUnreadOnly ? 'No unread notifications' : 'No notifications found'}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {notifications.map((userNotification) => (
                <div
                  key={userNotification.id}
                  className={`p-4 border rounded-lg transition-colors ${
                    !userNotification.isRead
                      ? 'bg-blue-50 border-blue-200 hover:bg-blue-100'
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-2">
                        {!userNotification.isRead && (
                          <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                        )}
                        <span className="text-lg">
                          {getTypeIcon(userNotification.notification.type)}
                        </span>
                        {getPriorityIcon(
                          userNotification.notification.targetRole,
                          userNotification.notification.isGlobal
                        ) && (
                          <span className="text-lg">
                            {getPriorityIcon(
                              userNotification.notification.targetRole,
                              userNotification.notification.isGlobal
                            )}
                          </span>
                        )}
                        <h3 className="font-medium text-lg">
                          {userNotification.notification.title}
                        </h3>
                        <Badge variant={getTypeBadgeVariant(userNotification.notification.type)}>
                          {userNotification.notification.type}
                        </Badge>
                        {userNotification.notification.isGlobal && (
                          <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200">
                            Global
                          </Badge>
                        )}
                        {userNotification.notification.targetRole === 'BRIGADE_LEAD' && (
                          <Badge variant="secondary" className="bg-blue-50 text-blue-700 border-blue-200">
                            Brigade Leaders
                          </Badge>
                        )}
                      </div>
                      <p className="text-gray-600 mb-3 leading-relaxed">
                        {userNotification.notification.message}
                      </p>
                      <div className="flex items-center gap-4 text-sm text-gray-500">
                        <span>
                          Received: {formatDateTime(userNotification.createdAt)}
                        </span>
                        {userNotification.notification.expiresAt && (
                          <span className="text-amber-600">
                            Expires: {formatDateTime(userNotification.notification.expiresAt)}
                          </span>
                        )}
                        {userNotification.readAt && (
                          <span>
                            Read: {formatDateTime(userNotification.readAt)}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      <Badge variant={userNotification.isRead ? "secondary" : "default"}>
                        {userNotification.isRead ? 'Read' : 'Unread'}
                      </Badge>
                      {!userNotification.isRead && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleMarkAsRead(userNotification.id)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <CheckCircle className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-6">
              <p className="text-sm text-gray-500">
                Showing {((pagination.currentPage - 1) * pagination.itemsPerPage) + 1} to{' '}
                {Math.min(pagination.currentPage * pagination.itemsPerPage, pagination.totalItems)} of{' '}
                {pagination.totalItems} results
              </p>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage - 1 }))}
                  disabled={pagination.currentPage === 1}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.currentPage} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setPagination(prev => ({ ...prev, currentPage: prev.currentPage + 1 }))}
                  disabled={pagination.currentPage === pagination.totalPages}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}