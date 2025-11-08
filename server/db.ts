import { eq, desc, and, sql, gte, lte, or, count } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, wallets, InsertWallet, transactions, InsertTransaction,
  withdrawals, InsertWithdrawal, tasks, InsertTask, taskCompletions, InsertTaskCompletion,
  referrals, InsertReferral, vipLevels, InsertVIPLevel, spinRewards, InsertSpinReward,
  spinHistory, InsertSpinHistory, notifications, InsertNotification, businesses, InsertBusiness,
  loginLogs, InsertLoginLog, fraudLogs, InsertFraudLog, settings, InsertSetting
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============= USER MANAGEMENT =============

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod", "phone", "profileImage"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getUserById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateUserProfile(userId: number, data: Partial<InsertUser>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(users).set(data).where(eq(users.id, userId));
  return getUserById(userId);
}

export async function generateReferralCode(userId: number): Promise<string> {
  const code = `CB${userId}${Math.random().toString(36).substring(2, 8).toUpperCase()}`;
  const db = await getDb();
  if (!db) return code;
  await db.update(users).set({ referralCode: code }).where(eq(users.id, userId));
  return code;
}

export async function getUserByReferralCode(code: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(users).where(eq(users.referralCode, code)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateDailyLoginStreak(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const user = await getUserById(userId);
  if (!user) return;
  
  const now = new Date();
  const lastLogin = user.lastLoginDate;
  
  let newStreak = 1;
  if (lastLogin) {
    const daysDiff = Math.floor((now.getTime() - lastLogin.getTime()) / (1000 * 60 * 60 * 24));
    if (daysDiff === 1) {
      newStreak = user.dailyLoginStreak + 1;
    } else if (daysDiff === 0) {
      newStreak = user.dailyLoginStreak; // Same day, no change
    }
  }
  
  await db.update(users).set({
    dailyLoginStreak: newStreak,
    lastLoginDate: now
  }).where(eq(users.id, userId));
}

// ============= WALLET MANAGEMENT =============

export async function createWallet(userId: number) {
  const db = await getDb();
  if (!db) return null;
  await db.insert(wallets).values({ userId, balance: 0, totalEarned: 0, totalWithdrawn: 0, totalSpent: 0 });
  return getWalletByUserId(userId);
}

export async function getWalletByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(wallets).where(eq(wallets.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrCreateWallet(userId: number) {
  let wallet = await getWalletByUserId(userId);
  if (!wallet) {
    wallet = (await createWallet(userId)) || undefined;
  }
  return wallet;
}

export async function creditWallet(
  userId: number, 
  amount: number, 
  type: InsertTransaction['type'], 
  description: string,
  referenceId?: number,
  referenceType?: string
) {
  const db = await getDb();
  if (!db) return null;
  
  const wallet = await getOrCreateWallet(userId);
  if (!wallet) return null;
  
  const newBalance = wallet.balance + amount;
  const newTotalEarned = wallet.totalEarned + amount;
  
  await db.update(wallets).set({
    balance: newBalance,
    totalEarned: newTotalEarned
  }).where(eq(wallets.userId, userId));
  
  await db.insert(transactions).values({
    userId,
    type,
    amount,
    balanceBefore: wallet.balance,
    balanceAfter: newBalance,
    description,
    referenceId,
    referenceType
  });
  
  return getWalletByUserId(userId);
}

export async function debitWallet(
  userId: number, 
  amount: number, 
  type: InsertTransaction['type'], 
  description: string,
  referenceId?: number,
  referenceType?: string
) {
  const db = await getDb();
  if (!db) return null;
  
  const wallet = await getWalletByUserId(userId);
  if (!wallet || wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }
  
  const newBalance = wallet.balance - amount;
  const updateData: any = { balance: newBalance };
  
  if (type === 'withdrawal') {
    updateData.totalWithdrawn = wallet.totalWithdrawn + amount;
    updateData.lastWithdrawalDate = new Date();
  } else {
    updateData.totalSpent = wallet.totalSpent + amount;
  }
  
  await db.update(wallets).set(updateData).where(eq(wallets.userId, userId));
  
  await db.insert(transactions).values({
    userId,
    type,
    amount: -amount,
    balanceBefore: wallet.balance,
    balanceAfter: newBalance,
    description,
    referenceId,
    referenceType
  });
  
  return getWalletByUserId(userId);
}

export async function getTransactionHistory(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(transactions).where(eq(transactions.userId, userId)).orderBy(desc(transactions.createdAt)).limit(limit);
}

// ============= TASK MANAGEMENT =============

export async function createTask(data: InsertTask) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(tasks).values(data);
  return getTaskById(Number(result[0].insertId));
}

export async function getTaskById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(tasks).where(eq(tasks.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getActiveTasks(limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks)
    .where(and(
      eq(tasks.status, 'active'),
      sql`${tasks.completedSlots} < ${tasks.totalSlots}`
    ))
    .orderBy(desc(tasks.createdAt))
    .limit(limit);
}

export async function getTasksByBusiness(businessId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(tasks).where(eq(tasks.businessId, businessId)).orderBy(desc(tasks.createdAt));
}

export async function updateTask(id: number, data: Partial<InsertTask>) {
  const db = await getDb();
  if (!db) return null;
  await db.update(tasks).set(data).where(eq(tasks.id, id));
  return getTaskById(id);
}

export async function completeTask(userId: number, taskId: number, proofUrl?: string, proofText?: string) {
  const db = await getDb();
  if (!db) return null;
  
  const task = await getTaskById(taskId);
  if (!task || task.status !== 'active' || task.completedSlots >= task.totalSlots) {
    throw new Error("Task not available");
  }
  
  // Check if user already completed this task
  const existing = await db.select().from(taskCompletions)
    .where(and(eq(taskCompletions.userId, userId), eq(taskCompletions.taskId, taskId)))
    .limit(1);
  
  if (existing.length > 0) {
    throw new Error("Task already completed");
  }
  
  // Get user's VIP level to calculate reward
  const user = await getUserById(userId);
  const vipLevel = user ? await getVIPLevelByLevel(user.vipLevel) : null;
  const multiplier = vipLevel ? vipLevel.taskRewardMultiplier / 100 : 1;
  const rewardAmount = Math.floor(task.rewardAmount * multiplier);
  
  // Create completion record
  const result = await db.insert(taskCompletions).values({
    taskId,
    userId,
    proofUrl,
    proofText,
    rewardAmount,
    status: task.requiresProof ? 'pending' : 'approved'
  });
  
  const completionId = Number(result[0].insertId);
  
  // If no proof required, auto-approve and credit wallet
  if (!task.requiresProof) {
    await db.update(tasks).set({
      completedSlots: task.completedSlots + 1
    }).where(eq(tasks.id, taskId));
    
    await creditWallet(userId, rewardAmount, 'task_reward', `Reward for completing: ${task.title}`, taskId, 'task');
  }
  
  return db.select().from(taskCompletions).where(eq(taskCompletions.id, completionId)).limit(1).then(r => r[0]);
}

export async function getUserTaskCompletions(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskCompletions).where(eq(taskCompletions.userId, userId)).orderBy(desc(taskCompletions.createdAt));
}

export async function getPendingTaskCompletions() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(taskCompletions).where(eq(taskCompletions.status, 'pending')).orderBy(desc(taskCompletions.createdAt));
}

export async function approveTaskCompletion(completionId: number, reviewerId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const completion = await db.select().from(taskCompletions).where(eq(taskCompletions.id, completionId)).limit(1).then(r => r[0]);
  if (!completion || completion.status !== 'pending') {
    throw new Error("Invalid completion");
  }
  
  const task = await getTaskById(completion.taskId);
  if (!task) throw new Error("Task not found");
  
  await db.update(taskCompletions).set({
    status: 'approved',
    reviewedBy: reviewerId,
    reviewedAt: new Date()
  }).where(eq(taskCompletions.id, completionId));
  
  await db.update(tasks).set({
    completedSlots: task.completedSlots + 1
  }).where(eq(tasks.id, completion.taskId));
  
  await creditWallet(completion.userId, completion.rewardAmount, 'task_reward', `Reward for completing: ${task.title}`, task.id, 'task');
  
  return db.select().from(taskCompletions).where(eq(taskCompletions.id, completionId)).limit(1).then(r => r[0]);
}

// ============= VIP SYSTEM =============

export async function createVIPLevel(data: InsertVIPLevel) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(vipLevels).values(data);
  return getVIPLevelByLevel(data.level);
}

export async function getVIPLevelByLevel(level: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(vipLevels).where(eq(vipLevels.level, level)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllVIPLevels() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(vipLevels).orderBy(vipLevels.level);
}

export async function checkAndUpgradeVIP(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const user = await getUserById(userId);
  if (!user) return null;
  
  const wallet = await getWalletByUserId(userId);
  const completedTasks = await db.select({ count: count() }).from(taskCompletions)
    .where(and(eq(taskCompletions.userId, userId), eq(taskCompletions.status, 'approved')))
    .then(r => r[0]?.count || 0);
  
  const allLevels = await getAllVIPLevels();
  let newLevel = user.vipLevel;
  
  for (const level of allLevels) {
    if (level.level > user.vipLevel && 
        completedTasks >= level.minTasks && 
        (wallet?.totalEarned || 0) >= level.minEarnings) {
      newLevel = level.level;
    }
  }
  
  if (newLevel > user.vipLevel) {
    await db.update(users).set({ vipLevel: newLevel }).where(eq(users.id, userId));
    return newLevel;
  }
  
  return null;
}

// ============= REFERRAL SYSTEM =============

export async function createReferral(referrerId: number, referredId: number, bonusAmount = 5) {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(referrals).values({
    referrerId,
    referredId,
    bonusAmount,
    bonusPaid: false
  });
  
  // Credit referrer
  await creditWallet(referrerId, bonusAmount, 'referral_bonus', `Referral bonus for inviting new user`, referredId as number | undefined, 'referral');
  
  // Mark as paid
  await db.update(referrals).set({ bonusPaid: true })
    .where(and(eq(referrals.referrerId, referrerId), eq(referrals.referredId, referredId)));
  
  // Check for milestone bonuses
  await checkReferralMilestones(referrerId);
  
  return db.select().from(referrals)
    .where(and(eq(referrals.referrerId, referrerId), eq(referrals.referredId, referredId)))
    .limit(1).then(r => r[0]);
}

export async function checkReferralMilestones(userId: number) {
  const db = await getDb();
  if (!db) return;
  
  const referralCount = await db.select({ count: count() }).from(referrals)
    .where(eq(referrals.referrerId, userId))
    .then(r => r[0]?.count || 0);
  
  // Milestone: Every 50 referrals = 100 Ksh bonus
  const milestones = Math.floor(referralCount / 50);
  const paidMilestones = await db.select({ count: count() }).from(referrals)
    .where(and(eq(referrals.referrerId, userId), eq(referrals.milestonePaid, true)))
    .then(r => r[0]?.count || 0);
  
  const unpaidMilestones = milestones - Math.floor(paidMilestones / 50);
  
  if (unpaidMilestones > 0) {
    const bonusAmount = unpaidMilestones * 100;
    await creditWallet(userId, bonusAmount, 'referral_bonus', `Milestone bonus for ${referralCount} referrals`, undefined, 'milestone');
  }
}

export async function getUserReferrals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(referrals).where(eq(referrals.referrerId, userId)).orderBy(desc(referrals.createdAt));
}

export async function getReferralLeaderboard(limit = 10) {
  const db = await getDb();
  if (!db) return [];
  
  const leaderboard = await db.select({
    userId: referrals.referrerId,
    referralCount: count(referrals.id)
  })
  .from(referrals)
  .groupBy(referrals.referrerId)
  .orderBy(desc(count(referrals.id)))
  .limit(limit);
  
  // Get user details
  const result = [];
  for (const entry of leaderboard) {
    const user = await getUserById(entry.userId);
    if (user) {
      result.push({
        user,
        referralCount: entry.referralCount
      });
    }
  }
  
  return result;
}

// ============= WITHDRAWAL MANAGEMENT =============

export async function createWithdrawal(userId: number, amount: number, phoneNumber: string) {
  const db = await getDb();
  if (!db) return null;
  
  const wallet = await getWalletByUserId(userId);
  if (!wallet || wallet.balance < amount) {
    throw new Error("Insufficient balance");
  }
  
  const user = await getUserById(userId);
  if (!user) throw new Error("User not found");
  
  const vipLevel = await getVIPLevelByLevel(user.vipLevel);
  if (!vipLevel) throw new Error("VIP level not found");
  
  if (amount < vipLevel.withdrawalMinAmount) {
    throw new Error(`Minimum withdrawal amount is ${vipLevel.withdrawalMinAmount} Ksh`);
  }
  
  // Check cooldown
  if (wallet.lastWithdrawalDate) {
    const daysSince = Math.floor((Date.now() - wallet.lastWithdrawalDate.getTime()) / (1000 * 60 * 60 * 24));
    if (daysSince < vipLevel.withdrawalCooldown) {
      throw new Error(`Withdrawal cooldown: ${vipLevel.withdrawalCooldown - daysSince} days remaining`);
    }
  }
  
  const result = await db.insert(withdrawals).values({
    userId,
    amount,
    phoneNumber,
    status: 'pending'
  });
  
  return db.select().from(withdrawals).where(eq(withdrawals.id, Number(result[0].insertId))).limit(1).then(r => r[0]);
}

export async function getUserWithdrawals(userId: number) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(withdrawals).where(eq(withdrawals.userId, userId)).orderBy(desc(withdrawals.createdAt));
}

