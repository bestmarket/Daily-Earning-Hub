import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolsRouter from "./tools";
import customRequestsRouter from "./custom-requests";
import adminRouter from "./admin";
import aiRecommendRouter from "./ai-recommend";
import siteSettingsRouter from "./site-settings";
import ogRouter from "./og";
import crmAiRouter from "./crm-ai";
import toolsAiRouter from "./tools-ai";
import apiKeysRouter from "./api-keys";
import automationRouter, { startScheduler } from "./automation";
import brevoRouter from "./brevo";
import reportsRouter from "./reports";
import affiliateRouter from "./affiliate";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolsRouter);
router.use(customRequestsRouter);
router.use(adminRouter);
router.use(aiRecommendRouter);
router.use(siteSettingsRouter);
router.use(ogRouter);
router.use(crmAiRouter);
router.use(toolsAiRouter);
router.use(apiKeysRouter);
router.use(automationRouter);
router.use(brevoRouter);
// Reports must come before any wildcard routes — public /api/reports/:reportId + admin sub-paths
router.use(reportsRouter);
router.use(affiliateRouter);

// Start the automation scheduler (no-op if auto mode is off)
startScheduler();

export default router;
