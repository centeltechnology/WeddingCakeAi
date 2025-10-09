import { useQuery } from '@tanstack/react-query';
import { Clock, Mail, Eye, CheckCircle, XCircle, FileText, Edit } from 'lucide-react';
import { format } from 'date-fns';

interface QuoteEvent {
  id: string;
  quoteId: string;
  event: 'created' | 'updated' | 'sent' | 'viewed' | 'approved' | 'declined';
  actorUserId: string | null;
  meta: Record<string, any> | null;
  createdAt: string;
}

interface QuoteTimelineProps {
  quoteId: string;
}

const eventConfig = {
  created: {
    icon: FileText,
    color: 'text-blue-600',
    bgColor: 'bg-blue-50',
    label: 'Quote Created'
  },
  updated: {
    icon: Edit,
    color: 'text-gray-600',
    bgColor: 'bg-gray-50',
    label: 'Quote Updated'
  },
  sent: {
    icon: Mail,
    color: 'text-orange-600',
    bgColor: 'bg-orange-50',
    label: 'Quote Sent'
  },
  viewed: {
    icon: Eye,
    color: 'text-purple-600',
    bgColor: 'bg-purple-50',
    label: 'Quote Viewed'
  },
  approved: {
    icon: CheckCircle,
    color: 'text-green-600',
    bgColor: 'bg-green-50',
    label: 'Quote Approved'
  },
  declined: {
    icon: XCircle,
    color: 'text-red-600',
    bgColor: 'bg-red-50',
    label: 'Quote Declined'
  }
};

export function QuoteTimeline({ quoteId }: QuoteTimelineProps) {
  const { data: events, isLoading, error } = useQuery<QuoteEvent[]>({
    queryKey: [`/api/quotes/${quoteId}/events`],
    enabled: !!quoteId,
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8 text-red-600">
        Failed to load quote history
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        No activity yet
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h3 className="text-lg font-semibold">Quote Activity</h3>
      <div className="relative">
        {/* Timeline line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gray-200" />
        
        {/* Events */}
        <div className="space-y-6">
          {events.map((event, index) => {
            const config = eventConfig[event.event];
            const Icon = config.icon;
            
            return (
              <div key={event.id} className="relative flex gap-4">
                {/* Icon */}
                <div className={`relative z-10 flex items-center justify-center w-10 h-10 rounded-full ${config.bgColor}`}>
                  <Icon className={`w-5 h-5 ${config.color}`} />
                </div>
                
                {/* Content */}
                <div className="flex-1 pb-6">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-gray-100">
                        {config.label}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                        {format(new Date(event.createdAt), 'PPp')}
                      </p>
                    </div>
                  </div>
                  
                  {/* Event metadata */}
                  {event.meta && Object.keys(event.meta).length > 0 && (
                    <div className="mt-2 text-sm text-gray-600 dark:text-gray-300">
                      {event.event === 'sent' && event.meta.to && (
                        <p>Sent to: {event.meta.to}</p>
                      )}
                      {event.event === 'sent' && event.meta.subject && (
                        <p className="text-gray-500 dark:text-gray-400">Subject: {event.meta.subject}</p>
                      )}
                      {event.event === 'updated' && event.meta.fields && (
                        <p>Updated fields: {event.meta.fields.join(', ')}</p>
                      )}
                      {event.event === 'viewed' && event.meta.customerEmail && (
                        <p>Customer: {event.meta.customerEmail}</p>
                      )}
                      {event.event === 'declined' && event.meta.reason && (
                        <p className="text-red-600 dark:text-red-400">Reason: {event.meta.reason}</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