export async function getPendingWithdrawals() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(withdrawals).where(eq(withdrawals.status, 'pending')).orderBy(desc(withdrawals.createdAt));
}

export async function approveWithdrawal(withdrawalId: number, adminId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const withdrawal = await db.select().from(withdrawals).where(eq(withdrawals.id, withdrawalId)).limit(1).then(r => r[0]);
  if (!withdrawal || withdrawal.status !== 'pending') {
    throw new Error("Invalid withdrawal");
  }
  
  await db.update(withdrawals).set({
    status: 'processing',
    approvedBy: adminId,
    approvedAt: new Date()
  }).where(eq(withdrawals.id, withdrawalId));
  
  // Debit wallet
  await debitWallet(withdrawal.userId, withdrawal.amount, 'withdrawal', `Withdrawal to ${withdrawal.phoneNumber}`, withdrawalId, 'withdrawal');
  
  // In real implementation, call M-Pesa API here
  // For now, mark as completed
  await db.update(withdrawals).set({
    status: 'completed',
    completedAt: new Date(),
    mpesaTransactionId: `MPESA${Date.now()}`
  }).where(eq(withdrawals.id, withdrawalId));
  
  return db.select().from(withdrawals).where(eq(withdrawals.id, withdrawalId)).limit(1).then(r => r[0]);
}

