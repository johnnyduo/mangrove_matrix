
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Key, ExternalLink, CheckCircle } from 'lucide-react';

interface MapboxTokenInputProps {
  onTokenSet: (token: string) => void;
}

export const MapboxTokenInput = ({ onTokenSet }: MapboxTokenInputProps) => {
  return (
    <div className="absolute inset-0 bg-gray-900/95 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-full max-w-md bg-gray-800 border-gray-700">
        <CardHeader className="text-center">
          <CardTitle className="text-white flex items-center justify-center space-x-2">
            <CheckCircle className="w-5 h-5 text-green-400" />
            <span>Mapbox Ready</span>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4 text-center">
          <p className="text-gray-300 text-sm">
            Mapbox credentials are configured and ready to use.
          </p>
          <p className="text-xs text-green-400">
            🌍 3D Satellite Map with Enhanced Coastline Data
          </p>
        </CardContent>
      </Card>
    </div>
  );
};
