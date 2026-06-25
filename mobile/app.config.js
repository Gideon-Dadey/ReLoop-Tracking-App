/** Adds location permissions for the map tab. Android uses free OpenStreetMap (no Google billing). */
module.exports = ({ config }) => {
  const plugins = [...(config.plugins ?? [])];
  const hasLocationPlugin = plugins.some(
    (p) => p === 'expo-location' || (Array.isArray(p) && p[0] === 'expo-location'),
  );
  if (!hasLocationPlugin) {
    plugins.push([
      'expo-location',
      {
        locationWhenInUsePermission:
          'ReLoop uses your location to show nearby drop-off points on the map.',
      },
    ]);
  }

  return {
    ...config,
    ios: {
      ...config.ios,
      infoPlist: {
        ...config.ios?.infoPlist,
        NSLocationWhenInUseUsageDescription:
          'ReLoop uses your location to show nearby drop-off points on the map.',
      },
    },
    plugins,
  };
};
