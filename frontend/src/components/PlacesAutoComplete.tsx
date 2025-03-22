"use client"

import { useState } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"
import axios from "axios"

// Replace with your Geoapify API key
const GEOAPIFY_API_KEY = "db97cf10b98e4fb987ad6e50b5b0091b" 

interface PlacesAutoCompleteProps {
  field: {
    value: string
    onChange: (value: string) => void
  }
  form: any
  selectedFromList: boolean
  setSelectedFromList: (value: boolean) => void
}

interface GeoapifyResult {
  place_id: string
  formatted: string
  city: string
  state: string
  country: string
  lat: number
  lon: number
}

const PlacesAutoComplete = ({ field, form, selectedFromList, setSelectedFromList }: PlacesAutoCompleteProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(field.value || "")
  const [suggestions, setSuggestions] = useState<Array<{ place_id: string; description: string }>>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle search input change
  const handleSearchChange = async (value: string) => {
    setSearchValue(value)
    field.onChange(value)
    setSelectedFromList(false)
    setError(null)

    if (value.length > 2) {
      setLoading(true)

      try {
        // Use Geoapify Autocomplete API
        const response = await axios.get(
          `https://api.geoapify.com/v1/geocode/autocomplete`, 
          {
            params: {
              text: value,
              format: 'json',
              apiKey: GEOAPIFY_API_KEY,
              limit: 10
            }
          }
        )
        
        console.log("API Response:", response.data);
        
        // Check if there are results in the response
        if (response.data.results && response.data.results.length > 0) {
          setSuggestions(
            response.data.results.map((result: GeoapifyResult) => ({
              place_id: result.place_id,
              description: result.formatted,
              // You can store additional data as needed
              // lat: result.lat,
              // lon: result.lon,
            }))
          )
        } else {
          setSuggestions([])
        }
      } catch (error) {
        console.error("Error fetching from Geoapify:", error)
        setSuggestions([])
        if (!GEOAPIFY_API_KEY || GEOAPIFY_API_KEY === "db97cf10b98e4fb987ad6e50b5b0091b") {
          setError("API key not configured. Please add a valid Geoapify API key.")
        } else {
          setError("Failed to fetch location data. Please try again later.")
        }
      } finally {
        setLoading(false)
      }
    } else {
      setSuggestions([])
      setLoading(false)
    }
  }

  // Handle selection from dropdown
  const handleSelect = (city: { place_id: string; description: string }) => {
    setSearchValue(city.description)
    field.onChange(city.description)
    setSelectedFromList(true)
    setOpen(false)
  }

  return (
    <div>
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <div className="flex items-center">
            <Input
              value={searchValue}
              onChange={(e) => handleSearchChange(e.target.value)}
              placeholder="Search for a city..."
              className="w-full"
            />
            <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
          </div>
        </PopoverTrigger>
        <PopoverContent className="w-[300px] p-0" align="start">
          <Command>
            <CommandInput placeholder="Search for a city..." value={searchValue} onValueChange={handleSearchChange} />
            <CommandList>
              {loading ? (
                <CommandEmpty>Loading...</CommandEmpty>
              ) : error ? (
                <CommandEmpty>{error}</CommandEmpty>
              ) : suggestions.length === 0 ? (
                <CommandEmpty>No cities found. Try a different search.</CommandEmpty>
              ) : (
                <CommandGroup>
                  {suggestions.map((city) => (
                    <CommandItem key={city.place_id} value={city.description} onSelect={() => handleSelect(city)}>
                      {city.description}
                      {selectedFromList && field.value === city.description && <Check className="ml-auto h-4 w-4" />}
                    </CommandItem>
                  ))}
                </CommandGroup>
              )}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>
      {error && <p className="text-red-500 text-sm mt-1">{error}</p>}
    </div>
  )
}

export default PlacesAutoComplete