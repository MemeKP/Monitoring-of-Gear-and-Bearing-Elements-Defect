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

    // Click cluster → zoom in
    const onClusterClick = useCallback((e) => {
        const map = mapRef.current?.getMap();
        if (!map || !e.features?.length) return;

        const feature = e.features[0];

        // CLICK CLUSTER 
        if (feature.properties?.cluster) {
            const clusterId = feature.properties.cluster_id;
            const source = map.getSource('sites');

            source.getClusterExpansionZoom(clusterId, (err, zoom) => {
                if (err) return;

                map.easeTo({
                    center: feature.geometry.coordinates,
                    zoom,
                    duration: 500,
                });
            });

            return;
        }

        // CLICK SINGLE DOT
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

    // Click single site dot
    const onDotClick = useCallback((e) => {
        const features = e.features;
        if (!features?.length) return;
        const siteId = features[0].properties?.id;
        if (siteId) onSiteClick(siteId);
    }, [onSiteClick]);

    // Hover
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
            initialViewState={{
                longitude: 102,
                latitude: 15,
                zoom: 5
            }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            onClick={onClusterClick}
            interactiveLayerIds={[
                clusterLayer.id,
                unclusteredPointLayer.id,
            ]}
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
                <Layer
                    {...unclusteredPointLayer}
                    // onClick={onDotClick}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                />
            </Source>
        </Map>
    );
}

export default RegionMap;