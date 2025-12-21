import { memo, useState, useCallback } from 'react';
import { VehicleData } from '../types';

interface PDPStoryProps {
  vehicleData: VehicleData;
}

export const PDPStory = memo<PDPStoryProps>(({ vehicleData }) => {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [imageLoading, setImageLoading] = useState(true);

  const handleImageLoad = useCallback(() => {
    setImageLoading(false);
  }, []);

  const handleImageError = useCallback(() => {
    setImageLoading(false);
    // Could show a fallback image or error state
  }, []);

  const nextImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev < vehicleData.imagePaths.length - 1 ? prev + 1 : 0
    );
  }, [vehicleData.imagePaths.length]);

  const prevImage = useCallback(() => {
    setCurrentImageIndex((prev) =>
      prev > 0 ? prev - 1 : vehicleData.imagePaths.length - 1
    );
  }, [vehicleData.imagePaths.length]);

  const currentImage = vehicleData.imagePaths[currentImageIndex];

  return (
    <div className="pdp-story">
      <div className="pdp-story-image-container">
        {imageLoading && (
          <div className="pdp-story-loader">
            <div className="pdp-story-spinner"></div>
          </div>
        )}
        <img
          src={currentImage}
          alt={`${vehicleData.vehicleName} - ${vehicleData.brand} ${vehicleData.modelName}`}
          onLoad={handleImageLoad}
          onError={handleImageError}
          loading="lazy"
          style={{ opacity: imageLoading ? 0 : 1 }}
          className="pdp-story-image"
          crossOrigin="anonymous"
        />
        {vehicleData.imagePaths.length > 1 && (
          <>
            <button
              className="pdp-story-nav pdp-story-nav-prev"
              onClick={prevImage}
              aria-label="Previous image"
            >
              ‹
            </button>
            <button
              className="pdp-story-nav pdp-story-nav-next"
              onClick={nextImage}
              aria-label="Next image"
            >
              ›
            </button>
            <div className="pdp-story-indicators">
              {vehicleData.imagePaths.map((_, index) => (
                <div
                  key={index}
                  className={`pdp-story-indicator ${
                    index === currentImageIndex ? 'active' : ''
                  }`}
                />
              ))}
            </div>
          </>
        )}
      </div>

      <div className="pdp-story-content">
        <div className="pdp-story-header">
          <h2 className="pdp-story-title">
            {vehicleData.brand} {vehicleData.modelName}
          </h2>
          <div className="pdp-story-price">{vehicleData.price.displayValue}</div>
        </div>

        <div className="pdp-story-details">
          <div className="pdp-story-detail">
            <span className="pdp-story-label">Year:</span>
            <span className="pdp-story-value">{vehicleData.overview.makeYear.displayValue}</span>
          </div>
          <div className="pdp-story-detail">
            <span className="pdp-story-label">KMs Driven:</span>
            <span className="pdp-story-value">{vehicleData.overview.kmDriven.displayValue}</span>
          </div>
          <div className="pdp-story-detail">
            <span className="pdp-story-label">Color:</span>
            <span className="pdp-story-value">{vehicleData.colour}</span>
          </div>
          <div className="pdp-story-detail">
            <span className="pdp-story-label">Engine:</span>
            <span className="pdp-story-value">{vehicleData.keyHighlights.engineCapacity.displayValue}</span>
          </div>
          <div className="pdp-story-detail">
            <span className="pdp-story-label">Max Power:</span>
            <span className="pdp-story-value">{vehicleData.keyHighlights.maxPower.displayValue}</span>
          </div>
        </div>

        <div className="pdp-story-highlights">
          <div className="pdp-story-highlight">
            <div className="pdp-story-highlight-value">{vehicleData.keyHighlights.fuelTankCapacity.displayValue}</div>
            <div className="pdp-story-highlight-label">Fuel Tank</div>
          </div>
          <div className="pdp-story-highlight">
            <div className="pdp-story-highlight-value">{vehicleData.keyHighlights.topSpeed.displayValue} km/h</div>
            <div className="pdp-story-highlight-label">Top Speed</div>
          </div>
        </div>
      </div>
    </div>
  );
});

PDPStory.displayName = 'PDPStory';