// "use client";
// import {Input} from "@/components/ui/input";
// import {ChangeEvent, Dispatch, MouseEvent, SetStateAction, useState} from "react";
// import usePlacesService from "react-google-autocomplete/lib/usePlacesAutocompleteService";
// import {Loading} from "@/components/shared/Loading";
// import {ControllerRenderProps, UseFormReturn} from "react-hook-form";
// import {formSchemaType} from "@/components/NewPlanForm";

// type PlacesAutoCompleteProps = {
//   selectedFromList: boolean;
//   setSelectedFromList: Dispatch<SetStateAction<boolean>>;
//   form: UseFormReturn<formSchemaType, any, undefined>;
//   field: ControllerRenderProps<formSchemaType, "placeName">;
// };

// const PlacesAutoComplete = ({
//   form,
//   field,
//   selectedFromList,
//   setSelectedFromList,
// }: PlacesAutoCompleteProps) => {
//   const [showReults, setShowResults] = useState(false);

//   const {placesService, placePredictions, getPlacePredictions, isPlacePredictionsLoading} =
//     usePlacesService({
//       apiKey: "AIzaSyCuUQJBuYNESeQwoQPGUsg0uAnYpPz_rKo",
//       options: {
//         types: ["(cities)"],
//         input: field.value,
//       },
//     });

//   const hadleSelectItem = (e: MouseEvent<HTMLLIElement>, description: string) => {
//     e.stopPropagation();
//     form.clearErrors("placeName");

//     setShowResults(false);
//     setSelectedFromList(true);

//     form.setValue("placeName", description);
//   };

//   const handleSearch = (e: ChangeEvent<HTMLInputElement>) => {
//     if (selectedFromList) {
//       form.setError("placeName", {
//         message: "Place should be selected from the list",
//         type: "custom",
//       });
//       setSelectedFromList(false);
//     }

//     const value = e.target.value;
//     field.onChange(e.target.value);

//     //predictions
//     if (value) {
//       getPlacePredictions({input: value});
//       setShowResults(true);
//     } else {
//       setShowResults(false);
//     }
//   };

//   return (
//     <div className="relative">
//       <div className="relative">
//         <Input
//           type="text"
//           placeholder="Search for your destination city..."
//           onChange={handleSearch}
//           onBlur={() => setShowResults(false)}
//           value={field.value}
//         />
//         {isPlacePredictionsLoading && (
//           <div className="absolute right-3 top-0 h-full flex items-center">
//             <Loading className="w-6 h-6" />
//           </div>
//         )}
//       </div>
//       {showReults && (
//         <div
//           className="absolute w-full
//         mt-2 shadow-md rounded-xl p-1 bg-background max-h-80 overflow-auto
//         z-50"
//           onMouseDown={(e) => e.preventDefault()}
//         >
//           <ul className="w-full flex flex-col gap-2" onMouseDown={(e) => e.preventDefault()}>
//             {placePredictions.map((item) => (
//               <li
//                 className="cursor-pointer
//                 border-b 
//                 flex justify-between items-center
//                 hover:bg-muted hover:rounded-lg
//                 px-1 py-2 text-sm"
//                 onClick={(e) => hadleSelectItem(e, item.description)}
//                 key={item.place_id}
//               >
//                 {item.description}
//               </li>
//             ))}
//           </ul>
//         </div>
//       )}
//     </div>
//   );
// };

// export default PlacesAutoComplete;
"use client"

import { useState, useEffect, useRef } from "react"
import { Input } from "@/components/ui/input"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Check, ChevronsUpDown } from "lucide-react"

// Mock data for cities when API key is not available
const MOCK_CITIES = [
  { place_id: "1", description: "New York, NY, USA" },
  { place_id: "2", description: "Los Angeles, CA, USA" },
  { place_id: "3", description: "Chicago, IL, USA" },
  { place_id: "4", description: "San Francisco, CA, USA" },
  { place_id: "5", description: "Miami, FL, USA" },
  { place_id: "6", description: "London, UK" },
  { place_id: "7", description: "Paris, France" },
  { place_id: "8", description: "Tokyo, Japan" },
  { place_id: "9", description: "Sydney, Australia" },
  { place_id: "10", description: "Rome, Italy" },
  { place_id: "11", description: "Barcelona, Spain" },
  { place_id: "12", description: "Amsterdam, Netherlands" },
  { place_id: "13", description: "Berlin, Germany" },
  { place_id: "14", description: "Dubai, UAE" },
  { place_id: "15", description: "Singapore" },
]

interface PlacesAutoCompleteProps {
  field: {
    value: string
    onChange: (value: string) => void
  }
  form: any
  selectedFromList: boolean
  setSelectedFromList: (value: boolean) => void
}

const PlacesAutoComplete = ({ field, form, selectedFromList, setSelectedFromList }: PlacesAutoCompleteProps) => {
  const [open, setOpen] = useState(false)
  const [searchValue, setSearchValue] = useState(field.value || "")
  const [suggestions, setSuggestions] = useState<Array<{ place_id: string; description: string }>>([])
  const [loading, setLoading] = useState(false)
  const [useGooglePlaces, setUseGooglePlaces] = useState(false)
  const autocompleteService = useRef<google.maps.places.AutocompleteService | null>(null)

  // Check if Google Maps API is available
  useEffect(() => {
    if (typeof window.google !== "undefined" && window.google.maps && window.google.maps.places) {
      autocompleteService.current = new window.google.maps.places.AutocompleteService()
      setUseGooglePlaces(true)
    } else {
      console.log("Google Places API not available, using mock data")
      setUseGooglePlaces(false)
    }
  }, [])

  // Handle search input change
  const handleSearchChange = (value: string) => {
    setSearchValue(value)
    field.onChange(value)
    setSelectedFromList(false)

    if (value.length > 2) {
      setLoading(true)

      if (useGooglePlaces && autocompleteService.current) {
        // Use Google Places API if available
        autocompleteService.current.getPlacePredictions(
          {
            input: value,
            types: ["(cities)"],
          },
          (predictions, status) => {
            setLoading(false)
            if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
              setSuggestions(
                predictions.map((prediction) => ({
                  place_id: prediction.place_id,
                  description: prediction.description,
                })),
              )
            } else {
              setSuggestions([])
            }
          },
        )
      } else {
        // Use mock data if Google Places API is not available
        setTimeout(() => {
          setLoading(false)
          const filteredCities = MOCK_CITIES.filter((city) =>
            city.description.toLowerCase().includes(value.toLowerCase()),
          )
          setSuggestions(filteredCities)
        }, 300) // Simulate API delay
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
  )
}

export default PlacesAutoComplete