// ============= SPIN & WIN =============

export async function createSpinReward(data: InsertSpinReward) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(spinRewards).values(data);
  return db.select().from(spinRewards).where(eq(spinRewards.id, Number(result[0].insertId))).limit(1).then(r => r[0]);
}

export async function getActiveSpinRewards() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(spinRewards).where(eq(spinRewards.isActive, true));
}

export async function spinWheel(userId: number) {
  const db = await getDb();
  if (!db) return null;
  
  const rewards = await getActiveSpinRewards();
  if (rewards.length === 0) throw new Error("No rewards available");
  
  // Calculate weighted random selection
  const totalProbability = rewards.reduce((sum, r) => sum + r.probability, 0);
  let random = Math.random() * totalProbability;
  
  let selectedReward = rewards[0];
  for (const reward of rewards) {
    random -= reward.probability;
    if (random <= 0) {
      selectedReward = reward;
      break;
    }
  }
  
  // Record spin
  await db.insert(spinHistory).values({
    userId,
    rewardId: selectedReward.id,
    rewardValue: selectedReward.rewardValue
  });
  
  // Credit wallet if CB points
  if (selectedReward.rewardType === 'cb_points') {
    await creditWallet(userId, selectedReward.rewardValue, 'spin_win', `Spin & Win reward: ${selectedReward.displayText}`, selectedReward.id, 'spin');
  }
  
  return selectedReward;
}

