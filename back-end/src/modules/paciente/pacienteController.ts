import { Request, Response } from "express";
import { PacienteService } from "./pacienteService";

export class PacienteController {
  constructor(private service: PacienteService) {}

  //Paciente
  create = async (req: Request, res: Response) => {
    // Converte string para Date
    const data = {
      ...req.body,
      data_nascimento: new Date(req.body.data_nascimento),
    };
    const result = await this.service.create(data);
    return res.status(201).json(result);
  };

  getById = async (req: Request, res: Response) => {
    const result = await this.service.getById(req.params.id);
    return res.json(result);
  };

  listPaginated = async (req: Request, res: Response) => {
    const { page = 1, limit = 10 } = req.query;
    const result = await this.service.listPaginated(
      Number(page),
      Number(limit)
    );
    return res.json(result);
  };

  listAll = async (req: Request, res: Response) => {
    const result = await this.service.listAll();
    return res.json(result);
  };

  update = async (req: Request, res: Response) => {
    const data = { ...req.body };
    if (data.data_nascimento) {
      data.data_nascimento = new Date(data.data_nascimento);
    }
    const result = await this.service.update(req.params.id, data);
    return res.json(result);
  };

  searchPaginated = async (req: Request, res: Response) => {
    const { q = "", page = 1, limit = 10 } = req.query;
    const result = await this.service.searchPaginated(
      String(q),
      Number(page),
      Number(limit)
    );
    return res.json(result);
  };

  delete = async (req: Request, res: Response) => {
    await this.service.delete(req.params.id);
    return res.status(204).send();
  };

  //Paciente Tags
  addTag = async (req: Request, res: Response) => {
    const result = await this.service.addTag(
      req.params.id_paciente,
      req.body.nome
    );
    return res.status(201).json(result);
  };

  listTags = async (req: Request, res: Response) => {
    const result = await this.service.listTags(req.params.id_paciente);
    return res.json(result);
  };

  //Debitos
  addDebito = async (req: Request, res: Response) => {
    const result = await this.service.addDebito(req.params.id_paciente, {
      ...req.body,
      data_vencimento: new Date(req.body.data_vencimento),
    });
    return res.status(201).json(result);
  };

  listDebitos = async (req: Request, res: Response) => {
    const result = await this.service.listDebitos(req.params.id_paciente);
    return res.json(result);
  };

  payDebito = async (req: Request, res: Response) => {
    const result = await this.service.payDebito(req.params.id_debito);
    return res.json(result);
  };

  deleteDebito = async (req: Request, res: Response) => {
    await this.service.deleteDebito(req.params.id_debito);
    return res.status(204).send();
  };

  //Telefone
  addTelefone = async (req: Request, res: Response) => {
    const result = await this.service.addTelefone(
      req.params.id_paciente,
      req.body
    );
    return res.status(201).json(result);
  };

  replaceTelefones = async (req: Request, res: Response) => {
    const result = await this.service.replaceTelefones(
      req.params.id_paciente,
      req.body
    );
    return res.status(200).json(result);
  };

  listTelefones = async (req: Request, res: Response) => {
    const result = await this.service.listTelefones(req.params.id_paciente);
    return res.json(result);
  };

  deleteTelefone = async (req: Request, res: Response) => {
    await this.service.deleteTelefone(req.params.id_telefone);
    return res.status(204).send();
  };

  // GET /pacientes/:id_paciente/prontuario
  getProntuario = async (req: Request, res: Response) => {
    const result = await this.service.getProntuario(req.params.id_paciente);
    return res.json(result);
  };

  // POST /prontuarios/:id_prontuario/entradas
  createEntrada = async (req: Request, res: Response) => {
    // ADICIONE ESTAS LINHAS PARA DEBUGAR
    console.log("USER COMPLETO:", req.user);

    // Verifique se o campo é 'userId', 'id' ou 'sub'
    const id_usuario = req.user?.userId || req.user?.userId;

    if (!id_usuario) {
      console.log("Falha: ID do usuário não encontrado no token");
      return res.status(401).json({ message: "Usuário não autenticado" });
    }

    const result = await this.service.createEntrada(
      req.params.id_prontuario,
      id_usuario,
      req.body
    );
    return res.status(201).json(result);
  };

  // GET /prontuarios/:id_prontuario/entradas
  listEntradas = async (req: Request, res: Response) => {
    const { tipo } = req.query;
    const result = await this.service.listEntradas(
      req.params.id_prontuario,
      tipo ? String(tipo) : undefined
    );
    return res.json(result);
  };

  // GET /prontuarios/:id_prontuario/entradas/:id_entrada
  getEntrada = async (req: Request, res: Response) => {
    const result = await this.service.getEntrada(req.params.id_entrada);
    return res.json(result);
  };

  // PUT /prontuarios/:id_prontuario/entradas/:id_entrada
  updateEntrada = async (req: Request, res: Response) => {
    const id_usuario = req.user?.userId;
    if (!id_usuario)
      return res.status(401).json({ message: "Usuário não autenticado" });

    const result = await this.service.updateEntrada(
      req.params.id_entrada,
      id_usuario,
      req.body
    );
    return res.json(result);
  };

  // DELETE /prontuarios/:id_prontuario/entradas/:id_entrada
  deleteEntrada = async (req: Request, res: Response) => {
    const id_usuario = req.user?.userId;
    if (!id_usuario)
      return res.status(401).json({ message: "Usuário não autenticado" });

    await this.service.deleteEntrada(req.params.id_entrada, id_usuario);
    return res.status(204).send();
  };

  // POST /prontuarios/:id_prontuario/entradas/:id_entrada/arquivos
  addArquivo = async (req: Request, res: Response) => {
    const id_usuario = req.user?.userId;
    if (!id_usuario)
      return res.status(401).json({ message: "Usuário não autenticado" });

    // Aqui assume que o upload do arquivo já foi processado por um middleware (ex: multer)
    // e os dados do arquivo (URL, nome) estão no body ou em req.file
    // Para simplificar, vou assumir que o serviço de upload devolveu os metadados no body:

    const result = await this.service.addArquivo(
      req.params.id_entrada,
      id_usuario,
      req.body
    );
    return res.status(201).json(result);
  };

  // DELETE /prontuarios/:id_prontuario/entradas/:id_entrada/arquivos/:id_arquivo
  removeArquivo = async (req: Request, res: Response) => {
    const id_usuario = req.user?.userId;
    if (!id_usuario)
      return res.status(401).json({ message: "Usuário não autenticado" });

    await this.service.removeArquivo(req.params.id_arquivo, id_usuario);
    return res.status(204).send();
  };
}
