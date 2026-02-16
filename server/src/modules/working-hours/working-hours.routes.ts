import { Router } from "express"
import { protect } from "../../middlewares/auth.middleware"
import { validate } from "../../middlewares/validate.middleware"
import {
  updateWorkingHours,
  getWorkingHours,
} from "./working-hours.controller"
import { updateWorkingHoursSchema } from "./working-hours.schema"

const router = Router()

router.use(protect)

router.get("/", getWorkingHours)
router.put("/", validate(updateWorkingHoursSchema), updateWorkingHours)

export default router
