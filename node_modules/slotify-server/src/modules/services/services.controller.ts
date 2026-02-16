import { Request, Response } from "express"
import { ServicesService } from "./services.service"

const service = new ServicesService()

export async function createService(req: Request, res: Response) {
  const result = await service.create(req.businessId!, req.body)
  res.status(201).json(result)
}

export async function getServices(req: Request, res: Response) {
  const result = await service.getAll(req.businessId!)
  res.json(result)
}

export async function updateService(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  const result = await service.update(
    id,
    req.businessId!,
    req.body
  )
  res.json(result)
}

export async function deleteService(req: Request, res: Response) {
  const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id
  await service.delete(id, req.businessId!)
  res.status(204).send()
}
