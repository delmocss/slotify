import { Router } from "express"
import { register, login, getMe } from "./auth.controller"
import { validate } from "../../middlewares/validate.middleware"
import { registerSchema, loginSchema } from "./auth.schema"
import { protect } from "../../middlewares/auth.middleware"

const router = Router()

router.post("/register", validate(registerSchema), register)
router.post("/login", validate(loginSchema), login)

router.get("/me", protect, getMe)

export default router
