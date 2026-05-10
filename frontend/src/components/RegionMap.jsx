/**
 * Main Responsibility:
 *  This component renders an interactive map using MapLibre.
 * It visualizes site data as markers with clustering support.
 * 
 * Features:
 * - Display site on the map.
 * - Automatically cluster markers when zomm out.
 * - Click cluster to zoom in.
 * - Click marker to focus size.
 * 
 * Props:
 * @param {Array} sites
 * List all site object
 * 
 * @param {Function} onHover
 * Callback triggered when hovering a marker.
 * Returns the site id to the parent component.
 *
 * @param {Function} onSiteClick
 * Callback triggered when clicking a site marker.
 * Returns the site id to the parent component.
 * */

import { useRef, useCallback, useEffect } from 'react';
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
        if (!map || !e.features?.length) return;

        const feature = e.features[0];

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

    const handleMapLoad = useCallback(() => {
        const map = mapRef.current?.getMap();
        if (!map) return;

        map.addSource('sites', {
            type: 'geojson',
            data: sitesToGeoJSON(sites),
            cluster: true,
            clusterMaxZoom: 10,
            clusterRadius: 50,
            clusterProperties: {
                sum_f: [['+', ['accumulated'], ['get', 'sum_f']], ['case', ['==', ['get', 'severity'], 'F'], 1, 0]],
                sum_e: [['+', ['accumulated'], ['get', 'sum_e']], ['case', ['==', ['get', 'severity'], 'E'], 1, 0]],
            },
        });

        map.addLayer(pulseLayer);
        map.addLayer(clusterLayer);
        map.addLayer(clusterCountLayer);
        map.addLayer(unclusteredPointLayer);

        map.on('click', 'clusters', handleMapClick);
        map.on('click', 'unclustered-point', handleMapClick);
        map.on('mouseenter', 'clusters', onMouseEnter);
        map.on('mouseenter', 'unclustered-point', onMouseEnter);
        map.on('mouseleave', 'clusters', onMouseLeave);
        map.on('mouseleave', 'unclustered-point', onMouseLeave);
    }, [handleMapClick, onMouseEnter, onMouseLeave]); 

    useEffect(() => {
        const map = mapRef.current?.getMap();
        if (!map || !map.getSource('sites')) return;
        map.getSource('sites').setData(sitesToGeoJSON(sites));
    }, [sites]);

    return (
        <Map
            ref={mapRef}
            initialViewState={{ longitude: 102, latitude: 15, zoom: 5 }}
            style={{ width: '100%', height: '100%' }}
            mapStyle={MAP_STYLE}
            onLoad={handleMapLoad}
        >
        </Map>
    );
}

export default RegionMap