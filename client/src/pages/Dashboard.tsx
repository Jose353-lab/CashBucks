import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_TITLE, getLoginUrl } from "@/const";
import { trpc } from "@/lib/trpc";
import { Coins, Loader2, Star, TrendingUp, Users, Wallet, Zap } from "lucide-react";
import { Link } from "wouter";
import { useEffect } from "react";

export default function Dashboard() {
  const { isAuthenticated, user, loading: authLoading } = useAuth();
  const { data: stats, isLoading } = trpc.user.getDashboardStats.useQuery(undefined, { enabled: isAuthenticated });
  const { data: profile } = trpc.user.getProfile.useQuery(undefined, { enabled: isAuthenticated });

  useEffect(() => {
    if (!authLoading && !isAuthenticated) window.location.href = getLoginUrl();
  }, [authLoading, isAuthenticated]);

  if (authLoading || !isAuthenticated) {
    return <div className="min-h-screen flex items-center justify-center"><Loader2 className="w-8 h-8 animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <Link href="/"><a className="flex items-center gap-2"><Coins className="w-6 h-6 text-emerald-600" /><span className="font-bold">{APP_TITLE}</span></a></Link>
          <nav className="flex gap-2">
            <Link href="/tasks"><Button variant="ghost" size="sm">Tasks</Button></Link>
            <Link href="/wallet"><Button variant="ghost" size="sm">Wallet</Button></Link>
            <Link href="/referrals"><Button variant="ghost" size="sm">Referrals</Button></Link>
            <Link href="/spin"><Button variant="ghost" size="sm">Spin</Button></Link>
            <Link href="/vip"><Button variant="ghost" size="sm">VIP</Button></Link>
          </nav>
        </div>
      </header>
      <main className="container mx-auto px-4 py-8">
        <div className="bg-emerald-600 rounded-lg p-6 text-white mb-6">
          <h1 className="text-2xl font-bold">Welcome, {user?.name}!</h1>
          <p>Streak: {stats?.dailyStreak || 0} days | VIP: {profile?.vipLevel?.name || 'Starter'}</p>
        </div>
        <div className="grid md:grid-cols-4 gap-4">
          <Card><CardHeader><CardTitle className="text-sm">Balance</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold text-emerald-600">{stats?.balance || 0}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Total Earned</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.totalEarned || 0}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Tasks Done</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.tasksCompleted || 0}</div></CardContent></Card>
          <Card><CardHeader><CardTitle className="text-sm">Referrals</CardTitle></CardHeader><CardContent><div className="text-2xl font-bold">{stats?.referralCount || 0}</div></CardContent></Card>
        </div>
      </main>
    </div>
  );
}