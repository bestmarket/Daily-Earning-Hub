import { Router, type IRouter } from "express";
import healthRouter from "./health";
import toolsRouter from "./tools";
import customRequestsRouter from "./custom-requests";
import adminRouter from "./admin";
import aiRecommendRouter from "./ai-recommend";
import siteSettingsRouter from "./site-settings";
import ogRouter from "./og";
import crmAiRouter from "./crm-ai";

const router: IRouter = Router();

router.use(healthRouter);
router.use(toolsRouter);
router.use(customRequestsRouter);
router.use(adminRouter);
router.use(aiRecommendRouter);
router.use(siteSettingsRouter);
router.use(ogRouter);
router.use(crmAiRouter);

export default router;
