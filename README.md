# CashBucks - Earn Rewards Platform

A comprehensive task-based rewards platform built for the African market, enabling users to earn money by completing simple tasks, referring friends, and participating in gamification features.

## 🌟 Features

### User Features
- **Task System**: Browse and complete various tasks (surveys, app installs, social media engagement)
- **CB Points Wallet**: Earn and manage CB Points (1 CB Point = 1 Ksh)
- **M-Pesa Withdrawals**: Direct withdrawal to M-Pesa accounts
- **Referral System**: Earn Ksh 5 per referral + milestone bonuses
- **VIP Tiers**: 6 levels (Starter → Diamond) with increasing reward multipliers
- **Spin & Win**: Daily wheel spin for instant CB Points rewards
- **Real-time Notifications**: Stay updated on earnings and approvals
- **Daily Login Streaks**: Bonus rewards for consistent engagement

### Admin Features
- **User Management**: View and manage all users, adjust VIP levels
- **Task Approval**: Review and approve business-submitted tasks
- **Withdrawal Management**: Approve/reject withdrawal requests
- **Task Completion Review**: Verify task completions with proof
- **Platform Settings**: Configure rewards, bonuses, and system parameters
- **Analytics Dashboard**: Track platform metrics and user activity

### Business Portal
- **Task Creation**: Submit tasks for user completion
- **Campaign Management**: Track task performance and completions
- **Wallet System**: Manage business credits for task rewards
- **Analytics**: View completion rates and user engagement

## 🏗️ Tech Stack

- **Frontend**: React 19 + TypeScript + Tailwind CSS 4
- **Backend**: Node.js + Express + tRPC 11
- **Database**: MySQL with Drizzle ORM
- **Authentication**: Built-in OAuth system
- **Deployment**: Manus Platform

## 📊 Database Schema

### Core Tables
- `users` - User accounts with VIP levels and roles
- `wallets` - CB Points balance tracking
- `transactions` - All financial transactions
- `tasks` - Available tasks from businesses
- `task_completions` - User task submissions
- `withdrawals` - Withdrawal requests and approvals
- `referrals` - Referral tracking and bonuses
- `vip_levels` - VIP tier definitions and benefits
- `spin_rewards` - Spin & Win reward configurations
- `businesses` - Business/advertiser accounts
- `notifications` - User notifications
- `login_logs` - Security and analytics tracking
- `fraud_logs` - Fraud detection records
- `settings` - Platform configuration

## 🚀 Getting Started

