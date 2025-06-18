// src/pages/delivery-terms/index.jsx
import React, { useState, useEffect } from 'react';
import NavBar from '../../components/Nav';
import {
  Container,
  Row,
  Col,
  Nav,
  ListGroup,
  Offcanvas,
  Button
} from 'react-bootstrap';

const sections = [
  {
    id: 'introduction',
    title: '1. Introduction and Agreement to Terms',
    content: `By registering for and using this app, you ("Delivery Partner", "you", "your") agree to be bound by these Terms and Conditions ("Terms"). If you do not agree, you may not access or use the app.`
  },
  {
    id: 'eligibility-registration',
    title: '2. Eligibility and Registration',
    list: [
      'You must be at least 18 years old to register and work as a delivery partner.',
      'You must possess a valid government-issued national identity card and a valid driver’s/rider’s license.',
      'You must have access to a smartphone with active internet, GPS, and the latest version of the app.'
    ]
  },
  {
    id: 'user-account-responsibilities',
    title: '3. User Account Responsibilities',
    list: [
      'You agree to provide correct, complete, and current information during registration and at all times.',
      'You are solely responsible for maintaining the confidentiality and security of your login credentials.',
      'You may not share your account with others. Only one account per individual is permitted.'
    ]
  },
  {
    id: 'role-responsibilities',
    title: '4. Role and Responsibilities of Delivery Partners',
    list: [
      'You agree to accept and complete delivery tasks in a timely, respectful, and professional manner.',
      'Pickup and drop-off should adhere to time expectations set by the app.',
      'You must maintain courteous communication with Arpella’s customers via in-app chat or call features.',
      'In case of issues (e.g., customer unavailability, incorrect address), you must report immediately through the app and follow provided instructions.',
      'Undeliverable items must be returned to the seller’s designated hub or as directed by the support team.'
    ]
  },
  {
    id: 'payouts-compensation',
    title: '5. Payouts and Compensation',
    list: [
      'Payouts are processed daily/weekly/monthly, depending on your location, via bank transfer, mobile money (e.g., M-Pesa, Airtel Money) or other designated digital payment methods.',
      'You earn a delivery fee per order, with potential bonuses or incentives as applicable.',
      'Deductions may occur for cancelled deliveries, late deliveries, or rule violations.',
      'You are classified as an independent contractor and are solely responsible for reporting and paying your taxes.'
    ]
  },
  {
    id: 'code-of-conduct',
    title: '6. Code of Conduct',
    list: [
      'You must act professionally, respectfully, responsibly and lawfully at all times.',
      'Prohibited behavior includes, but is not limited to, sexual, physical or verbal harassment, discriminatory actions, theft, tampering with packages, substance abuse, or falsifying deliveries.',
      'If applicable, you are required to wear company-branded gear or presentable clothing while on duty.'
    ]
  },
  {
    id: 'app-use',
    title: '7. Use of the App',
    list: [
      'You may not attempt to reverse engineer, decompile, or exploit the app in a manner that compromises its safety, functionality or integrity.',
      'You may only use the app for its intended purpose and in compliance with all local laws.'
    ]
  },
  {
    id: 'delivery-liability',
    title: '8. Delivery and Liability',
    list: [
      'You are responsible for packages in your possession and liable for loss, damage, or delays caused by negligence or inaction.',
      'Package tampering and theft are strictly prohibited and grounds for immediate termination.',
      'In the case of loss or damage, the company may deduct compensation from your payouts after investigation.'
    ]
  },
  {
    id: 'suspension-termination',
    title: '9. Suspension or Termination of Account',
    list: [
      'We reserve the right to suspend or terminate your account for reasons including repeated delivery issues, customer complaints, safety violations, or misuse of the app.',
      'Investigations will be conducted where necessary, and you may be given a chance to respond or appeal.',
      'There is no guarantee of account reactivation or rehire once terminated.'
    ]
  },
  {
    id: 'insurance-risk',
    title: '10. Insurance and Risk',
    list: [
      'Unless explicitly stated, delivery partners are not covered by company-provided insurance.',
      'You are responsible for ensuring your motorbike and personal insurance coverage complies with local regulations.',
      'You acknowledge and agree that you are an independent contractor, not an employee, and you assume full risk during deliveries.'
    ]
  },
  {
    id: 'dispute-resolution',
    title: '11. Dispute Resolution',
    list: [
      'For any disputes or complaints, please contact our Rider Support Team via the app.',
      'The company encourages internal resolution first. If unresolved, matters may be referred to mediation or municipal courts under Kenya law.',
      'Legal proceedings will be governed by the jurisdiction in Kenya.'
    ]
  }
];

export default function DeliveryTermsPage() {
  const [activeId, setActiveId] = useState('introduction');
  const [showNav, setShowNav] = useState(false);
  const activeSection = sections.find(s => s.id === activeId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .custom-nav-link {
          color: inherit !important;
          background-color: transparent !important;
        }
        .custom-nav-link:hover {
          background-color: #333 !important;
          color: #fff !important;
        }
        .custom-nav-link.active {
          background-color: #ff8c00 !important;
          color: #fff !important;
          font-weight: 600 !important;
        }
      `}</style>

      <div style={{
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1000,
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between'
      }}>
        <NavBar />
        <Button
          variant="outline-secondary"
          className="d-md-none"
          onClick={() => setShowNav(true)}
        >
          Menu
        </Button>
      </div>

      <Offcanvas show={showNav} onHide={() => setShowNav(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Sections</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <Nav variant="pills" className="flex-column">
            {sections.map(sec => (
              <Nav.Item key={sec.id} className="mb-2">
                <Nav.Link
                  className="custom-nav-link"
                  onClick={() => {
                    setActiveId(sec.id);
                    setShowNav(false);
                  }}
                  active={sec.id === activeId}
                >
                  {sec.title}
                </Nav.Link>
              </Nav.Item>
            ))}
          </Nav>
        </Offcanvas.Body>
      </Offcanvas>

      <Container fluid>
        <Row>
          <Col
            md={2}
            className="d-none d-md-block border-end"
            style={{
              position: 'sticky',
              top: '100px',
              height: 'calc(100vh - 100px)',
              overflowY: 'auto'
            }}
          >
            <Nav variant="pills" className="flex-column mt-3">
              {sections.map(sec => (
                <Nav.Item key={sec.id} className="mb-2">
                  <Nav.Link
                    className="custom-nav-link"
                    onClick={() => setActiveId(sec.id)}
                    active={sec.id === activeId}
                  >
                    {sec.title}
                  </Nav.Link>
                </Nav.Item>
              ))}
            </Nav>
          </Col>

          <Col md={10} className="py-5 d-flex justify-content-center">
            <div style={{ maxWidth: '800px', width: '100%', padding: '0 1rem' }}>
              <h1 className="mb-3">Terms & Conditions<br/><small>Arpella Delivery App – Contracted Riders</small></h1>
              <p className="text-muted mb-4">Effective Date May 1 2025</p>

              <section id={activeSection.id}>
                <h4 className="mb-3">{activeSection.title}</h4>
                {activeSection.content && (
                  <p style={{ lineHeight: 1.8, color: '#333', whiteSpace: 'pre-line' }}>
                    {activeSection.content}
                  </p>
                )}
                {activeSection.list && (
                  <ListGroup variant="flush" className="ps-2">
                    {activeSection.list.map((item, i) => (
                      <ListGroup.Item key={i} className="border-0 ps-0">
                        • {item}
                      </ListGroup.Item>
                    ))}
                  </ListGroup>
                )}
              </section>
            </div>
          </Col>
        </Row>
      </Container>
    </div>
  );
}
