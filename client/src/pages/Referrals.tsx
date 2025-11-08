import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { trpc } from "@/lib/trpc";
import { Copy } from "lucide-react";
import { Link } from "wouter";
import { toast } from "sonner";

export default function Referrals() {
  const { data: profile } = trpc.user.getProfile.useQuery();
  const { data: referrals } = trpc.referrals.getMyReferrals.useQuery();
  const generateMutation = trpc.user.generateReferralCode.useMutation();

  const handleGenerate = async () => {
    const result = await generateMutation.mutateAsync();
    toast.success("Referral code generated!");
  };

  const copyCode = () => {
    if (profile?.user?.referralCode) {
      navigator.clipboard.writeText(profile.user.referralCode);
      toast.success("Code copied!");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <Link href="/dashboard"><Button variant="ghost">← Back</Button></Link>
      <div className="max-w-4xl mx-auto mt-4 space-y-4">
        <Card>
          <CardHeader><CardTitle>Your Referral Code</CardTitle></CardHeader>
          <CardContent>
            {profile?.user?.referralCode ? (
              <div className="flex gap-2">
                <Input value={profile.user.referralCode} readOnly />
                <Button onClick={copyCode}><Copy className="w-4 h-4" /></Button>
              </div>
            ) : (
              <Button onClick={handleGenerate}>Generate Code</Button>
            )}
            <p className="mt-4 text-sm text-gray-600">Share this code and earn Ksh 5 for every friend who joins!</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader><CardTitle>Your Referrals ({referrals?.length || 0})</CardTitle></CardHeader>
          <CardContent>
            {referrals?.map(ref => (
              <div key={ref.id} className="py-2 border-b">
                <div className="font-medium">{ref.referredUser?.name || "User"}</div>
                <div className="text-sm text-gray-600">Joined {new Date(ref.createdAt).toLocaleDateString()}</div>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}