import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import {
  Users,
  UserPlus,
  Mail,
  Shield,
  Settings,
  Trash2,
  Edit,
  Clock,
  CheckCircle,
  AlertCircle,
  Crown,
  Eye,
  FileEdit,
  DollarSign,
  UserCheck
} from 'lucide-react';

interface TeamMember {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'editor' | 'viewer';
  status: 'active' | 'pending' | 'suspended';
  invitedAt: string;
  lastActive?: string;
  permissions: string[];
}

interface TeamInvitation {
  id: string;
  email: string;
  role: 'admin' | 'editor' | 'viewer';
  invitedBy: string;
  invitedAt: string;
  expiresAt: string;
  status: 'pending' | 'accepted' | 'expired';
}

interface TeamManagementProps {
  bakerId: string;
}

const rolePermissions = {
  owner: {
    label: 'Owner',
    description: 'Full access to everything including team management and billing',
    permissions: ['*'],
    color: 'bg-purple-100 text-purple-800',
    icon: Crown
  },
  admin: {
    label: 'Administrator', 
    description: 'Can manage team members and access most features',
    permissions: ['team.manage', 'quotes.manage', 'customers.manage', 'analytics.view', 'settings.manage'],
    color: 'bg-red-100 text-red-800',
    icon: Shield
  },
  editor: {
    label: 'Editor',
    description: 'Can create and edit quotes, manage customers',
    permissions: ['quotes.create', 'quotes.edit', 'customers.manage', 'analytics.view'],
    color: 'bg-blue-100 text-blue-800',
    icon: FileEdit
  },
  viewer: {
    label: 'Viewer',
    description: 'Can view quotes and customer information only',
    permissions: ['quotes.view', 'customers.view', 'analytics.view'],
    color: 'bg-gray-100 text-gray-800',
    icon: Eye
  }
};

