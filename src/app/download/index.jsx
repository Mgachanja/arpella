// src/pages/download/index.jsx
import React, { useState, useEffect } from 'react';
import NavBar from '../../components/Nav';
import {
  Container,
  Row,
  Col,
  Button,
  Offcanvas,
  Modal,
  Card,
  ListGroup
} from 'react-bootstrap';
import {
  FaDownload,
  FaApple,
  FaChrome,
  FaAndroid,
  FaCheckCircle,
  FaExclamationCircle,
  FaExternalLinkAlt,
  FaMobileAlt
} from 'react-icons/fa';

const features = [
  'Seamless shopping experience',
  'Secure M-Pesa payments',
  'Real-time order tracking',
  'Live location delivery',
  'Easy product discovery',
  'Fast checkout process'
];

// Update these to your actual EAS build / TestFlight URLs
const ANDROID_DOWNLOAD_URL = 'https://expo.dev/artifacts/eas/MqmbcN8T37zcnC63T1AaH.apk';
const IOS_DOWNLOAD_URL = 'pending';
const TESTFLIGHT_URL = 'pending';

export default function DownloadPage() {
  const [showNavOffcanvas, setShowNavOffcanvas] = useState(false);
  const [showAndroidModal, setShowAndroidModal] = useState(false);
  const [showIOSModal, setShowIOSModal] = useState(false);

  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div style={{ fontFamily: 'Roboto, sans-serif', minHeight: '100vh' }}>
      <style>{`
        .brand-orange { color: #ff8c00 !important; }
        .bg-brand-orange { background-color: #ff8c00 !important; }
        .btn-android { background-color: #ff8c00; border-color: #ff8c00; }
        .btn-android:hover { background-color: #e67600; border-color: #e67600; }
        .custom-nav-link { color: inherit !important; background-color: transparent !important; }
        .custom-card { border: 1px solid rgba(0,0,0,0.06); }
      `}</style>

      {/* Top sticky header */}
      <div style={{
        boxShadow: '0 2px 4px rgba(0,0,0,0.08)',
        position: 'sticky',
        top: 0,
        zIndex: 1100,
        padding: '0.75rem 1.5rem',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        background: '#fff'
      }}>
        <NavBar />
        <Button
          variant="outline-secondary"
          className="d-md-none"
          onClick={() => setShowNavOffcanvas(true)}
        >
          Menu
        </Button>
      </div>

      <Offcanvas show={showNavOffcanvas} onHide={() => setShowNavOffcanvas(false)} placement="start">
        <Offcanvas.Header closeButton>
          <Offcanvas.Title>Quick Links</Offcanvas.Title>
        </Offcanvas.Header>
        <Offcanvas.Body>
          <ListGroup variant="flush">
            <ListGroup.Item action href="#hero">Home</ListGroup.Item>
            <ListGroup.Item action href="#features">Features</ListGroup.Item>
            <ListGroup.Item action href="#download">Download</ListGroup.Item>
            <ListGroup.Item action href="#instructions">Instructions</ListGroup.Item>
            <ListGroup.Item action href="https://arpellastore.com" target="_blank">Website</ListGroup.Item>
          </ListGroup>
        </Offcanvas.Body>
      </Offcanvas>

      {/* Hero */}
      <Container fluid className="py-5" id="hero">
        <Row className="justify-content-center">
          <Col lg={10} className="text-center">
            <div className="d-inline-block p-3 bg-brand-orange rounded-3 mb-4 shadow-lg">
              <FaMobileAlt size={48} className="text-white" />
            </div>

            <h1 className="display-5 fw-bold mb-3">Download <span className="brand-orange">Arpella</span></h1>
            <p className="lead text-muted mb-4" style={{ lineHeight: 1.7 }}>
              Experience seamless shopping on your mobile device. Download the beta now and join the early testers.
            </p>

            <div className="mb-3">
              <span className="badge bg-warning text-dark p-2">🚀 Beta Version 1.0.1 • Pre-Release</span>
            </div>

            <div className="mb-4 p-3 rounded" style={{ background: '#eef6ff', border: '1px solid #dbeefc', maxWidth: 800, margin: '0 auto' }}>
              <div className="d-flex align-items-start gap-3">
                <FaExclamationCircle size={18} className="text-primary mt-1" />
                <div className="text-start">
                  <small className="text-muted">
                    <strong>Note:</strong> This is a pre-release beta build and is not distributed through the App Store or Google Play.
                    Please follow the instructions below appropriate to your device.
                  </small>
                </div>
              </div>
            </div>

            {/* Download buttons */}
            <div id="download" className="d-flex flex-column flex-sm-row justify-content-center gap-3">
              <Button
                onClick={() => setShowIOSModal(true)}
                className="d-flex align-items-center gap-2 px-4"
                style={{ background: '#111', borderColor: '#111', width: 300 }}
              >
                <FaApple size={20} />
                <div className="text-start">
                  <div style={{ fontSize: 12 }}>Download for</div>
                  <div className="fw-semibold">iOS (Beta)</div>
                </div>
              </Button>

              <Button
                onClick={() => setShowAndroidModal(true)}
                className="d-flex align-items-center gap-2 px-4 btn-android"
                style={{ color: '#fff', width: 300 }}
              >
                <FaAndroid size={20} />
                <div className="text-start">
                  <div style={{ fontSize: 12 }}>Download for</div>
                  <div className="fw-semibold">Android (Beta)</div>
                </div>
              </Button>
            </div>
          </Col>
        </Row>
      </Container>

      {/* Features */}
      <div id="features" className="py-5 bg-white border-top">
        <Container>
          <Row className="justify-content-center mb-4">
            <Col lg={8} className="text-center">
              <h2 className="h2 fw-bold mb-2">Why Choose Arpella?</h2>
              <p className="text-muted">Everything you need for a perfect shopping experience</p>
            </Col>
          </Row>

          <Row className="g-3">
            {features.map((f, i) => (
              <Col key={i} md={6} lg={4}>
                <Card className="custom-card p-3 h-100">
                  <div className="d-flex align-items-start gap-3">
                    <div className="p-2 rounded" style={{ background: '#fff7ef' }}>
                      <FaCheckCircle className="text-warning" size={20} />
                    </div>
                    <div>
                      <div className="fw-medium">{f}</div>
                    </div>
                  </div>
                </Card>
              </Col>
            ))}
          </Row>
        </Container>
      </div>

      {/* Instructions */}
      <div id="instructions" className="py-5 border-top">
        <Container>
          <Row className="justify-content-center mb-4">
            <Col lg={8} className="text-center">
              <h2 className="h2 fw-bold mb-2">Installation Instructions</h2>
              <p className="text-muted">Follow these steps for your device to install Arpella</p>
            </Col>
          </Row>

          <Row className="g-4">
            <Col md={6}>
              <Card className="p-3 h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-2 bg-light rounded">
                    <FaChrome size={20} className="text-warning" />
                  </div>
                  <h5 className="mb-0">Android</h5>
                </div>

                <ListGroup variant="flush" className="text-muted" style={{ lineHeight: 1.7 }}>
                  <ListGroup.Item className="ps-0 border-0"><strong>1.</strong> Click the "Download for Android" button above</ListGroup.Item>
                  <ListGroup.Item className="ps-0 border-0"><strong>2.</strong> Allow installation from unknown sources in your Settings</ListGroup.Item>
                  <ListGroup.Item className="ps-0 border-0"><strong>3.</strong> Download the APK file to your device</ListGroup.Item>
                  <ListGroup.Item className="ps-0 border-0"><strong>4.</strong> Open the APK and tap "Install"</ListGroup.Item>
                  <ListGroup.Item className="ps-0 border-0"><strong>5.</strong> Launch Arpella and start shopping</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>

            <Col md={6}>
              <Card className="p-3 h-100">
                <div className="d-flex align-items-center gap-3 mb-3">
                  <div className="p-2 bg-light rounded">
                    <FaApple size={20} />
                  </div>
                  <h5 className="mb-0">iOS</h5>
                </div>

                <ListGroup variant="flush" className="text-muted" style={{ lineHeight: 1.7 }}>
                  <ListGroup.Item className="ps-0 border-0"><strong>1.</strong> Install TestFlight from the App Store (if needed)</ListGroup.Item>
                  <ListGroup.Item className="ps-0 border-0"><strong>2.</strong> Click the "Download for iOS" button above</ListGroup.Item>
                  <ListGroup.Item className="ps-0 border-0"><strong>3.</strong> You will be redirected to TestFlight</ListGroup.Item>
                  <ListGroup.Item className="ps-0 border-0"><strong>4.</strong> Tap "Accept" to join the beta</ListGroup.Item>
                  <ListGroup.Item className="ps-0 border-0"><strong>5.</strong> Install Arpella through TestFlight and open it</ListGroup.Item>
                </ListGroup>
              </Card>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Contact / CTA */}
      <div className="py-5 text-white" style={{ background: '#ff8c00' }}>
        <Container>
          <Row className="justify-content-center text-center">
            <Col lg={8}>
              <h3 className="fw-bold mb-2">Need Help?</h3>
              <p className="mb-3" style={{ opacity: 0.95 }}>
                If you have issues during installation or questions about the beta, contact support.
              </p>

              <div className="d-flex flex-column flex-sm-row justify-content-center gap-3">
                <a
                  href="mailto:arpellastoressystems@gmail.com"
                  className="btn btn-light text-orange-500 d-inline-flex align-items-center gap-2 px-4"
                  style={{ fontWeight: 600 }}
                >
                  Email Support <FaExternalLinkAlt />
                </a>

                <a
                  href="https://arpellastore.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn btn-outline-light d-inline-flex align-items-center gap-2 px-4"
                  style={{ color: '#fff', borderColor: '#fff' }}
                >
                  Visit Website <FaExternalLinkAlt />
                </a>
              </div>
            </Col>
          </Row>
        </Container>
      </div>

      {/* Footer */}
      <footer className="bg-dark text-muted py-4">
        <Container>
          <Row className="align-items-start">
            <Col md={4}>
              <h5 className="text-white">Arpella</h5>
              <p className="small">Your trusted mobile shopping companion</p>
            </Col>
            <Col md={4}>
              <h6 className="text-white">Quick Links</h6>
              <ul className="list-unstyled small">
                <li><a href="https://arpellastore.com/privacy" className="text-muted">Privacy Policy</a></li>
                <li><a href="https://arpellastore.com" className="text-muted">Terms of Service</a></li>
                <li><a href="mailto:arpellastoressystems@gmail.com" className="text-muted">Support</a></li>
              </ul>
            </Col>
            <Col md={4}>
              <h6 className="text-white">Contact</h6>
              <ul className="list-unstyled small text-muted">
                <li>Email: arpellastoressystems@gmail.com</li>
                <li>Website: arpellastore.com</li>
              </ul>
            </Col>
          </Row>

          <div className="text-center mt-3 small">
            &copy; 2025 Arpella Stores. All rights reserved.
          </div>
        </Container>
      </footer>

      {/* Android Modal */}
      <Modal show={showAndroidModal} onHide={() => setShowAndroidModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Download Arpella for Android</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 p-3 rounded" style={{ background: '#fff7e6', border: '1px solid #ffe9c9' }}>
            <FaExclamationCircle className="me-2" /> <small>You will need to allow installations from unknown sources to install the APK.</small>
          </div>

          <h6 className="fw-bold">Installation Steps</h6>
          <ol className="text-muted" style={{ lineHeight: 1.7 }}>
            <li>Click the download button below to fetch the APK file.</li>
            <li>Go to Settings → Security → Enable "Install Unknown Apps" for your browser or file manager.</li>
            <li>Open the downloaded APK from notifications or the Downloads folder.</li>
            <li>Tap "Install" and wait for completion.</li>
            <li>Open Arpella and start shopping.</li>
          </ol>

          <div className="d-grid mt-3">
            <a
              href={ANDROID_DOWNLOAD_URL}
              className="btn btn-android d-flex align-items-center justify-content-center gap-2"
              role="button"
            >
              <FaDownload /> Download APK (Beta)
            </a>
          </div>
        </Modal.Body>
      </Modal>

      {/* iOS Modal */}
      <Modal show={showIOSModal} onHide={() => setShowIOSModal(false)} centered size="lg">
        <Modal.Header closeButton>
          <Modal.Title>Download Arpella for iOS</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <div className="mb-3 p-3 rounded" style={{ background: '#eef6ff', border: '1px solid #dbeefc' }}>
            <FaExclamationCircle className="me-2" /> <small>You will need TestFlight to install beta builds on iOS.</small>
          </div>

          <h6 className="fw-bold">Installation Steps</h6>
          <ol className="text-muted" style={{ lineHeight: 1.7 }}>
            <li>Install TestFlight from the App Store if you don't have it.</li>
            <li>Click the button below to open the TestFlight invitation.</li>
            <li>Tap "Accept" to join the beta program.</li>
            <li>Tap "Install" in TestFlight when prompted.</li>
            <li>Open Arpella from your home screen and start shopping.</li>
          </ol>

          <div className="d-grid mt-3">
            <a
              href={TESTFLIGHT_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="btn btn-dark d-flex align-items-center justify-content-center gap-2"
              role="button"
            >
              <FaApple /> Open in TestFlight
            </a>
          </div>
        </Modal.Body>
      </Modal>
    </div>
  );
}
