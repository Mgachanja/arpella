// src/pages/privacy/index.jsx
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
    title: '1. Introduction',
    content: `Welcome to Arpella Stores. Your privacy is important to us. This Privacy Policy outlines how we collect, use, disclose, and protect your personal information when you use our mobile application and the ecommerce web application.

By using the Arpella Stores app and the ecommerce web application you agree to the terms outlined in this policy.`
  },
  {
    id: 'information-we-collect',
    title: '2. Information We Collect',
    list: [
      'Full name',
      'Email address',
      'Phone number',
      'Physical delivery address',
      'Live location with your permission',
      'M-Pesa number',
      'KRA PIN optional used for compliance purposes'
    ]
  },
  {
    id: 'app-permissions',
    title: '3. App Permissions',
    content: `Our app requests the following permissions:

Location access to enable real time delivery tracking  
Storage access for caching product images and improving performance  

All permissions are explicitly requested and you can manage them in your device settings.`
  },
  {
    id: 'use-of-information',
    title: '4. Use of Information',
    list: [
      'Order processing and fulfillment',
      'Delivery tracking and logistics',
      'Customer service and communication',
      'Account management',
      'Fraud detection and compliance with applicable regulations'
    ]
  },
  {
    id: 'payments',
    title: '5. Payments',
    content: `We use M-Pesa as our primary payment method. You will be prompted to input your M-Pesa number when checking out. We do not collect process or store M-Pesa PINs or payment credentials on our servers.`
  },
  {
    id: 'data-sharing',
    title: '6. Data Sharing',
    content: `We do not sell or rent your personal data to third parties. We may share your information with:

Delivery personnel for order fulfillment  
Legal authorities upon valid request  
Future integrations with services like Google OAuth under strict compliance with their user data policies`
  },
  {
    id: 'data-security',
    title: '7. Data Security',
    list: [
      'HTTPS and SSL encryption',
      'Access controls and user authentication',
      'Regular system audits and security reviews'
    ]
  },
  {
    id: 'data-retention',
    title: '8. Data Retention',
    content: `We retain user data only as long as is necessary to:

Fulfill customer orders  
Comply with legal and tax obligations  
Maintain internal records and resolve disputes  

You may request deletion of your account at any time.`
  },
  {
    id: 'user-rights',
    title: '9. User Rights',
    content: `As a user you have the right to:

Access the personal data we store about you  
Request corrections or updates to your information  
Request data deletion or deactivation of your account  

To make any of these requests contact us via the details provided in Section 13.`
  },
  {
    id: 'childrens-privacy',
    title: '10. Children’s Privacy',
    content: `Arpella Stores does not knowingly collect data from children under the age of 13. In the Kenyan context we understand that minors may access smartphones registered under their parents names which makes it difficult to verify age.

We therefore require all users to confirm that they are either:

18 years of age or older or  
Using the app with full parental or guardian consent  

Some products may be flagged as age restricted in the future. For these items a warning will appear before checkout and we reserve the right to cancel any order suspected to be made by an underage user.

If we become aware that we have unknowingly collected personal data from a child under 13 without parental consent we will delete it immediately.`
  },
  {
    id: 'cookies-tracking',
    title: '11. Cookies and Tracking',
    content: `We may use basic tracking technologies such as Firebase Analytics to understand how users interact with the app and improve our services. These technologies do not identify you personally.`
  },
  {
    id: 'legal-compliance',
    title: '12. Legal and Platform Compliance',
    list: [
      'The Kenya Data Protection Act 2019',
      'The General Data Protection Regulation GDPR where applicable to international users',
      'Apple’s App Store Review Guidelines including policies on data minimization user consent secure data transmission and limited data use for permitted purposes'
    ]
  },
  {
    id: 'contact-us',
    title: '13. Contact Us',
    content: `If you have any questions or requests related to this Privacy Policy please contact us:

Email arpellastoressystems@gmail.com  
Website https://arpellastore.com`
  }
];

export default function PrivacyPolicyPage() {
  const [activeId, setActiveId] = useState('introduction');
  const [showNav, setShowNav] = useState(false);
  const activeSection = sections.find(s => s.id === activeId);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [activeId]);

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif', minHeight: '100vh' }}>
      {/* Global styles for nav links */}
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

      {/* Top Nav with Menu toggle on small */}
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

      {/* Offcanvas for small screens */}
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
          {/* Sidebar on md+ */}
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

          {/* Main content */}
          <Col md={10} className="py-5 d-flex justify-content-center">
            <div style={{ maxWidth: '800px', width: '100%', padding: '0 1rem' }}>
              <h1 className="mb-3">Privacy Policy</h1>
              <p className="text-muted mb-4">Effective Date May 1 2025</p>

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