export function TeamManagement({ bakerId }: TeamManagementProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedTab, setSelectedTab] = useState('members');
  const [inviteDialogOpen, setInviteDialogOpen] = useState(false);
  const [editMemberDialogOpen, setEditMemberDialogOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState<TeamMember | null>(null);

  // Fetch team members
  const { data: teamMembers = [], isLoading: membersLoading } = useQuery<TeamMember[]>({
    queryKey: [`/api/teams/${bakerId}/members`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/teams/${bakerId}/members`);
      return response.json();
    },
  });

  // Fetch team invitations
  const { data: invitations = [], isLoading: invitationsLoading } = useQuery<TeamInvitation[]>({
    queryKey: [`/api/teams/${bakerId}/invitations`],
    queryFn: async () => {
      const response = await apiRequest('GET', `/api/teams/${bakerId}/invitations`);
      return response.json();
    },
  });

  // Invite team member mutation
  const inviteMutation = useMutation({
    mutationFn: async (inviteData: { email: string; role: string }) => {
      const response = await apiRequest('POST', `/api/teams/${bakerId}/invite`, inviteData);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Invitation sent!",
        description: "The team member will receive an email invitation.",
      });
      setInviteDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${bakerId}/invitations`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to send invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update member role mutation
  const updateRoleMutation = useMutation({
    mutationFn: async ({ memberId, role }: { memberId: string; role: string }) => {
      const response = await apiRequest('PUT', `/api/teams/${bakerId}/members/${memberId}`, { role });
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Role updated",
        description: "Team member role has been updated successfully.",
      });
      setEditMemberDialogOpen(false);
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${bakerId}/members`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to update role",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Remove member mutation
  const removeMemberMutation = useMutation({
    mutationFn: async (memberId: string) => {
      await apiRequest('DELETE', `/api/teams/${bakerId}/members/${memberId}`);
    },
    onSuccess: () => {
      toast({
        title: "Member removed",
        description: "Team member has been removed from the team.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${bakerId}/members`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to remove member",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Cancel invitation mutation
  const cancelInvitationMutation = useMutation({
    mutationFn: async (invitationId: string) => {
      await apiRequest('DELETE', `/api/teams/${bakerId}/invitations/${invitationId}`);
    },
    onSuccess: () => {
      toast({
        title: "Invitation cancelled",
        description: "The invitation has been cancelled.",
      });
      queryClient.invalidateQueries({ queryKey: [`/api/teams/${bakerId}/invitations`] });
    },
    onError: (error: any) => {
      toast({
        title: "Failed to cancel invitation",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'pending': return <Clock className="h-4 w-4 text-yellow-600" />;
      case 'suspended': return <AlertCircle className="h-4 w-4 text-red-600" />;
      default: return null;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-100 text-green-800';
      case 'pending': return 'bg-yellow-100 text-yellow-800';
      case 'suspended': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const InviteDialog = () => {
    const [inviteForm, setInviteForm] = useState({ email: '', role: 'viewer' });

    const handleSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (inviteForm.email && inviteForm.role) {
        inviteMutation.mutate(inviteForm);
      }
    };

    return (
      <Dialog open={inviteDialogOpen} onOpenChange={setInviteDialogOpen}>
        <DialogTrigger asChild>
          <Button data-testid="button-invite-member">
            <UserPlus className="h-4 w-4 mr-2" />
            Invite Team Member
          </Button>
        </DialogTrigger>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Invite Team Member</DialogTitle>
            <DialogDescription>
              Send an invitation to add a new member to your team.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={inviteForm.email}
                onChange={(e) => setInviteForm(prev => ({ ...prev, email: e.target.value }))}
                data-testid="input-invite-email"
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={inviteForm.role}
                onValueChange={(value) => setInviteForm(prev => ({ ...prev, role: value }))}
              >
                <SelectTrigger data-testid="select-invite-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rolePermissions).filter(([key]) => key !== 'owner').map(([key, role]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <role.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => setInviteDialogOpen(false)}
              >
                Cancel
              </Button>
              <Button
                type="submit"
                disabled={inviteMutation.isPending}
                data-testid="button-send-invitation"
              >
                {inviteMutation.isPending ? 'Sending...' : 'Send Invitation'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    );
  };

  const EditMemberDialog = () => {
    const [selectedRole, setSelectedRole] = useState<'owner' | 'admin' | 'editor' | 'viewer'>(selectedMember?.role || 'viewer');

    const handleSubmit = () => {
      if (selectedMember && selectedRole) {
        updateRoleMutation.mutate({ memberId: selectedMember.id, role: selectedRole });
      }
    };

    return (
      <Dialog open={editMemberDialogOpen} onOpenChange={setEditMemberDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Team Member</DialogTitle>
            <DialogDescription>
              Update {selectedMember?.name}'s role and permissions.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Role</Label>
              <Select value={selectedRole} onValueChange={(value: 'owner' | 'admin' | 'editor' | 'viewer') => setSelectedRole(value)}>
                <SelectTrigger data-testid="select-edit-role">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(rolePermissions).filter(([key]) => 
                    key !== 'owner' || selectedMember?.role === 'owner'
                  ).map(([key, role]) => (
                    <SelectItem key={key} value={key}>
                      <div className="flex items-center space-x-2">
                        <role.icon className="h-4 w-4" />
                        <div>
                          <div className="font-medium">{role.label}</div>
                          <div className="text-xs text-muted-foreground">{role.description}</div>
                        </div>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            {selectedRole && rolePermissions[selectedRole as keyof typeof rolePermissions] && (
              <div className="space-y-2">
                <Label>Permissions</Label>
                <div className="p-3 bg-muted rounded-lg">
                  <div className="text-sm text-muted-foreground mb-2">This role includes:</div>
                  <div className="flex flex-wrap gap-1">
                    {rolePermissions[selectedRole as keyof typeof rolePermissions].permissions.map(permission => (
                      <Badge key={permission} variant="outline" className="text-xs">
                        {permission === '*' ? 'All permissions' : permission}
                      </Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setEditMemberDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateRoleMutation.isPending}
              data-testid="button-save-member-changes"
            >
              {updateRoleMutation.isPending ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    );
  };

  if (membersLoading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Team Management</h1>
        <div className="animate-pulse">
          <div className="h-4 bg-muted rounded w-64 mb-4"></div>
          <div className="space-y-3">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-16 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Team Management</h1>
          <p className="text-muted-foreground">Manage your team members and their permissions</p>
        </div>
        <InviteDialog />
      </div>

      {/* Team Stats */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Members</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Members</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{teamMembers.filter(m => m.status === 'active').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pending Invites</CardTitle>
            <Mail className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invitations.filter(i => i.status === 'pending').length}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Roles</CardTitle>
            <Shield className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{new Set(teamMembers.map(m => m.role)).size}</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="members" data-testid="tab-team-members">Team Members</TabsTrigger>
          <TabsTrigger value="invitations" data-testid="tab-team-invitations">Invitations</TabsTrigger>
          <TabsTrigger value="roles" data-testid="tab-team-roles">Roles & Permissions</TabsTrigger>
        </TabsList>

        <TabsContent value="members" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Team Members</CardTitle>
              <CardDescription>Manage your team members and their roles</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {teamMembers.map((member) => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div className="w-10 h-10 bg-gradient-to-r from-pink-400 to-purple-400 rounded-full flex items-center justify-center text-white font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <h3 className="font-medium">{member.name}</h3>
                          <Badge className={rolePermissions[member.role].color}>
                            {rolePermissions[member.role].label}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{member.email}</p>
                        <div className="flex items-center space-x-4 mt-1">
                          <div className="flex items-center space-x-1">
                            {getStatusIcon(member.status)}
                            <Badge variant="outline" className={getStatusColor(member.status)}>
                              {member.status}
                            </Badge>
                          </div>
                          {member.lastActive && (
                            <span className="text-xs text-muted-foreground">
                              Last active: {new Date(member.lastActive).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedMember(member);
                          setEditMemberDialogOpen(true);
                        }}
                        data-testid={`button-edit-member-${member.id}`}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      {member.role !== 'owner' && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => removeMemberMutation.mutate(member.id)}
                          disabled={removeMemberMutation.isPending}
                          data-testid={`button-remove-member-${member.id}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </div>
                ))}
                
                {teamMembers.length === 0 && (
                  <div className="text-center py-12">
                    <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No team members yet</h3>
                    <p className="text-muted-foreground mb-4">
                      Invite team members to collaborate on your bakery business.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="invitations" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pending Invitations</CardTitle>
              <CardDescription>Manage sent invitations to join your team</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {invitations.map((invitation) => (
                  <div key={invitation.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <Mail className="h-8 w-8 text-muted-foreground" />
                      <div>
                        <h3 className="font-medium">{invitation.email}</h3>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={rolePermissions[invitation.role].color}>
                            {rolePermissions[invitation.role].label}
                          </Badge>
                          <Badge variant="outline" className={getStatusColor(invitation.status)}>
                            {invitation.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground mt-1">
                          Invited {new Date(invitation.invitedAt).toLocaleDateString()} • 
                          Expires {new Date(invitation.expiresAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => cancelInvitationMutation.mutate(invitation.id)}
                      disabled={cancelInvitationMutation.isPending}
                      data-testid={`button-cancel-invitation-${invitation.id}`}
                    >
                      Cancel
                    </Button>
                  </div>
                ))}
                
                {invitations.length === 0 && (
                  <div className="text-center py-12">
                    <Mail className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h3 className="text-lg font-medium mb-2">No pending invitations</h3>
                    <p className="text-muted-foreground">
                      All sent invitations have been accepted or expired.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="roles" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {Object.entries(rolePermissions).map(([key, role]) => (
              <Card key={key}>
                <CardHeader>
                  <div className="flex items-center space-x-2">
                    <role.icon className="h-5 w-5" />
                    <CardTitle>{role.label}</CardTitle>
                  </div>
                  <CardDescription>{role.description}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div>
                      <Label className="text-sm font-medium">Permissions:</Label>
                      <div className="flex flex-wrap gap-1 mt-1">
                        {role.permissions.map(permission => (
                          <Badge key={permission} variant="outline" className="text-xs">
                            {permission === '*' ? 'All permissions' : permission}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {teamMembers.filter(m => m.role === key).length} member{teamMembers.filter(m => m.role === key).length !== 1 ? 's' : ''}
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>
      </Tabs>

      {/* Edit Member Dialog */}
      <EditMemberDialog />
    </div>
  );
}