import React, { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Checkbox } from './ui/checkbox';
import { Input } from './ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { 
  Layers, 
  MapPin, 
  Search, 
  Filter,
  Download,
  ZoomIn,
  ZoomOut,
  Locate,
  Info,
  Eye,
  EyeOff
} from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialog';
import { Separator } from './ui/separator';
import { Alert, AlertDescription } from './ui/alert';

export interface MapLayer {
  id: string;
  name: string;
  type: 'wfs' | 'wms' | 'geojson' | 'vector';
  url?: string;
  visible: boolean;
  opacity: number;
  category: 'infrastructure' | 'sanitation' | 'water' | 'services' | 'administrative';
  color?: string;
  icon?: string;
  features?: GeoJSONFeature[];
  wfsConfig?: {
    typeName: string;
    version: string;
    outputFormat: string;
  };
}

export interface GeoJSONFeature {
  type: 'Feature';
  geometry: {
    type: string;
    coordinates: number[] | number[][] | number[][][];
  };
  properties: {
    [key: string]: any;
  };
}

export interface SpatialAnalysis {
  type: 'buffer' | 'intersection' | 'distance' | 'proximity';
  params: any;
  results?: any;
}

interface AdvancedMapViewerProps {
  center?: [number, number];
  zoom?: number;
  onFeatureClick?: (feature: GeoJSONFeature) => void;
  enableAnalytics?: boolean;
}

