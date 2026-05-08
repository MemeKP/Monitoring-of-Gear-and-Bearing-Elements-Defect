import { useRef, useCallback } from 'react';
import Map, { Source, Layer } from '@vis.gl/react-maplibre';
import 'maplibre-gl/dist/maplibre-gl.css';
import {
    clusterLayer,
    clusterCountLayer,
    unclusteredPointLayer,
    pulseLayer,
} from '../constant/layerMap';

const MAP_STYLE = "https://basemaps.cartocdn.com/gl/dark-matter-gl-style/style.json";

// convert sites -> GeoJSON
const sitesToGeoJSON = (sites) => ({
    type: 'FeatureCollection',
    features: sites.map(site => {
        const fCount = site.grades?.find(g => g.label?.startsWith('F'))?.count || 0;
        const eCount = site.grades?.find(g => g.label?.startsWith('E'))?.count || 0;
        const defectCount = site.grades?.reduce((s, g) => s + g.count, 0) || 0;
        const severity = fCount > eCount ? 'F' : eCount > fCount ? 'E' : 'all';

        return {
            type: 'Feature',
            geometry: {
                type: 'Point',
                coordinates:
                    [Number(site.lng),
                    Number(site.lat)]
            },
            properties: {
                id: site.id,
                name: site.name,
                severity,
                defect_count: defectCount,
            },
        };
    }),
});

function RegionMap({ sites, hoveredSite, onHover, onSiteClick }) {
    const mapRef = useRef(null);

    const handleMapClick = useCallback((e) => {
        const map = mapRef.current?.getMap();
        console.log('click features:', e.features); 
        if (!map || !e.features?.length) return;

        const feature = e.features[0];
        console.log('feature properties:', feature.properties);

        if (feature.properties.cluster_id) {
            const clusterId = feature.properties.cluster_id;
            const source = map.getSource('sites');

            source.getClusterExpansionZoom(clusterId)
                .then((zoom) => {
                    map.easeTo({
                        center: feature.geometry.coordinates,
                        zoom: zoom + 1,
                        duration: 500,
                    });
                })
                .catch(console.error);
            return;
        }

        // single dot → open site
        const siteId = feature.properties?.id;
        if (siteId) {
            onSiteClick(siteId);
            map.easeTo({
                center: feature.geometry.coordinates,
                zoom: 11,
                duration: 500,
            });
        }
    }, [onSiteClick]);

    const onMouseEnter = useCallback((e) => {
        const map = mapRef.current?.getMap();
        if (map) map.getCanvas().style.cursor = 'pointer';
        const id = e.features?.[0]?.properties?.id;
        if (id) onHover(id);
    }, [onHover]);

    const onMouseLeave = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (map) map.getCanvas().style.cursor = '';
        onHover(null);
    }, [onHover]);

    const geojson = sitesToGeoJSON(sites);

    return (
        <Map
            ref={mapRef}
            initialViewState={{ longitude: 102, latitude: 15, zoom: 5 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            interactiveLayerIds={['clusters', 'unclustered-point']}
            onClick={handleMapClick}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
        >
            <Source
                id="sites"
                type="geojson"
                data={geojson}
                cluster={true}
                clusterMaxZoom={10}
                clusterRadius={50}
            >
                <Layer {...pulseLayer} />
                <Layer {...clusterLayer} />
                <Layer {...clusterCountLayer} />
                <Layer {...unclusteredPointLayer} />
            </Source>
        </Map>
    );
}

export default RegionMap;