"use client";

import { useState } from "react";
import { Container, Row, Col, Card, Button, Carousel, Navbar, Nav } from "react-bootstrap";
import { FaSignInAlt, FaWhatsapp, FaInstagram, FaFacebook } from "react-icons/fa";
import Link from "next/link";

// ------------------- MOCKS -------------------
const mockServices = [
  {
    id: "1",
    nome: "Consulta Clínica Geral",
    descricao: "Atendimento médico completo para avaliação de saúde e diagnósticos.",
    valor: "150,00",
  },
  {
    id: "2",
    nome: "Cardiologia",
    descricao: "Avaliação do coração e sistema cardiovascular com especialistas.",
    valor: "250,00",
  },
  {
    id: "3",
    nome: "Pediatria",
    descricao: "Cuidado dedicado à saúde e desenvolvimento das crianças.",
    valor: "200,00",
  },
  {
    id: "4",
    nome: "Exames Laboratoriais",
    descricao: "Coleta e análise de exames diversos com resultados rápidos.",
    valor: undefined, // Preço sob consulta
  },
];

const mockCarouselImages = [
  {
    id: "1",
    url: "https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop",
    title: "Cuidado Humanizado",
    subtitle: "Sua saúde em primeiro lugar com atendimento de excelência.",
  },
  {
    id: "2",
    url: "https://images.unsplash.com/photo-1505751172876-fa1923c5c528?q=80&w=2070&auto=format&fit=crop",
    title: "Tecnologia Avançada",
    subtitle: "Equipamentos modernos para diagnósticos precisos.",
  },
  {
    id: "3",
    url: "https://images.unsplash.com/photo-1666214280557-f1b5022eb634?q=80&w=2070&auto=format&fit=crop",
    title: "Equipe Especializada",
    subtitle: "Profissionais qualificados prontos para te atender.",
  },
];

