import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import Navigation from "@/components/Navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { apiPost, API_BASE_URL } from "@/lib/api";
import { useToast } from "@/components/ui/use-toast";
import { XCircle, CheckCircle2, Loader2, Mail } from "lucide-react";

interface Invitation {
  id: string;
  project_id: string;
  invited_by_email: string;
  invited_email: string;
  role: string;
  status: string;
  expires_at: string;
  created_at: string;
  projects?: {
    id: string;
    title: string;
  };
}

const DeclineInvite = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const token = searchParams.get("token");
  
  const [invitation, setInvitation] = useState<Invitation | null>(null);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processInvitation = async () => {
      if (!token) {
        setError("No invitation token provided");
        setLoading(false);
        return;
      }

      try {
        // Get invitation details (no auth required)
        const response = await fetch(`${API_BASE_URL}/teams/invitations/${token}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || "Failed to fetch invitation");
        }
        const data = await response.json();
        const inv = data.invitation;
        setInvitation(inv);

        // Auto-decline if pending and not expired
        if (inv.status === 'pending' && new Date(inv.expires_at) >= new Date()) {
          // Check if user is authenticated
          const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('token');
          if (!isAuthenticated) {
            // Store token and redirect to sign in
            localStorage.setItem('pendingInviteToken', token);
            navigate('/signin?redirect=/invitations/decline?token=' + encodeURIComponent(token));
            return;
          }

          // Auto-decline
          setProcessing(true);
          try {
            const declineResponse = await apiPost<{ ok: boolean; message: string }>(
              '/teams/invitations/decline',
              { token }
            );
            localStorage.removeItem('pendingInviteToken');
            toast({
              title: "Invitation Declined",
              description: "You have declined the invitation.",
            });
            // Redirect to homepage after 2 seconds
            setTimeout(() => {
              navigate('/');
            }, 2000);
          } catch (err: any) {
            setError(err.message || "Failed to decline invitation");
            setProcessing(false);
          }
        }
      } catch (err: any) {
        setError(err.message || "Failed to load invitation");
      } finally {
        setLoading(false);
      }
    };

    processInvitation();
  }, [token, navigate, toast]);

  const handleDecline = async () => {
    if (!token) {
      setError("No invitation token provided");
      return;
    }

    // Check if user is authenticated
    const isAuthenticated = typeof window !== 'undefined' && !!localStorage.getItem('token');
    if (!isAuthenticated) {
      // Store the invitation token and redirect to sign in
      localStorage.setItem('pendingInviteToken', token);
      navigate('/signin?redirect=/invitations/decline?token=' + encodeURIComponent(token));
      return;
    }

    setProcessing(true);
    setError(null);

    try {
      const response = await apiPost<{ ok: boolean; message: string }>(
        '/teams/invitations/decline',
        { token }
      );

      toast({
        title: "Invitation Declined",
        description: response.message || "Invitation declined successfully",
      });

      // Clear pending invite token
      localStorage.removeItem('pendingInviteToken');

      // Redirect to homepage
      navigate('/');
    } catch (err: any) {
      setError(err.message || "Failed to decline invitation");
      toast({
        title: "Error",
        description: err.message || "Failed to decline invitation",
        variant: "destructive",
      });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="p-8 max-w-md w-full">
            <div className="flex flex-col items-center space-y-4">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
              <p className="text-muted-foreground">Loading invitation...</p>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (error && !invitation) {
    return (
      <div className="min-h-screen bg-background text-foreground">
        <Navigation />
        <div className="flex items-center justify-center min-h-[calc(100vh-4rem)]">
          <Card className="p-8 max-w-md w-full">
            <div className="flex flex-col items-center space-y-4 text-center">
              <XCircle className="w-12 h-12 text-destructive" />
              <h2 className="text-2xl font-bold">Invitation Not Found</h2>
              <p className="text-muted-foreground">{error}</p>
              <Button onClick={() => navigate('/')} variant="outline">
                Go to Homepage
              </Button>
            </div>
          </Card>
        </div>
      </div>
    );
  }

  if (!invitation) {
    return null;
  }

  const isExpired = new Date(invitation.expires_at) < new Date();
  const isAccepted = invitation.status === 'accepted';
  const isDeclined = invitation.status === 'declined';
  const isPending = invitation.status === 'pending' && !isExpired;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <Navigation />
      <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <Card className="p-8 max-w-md w-full">
          <div className="flex flex-col space-y-6">
            {isAccepted && (
              <div className="flex flex-col items-center space-y-4 text-center">
                <CheckCircle2 className="w-16 h-16 text-green-500" />
                <h2 className="text-2xl font-bold">Invitation Already Accepted</h2>
                <p className="text-muted-foreground">
                  This invitation has already been accepted.
                </p>
                <Button onClick={() => navigate('/projects')}>
                  Go to Projects
                </Button>
              </div>
            )}

            {isDeclined && (
              <div className="flex flex-col items-center space-y-4 text-center">
                <XCircle className="w-16 h-16 text-muted-foreground" />
                <h2 className="text-2xl font-bold">Invitation Declined</h2>
                <p className="text-muted-foreground">
                  You have declined this invitation.
                </p>
                <Button onClick={() => navigate('/')} variant="outline">
                  Go to Homepage
                </Button>
              </div>
            )}

            {isPending && processing && (
              <div className="flex flex-col items-center space-y-4 text-center">
                <Loader2 className="w-16 h-16 animate-spin text-primary" />
                <h2 className="text-2xl font-bold">Declining Invitation...</h2>
                <p className="text-muted-foreground">Please wait while we process your request.</p>
              </div>
            )}

            {isExpired && !isAccepted && !isDeclined && (
              <div className="flex flex-col items-center space-y-4 text-center">
                <XCircle className="w-16 h-16 text-destructive" />
                <h2 className="text-2xl font-bold">Invitation Expired</h2>
                <p className="text-muted-foreground">
                  This invitation has expired. Please contact the project owner for a new invitation.
                </p>
                <Button onClick={() => navigate('/')} variant="outline">
                  Go to Homepage
                </Button>
              </div>
            )}

            {isPending && (
              <>
                <div className="flex flex-col items-center space-y-4 text-center">
                  <Mail className="w-16 h-16 text-primary" />
                  <h2 className="text-2xl font-bold">Decline Invitation?</h2>
                </div>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-muted-foreground">You've been invited to join:</p>
                    <p className="text-lg font-semibold">{invitation.projects?.title || 'Unknown Project'}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Invited by:</p>
                    <p className="text-lg">{invitation.invited_by_email}</p>
                  </div>

                  <div>
                    <p className="text-sm text-muted-foreground">Role:</p>
                    <p className="text-lg capitalize">{invitation.role}</p>
                  </div>

                  <div className="p-3 bg-muted rounded-md">
                    <p className="text-sm text-muted-foreground">
                      Are you sure you want to decline this invitation? This action cannot be undone.
                    </p>
                  </div>

                  {error && (
                    <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-md">
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  )}

                  <div className="flex flex-col space-y-2 pt-4">
                    <Button
                      onClick={handleDecline}
                      disabled={processing}
                      variant="destructive"
                      className="w-full"
                    >
                      {processing ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Declining...
                        </>
                      ) : (
                        <>
                          <XCircle className="w-4 h-4 mr-2" />
                          Decline Invitation
                        </>
                      )}
                    </Button>
                    <Button
                      onClick={() => navigate('/')}
                      variant="outline"
                      className="w-full"
                      disabled={processing}
                    >
                      Cancel
                    </Button>
                  </div>
                </div>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default DeclineInvite;

