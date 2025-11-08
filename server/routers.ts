import { COOKIE_NAME } from "@shared/const";
import { z } from "zod";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import * as db from "./db";
import { users, tasks } from "../drizzle/schema";
import { eq } from "drizzle-orm";
import { TRPCError } from "@trpc/server";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

// Business-only procedure
const businessProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'business' && ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Business access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============= USER PROFILE =============
  user: router({
    getProfile: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      const wallet = await db.getOrCreateWallet(ctx.user.id);
      const vipLevel = user ? await db.getVIPLevelByLevel(user.vipLevel) : null;
      const referrals = await db.getUserReferrals(ctx.user.id);
      
      return {
        user,
        wallet,
        vipLevel,
        referralCount: referrals.length
      };
    }),
    
    updateProfile: protectedProcedure
      .input(z.object({
        name: z.string().optional(),
        phone: z.string().optional(),
        profileImage: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return db.updateUserProfile(ctx.user.id, input);
      }),
    
    generateReferralCode: protectedProcedure.mutation(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (user?.referralCode) {
        return { code: user.referralCode };
      }
      const code = await db.generateReferralCode(ctx.user.id);
      return { code };
    }),
    
    applyReferralCode: protectedProcedure
      .input(z.object({ code: z.string() }))
      .mutation(async ({ ctx, input }) => {
        const user = await db.getUserById(ctx.user.id);
        if (user?.referredBy) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'You have already used a referral code' });
        }
        
        const referrer = await db.getUserByReferralCode(input.code);
        if (!referrer) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Invalid referral code' });
        }
        
        if (referrer.id === ctx.user.id) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'You cannot refer yourself' });
        }
        
        await db.updateUserProfile(ctx.user.id, { referredBy: referrer.id });
        await db.createReferral(referrer.id, ctx.user.id);
        
        return { success: true, referrer: referrer.name };
      }),
    
    getDashboardStats: protectedProcedure.query(async ({ ctx }) => {
      const wallet = await db.getOrCreateWallet(ctx.user.id);
      const completions = await db.getUserTaskCompletions(ctx.user.id);
      const referrals = await db.getUserReferrals(ctx.user.id);
      const user = await db.getUserById(ctx.user.id);
      
      return {
        balance: wallet?.balance || 0,
        totalEarned: wallet?.totalEarned || 0,
        tasksCompleted: completions.filter(c => c.status === 'approved').length,
        referralCount: referrals.length,
        vipLevel: user?.vipLevel || 0,
        dailyStreak: user?.dailyLoginStreak || 0
      };
    }),
  }),

  // ============= WALLET & TRANSACTIONS =============
  wallet: router({
    getBalance: protectedProcedure.query(async ({ ctx }) => {
      return db.getOrCreateWallet(ctx.user.id);
    }),
    
    getTransactions: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return db.getTransactionHistory(ctx.user.id, input.limit);
      }),
    
    requestWithdrawal: protectedProcedure
      .input(z.object({
        amount: z.number().min(1),
        phoneNumber: z.string().regex(/^\+?[0-9]{10,15}$/)
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await db.createWithdrawal(ctx.user.id, input.amount, input.phoneNumber);
        } catch (error: any) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
      }),
    
    getWithdrawals: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserWithdrawals(ctx.user.id);
    }),
  }),

  // ============= TASKS =============
  tasks: router({
    getAvailable: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ input }) => {
        return db.getActiveTasks(input.limit);
      }),
    
    getById: protectedProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const task = await db.getTaskById(input.id);
        if (!task) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
        }
        return task;
      }),
    
    complete: protectedProcedure
      .input(z.object({
        taskId: z.number(),
        proofUrl: z.string().optional(),
        proofText: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        try {
          const completion = await db.completeTask(ctx.user.id, input.taskId, input.proofUrl, input.proofText);
          
          // Check for VIP upgrade
          await db.checkAndUpgradeVIP(ctx.user.id);
          
          // Update daily login streak
          await db.updateDailyLoginStreak(ctx.user.id);
          
          return completion;
        } catch (error: any) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
      }),
    
    getMyCompletions: protectedProcedure.query(async ({ ctx }) => {
      return db.getUserTaskCompletions(ctx.user.id);
    }),
  }),

  // ============= VIP SYSTEM =============
  vip: router({
    getLevels: publicProcedure.query(async () => {
      return db.getAllVIPLevels();
    }),
    
    getMyLevel: protectedProcedure.query(async ({ ctx }) => {
      const user = await db.getUserById(ctx.user.id);
      if (!user) return null;
      return db.getVIPLevelByLevel(user.vipLevel);
    }),
    
    checkUpgrade: protectedProcedure.mutation(async ({ ctx }) => {
      const newLevel = await db.checkAndUpgradeVIP(ctx.user.id);
      return { upgraded: newLevel !== null, newLevel };
    }),
  }),

  // ============= REFERRALS =============
  referrals: router({
    getMyReferrals: protectedProcedure.query(async ({ ctx }) => {
      const referrals = await db.getUserReferrals(ctx.user.id);
      
      // Get referred user details
      const referralsWithUsers = await Promise.all(
        referrals.map(async (ref) => {
          const referredUser = await db.getUserById(ref.referredId);
          return {
            ...ref,
            referredUser
          };
        })
      );
      
      return referralsWithUsers;
    }),
    
    getLeaderboard: publicProcedure
      .input(z.object({ limit: z.number().default(10) }))
      .query(async ({ input }) => {
        return db.getReferralLeaderboard(input.limit);
      }),
  }),

  // ============= SPIN & WIN =============
  spin: router({
    getRewards: publicProcedure.query(async () => {
      return db.getActiveSpinRewards();
    }),
    
    spin: protectedProcedure.mutation(async ({ ctx }) => {
      try {
        const reward = await db.spinWheel(ctx.user.id);
        return reward;
      } catch (error: any) {
        throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
      }
    }),
    
    getHistory: protectedProcedure
      .input(z.object({ limit: z.number().default(20) }))
      .query(async ({ ctx, input }) => {
        return db.getUserSpinHistory(ctx.user.id, input.limit);
      }),
  }),

  // ============= NOTIFICATIONS =============
  notifications: router({
    getAll: protectedProcedure
      .input(z.object({ limit: z.number().default(50) }))
      .query(async ({ ctx, input }) => {
        return db.getUserNotifications(ctx.user.id, input.limit);
      }),
    
    markAsRead: protectedProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        return db.markNotificationAsRead(input.id);
      }),
  }),

  // ============= ADMIN ROUTES =============
  admin: router({
    getStats: adminProcedure.query(async () => {
      const allUsers = await db.getDb().then(d => d?.select().from(users));
      const allTasks = await db.getDb().then(d => d?.select().from(tasks));
      const pendingWithdrawals = await db.getPendingWithdrawals();
      const pendingCompletions = await db.getPendingTaskCompletions();
      
      return {
        totalUsers: allUsers?.length || 0,
        totalTasks: allTasks?.length || 0,
        pendingWithdrawals: pendingWithdrawals.length,
        pendingCompletions: pendingCompletions.length
      };
    }),
    
    // User Management
    getAllUsers: adminProcedure
      .input(z.object({ limit: z.number().default(100) }))
      .query(async ({ input }) => {
        const dbInstance = await db.getDb();
        if (!dbInstance) return [];
        return dbInstance.select().from(users).limit(input.limit);
      }),
    
    updateUser: adminProcedure
      .input(z.object({
        userId: z.number(),
        data: z.object({
          vipLevel: z.number().optional(),
          isActive: z.boolean().optional(),
          isSuspended: z.boolean().optional(),
          role: z.enum(['user', 'admin', 'business']).optional()
        })
      }))
      .mutation(async ({ input }) => {
        return db.updateUserProfile(input.userId, input.data);
      }),
    
    // Task Management
    getPendingTasks: adminProcedure.query(async () => {
      const dbInstance = await db.getDb();
      if (!dbInstance) return [];
      return dbInstance.select().from(tasks).where(eq(tasks.status, 'pending_approval'));
    }),
    
    approveTask: adminProcedure
      .input(z.object({ taskId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.updateTask(input.taskId, {
          status: 'active',
          approvedBy: ctx.user.id,
          approvedAt: new Date()
        });
      }),
    
    rejectTask: adminProcedure
      .input(z.object({ taskId: z.number(), reason: z.string() }))
      .mutation(async ({ input }) => {
        return db.updateTask(input.taskId, {
          status: 'rejected',
          adminNotes: input.reason
        });
      }),
    
    // Task Completion Management
    getPendingCompletions: adminProcedure.query(async () => {
      return db.getPendingTaskCompletions();
    }),
    
    approveCompletion: adminProcedure
      .input(z.object({ completionId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        return db.approveTaskCompletion(input.completionId, ctx.user.id);
      }),
    
    // Withdrawal Management
    getPendingWithdrawals: adminProcedure.query(async () => {
      return db.getPendingWithdrawals();
    }),
    
    approveWithdrawal: adminProcedure
      .input(z.object({ withdrawalId: z.number() }))
      .mutation(async ({ ctx, input }) => {
        try {
          return await db.approveWithdrawal(input.withdrawalId, ctx.user.id);
        } catch (error: any) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: error.message });
        }
      }),
    
    // Settings Management
    getSettings: adminProcedure.query(async () => {
      return db.getAllSettings();
    }),
    
    updateSetting: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        return db.setSetting(input.key, input.value, input.description, ctx.user.id);
      }),
  }),

  // ============= BUSINESS ROUTES =============
  business: router({
    getProfile: businessProcedure.query(async ({ ctx }) => {
      return db.getBusinessByUserId(ctx.user.id);
    }),
    
    createProfile: businessProcedure
      .input(z.object({
        businessName: z.string(),
        businessEmail: z.string().email().optional(),
        businessPhone: z.string().optional(),
        businessDescription: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const existing = await db.getBusinessByUserId(ctx.user.id);
        if (existing) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Business profile already exists' });
        }
        
        return db.createBusiness({
          userId: ctx.user.id,
          ...input
        });
      }),
    
    getMyTasks: businessProcedure.query(async ({ ctx }) => {
      const business = await db.getBusinessByUserId(ctx.user.id);
      if (!business) return [];
      return db.getTasksByBusiness(business.id);
    }),
    
    createTask: businessProcedure
      .input(z.object({
        title: z.string().min(5),
        description: z.string().min(20),
        category: z.string().optional(),
        rewardAmount: z.number().min(10),
        totalSlots: z.number().min(1).default(100),
        requiresProof: z.boolean().default(false),
        proofInstructions: z.string().optional(),
        taskUrl: z.string().optional(),
        taskImage: z.string().optional()
      }))
      .mutation(async ({ ctx, input }) => {
        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Business profile required' });
        }
        
        return db.createTask({
          businessId: business.id,
          ...input,
          status: 'pending_approval'
        });
      }),
    
    updateTask: businessProcedure
      .input(z.object({
        taskId: z.number(),
        data: z.object({
          title: z.string().optional(),
          description: z.string().optional(),
          status: z.enum(['draft', 'pending_approval', 'active', 'paused']).optional()
        })
      }))
      .mutation(async ({ ctx, input }) => {
        const task = await db.getTaskById(input.taskId);
        if (!task) {
          throw new TRPCError({ code: 'NOT_FOUND', message: 'Task not found' });
        }
        
        const business = await db.getBusinessByUserId(ctx.user.id);
        if (!business || task.businessId !== business.id) {
          throw new TRPCError({ code: 'FORBIDDEN', message: 'Not authorized' });
        }
        
        return db.updateTask(input.taskId, input.data);
      }),
  }),
});

export type AppRouter = typeof appRouter;
