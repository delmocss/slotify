import { Request, Response } from "express"
import { AuthService } from "./auth.service"

const service = new AuthService()

export async function register(req: Request, res: Response) {
  const result = await service.register(req.body)
  res.status(201).json(result)
}

export async function login(req: Request, res: Response) {
  const result = await service.login(req.body)
  res.json(result)
}

export async function getMe(req: Request, res: Response) {
  const businessId = req.businessId!

  const result = await service.getMe(businessId)

  res.json(result)
}

