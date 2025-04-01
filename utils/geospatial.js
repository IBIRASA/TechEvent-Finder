export const calculateDistance = (point1, point2) => {
    // Implementation using PostGIS functions
    // Example:
    return `ST_Distance(
      ST_GeographyFromText('POINT(${point1.longitude} ${point1.latitude})'),
      ST_GeographyFromText('POINT(${point2.longitude} ${point2.latitude})')
    ) / 1000`; // Returns distance in kilometers
  };
  
  // Or as a default export if preferred
  export default {
    calculateDistance
  };