export async function getUserSpinHistory(userId: number, limit = 20) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(spinHistory).where(eq(spinHistory.userId, userId)).orderBy(desc(spinHistory.createdAt)).limit(limit);
}

// ============= BUSINESS MANAGEMENT =============

export async function createBusiness(data: InsertBusiness) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(businesses).values(data);
  return db.select().from(businesses).where(eq(businesses.id, Number(result[0].insertId))).limit(1).then(r => r[0]);
}

export async function getBusinessByUserId(userId: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.userId, userId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getBusinessById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(businesses).where(eq(businesses.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ============= NOTIFICATIONS =============

export async function createNotification(data: InsertNotification) {
  const db = await getDb();
  if (!db) return null;
  const result = await db.insert(notifications).values(data);
  return db.select().from(notifications).where(eq(notifications.id, Number(result[0].insertId))).limit(1).then(r => r[0]);
}

export async function getUserNotifications(userId: number, limit = 50) {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(notifications).where(eq(notifications.userId, userId)).orderBy(desc(notifications.createdAt)).limit(limit);
}

export async function markNotificationAsRead(id: number) {
  const db = await getDb();
  if (!db) return null;
  await db.update(notifications).set({ isRead: true }).where(eq(notifications.id, id));
  return db.select().from(notifications).where(eq(notifications.id, id)).limit(1).then(r => r[0]);
}

// ============= SETTINGS =============

export async function getSetting(key: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(settings).where(eq(settings.key, key)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function setSetting(key: string, value: string, description?: string, updatedBy?: number) {
  const db = await getDb();
  if (!db) return null;
  
  await db.insert(settings).values({ key, value, description, updatedBy })
    .onDuplicateKeyUpdate({ set: { value, updatedBy, updatedAt: new Date() } });
  
  return getSetting(key);
}

export async function getAllSettings() {
  const db = await getDb();
  if (!db) return [];
  return db.select().from(settings);
}
