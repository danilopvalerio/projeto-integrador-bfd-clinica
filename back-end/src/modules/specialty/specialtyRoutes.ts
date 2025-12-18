import { Router } from "express";
import { SpecialtyRepository } from "./specialtyRepository";
import { SpecialtyService } from "./specialtyService";
import { SpecialtyController } from "./specialtyController";

const specialtyRoutes = Router();


const specialtyRepository = new SpecialtyRepository();
const specialtyService = new SpecialtyService(specialtyRepository);
const specialtyController = new SpecialtyController(specialtyService);

specialtyRoutes.post("/", specialtyController.create);
specialtyRoutes.patch("/:id", specialtyController.update);

// rotas específicas antes do :id
specialtyRoutes.get("/", specialtyController.findAll);
specialtyRoutes.get("/search", specialtyController.searchPaginated);
specialtyRoutes.get("/paginated", specialtyController.listPaginated);
specialtyRoutes.get("/:id", specialtyController.getById);

specialtyRoutes.delete("/:id", specialtyController.delete);

export { specialtyRoutes };
