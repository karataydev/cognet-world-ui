"use client"

import * as React from "react"
import { Search, Loader2, X, MapPin, Globe2 } from "lucide-react"
import { useDebounce } from "use-debounce"
import { useSearch } from '@/context/SearchContext'
import { Switch } from "@/components/ui/switch"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"

export default function SearchBar() {
  const searchContainerRef = React.useRef(null);
  const [searchTerm, setSearchTerm] = React.useState("")
  const [debouncedValue] = useDebounce(searchTerm, 500)
  const [results, setResults] = React.useState([])
  const [isLoading, setIsLoading] = React.useState(false)
  const [isOpen, setIsOpen] = React.useState(false)
  const { 
    setSelectedResult, 
    selectedResult, 
    showAllChains, 
    setShowAllChains,
    mapRef  // Get mapRef from context instead of creating a new one
  } = useSearch()

  // Handle click outside
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Clear search
  const handleClear = () => {
    setSearchTerm("")
    setResults([])
    setIsOpen(false)
  }

  // Search API call
  React.useEffect(() => {
    const searchAPI = async () => {
      // Only search if at least 2 characters
      if (debouncedValue.length < 2) {
        setResults([])
        setIsOpen(false)
        return
      }

      setIsLoading(true)
      setIsOpen(true)

      try {
        // Replace with your actual API endpoint
        const response = await fetch(`https://cognet-world-inquiry-service.karatay.dev/api/v1/search/suggestions?prefix=${debouncedValue}`)
        const data = await response.json()
        setResults(data.data)
      } catch (error) {
        console.error("Search failed:", error)
      } finally {
        setIsLoading(false)
      }
    }

    searchAPI()
  }, [debouncedValue])

  const handleLabelClick = () => {
    if (selectedResult && mapRef.current) {
      mapRef.current.flyTo({
        center: [selectedResult.language_info.coordinates[1], selectedResult.language_info.coordinates[0] + 10],
        zoom: 3.3,
        essential: true
      });
    }
  };

  return (
    <>
      <div className="fixed top-4 left-1/2 -translate-x-1/2 w-full max-w-md z-[100]" ref={searchContainerRef}>
        <div className="relative mx-4">
          <div className="relative flex items-center gap-2">
            <div className="flex-1 relative">
              <div className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
                <Search className="h-4 w-4 text-muted-foreground" />
              </div>
              <Input
                type="search"
                placeholder="Search..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 h-12 rounded-full border-2 shadow-lg bg-background/95 backdrop-blur-sm"
              />
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowAllChains(!showAllChains)}
              className="h-12 w-12 rounded-full border-2 shadow-lg bg-background/95 backdrop-blur-sm"
            >
              {showAllChains ? (
                <Globe2 className="h-5 w-5" />
              ) : (
                <MapPin className="h-5 w-5" />
              )}
            </Button>
          </div>

          {/* Results dropdown */}
          {isOpen && (
            <div className="absolute top-full left-0 right-0 mt-2 rounded-lg border bg-background shadow-xl overflow-hidden max-h-[70vh] overflow-y-auto">
              {isLoading ? (
                <div className="flex items-center justify-center p-4">
                  <Loader2 className="h-6 w-6 animate-spin text-primary" />
                  <span className="ml-2">Searching...</span>
                </div>
              ) : results.length > 0 ? (
                <div className="p-2">
                  {results.map((result, index) => (
                    <div
                      key={result.word}
                      className={`p-3 hover:bg-muted cursor-pointer transition-colors ${
                        index !== results.length - 1 ? 'border-b border-border/60' : ''
                      }`}
                      onClick={() => {
                        setSelectedResult(result)
                        setIsOpen(false)
                        setSearchTerm("")
                        setResults([])
                      }}
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex flex-col">
                          <span className="font-medium text-lg">{result.word}</span>
                          <span className="text-xs text-muted-foreground">{result.language_info.name}</span>
                        </div>
                        <span className="text-2xl">{result.language_info.flag}</span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : debouncedValue.length >= 2 ? (
                <div className="p-4 text-center text-muted-foreground">No results found</div>
              ) : (
                <div className="p-4 text-center text-muted-foreground">Type at least 2 characters to search</div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Selected Word Label */}
      {selectedResult && (
        <div 
          className="fixed left-4 top-20 z-[90] bg-background/95 backdrop-blur-sm rounded-lg border-2 shadow-lg p-2 pr-8 animate-in fade-in slide-in-from-left hover:bg-muted/50 cursor-pointer transition-colors"
          onClick={handleLabelClick}
        >
          <div className="flex flex-col">
            <div className="flex items-center gap-1">
              <div className="font-medium">{selectedResult.word}</div>
              <span className="text-xl">{selectedResult.language_info.flag}</span>
            </div>
            <span className="text-xs text-muted-foreground">{selectedResult.language_info.name}</span>
          </div>
          <button 
            onClick={(e) => {
              e.stopPropagation(); // Prevent label click when clicking the X
              setSelectedResult(null);
            }}
            className="absolute top-1 right-1 p-1 hover:bg-muted rounded-full"
            aria-label="Clear selection"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      )}
    </>
  )
}