export default function Home() {
  const [index, setIndex] = useState(0);

  const handleSelect = (selectedIndex: number) => {
    setIndex(selectedIndex);
  };

  return (
    <main className="min-vh-100 d-flex flex-column bg-light">
      {/* HEADER / NAVBAR */}
      <Navbar expand="lg" className="bg-white shadow-sm py-3">
        <Container>
          <Navbar.Brand href="/" className="fw-bold text-primary d-flex align-items-center gap-2">
             {/* Logo Placeholder - Usando texto estilizado por enquanto */}
             <div className="bg-primary text-white rounded p-2 d-flex align-items-center justify-content-center" style={{width: 40, height: 40}}>
                BFD
             </div>
             <span>Clínica BFD</span>
          </Navbar.Brand>
          <Navbar.Toggle aria-controls="basic-navbar-nav" />
          <Navbar.Collapse id="basic-navbar-nav" className="justify-content-end">
            <Nav className="align-items-center gap-3">
              <Nav.Link href="#servicos">Serviços</Nav.Link>
              <Nav.Link href="#sobre">Sobre Nós</Nav.Link>
              <Nav.Link href="#contato">Contato</Nav.Link>
              <Link href="/login" passHref legacyBehavior>
                <Button variant="outline-primary" className="rounded-pill px-4 d-flex align-items-center gap-2">
                  <FaSignInAlt /> Área Restrita
                </Button>
              </Link>
            </Nav>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* HERO SECTION / CAROUSEL */}
      <section className="w-100">
        <Carousel activeIndex={index} onSelect={handleSelect} className="shadow-lg">
          {mockCarouselImages.map((img) => (
            <Carousel.Item key={img.id} interval={5000}>
              <div 
                style={{ 
                  height: "500px", 
                  backgroundImage: `url(${img.url})`, 
                  backgroundSize: "cover", 
                  backgroundPosition: "center" 
                }} 
                className="w-100 position-relative"
              >
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-dark opacity-50"></div>
                <div className="carousel-caption d-none d-md-block pb-5 mb-4">
                  <h1 className="display-4 fw-bold">{img.title}</h1>
                  <p className="lead">{img.subtitle}</p>
                  <Button variant="primary" size="lg" className="rounded-pill mt-3 px-5">
                    Agendar Consulta
                  </Button>
                </div>
              </div>
            </Carousel.Item>
          ))}
        </Carousel>
      </section>

      {/* APRESENTAÇÃO / INTRODUÇÃO */}
      <section className="py-5 bg-white" id="sobre">
        <Container>
          <Row className="justify-content-center text-center mb-5">
            <Col md={8}>
              <h2 className="fw-bold mb-3 text-primary">Bem-vindo à Clínica BFD</h2>
              <p className="text-muted fs-5">
                Somos referência em atendimento humanizado e medicina de precisão. 
                Nossa missão é promover saúde e bem-estar para você e sua família, 
                com uma equipe multidisciplinar e estrutura completa.
              </p>
            </Col>
          </Row>
        </Container>
      </section>

      {/* SERVIÇOS PRINCIPAIS */}
      <section className="py-5 bg-light" id="servicos">
        <Container>
          <div className="text-center mb-5">
            <h6 className="text-uppercase text-primary fw-bold letter-spacing-2">O que oferecemos</h6>
            <h2 className="fw-bold">Nossos Principais Serviços</h2>
          </div>

          <Row className="g-4">
            {mockServices.map((service) => (
              <Col key={service.id} md={6} lg={3}>
                <Card className="h-100 border-0 shadow-sm hover-card transition-all">
                  <Card.Body className="text-center p-4 d-flex flex-column">
                    <div className="mb-3 mx-auto bg-primary bg-opacity-10 p-3 rounded-circle text-primary" style={{width: 60, height: 60, display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                      {/* Ícone genérico baseada na primeira letra */}
                      <span className="fw-bold fs-4">{service.nome.charAt(0)}</span>
                    </div>
                    <Card.Title className="fw-bold mb-3">{service.nome}</Card.Title>
                    <Card.Text className="text-muted small flex-grow-1">
                      {service.descricao}
                    </Card.Text>
                    <div className="mt-3 pt-3 border-top">
                      {service.valor ? (
                        <span className="fw-bold text-success fs-5">R$ {service.valor}</span>
                      ) : (
                        <span className="text-muted fst-italic">Consulte valores</span>
                      )}
                    </div>
                  </Card.Body>
                </Card>
              </Col>
            ))}
          </Row>
          
          <div className="text-center mt-5">
            <Button variant="outline-primary" size="lg" className="rounded-pill px-5">
              Ver Todos os Serviços
            </Button>
          </div>
        </Container>
      </section>

      {/* FOOTER */}
      <footer className="py-5 mt-auto" style={{ backgroundColor: '#1a1a1a', color: '#ffffff' }}>
        <Container>
          <Row className="gy-4">
            <Col md={4}>
              <h5 className="fw-bold mb-3 text-white">Clínica BFD</h5>
              <p className="small text-white-50">
                Excelência em saúde e cuidado. Agende sua consulta e venha nos conhecer.
              </p>
              <div className="d-flex gap-3 mt-3">
                <a href="#" className="text-white opacity-75 hover-opacity-100"><FaInstagram size={24} /></a>
                <a href="#" className="text-white opacity-75 hover-opacity-100"><FaFacebook size={24} /></a>
                <a href="#" className="text-white opacity-75 hover-opacity-100"><FaWhatsapp size={24} /></a>
              </div>
            </Col>
            <Col md={4}>
              <h5 className="fw-bold mb-3 text-white">Links Rápidos</h5>
              <ul className="list-unstyled">
                <li className="mb-2"><a href="#sobre" className="text-decoration-none text-white-50 hover-text-white">Sobre Nós</a></li>
                <li className="mb-2"><a href="#servicos" className="text-decoration-none text-white-50 hover-text-white">Serviços</a></li>
                <li className="mb-2"><a href="#contato" className="text-decoration-none text-white-50 hover-text-white">Fale Conosco</a></li>
                <li className="mb-2"><Link href="/login" className="text-decoration-none text-white-50 hover-text-white">Área do Paciente</Link></li>
              </ul>
            </Col>
            <Col md={4}>
              <h5 className="fw-bold mb-3 text-white">Contato</h5>
              <p className="small mb-1 text-white-50">📍 Rua das Flores, 123 - Centro</p>
              <p className="small mb-1 text-white-50">📞 (11) 99999-9999</p>
              <p className="small text-white-50">✉️ contato@clinicabfd.com.br</p>
            </Col>
          </Row>
          <div className="border-top border-secondary mt-4 pt-4 text-center small text-white-50">
            © {new Date().getFullYear()} Clínica BFD. Todos os direitos reservados.
          </div>
        </Container>
      </footer>

      {/* Estilos inline para hover effects que não estão no global */}
      <style jsx global>{`
        .hover-card:hover {
          transform: translateY(-5px);
          transition: transform 0.3s ease;
        }
        .letter-spacing-2 {
          letter-spacing: 2px;
        }
        .hover-text-white:hover {
          color: white !important;
        }
      `}</style>
    </main>
  );
}
