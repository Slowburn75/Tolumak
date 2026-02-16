import { dashboardRouter } from "./dashboard.router";
import { productRouter } from "./product.router";
import { categoryRouter } from "./category.router";
import { orderRouter } from "./order.router";
import { collectionRouter } from "./collection.router";
import { attributeRouter } from "./attribute.router";
import { couponRouter } from "./coupon.router";
import { customerRouter } from "./customer.router";
import { settingRouter } from "./setting.router";
import { activityRouter, metricRouter } from "./activity-metric.router";
import { variantRouter } from "./variant.router";

export const adminRouter = {
  dashboard: dashboardRouter,
  products: productRouter,
  categories: categoryRouter,
  orders: orderRouter,
  collections: collectionRouter,
  attributes: attributeRouter,
  coupons: couponRouter,
  customers: customerRouter,
  settings: settingRouter,
  activities: activityRouter,
  metrics: metricRouter,
  productVariants: variantRouter,
};
