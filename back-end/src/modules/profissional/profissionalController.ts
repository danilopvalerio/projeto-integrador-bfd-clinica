import { Request, Response } from "express";
import { ProfissionalService } from "./profissionalService";

export class ProfissionalController {
  constructor(private profissionalService: ProfissionalService) {}

  create = async (req: Request, res: Response): Promise<Response> => {
    const profissional = await this.profissionalService.create(req.body);
    return res.status(201).json(profissional);
  };
}
