import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router, protectedProcedure } from "./_core/trpc";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import * as db from "./db";
import { storagePut } from "./storage";
import { initiatePayTechPayment, checkPayTechPaymentStatus } from "./paytech";
import { verifyAdminCredentials, createSessionToken } from "./_core/auth";

// Admin-only procedure
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: 'Admin access required' });
  }
  return next({ ctx });
});

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    login: publicProcedure
      .input(z.object({ email: z.string().email(), password: z.string().min(1) }))
      .mutation(async ({ input, ctx }) => {
        if (!verifyAdminCredentials(input.email, input.password)) {
          throw new TRPCError({ code: "UNAUTHORIZED", message: "Email ou mot de passe incorrect" });
        }
        // Sync admin user to DB if available (non-blocking)
        try {
          let user = await db.getUserByOpenId(input.email);
          if (!user) {
            await db.upsertUser({
              openId: input.email,
              name: "Administrateur",
              email: input.email,
              loginMethod: "local",
              role: "admin",
              lastSignedIn: new Date(),
            });
          }
        } catch {
          // DB unavailable — continue, JWT auth doesn't require DB
        }
        const token = await createSessionToken(input.email, "Administrateur");
        const cookieOptions = getSessionCookieOptions(ctx.req);
        ctx.res.cookie(COOKIE_NAME, token, { ...cookieOptions, maxAge: ONE_YEAR_MS });
        return { success: true } as const;
      }),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  categories: router({
    list: publicProcedure.query(async () => {
      return await db.getAllCategories();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCategoryById(input.id);
      }),
    getBySlug: publicProcedure
      .input(z.object({ slug: z.string() }))
      .query(async ({ input }) => {
        return await db.getCategoryBySlug(input.slug);
      }),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        emoji: z.string().optional(),
        slug: z.string(),
      }))
      .mutation(async ({ input }) => {
        await db.createCategory(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        emoji: z.string().optional(),
        slug: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCategory(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCategory(input.id);
        return { success: true };
      }),
  }),

  products: router({
    list: publicProcedure.query(async () => {
      return await db.getAllProducts();
    }),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductById(input.id);
      }),
    getByCategory: publicProcedure
      .input(z.object({ categoryId: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductsByCategory(input.categoryId);
      }),
    search: publicProcedure
      .input(z.object({ query: z.string() }))
      .query(async ({ input }) => {
        return await db.searchProducts(input.query);
      }),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        description: z.string().optional(),
        price: z.string(),
        unit: z.string().optional(),
        imageUrl: z.string().optional(),
        image2Url: z.string().optional(),
        image3Url: z.string().optional(),
        image4Url: z.string().optional(),
        image5Url: z.string().optional(),
        categoryId: z.number(),
        badge: z.string().optional(),
        inStock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createProduct(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        description: z.string().optional(),
        price: z.string().optional(),
        unit: z.string().optional(),
        imageUrl: z.string().optional(),
        image2Url: z.string().optional(),
        image3Url: z.string().optional(),
        image4Url: z.string().optional(),
        image5Url: z.string().optional(),
        categoryId: z.number().optional(),
        badge: z.string().optional(),
        inStock: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProduct(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProduct(input.id);
        return { success: true };
      }),
    uploadImage: adminProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(), // base64
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
        const randomSuffix = Math.random().toString(36).substring(7);
        const fileKey = `products/${input.fileName}-${randomSuffix}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { url };
      }),
  }),

  orders: router({
    list: adminProcedure.query(async () => {
      return await db.getAllOrders();
    }),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getOrderById(input.id);
      }),
    create: publicProcedure
      .input(z.object({
        productId: z.number(),
        productName: z.string(),
        productPrice: z.string(),
        quantity: z.number(),
        deliveryLocation: z.string().optional(),
        customerPhone: z.string().optional(),
        customerName: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const totalAmount = (parseFloat(input.productPrice) * input.quantity).toFixed(2);
        await db.createOrder({
          ...input,
          totalAmount,
        });
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        status: z.enum(['pending', 'contacted', 'confirmed', 'delivered', 'cancelled']).optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateOrder(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteOrder(input.id);
        return { success: true };
      }),
    stats: adminProcedure.query(async () => {
      return await db.getOrderStats();
    }),
  }),

  customers: router({
    list: adminProcedure.query(async () => {
      return await db.getAllCustomers();
    }),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerById(input.id);
      }),
    getOrders: adminProcedure
      .input(z.object({ customerId: z.number() }))
      .query(async ({ input }) => {
        return await db.getCustomerOrders(input.customerId);
      }),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        phone: z.string(),
        email: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createCustomer(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        phone: z.string().optional(),
        email: z.string().optional(),
        address: z.string().optional(),
        notes: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateCustomer(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteCustomer(input.id);
        return { success: true };
      }),
  }),

  settings: router({
    list: adminProcedure.query(async () => {
      return await db.getAllSettings();
    }),
    public: publicProcedure.query(async () => {
      return await db.getAllSettings();
    }),
    getByKey: adminProcedure
      .input(z.object({ key: z.string() }))
      .query(async ({ input }) => {
        return await db.getSettingByKey(input.key);
      }),
    upsert: adminProcedure
      .input(z.object({
        key: z.string(),
        value: z.string(),
        description: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.upsertSetting(input.key, input.value, input.description);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ key: z.string() }))
      .mutation(async ({ input }) => {
        await db.deleteSetting(input.key);
        return { success: true };
      }),
  }),

  banners: router({
    list: adminProcedure.query(async () => {
      return await db.getAllBanners();
    }),
    active: publicProcedure.query(async () => {
      return await db.getActiveBanners();
    }),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getBannerById(input.id);
      }),
    create: adminProcedure
      .input(z.object({
        title: z.string(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        linkUrl: z.string().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createBanner(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        title: z.string().optional(),
        description: z.string().optional(),
        imageUrl: z.string().optional(),
        linkUrl: z.string().optional(),
        isActive: z.number().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateBanner(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteBanner(input.id);
        return { success: true };
      }),
    uploadImage: adminProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `banners/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { url };
      }),
  }),

  affiliateLinks: router({
    list: adminProcedure.query(async () => {
      return await db.getAllAffiliateLinks();
    }),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAffiliateLinkById(input.id);
      }),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        url: z.string(),
        description: z.string().optional(),
        platform: z.string().optional(),
        categoryId: z.number().optional(),
        productId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createAffiliateLink(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        url: z.string().optional(),
        description: z.string().optional(),
        platform: z.string().optional(),
        categoryId: z.number().optional(),
        productId: z.number().optional(),
        isActive: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAffiliateLink(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAffiliateLink(input.id);
        return { success: true };
      }),
    trackClick: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementAffiliateLinkClick(input.id);
        return { success: true };
      }),
  }),

  adBanners: router({
    list: adminProcedure.query(async () => {
      return await db.getAllAdBanners();
    }),
    getByPosition: publicProcedure
      .input(z.object({ position: z.string() }))
      .query(async ({ input }) => {
        return await db.getAdBannersByPosition(input.position);
      }),
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getAdBannerById(input.id);
      }),
    create: adminProcedure
      .input(z.object({
        name: z.string(),
        position: z.string(),
        type: z.enum(['image', 'html', 'adsense']),
        content: z.string(),
        linkUrl: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        await db.createAdBanner(input);
        return { success: true };
      }),
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        position: z.string().optional(),
        type: z.enum(['image', 'html', 'adsense']).optional(),
        content: z.string().optional(),
        linkUrl: z.string().optional(),
        width: z.number().optional(),
        height: z.number().optional(),
        isActive: z.number().optional(),
        displayOrder: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateAdBanner(id, data);
        return { success: true };
      }),
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteAdBanner(input.id);
        return { success: true };
      }),
    trackImpression: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementAdBannerImpression(input.id);
        return { success: true };
      }),
    trackClick: publicProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.incrementAdBannerClick(input.id);
        return { success: true };
      }),
    uploadImage: adminProcedure
      .input(z.object({
        fileName: z.string(),
        fileData: z.string(),
        mimeType: z.string(),
      }))
      .mutation(async ({ input }) => {
        const buffer = Buffer.from(input.fileData, 'base64');
        const fileKey = `ad-banners/${Date.now()}-${input.fileName}`;
        const { url } = await storagePut(fileKey, buffer, input.mimeType);
        return { url };
      }),
  }),

  statistics: router({
    dashboard: adminProcedure.query(async () => {
      return await db.getDashboardStats();
    }),
    popularProducts: adminProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getPopularProducts(input.limit || 10);
      }),
    recentOrders: adminProcedure
      .input(z.object({ limit: z.number().optional() }))
      .query(async ({ input }) => {
        return await db.getRecentOrders(input.limit || 10);
      }),
  }),

  productDrafts: router({
    create: adminProcedure
      .input(z.object({
        name: z.string().min(1, "Product name is required"),
        categoryId: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const slug = input.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');
        const result = await db.createProductDraft({
          name: input.name,
          slug,
          categoryId: input.categoryId,
          currentStep: 1,
          completionPercentage: 10,
        });
        return result;
      }),
    
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        return await db.getProductDraftById(input.id);
      }),
    
    update: adminProcedure
      .input(z.object({
        id: z.number(),
        name: z.string().optional(),
        categoryId: z.number().optional(),
        price: z.string().optional(),
        promoPrice: z.string().optional(),
        unit: z.string().optional(),
        badge: z.string().optional(),
        stockQty: z.number().optional(),
        availability: z.enum(['in_stock', 'out_of_stock', 'preorder']).optional(),
        shortDescription: z.string().optional(),
        descriptionHtml: z.string().optional(),
        sku: z.string().optional(),
        barcode: z.string().optional(),
        metaTitle: z.string().optional(),
        metaDescription: z.string().optional(),
        tags: z.string().optional(),
        currentStep: z.number().optional(),
        completionPercentage: z.number().optional(),
      }))
      .mutation(async ({ input }) => {
        const { id, ...data } = input;
        await db.updateProductDraft(id, data);
        return { success: true };
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductDraft(input.id);
        return { success: true };
      }),
  }),

  productMedia: router({
    upload: adminProcedure
      .input(z.object({
        productId: z.number(),
        type: z.enum(['image', 'video']),
        url: z.string().url(),
        mimeType: z.string().optional(),
        fileSize: z.number().optional(),
        sortOrder: z.number().default(0),
        isMain: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const result = await db.createProductMedia(input);
        return result;
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductMedia(input.id);
        return { success: true };
      }),
    
    updateOrder: adminProcedure
      .input(z.object({
        id: z.number(),
        sortOrder: z.number(),
      }))
      .mutation(async ({ input }) => {
        await db.updateProductMediaOrder(input.id, input.sortOrder);
        return { success: true };
      }),
  }),

  productSpecs: router({
    add: adminProcedure
      .input(z.object({
        productId: z.number(),
        key: z.string().min(1, "Spec key is required"),
        value: z.string().min(1, "Spec value is required"),
        sortOrder: z.number().default(0),
      }))
      .mutation(async ({ input }) => {
        const result = await db.createProductSpec(input);
        return result;
      }),
    
    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await db.deleteProductSpec(input.id);
        return { success: true };
      }),
  }),

  payment: router({
    initiatePayTech: publicProcedure
      .input(z.object({
        itemName: z.string().min(1, "itemName is required"),
        itemPrice: z.number().min(1, "itemPrice must be positive"),
        currency: z.string().default('XOF'),
        commandName: z.string().min(1, "commandName is required"),
        targetPayment: z.string().optional(),
        customField: z.record(z.string(), z.any()).optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const origin = ctx.req.headers.origin || ctx.req.headers.referer?.replace(/\/[^/]*$/, '') || `https://${ctx.req.headers.host}`;
        const refCommand = `CMD_${Date.now()}_${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

        const paymentRequest = {
          item_name: input.itemName,
          item_price: input.itemPrice,
          currency: input.currency,
          ref_command: refCommand,
          command_name: input.commandName,
          env: "test" as const, // Use "test" until PayTech account is activated for production
          ipn_url: `${origin}/api/paytech/ipn`,
          success_url: `${origin}/paiement-succes`,
          cancel_url: `${origin}/paiement-annule`,
          custom_field: input.customField ? JSON.stringify(input.customField) : undefined,
          target_payment: input.targetPayment,
        };

        const result = await initiatePayTechPayment(paymentRequest);
        return { ...result, refCommand };
      }),
    checkStatus: publicProcedure
      .input(z.object({ token: z.string() }))
      .query(async ({ input }) => {
        return await checkPayTechPaymentStatus(input.token);
      }),
  }),
});

export type AppRouter = typeof appRouter;
