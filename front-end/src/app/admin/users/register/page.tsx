"use client";

import { useState } from "react";
import { Container, Row, Col, Card, Form, Button, Alert } from "react-bootstrap";
import { FaUserPlus, FaArrowLeft, FaSave } from "react-icons/fa";
import Link from "next/link";

export default function RegisterUserPage() {
  const [formData, setFormData] = useState({
    email: "",
    tipo: "RECEPCIONISTA", // Valor padrão
    ativo: true,
    // Campos específicos de profissional
    nome: "",
    cpf: "",
    registroConselho: "",
  });

  const [feedback, setFeedback] = useState<{ type: 'success' | 'danger' | null, message: string }>({ type: null, message: '' });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    
    // Tratamento para checkbox
    if (type === 'checkbox') {
        const checked = (e.target as HTMLInputElement).checked;
        setFormData(prev => ({ ...prev, [name]: checked }));
        return;
    }

    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Simulação de Validação Básica
    if (!formData.email) {
        setFeedback({ type: 'danger', message: 'O email é obrigatório.' });
        return;
    }

    if (formData.tipo === 'PROFISSIONAL') {
        if (!formData.nome || !formData.cpf || !formData.registroConselho) {
            setFeedback({ type: 'danger', message: 'Para profissionais, todos os campos adicionais são obrigatórios.' });
            return;
        }
    }

    // Simulação de Envio
    console.log("📦 Dados do Formulário Enviados:", formData);
    
    // Simulação de Sucesso
    setFeedback({ type: 'success', message: 'Usuário cadastrado com sucesso! (Simulação - Verifique o Console)' });
    
    // Resetar formulário (opcional)
    // setFormData({ ...formData, email: '', nome: '', cpf: '', registroConselho: '' });
  };

  const isProfissional = formData.tipo === "PROFISSIONAL";

  return (
    <div className="min-vh-100 bg-light py-5">
      <Container>
        <div className="mb-4">
          <Link href="/menu" passHref legacyBehavior>
             <Button variant="link" className="text-decoration-none text-secondary p-0 d-flex align-items-center gap-2 mb-2">
                <FaArrowLeft /> Voltar ao Menu
             </Button>
          </Link>
          <h2 className="fw-bold text-primary d-flex align-items-center gap-2">
            <FaUserPlus /> Cadastro de Usuários
          </h2>
          <p className="text-muted">Área administrativa para gestão de acessos do sistema.</p>
        </div>

        <Row className="justify-content-center">
          <Col md={10} lg={8}>
            <Card className="shadow-sm border-0 rounded-3">
              <Card.Header className="bg-white py-3 border-bottom">
                <h5 className="mb-0 fw-bold text-dark">Novo Usuário</h5>
              </Card.Header>
              <Card.Body className="p-4">
                
                {feedback.message && (
                    <Alert variant={feedback.type || 'info'} onClose={() => setFeedback({ type: null, message: '' })} dismissible>
                        {feedback.message}
                    </Alert>
                )}

                <Form onSubmit={handleSubmit}>
                  {/* DADOS DE ACESSO */}
                  <h6 className="text-uppercase text-secondary fw-bold small mb-3 letter-spacing-1">Dados de Acesso</h6>
                  <Row className="g-3 mb-4">
                    <Col md={6}>
                      <Form.Group controlId="email">
                        <Form.Label>Email <span className="text-danger">*</span></Form.Label>
                        <Form.Control
                          type="email"
                          name="email"
                          placeholder="ex: usuario@clinica.com"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                      </Form.Group>
                    </Col>
                    <Col md={4}>
                      <Form.Group controlId="tipo">
                        <Form.Label>Tipo de Usuário <span className="text-danger">*</span></Form.Label>
                        <Form.Select
                          name="tipo"
                          value={formData.tipo}
                          onChange={handleChange}
                        >
                          <option value="RECEPCIONISTA">Recepcionista</option>
                          <option value="PROFISSIONAL">Profissional de Saúde</option>
                          {/* <option value="GERENTE">Gerente (Admin)</option> */}
                        </Form.Select>
                      </Form.Group>
                    </Col>
                    <Col md={2}>
                        <Form.Group controlId="ativo" className="h-100 d-flex align-items-end pb-2">
                            <Form.Check 
                                type="switch"
                                id="ativo-switch"
                                label="Ativo"
                                name="ativo"
                                checked={formData.ativo}
                                onChange={handleChange}
                            />
                        </Form.Group>
                    </Col>
                  </Row>

                  {/* DADOS DO PROFISSIONAL (CONDICIONAL) */}
                  {isProfissional && (
                    <div className="animation-fade-in bg-light p-4 rounded-3 mb-4 border">
                      <h6 className="text-uppercase text-primary fw-bold small mb-3 letter-spacing-1 d-flex align-items-center gap-2">
                         Dados do Profissional
                      </h6>
                      <Row className="g-3">
                        <Col md={12}>
                          <Form.Group controlId="nome">
                            <Form.Label>Nome Completo <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="nome"
                              placeholder="Nome do profissional"
                              value={formData.nome}
                              onChange={handleChange}
                              required={isProfissional}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="cpf">
                            <Form.Label>CPF <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="cpf"
                              placeholder="000.000.000-00"
                              value={formData.cpf}
                              onChange={handleChange}
                              required={isProfissional}
                            />
                          </Form.Group>
                        </Col>
                        <Col md={6}>
                          <Form.Group controlId="registroConselho">
                            <Form.Label>Registro do Conselho (CRM/CRO/etc) <span className="text-danger">*</span></Form.Label>
                            <Form.Control
                              type="text"
                              name="registroConselho"
                              placeholder="Ex: CRM/SP 123456"
                              value={formData.registroConselho}
                              onChange={handleChange}
                              required={isProfissional}
                            />
                          </Form.Group>
                        </Col>
                      </Row>
                    </div>
                  )}

                  <div className="d-flex justify-content-end gap-2 mt-4 pt-3 border-top">
                    <Button variant="outline-secondary" type="button" onClick={() => window.history.back()}>
                        Cancelar
                    </Button>
                    <Button variant="primary" type="submit" className="d-flex align-items-center gap-2 px-4">
                      <FaSave /> Salvar Usuário
                    </Button>
                  </div>
                </Form>
              </Card.Body>
            </Card>
          </Col>
        </Row>
      </Container>
      
      <style jsx>{`
        .letter-spacing-1 {
            letter-spacing: 1px;
        }
        .animation-fade-in {
            animation: fadeIn 0.5s ease-in-out;
        }
        @keyframes fadeIn {
            from { opacity: 0; transform: translateY(-10px); }
            to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
