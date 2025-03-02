'use client';
import Map from '@/components/Map';
import SearchBar from '@/components/SearchBar';
import { SearchProvider } from '@/context/SearchContext';
import 'maplibre-gl/dist/maplibre-gl.css';

export default function Home() {
  return (
    <SearchProvider>
      <div className="h-screen w-screen">
        <SearchBar />
        <Map />
      </div>
    </SearchProvider>
  );
}
