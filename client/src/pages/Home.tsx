import { useAuth } from "@/_core/hooks/useAuth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { APP_LOGO, APP_TITLE, getLoginUrl } from "@/const";
import { ArrowRight, Coins, Gift, Star, TrendingUp, Users, Zap } from "lucide-react";
import { Link } from "wouter";

export default function Home() {
  const { isAuthenticated, user } = useAuth();

  return (
    <div className="min-h-screen bg-gradient-to-b from-emerald-50 to-white">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Coins className="w-8 h-8 text-emerald-600" />
            <span className="text-2xl font-bold text-emerald-900">{APP_TITLE}</span>
          </div>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (
              <>
                <Link href="/dashboard">
                  <Button variant="ghost">Dashboard</Button>
                </Link>
                <Link href="/tasks">
                  <Button variant="default">Browse Tasks</Button>
                </Link>
              </>
            ) : (
              <>
                <a href={getLoginUrl()}>
                  <Button variant="ghost">Sign In</Button>
                </a>
                <a href={getLoginUrl()}>
                  <Button variant="default">Get Started</Button>
                </a>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="container mx-auto text-center max-w-4xl">
          <div className="inline-block mb-4 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full text-sm font-semibold">
            🎉 Earn Real Money Online in Kenya
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
            Turn Your Time Into <span className="text-emerald-600">Cash</span>
          </h1>
          <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
            Complete simple tasks, refer friends, and spin to win. Earn CB Points and withdraw directly to your M-Pesa account. Start earning today!
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <a href={getLoginUrl()}>
              <Button size="lg" className="gap-2">
                Start Earning Now <ArrowRight className="w-4 h-4" />
              </Button>
            </a>
            <Link href="/vip">
              <Button size="lg" variant="outline" className="gap-2">
                View VIP Benefits <Star className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          
          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 mt-16 max-w-2xl mx-auto">
            <div>
              <div className="text-3xl font-bold text-emerald-600">10,000+</div>
              <div className="text-sm text-gray-600">Active Users</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">Ksh 2M+</div>
              <div className="text-sm text-gray-600">Paid Out</div>
            </div>
            <div>
              <div className="text-3xl font-bold text-emerald-600">500+</div>
              <div className="text-sm text-gray-600">Daily Tasks</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-20 px-4 bg-white">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-12">How It Works</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6 text-emerald-600" />
                </div>
                <CardTitle>Complete Tasks</CardTitle>
                <CardDescription>
                  Browse hundreds of simple tasks like surveys, app installs, and social media engagement. Earn CB Points for each completion.
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="w-6 h-6 text-blue-600" />
                </div>
                <CardTitle>Refer Friends</CardTitle>
                <CardDescription>
                  Share your referral code and earn Ksh 5 for every friend who joins. Reach milestones for bonus rewards up to Ksh 100!
                </CardDescription>
              </CardHeader>
            </Card>
            
            <Card>
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
                  <Gift className="w-6 h-6 text-purple-600" />
                </div>
                <CardTitle>Spin & Win</CardTitle>
                <CardDescription>
                  Try your luck daily with our Spin & Win wheel. Win instant CB Points ranging from 5 to 200 points!
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
      </section>

      {/* VIP Tiers */}
      <section className="py-20 px-4">
        <div className="container mx-auto max-w-6xl">
          <h2 className="text-3xl font-bold text-center mb-4">VIP Rewards Program</h2>
          <p className="text-center text-gray-600 mb-12">Level up to unlock better rewards and faster withdrawals</p>
          
          <div className="grid md:grid-cols-6 gap-4">
            {[
              { level: 0, name: "Starter", color: "gray", multiplier: "1x" },
              { level: 1, name: "Bronze", color: "orange", multiplier: "1.1x" },
              { level: 2, name: "Silver", color: "gray", multiplier: "1.25x" },
              { level: 3, name: "Gold", color: "yellow", multiplier: "1.5x" },
              { level: 4, name: "Platinum", color: "cyan", multiplier: "1.75x" },
              { level: 5, name: "Diamond", color: "blue", multiplier: "2x" }
            ].map((tier) => (
              <Card key={tier.level} className="text-center">
                <CardHeader>
                  <div className="w-16 h-16 mx-auto mb-2 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center">
                    <Star className="w-8 h-8 text-white" />
                  </div>
                  <CardTitle className="text-sm">{tier.name}</CardTitle>
                  <CardDescription className="text-xs">
                    {tier.multiplier} Rewards
                  </CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
          
          <div className="text-center mt-8">
            <Link href="/vip">
              <Button variant="outline">View All Benefits</Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4 bg-emerald-600 text-white">
        <div className="container mx-auto text-center max-w-3xl">
          <TrendingUp className="w-16 h-16 mx-auto mb-6" />
          <h2 className="text-4xl font-bold mb-4">Ready to Start Earning?</h2>
          <p className="text-xl mb-8 text-emerald-100">
            Join thousands of Kenyans earning real money online. Sign up now and get your first task bonus!
          </p>
          <a href={getLoginUrl()}>
            <Button size="lg" variant="secondary" className="gap-2">
              Create Free Account <ArrowRight className="w-4 h-4" />
            </Button>
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-gray-400 py-12 px-4">
        <div className="container mx-auto max-w-6xl">
          <div className="grid md:grid-cols-4 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-4">
                <Coins className="w-6 h-6 text-emerald-500" />
                <span className="text-white font-bold">{APP_TITLE}</span>
              </div>
              <p className="text-sm">
                Earn real money by completing simple tasks. Withdraw directly to M-Pesa.
              </p>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Platform</h3>
              <ul className="space-y-2 text-sm">
                <li><Link href="/tasks"><a className="hover:text-white">Browse Tasks</a></Link></li>
                <li><Link href="/vip"><a className="hover:text-white">VIP Program</a></Link></li>
                <li><Link href="/referrals"><a className="hover:text-white">Referrals</a></Link></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Support</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Help Center</a></li>
                <li><a href="#" className="hover:text-white">Contact Us</a></li>
                <li><a href="#" className="hover:text-white">FAQs</a></li>
              </ul>
            </div>
            <div>
              <h3 className="text-white font-semibold mb-4">Legal</h3>
              <ul className="space-y-2 text-sm">
                <li><a href="#" className="hover:text-white">Terms of Service</a></li>
                <li><a href="#" className="hover:text-white">Privacy Policy</a></li>
              </ul>
            </div>
          </div>
          <div className="border-t border-gray-800 mt-8 pt-8 text-center text-sm">
            <p>&copy; 2024 {APP_TITLE}. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
