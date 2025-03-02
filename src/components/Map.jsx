'use client';

import { useEffect, useRef, useState } from 'react';
import maplibregl from 'maplibre-gl';
import { useSearch } from '@/context/SearchContext';
import 'maplibre-gl/dist/maplibre-gl.css';

const CHAIN_COLORS = [
    '#FF6B6B', // Red
    '#4ECDC4', // Teal
    '#45B7D1', // Blue
    '#96CEB4', // Green
    '#FFEEAD', // Yellow
    '#D4A5A5', // Pink
    '#9B59B6', // Purple
    '#3498DB', // Light Blue
    '#2ECC71', // Emerald
    '#F1C40F', // Sun Yellow
    '#E67E22', // Orange
    '#1ABC9C', // Turquoise
];

export default function Map() {
    const { selectedResult, showAllChains, mapRef } = useSearch();
    const [chains, setChains] = useState(null);

    // Initialize map only once
    useEffect(() => {
        const map = new maplibregl.Map({
            container: 'map',
            style: 'https://demotiles.maplibre.org/style.json',
            center: [25, 52],
            zoom: 3.3,
            maxZoom: 5.5,
            minZoom: 2.5,
            dragRotate: false,
            keyboard: false,
            touchZoomRotate: false,
            pitch: 75
        });

        map.on('style.load', () => {
            map.setProjection({
                type: 'globe',
            });
        });

        mapRef.current = map;

        return () => {
            cleanupMap(map);
            map.remove();
        };
    }, []);

    // Helper function to cleanup map
    const cleanupMap = (map) => {
        // Remove all markers
        const existingMarkers = document.getElementsByClassName('marker');
        while (existingMarkers[0]) {
            existingMarkers[0].remove();
        }

        // Remove all sources and layers
        if (map.loaded()) {
            const style = map.getStyle();
            if (style) {
                // Remove layers first
                style.layers.forEach(layer => {
                    if (layer.id.startsWith('line-')) {
                        map.removeLayer(layer.id);
                    }
                });
                // Then remove sources
                Object.keys(style.sources).forEach(sourceId => {
                    if (sourceId.startsWith('line-')) {
                        map.removeSource(sourceId);
                    }
                });
            }
        }
    };

    // Handle selected result changes
    useEffect(() => {
        const fetchChains = async () => {
            if (!selectedResult || !mapRef.current) return;

            try {
                cleanupMap(mapRef.current);

                const baseUrl = `https://cognet-world-inquiry-service.karatay.dev/api/v1/search/chains/concept/${selectedResult.concept_id}`;
                const url = showAllChains 
                    ? baseUrl
                    : `${baseUrl}?word=${selectedResult.word}&lang=${selectedResult.language_info.code}`;

                const response = await fetch(url);
                const data = await response.json();
                setChains(data.data);

                // Process each chain
                data.data.chains.forEach((chainData, chainIndex) => {
                    const chainColor = CHAIN_COLORS[chainIndex % CHAIN_COLORS.length];


                    chainData.chain.forEach((node, nodeIndex) => {
                        console.log(node)

                        // Create marker pin element
                        const pinEl = document.createElement('div');
                        pinEl.className = 'marker marker-pin';
                        pinEl.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24" fill="${chainColor}">
                            <path d="M12 0C7.58 0 4 3.58 4 8c0 5.5 8 13 8 13s8-7.5 8-13c0-4.42-3.58-8-8-8zm0 11c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3z"/>
                        </svg>`;

                        // Create label element
                        const labelEl = document.createElement('div');
                        labelEl.className = 'marker marker-label';
                        labelEl.innerHTML = `
                            <div class="bg-background/95 backdrop-blur-sm p-1 rounded-lg border shadow-lg text-center">
                                <div class="font-medium text-sm">${node.word}</div>
                                <div class="text-xs text-muted-foreground">${node.translit1}</div>
                                <div class="details hidden">
                                    <div class="flex items-center justify-center gap-1">
                                        <div class="text-xs text-muted-foreground">${node.language_info.name}</div>
                                        <div class="text-base">${node.language_info.flag}</div>
                                    </div>
                                </div>
                            </div>
                        `;

                        // Add click handler to toggle details
                        labelEl.addEventListener('click', (e) => {
                            const details = labelEl.querySelector('.details');
                            const allDetails = document.querySelectorAll('.details');
                            allDetails.forEach(detail => {
                                if (detail !== details) {
                                    detail.classList.add('hidden');
                                }
                            });
                            details.classList.toggle('hidden');
                            e.stopPropagation();
                        });

                        // Create container for both pin and label
                        const container = document.createElement('div');
                        container.className = 'marker-container';
                        container.appendChild(pinEl);
                        container.appendChild(labelEl);

                        // Add marker to map
                        new maplibregl.Marker({
                            element: container,
                            anchor: 'bottom',
                            offset: [0, 0]
                        })
                            .setLngLat([node.language_info.coordinates[1], node.language_info.coordinates[0]])
                            .addTo(mapRef.current);

                        // Draw line to next point in chain if it exists
                        if (nodeIndex < chainData.chain.length - 1) {
                            const nextNode = chainData.chain[nodeIndex + 1];
                            const coordinates = [
                                [node.language_info.coordinates[1], node.language_info.coordinates[0]],
                                [nextNode.language_info.coordinates[1], nextNode.language_info.coordinates[0]]
                            ];

                            const sourceId = `line-${chainIndex}-${nodeIndex}`;
                            const layerId = `line-${chainIndex}-${nodeIndex}`;

                            mapRef.current.addSource(sourceId, {
                                'type': 'geojson',
                                'data': {
                                    'type': 'Feature',
                                    'properties': {},
                                    'geometry': {
                                        'type': 'LineString',
                                        'coordinates': coordinates
                                    }
                                }
                            });

                            mapRef.current.addLayer({
                                'id': layerId,
                                'type': 'line',
                                'source': sourceId,
                                'layout': {
                                    'line-join': 'round',
                                    'line-cap': 'round'
                                },
                                'paint': {
                                    'line-color': chainColor,
                                    'line-width': 2,
                                    'line-opacity': 0.7
                                }
                            });
                        }
                    });
                });

                // If there's a selected result, fly to its coordinates
                if (selectedResult) {
                    mapRef.current.flyTo({
                        center: [selectedResult.language_info.coordinates[1], selectedResult.language_info.coordinates[0] + 10],
                        zoom: 3.3,
                        essential: true
                    });
                }

            } catch (error) {
                console.error('Error fetching chains:', error);
            }
        };

        fetchChains();

        // Cleanup when selectedResult changes or component unmounts
        return () => {
            if (mapRef.current) {
                cleanupMap(mapRef.current);
            }
        };
    }, [selectedResult, showAllChains]);

    // Add click handler to map to close all details
    useEffect(() => {
        if (mapRef.current) {
            const handleMapClick = () => {
                const allDetails = document.querySelectorAll('.details');
                allDetails.forEach(detail => {
                    detail.classList.add('hidden');
                });
            };

            mapRef.current.on('click', handleMapClick);

            return () => {
                mapRef.current?.off('click', handleMapClick);
            };
        }
    }, []);

    return (
        <div id="map" className="absolute w-full h-full">
        </div>
    );
}