### Prerequisites
- Node.js 22+
- MySQL database
- Manus Platform account

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd cashbucks
   ```

2. **Install dependencies**
   ```bash
   pnpm install
   ```

3. **Set up environment variables**
   Configure in Management UI → Settings → Secrets or `.env` file:
   ```
   DATABASE_URL=mysql://user:password@host:port/database
   JWT_SECRET=your_jwt_secret
   # Add M-Pesa credentials when ready (see INTEGRATION_GUIDE.md)
   ```

4. **Initialize database**
   ```bash
   pnpm db:push
   ```

5. **Seed initial data**
   ```bash
   pnpm exec tsx scripts/seed.mjs
   ```

6. **Start development server**
   ```bash
   pnpm dev
   ```

## 📱 User Roles

### User (Default)
- Complete tasks
- Earn CB Points
- Request withdrawals
- Refer friends
- Spin & Win
- View VIP progress

### Business
- Create tasks
- Manage campaigns
- Track completions
- Manage wallet

### Admin
- Full platform access
- User management
- Task approval
- Withdrawal processing
- System configuration

## 💰 VIP Tier System

| Level | Name | Tasks Required | Earnings Required | Reward Multiplier | Withdrawal Cooldown |
|-------|------|----------------|-------------------|-------------------|---------------------|
| 0 | Starter | 0 | 0 | 1.0x | 14 days |
| 1 | Bronze | 10 | 500 | 1.1x | 10 days |
| 2 | Silver | 50 | 2,500 | 1.25x | 7 days |
| 3 | Gold | 150 | 7,500 | 1.5x | 5 days |
| 4 | Platinum | 300 | 15,000 | 1.75x | 3 days |
| 5 | Diamond | 500 | 25,000 | 2.0x | 1 day |

## 🎯 Referral System

- **Base Bonus**: Ksh 5 per successful referral
- **Milestone Bonus**: Ksh 100 for every 50 referrals
- **Leaderboard**: Top referrers featured on platform
- **Lifetime Tracking**: All referrals tracked permanently

## 🎰 Spin & Win

- **Cooldown**: 24 hours between spins
- **Rewards**: 5 to 200 CB Points
- **Probability-based**: Configured reward distribution
- **History Tracking**: View all spin results

## 🔒 Security Features

- **2FA Support**: Two-factor authentication ready
- **Fraud Detection**: Automated suspicious activity logging
- **Login Tracking**: All login attempts recorded
- **Rate Limiting**: Prevent abuse on critical endpoints
- **Role-based Access**: Strict permission controls

## 📈 Analytics & Tracking

- **User Metrics**: Track engagement, earnings, and activity
- **Task Performance**: Monitor completion rates and quality
- **Financial Tracking**: All transactions logged and auditable
- **Referral Analytics**: Track referral performance and bonuses
- **VIP Progression**: Monitor user tier advancement

## 🔌 Integrations

### Current Status: Placeholder
All integrations are currently in **mock mode**. See `INTEGRATION_GUIDE.md` for implementation details.

- **M-Pesa**: Withdrawal processing (placeholder)
- **SMS (Africa's Talking)**: OTP and notifications (placeholder)
- **Firebase**: Push notifications (optional)
- **AdSense**: Monetization (optional)

## 📝 API Documentation

The platform uses tRPC for type-safe API communication. All endpoints are defined in `server/routers.ts`.

### Main Routers
- `auth.*` - Authentication and session management
- `user.*` - User profile and dashboard
- `wallet.*` - Balance and transactions
- `tasks.*` - Task browsing and completion
- `vip.*` - VIP tier information
- `referrals.*` - Referral system
- `spin.*` - Spin & Win game
- `notifications.*` - User notifications
- `admin.*` - Admin management (requires admin role)
- `business.*` - Business portal (requires business role)

## 🧪 Testing

```bash
# Run TypeScript checks
pnpm tsc

# Test database connection
pnpm db:push

# Seed test data
pnpm exec tsx scripts/seed.mjs
```

## 📦 Deployment

### Via Manus Platform

1. **Save Checkpoint**
   ```
   Create checkpoint via Management UI or CLI
   ```

2. **Publish**
   ```
   Click "Publish" button in Management UI
   ```

3. **Configure Domain**
   ```
   Settings → Domains → Add custom domain (optional)
   ```

### Environment Configuration

Ensure all secrets are configured in Management UI → Settings → Secrets:
- Database credentials
- JWT secret
- M-Pesa credentials (when ready)
- SMS API keys (when ready)

## 📚 Project Structure

```
cashbucks/
├── client/               # Frontend React application
│   ├── src/
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable UI components
│   │   ├── lib/         # Utilities and tRPC client
│   │   └── App.tsx      # Main app and routing
├── server/              # Backend Node.js application
│   ├── routers.ts       # tRPC API endpoints
│   ├── db.ts            # Database queries and helpers
│   └── _core/           # Framework infrastructure
├── drizzle/             # Database schema and migrations
│   └── schema.ts        # Table definitions
├── scripts/             # Utility scripts
│   └── seed.mjs         # Database seeding
├── todo.md              # Feature tracking
├── INTEGRATION_GUIDE.md # Integration documentation
└── README.md            # This file
```

## 🤝 Contributing

This is a custom-built platform. For modifications:

1. Update `todo.md` with new features
2. Implement changes in appropriate files
3. Test thoroughly
4. Create checkpoint before deploying

## 📄 License

Proprietary - All rights reserved

## 🆘 Support

For platform issues or questions:
- Check `INTEGRATION_GUIDE.md` for integration help
- Review `todo.md` for planned features
- Contact platform administrator

## 🎉 Acknowledgments

Built with:
- React + TypeScript
- tRPC for type-safe APIs
- Tailwind CSS for styling
- Drizzle ORM for database
- Manus Platform for deployment

---

**Version**: 1.0.0  
**Last Updated**: 2024  
**Status**: Production Ready (pending external API integrations)
