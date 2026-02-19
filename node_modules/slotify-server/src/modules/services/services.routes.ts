import { Router } from "express"
import { protect } from "../../middlewares/auth.middleware"
import { validate } from "../../middlewares/validate.middleware"
import {
  createService,
  getServices,
  updateService,
  deleteService,
  toggleService,
} from "./services.controller"
import {
  createServiceSchema,
  updateServiceSchema,
} from "./services.schema"

const router = Router()

router.use(protect)

router.get("/", getServices)
router.post("/", validate(createServiceSchema), createService)
router.put("/:id", validate(updateServiceSchema), updateService)
router.delete("/:id", deleteService)
router.patch("/:slug/toggle", toggleService)

export default router