export function AdvancedMapViewer({ 
  center = [-26.2041, 28.0473], // Johannesburg
  zoom = 12,
  onFeatureClick,
  enableAnalytics = true
}: AdvancedMapViewerProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const [layers, setLayers] = useState<MapLayer[]>([
    {
      id: 'water-network',
      name: 'Water Distribution Network',
      type: 'wfs',
      visible: true,
      opacity: 0.8,
      category: 'water',
      color: '#0ea5e9',
      wfsConfig: {
        typeName: 'municipal:water_lines',
        version: '2.0.0',
        outputFormat: 'application/json'
      }
    },
    {
      id: 'sanitation-facilities',
      name: 'Sanitation Facilities',
      type: 'wfs',
      visible: true,
      opacity: 0.8,
      category: 'sanitation',
      color: '#8b5cf6',
      wfsConfig: {
        typeName: 'municipal:sanitation_points',
        version: '2.0.0',
        outputFormat: 'application/json'
      }
    },
    {
      id: 'road-infrastructure',
      name: 'Road Infrastructure',
      type: 'wfs',
      visible: false,
      opacity: 0.7,
      category: 'infrastructure',
      color: '#6b7280',
      wfsConfig: {
        typeName: 'municipal:roads',
        version: '2.0.0',
        outputFormat: 'application/json'
      }
    },
    {
      id: 'service-points',
      name: 'Service Delivery Points',
      type: 'geojson',
      visible: true,
      opacity: 1,
      category: 'services',
      color: '#10b981',
      features: []
    },
    {
      id: 'municipal-boundaries',
      name: 'Municipal Boundaries',
      type: 'wfs',
      visible: true,
      opacity: 0.5,
      category: 'administrative',
      color: '#f59e0b',
      wfsConfig: {
        typeName: 'municipal:boundaries',
        version: '2.0.0',
        outputFormat: 'application/json'
      }
    }
  ]);

  const [selectedLayer, setSelectedLayer] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCategory, setFilterCategory] = useState<string>('all');
  const [selectedFeature, setSelectedFeature] = useState<GeoJSONFeature | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    // Initialize map (placeholder for actual map library integration)
    console.log('Advanced Map Viewer initialized with center:', center, 'zoom:', zoom);
    
    // Simulate map load
    setTimeout(() => {
      setMapLoaded(true);
      loadWFSLayers();
    }, 1000);
  }, []);

  const loadWFSLayers = async () => {
    // Load WFS layers from OGC services
    for (const layer of layers.filter(l => l.type === 'wfs' && l.visible)) {
      try {
        await fetchWFSFeatures(layer);
      } catch (error) {
        console.error(`Failed to load WFS layer ${layer.name}:`, error);
      }
    }
  };

  const fetchWFSFeatures = async (layer: MapLayer) => {
    if (!layer.wfsConfig || !layer.url) {
      console.log(`WFS layer ${layer.name} configured but no URL provided (demo mode)`);
      return;
    }

    const { typeName, version, outputFormat } = layer.wfsConfig;
    const wfsUrl = `${layer.url}?service=WFS&version=${version}&request=GetFeature&typeName=${typeName}&outputFormat=${outputFormat}`;

    try {
      const response = await fetch(wfsUrl);
      const data = await response.json();
      
      setLayers(prev => prev.map(l => 
        l.id === layer.id ? { ...l, features: data.features } : l
      ));
      
      console.log(`Loaded ${data.features?.length || 0} features for ${layer.name}`);
    } catch (error) {
      console.error(`WFS fetch error for ${layer.name}:`, error);
    }
  };

  const toggleLayerVisibility = (layerId: string) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, visible: !layer.visible } : layer
    ));
  };

  const updateLayerOpacity = (layerId: string, opacity: number) => {
    setLayers(prev => prev.map(layer => 
      layer.id === layerId ? { ...layer, opacity } : layer
    ));
  };

  const performSpatialAnalysis = async (analysisType: string) => {
    setIsAnalyzing(true);
    
    // Simulate spatial analysis
    setTimeout(() => {
      console.log(`Performing ${analysisType} analysis...`);
      setIsAnalyzing(false);
    }, 2000);
  };

  const exportLayerData = (layerId: string) => {
    const layer = layers.find(l => l.id === layerId);
    if (!layer || !layer.features) return;

    const geojson = {
      type: 'FeatureCollection',
      features: layer.features
    };

    const blob = new Blob([JSON.stringify(geojson, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${layer.name.replace(/\s+/g, '_').toLowerCase()}.geojson`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLayers = layers.filter(layer => 
    (filterCategory === 'all' || layer.category === filterCategory) &&
    (searchQuery === '' || layer.name.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  const layerCategories = [
    { value: 'all', label: 'All Layers' },
    { value: 'infrastructure', label: 'Infrastructure' },
    { value: 'sanitation', label: 'Sanitation' },
    { value: 'water', label: 'Water' },
    { value: 'services', label: 'Services' },
    { value: 'administrative', label: 'Administrative' }
  ];

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Layers className="w-5 h-5" />
                Advanced GIS Viewer
              </CardTitle>
              <CardDescription>
                OGC WFS/WMS integration with spatial analytics
              </CardDescription>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
              {enableAnalytics && (
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="outline" size="sm">
                      <Filter className="w-4 h-4 mr-1" />
                      Analyze
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Spatial Analysis Tools</DialogTitle>
                      <DialogDescription>
                        Perform advanced spatial analytics on map layers
                      </DialogDescription>
                    </DialogHeader>
                    <div className="space-y-4">
                      <Button 
                        onClick={() => performSpatialAnalysis('buffer')}
                        disabled={isAnalyzing}
                        className="w-full justify-start"
                      >
                        Buffer Analysis
                      </Button>
                      <Button 
                        onClick={() => performSpatialAnalysis('proximity')}
                        disabled={isAnalyzing}
                        className="w-full justify-start"
                      >
                        Proximity Analysis
                      </Button>
                      <Button 
                        onClick={() => performSpatialAnalysis('intersection')}
                        disabled={isAnalyzing}
                        className="w-full justify-start"
                      >
                        Intersection Analysis
                      </Button>
                      <Button 
                        onClick={() => performSpatialAnalysis('distance')}
                        disabled={isAnalyzing}
                        className="w-full justify-start"
                      >
                        Distance Calculations
                      </Button>
                    </div>
                  </DialogContent>
                </Dialog>
              )}
            </div>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-4">
        {/* Layer Control Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="text-sm">Layer Control</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Input
                placeholder="Search layers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="h-8"
              />
              
              <Select value={filterCategory} onValueChange={setFilterCategory}>
                <SelectTrigger className="h-8">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {layerCategories.map(cat => (
                    <SelectItem key={cat.value} value={cat.value}>
                      {cat.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <Separator />

            <div className="space-y-3">
              {filteredLayers.map((layer) => (
                <div key={layer.id} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 flex-1">
                      <Checkbox
                        checked={layer.visible}
                        onCheckedChange={() => toggleLayerVisibility(layer.id)}
                      />
                      <div className="flex-1">
                        <div className="text-sm flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded"
                            style={{ backgroundColor: layer.color }}
                          />
                          {layer.name}
                        </div>
                        <div className="text-xs text-gray-500">
                          {layer.type.toUpperCase()}
                        </div>
                      </div>
                    </div>
                    <Dialog>
                      <DialogTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={() => setSelectedLayer(layer.id)}
                        >
                          <Info className="w-3 h-3" />
                        </Button>
                      </DialogTrigger>
                      <DialogContent>
                        <DialogHeader>
                          <DialogTitle>{layer.name}</DialogTitle>
                          <DialogDescription>Layer Information</DialogDescription>
                        </DialogHeader>
                        <div className="space-y-3 text-sm">
                          <div>
                            <span className="text-gray-500">Type:</span> {layer.type.toUpperCase()}
                          </div>
                          <div>
                            <span className="text-gray-500">Category:</span> {layer.category}
                          </div>
                          {layer.wfsConfig && (
                            <>
                              <div>
                                <span className="text-gray-500">WFS Type:</span> {layer.wfsConfig.typeName}
                              </div>
                              <div>
                                <span className="text-gray-500">Version:</span> {layer.wfsConfig.version}
                              </div>
                            </>
                          )}
                          {layer.features && (
                            <div>
                              <span className="text-gray-500">Features:</span> {layer.features.length}
                            </div>
                          )}
                          <Separator />
                          <Button 
                            onClick={() => exportLayerData(layer.id)}
                            size="sm"
                            className="w-full"
                          >
                            <Download className="w-3 h-3 mr-2" />
                            Export GeoJSON
                          </Button>
                        </div>
                      </DialogContent>
                    </Dialog>
                  </div>
                  
                  {layer.visible && (
                    <div className="ml-6 space-y-1">
                      <div className="text-xs text-gray-500">
                        Opacity: {Math.round(layer.opacity * 100)}%
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="100"
                        value={layer.opacity * 100}
                        onChange={(e) => updateLayerOpacity(layer.id, parseInt(e.target.value) / 100)}
                        className="w-full h-1 bg-gray-200 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>
                  )}
                </div>
              ))}
            </div>

            {filteredLayers.length === 0 && (
              <div className="text-center py-4 text-gray-500 text-sm">
                No layers match your filter
              </div>
            )}
          </CardContent>
        </Card>

        {/* Map Display */}
        <Card className="lg:col-span-3">
          <CardContent className="p-0">
            <div 
              ref={mapRef}
              className="relative w-full h-[600px] bg-gray-100 rounded-lg overflow-hidden"
            >
              {!mapLoaded ? (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-gray-500">Loading map...</div>
                </div>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="text-center space-y-2">
                    <MapPin className="w-12 h-12 text-blue-500 mx-auto" />
                    <div className="text-sm text-gray-600">
                      Interactive map with {layers.filter(l => l.visible).length} active layers
                    </div>
                    <Alert className="mt-4">
                      <Info className="h-4 w-4" />
                      <AlertDescription className="text-xs">
                        To use full GIS functionality, integrate with Leaflet, OpenLayers, or MapLibre GL JS.
                        WFS layers configured for: {layers.filter(l => l.type === 'wfs').map(l => l.name).join(', ')}
                      </AlertDescription>
                    </Alert>
                  </div>
                </div>
              )}
              
              {/* Map Controls */}
              <div className="absolute top-4 right-4 space-y-2">
                <Button size="sm" variant="secondary">
                  <ZoomIn className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <ZoomOut className="w-4 h-4" />
                </Button>
                <Button size="sm" variant="secondary">
                  <Locate className="w-4 h-4" />
                </Button>
              </div>

              {/* Legend */}
              <div className="absolute bottom-4 left-4 bg-white p-3 rounded shadow-lg space-y-2">
                <div className="text-xs mb-2">Active Layers</div>
                {layers.filter(l => l.visible).map(layer => (
                  <div key={layer.id} className="flex items-center gap-2 text-xs">
                    <div 
                      className="w-3 h-3 rounded"
                      style={{ backgroundColor: layer.color }}
                    />
                    {layer.name}
                  </div>
                ))}
              </div>

              {/* Scale Bar */}
              <div className="absolute bottom-4 right-4 bg-white px-3 py-1 rounded shadow text-xs">
                Scale: 1:50,000
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
