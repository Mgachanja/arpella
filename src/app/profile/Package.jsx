import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Container, Row, Col } from 'react-bootstrap';
import { FaArrowLeft, FaHome, FaTicketAlt, FaUser } from 'react-icons/fa';
import { ToastContainer, toast } from 'react-toastify';
import { GoogleMap, Marker, LoadScript } from '@react-google-maps/api';
import 'react-toastify/dist/ReactToastify.css';

const containerStyle = {
  width: '100%',
  height: '400px',
};

const defaultPosition = { lat: -1.286389, lng: 36.817223 }; // Default center for map

const Package = ({ parcelLocation }) => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userLocation, setUserLocation] = useState(null);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          setIsLoading(false);
        },
        (error) => {
          toast.error('Could not detect location: ' + error.message);
          setIsLoading(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
      setIsLoading(false);
    }
  }, []);

  const handleNavigation = (path) => {
    navigate(path);
  };

  if (error) {
    return (
      <Container className="pt-4">
        <div className="alert alert-danger">
          {error}
        </div>
      </Container>
    );
  }

  return (
    <Container className="pt-4 pb-5">
      <Button
        variant="link"
        onClick={() => navigate(-1)}
        className="position-absolute top-0 start-0 m-3"
      >
        <FaArrowLeft size={24} />
      </Button>

      <h1 className="text-center mb-4">Package Tracking</h1>

      {isLoading ? (
        <div className="text-center">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
          <p className="mt-2">Loading map...</p>
        </div>
      ) : (
        <div style={{ display: 'flex' }}>
          <div style={{ flex: 1, marginRight: '20px' }}>
            <LoadScript googleMapsApiKey="AIzaSyD-YPpUWHXNzvQjjXjqj7mvO2Idi72jREc">
              <GoogleMap
                mapContainerStyle={containerStyle}
                center={userLocation || defaultPosition}
                zoom={13}
              >
                <Marker position={userLocation || defaultPosition} />
                {parcelLocation && (
                  <Marker
                    position={{
                      lat: parcelLocation.latitude,
                      lng: parcelLocation.longitude,
                    }}
                    icon={{
                      url: 'https://maps.google.com/mapfiles/ms/icons/red-dot.png',
                    }}
                  />
                )}
              </GoogleMap>
            </LoadScript>
          </div>

          {/* Package Details */}
          <div style={{ flex: 1 }}>
            <Row className="mt-4">
              <Col>
                <div className="alert alert-info text-center">
                  Your package is in transit. We will notify you once it arrives at your destination.
                </div>
              </Col>
            </Row>

            {/* Navigation Footer */}
          </div>
        </div>
      )}

      <ToastContainer position="top-right" autoClose={3000} />
    </Container>
  );
};

export default Package;
