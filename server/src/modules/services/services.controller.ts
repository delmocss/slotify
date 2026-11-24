import { Request, Response } from "express"
import { ServicesService } from "./services.service"
import { AppError } from "../../utils/appError"

const service = new ServicesService()

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

function param(value: string | string[]) {
  return Array.isArray(value) ? value[0] : value
}

// A malformed id can never match a row; answer 404 instead of letting Postgres
// fail the uuid cast with a 500.
function serviceId(req: Request) {
  const id = param(req.params.id)
  if (!UUID_RE.test(id)) throw new AppError("Service not found", 404)
  return id
}

export async function createService(req: Request, res: Response) {
  const result = await service.create(req.context!.organizationId, req.body)
  res.status(201).json(result)
}

export async function getServices(req: Request, res: Response) {
  const result = await service.getAll(req.context!.organizationId)
  res.json(result)
}

export async function updateService(req: Request, res: Response) {
  const result = await service.update(serviceId(req), req.context!.organizationId, req.body)
  res.json(result)
}

export async function deleteService(req: Request, res: Response) {
  await service.delete(serviceId(req), req.context!.organizationId)
  res.status(204).send()
}

export async function toggleService(req: Request, res: Response) {
  const result = await service.toggleService(param(req.params.slug), req.context!.organizationId)
  res.json(result)
}
