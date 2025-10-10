import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Calendar, 
  Clock, 
  Plus, 
  Trash2,
  Save,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

interface AvailabilitySettingsProps {
  bakerId: string;
}

interface AvailabilityData {
  mode: 'template' | 'custom';
  templateKey?: 'mon-fri-9-5' | 'tue-sat-10-6' | 'weekends-10-4' | 'custom';
  rules?: { dayOfWeek: number; ranges: { start: string; end: string }[] }[];
  exceptions?: { date: string; ranges?: { start: string; end: string }[] }[];
  timeZone: string;
  slotMinutes: number;
  minNoticeMinutes: number;
  maxAdvanceDays: number;
}

const templateOptions = [
  { key: 'mon-fri-9-5', label: 'Monday-Friday, 9 AM - 5 PM', description: 'Standard business hours' },
  { key: 'tue-sat-10-6', label: 'Tuesday-Saturday, 10 AM - 6 PM', description: 'Retail schedule' },
  { key: 'weekends-10-4', label: 'Weekends Only, 10 AM - 4 PM', description: 'Weekend baker' },
];

const dayNames = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

export function AvailabilitySettings({ bakerId }: AvailabilitySettingsProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [availability, setAvailability] = useState<AvailabilityData>({
    mode: 'template',
    templateKey: 'mon-fri-9-5',
    timeZone: 'America/New_York',
    slotMinutes: 60,
    minNoticeMinutes: 1440,
    maxAdvanceDays: 60,
    rules: [],
    exceptions: []
  });

  // Fetch current availability
  const { data: currentAvailability, isLoading } = useQuery<AvailabilityData>({
    queryKey: ['/api/bakers', bakerId, 'availability'],
    queryFn: async () => {
      const response = await fetch(`/api/bakers/${bakerId}/availability`);
      if (!response.ok) throw new Error('Failed to fetch availability');
      const data = await response.json();
      setAvailability(data);
      return data;
    }
  });

  // Update availability
  const updateAvailabilityMutation = useMutation({
    mutationFn: async (availabilityData: AvailabilityData) => {
      const response = await fetch(`/api/bakers/${bakerId}/availability`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(availabilityData),
      });
      
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update availability');
      }
      
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: 'Availability Updated',
        description: 'Your schedule has been saved successfully.',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/bakers', bakerId, 'availability'] });
    },
    onError: (error: any) => {
      toast({
        title: 'Update Failed',
        description: error.message,
        variant: 'destructive',
      });
    },
  });

  const addCustomRule = () => {
    const newRule = {
      dayOfWeek: 1, // Monday
      ranges: [{ start: '09:00', end: '17:00' }]
    };
    
    setAvailability(prev => ({
      ...prev,
      rules: [...(prev.rules || []), newRule]
    }));
  };

  const removeCustomRule = (index: number) => {
    setAvailability(prev => ({
      ...prev,
      rules: prev.rules?.filter((_, i) => i !== index)
    }));
  };

  const updateCustomRule = (index: number, updates: any) => {
    setAvailability(prev => ({
      ...prev,
      rules: prev.rules?.map((rule, i) => i === index ? { ...rule, ...updates } : rule)
    }));
  };

  const handleSave = () => {
    updateAvailabilityMutation.mutate(availability);
  };

  if (isLoading) {
    return (
      <Card data-testid="availability-loading">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Availability Settings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="animate-pulse space-y-3">
            <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 rounded w-1/2"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      <Card data-testid="availability-settings">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Consultation Availability
          </CardTitle>
          <CardDescription>
            Set when customers can book consultations with you
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          
          {/* Mode Selection */}
          <div className="space-y-4">
            <Label className="text-sm font-medium">Schedule Type</Label>
            <RadioGroup
              value={availability.mode}
              onValueChange={(value: 'template' | 'custom') => 
                setAvailability(prev => ({ ...prev, mode: value }))
              }
              data-testid="radio-schedule-mode"
            >
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="template" id="template" />
                <Label htmlFor="template">Use a preset schedule template</Label>
              </div>
              <div className="flex items-center space-x-2">
                <RadioGroupItem value="custom" id="custom" />
                <Label htmlFor="custom">Create custom schedule</Label>
              </div>
            </RadioGroup>
          </div>

          {/* Template Mode */}
          {availability.mode === 'template' && (
            <div className="space-y-4">
              <Label className="text-sm font-medium">Choose Schedule Template</Label>
              <div className="grid gap-3">
                {templateOptions.map((template) => (
                  <div
                    key={template.key}
                    className={`border rounded-lg p-4 cursor-pointer transition-colors ${
                      availability.templateKey === template.key
                        ? 'border-rose-500 bg-rose-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => setAvailability(prev => ({ 
                      ...prev, 
                      templateKey: template.key as any 
                    }))}
                    data-testid={`template-${template.key}`}
                  >
                    <div className="font-medium">{template.label}</div>
                    <div className="text-sm text-gray-500">{template.description}</div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Custom Mode */}
          {availability.mode === 'custom' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <Label className="text-sm font-medium">Custom Schedule Rules</Label>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addCustomRule}
                  data-testid="button-add-custom-rule"
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Add Day
                </Button>
              </div>
              
              {availability.rules && availability.rules.length > 0 ? (
                <div className="space-y-3">
                  {availability.rules.map((rule, index) => (
                    <div key={index} className="border rounded-lg p-4">
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 items-end">
                        <div>
                          <Label className="text-xs">Day of Week</Label>
                          <Select
                            value={rule.dayOfWeek.toString()}
                            onValueChange={(value) => 
                              updateCustomRule(index, { dayOfWeek: parseInt(value) })
                            }
                          >
                            <SelectTrigger data-testid={`select-day-${index}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              {dayNames.map((day, dayIndex) => (
                                <SelectItem key={dayIndex} value={dayIndex.toString()}>
                                  {day}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        
                        <div>
                          <Label className="text-xs">Start Time</Label>
                          <Input
                            type="time"
                            value={rule.ranges[0]?.start || '09:00'}
                            onChange={(e) => {
                              const newRanges = [{ 
                                start: e.target.value, 
                                end: rule.ranges[0]?.end || '17:00' 
                              }];
                              updateCustomRule(index, { ranges: newRanges });
                            }}
                            data-testid={`input-start-${index}`}
                          />
                        </div>
                        
                        <div>
                          <Label className="text-xs">End Time</Label>
                          <Input
                            type="time"
                            value={rule.ranges[0]?.end || '17:00'}
                            onChange={(e) => {
                              const newRanges = [{ 
                                start: rule.ranges[0]?.start || '09:00', 
                                end: e.target.value 
                              }];
                              updateCustomRule(index, { ranges: newRanges });
                            }}
                            data-testid={`input-end-${index}`}
                          />
                        </div>
                        
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => removeCustomRule(index)}
                          data-testid={`button-remove-rule-${index}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Calendar className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No schedule rules added yet. Click "Add Day" to get started.</p>
                </div>
              )}
            </div>
          )}

          {/* Advanced Settings */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="slotMinutes" className="text-sm font-medium">
                Appointment Duration (minutes)
              </Label>
              <Select
                value={availability.slotMinutes.toString()}
                onValueChange={(value) => 
                  setAvailability(prev => ({ ...prev, slotMinutes: parseInt(value) }))
                }
              >
                <SelectTrigger data-testid="select-slot-minutes">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="30">30 minutes</SelectItem>
                  <SelectItem value="60">1 hour</SelectItem>
                  <SelectItem value="90">1.5 hours</SelectItem>
                  <SelectItem value="120">2 hours</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="minNotice" className="text-sm font-medium">
                Minimum Notice (hours)
              </Label>
              <Select
                value={(availability.minNoticeMinutes / 60).toString()}
                onValueChange={(value) => 
                  setAvailability(prev => ({ ...prev, minNoticeMinutes: parseInt(value) * 60 }))
                }
              >
                <SelectTrigger data-testid="select-min-notice">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2">2 hours</SelectItem>
                  <SelectItem value="4">4 hours</SelectItem>
                  <SelectItem value="24">24 hours</SelectItem>
                  <SelectItem value="48">2 days</SelectItem>
                  <SelectItem value="72">3 days</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="maxAdvance" className="text-sm font-medium">
                Max Advance Booking (days)
              </Label>
              <Select
                value={availability.maxAdvanceDays.toString()}
                onValueChange={(value) => 
                  setAvailability(prev => ({ ...prev, maxAdvanceDays: parseInt(value) }))
                }
              >
                <SelectTrigger data-testid="select-max-advance">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">1 week</SelectItem>
                  <SelectItem value="14">2 weeks</SelectItem>
                  <SelectItem value="30">1 month</SelectItem>
                  <SelectItem value="60">2 months</SelectItem>
                  <SelectItem value="90">3 months</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Schedule Preview */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h4 className="font-medium mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Schedule Preview
            </h4>
            
            {availability.mode === 'template' ? (
              <div className="space-y-2">
                <Badge variant="secondary" className="mb-2">
                  {templateOptions.find(t => t.key === availability.templateKey)?.label || 'Custom Schedule'}
                </Badge>
                <p className="text-sm text-gray-600">
                  Customers can book {availability.slotMinutes}-minute appointments with {availability.minNoticeMinutes / 60} hours notice, up to {availability.maxAdvanceDays} days in advance.
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                {availability.rules && availability.rules.length > 0 ? (
                  <>
                    {availability.rules.map((rule, index) => (
                      <div key={index} className="text-sm">
                        <span className="font-medium">{dayNames[rule.dayOfWeek]}:</span>{' '}
                        {rule.ranges.map(range => `${range.start} - ${range.end}`).join(', ')}
                      </div>
                    ))}
                    <p className="text-sm text-gray-600 mt-2">
                      {availability.slotMinutes}-minute appointments, {availability.minNoticeMinutes / 60}h notice, {availability.maxAdvanceDays} days advance
                    </p>
                  </>
                ) : (
                  <p className="text-sm text-gray-500">No custom schedule rules defined</p>
                )}
              </div>
            )}
          </div>

          {/* Save Button */}
          <div className="flex justify-end">
            <Button
              onClick={handleSave}
              disabled={updateAvailabilityMutation.isPending}
              className="bg-rose-600 hover:bg-rose-700 text-white"
              data-testid="button-save-availability"
            >
              {updateAvailabilityMutation.isPending ? (
                <>
                  <Clock className="h-4 w-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  <Save className="h-4 w-4 mr-2" />
                  Save Schedule
                </>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}