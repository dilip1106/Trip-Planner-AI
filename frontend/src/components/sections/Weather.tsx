import { ReactNode, useEffect, useState } from "react";
import SectionWrapper from "@/components/sections/SectionWrapper";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Cloud,
  Compass,
  Droplets,
  Eye,
  EyeOff,
  Thermometer,
  ThermometerSnowflake,
  ThermometerSun,
  Waves,
  Wind,
} from "lucide-react";

// Define the weather response type to match the actual API response
interface CurrentWeatherResponse {
  coord: {
    lon: number;
    lat: number;
  };
  weather: {
    id: number;
    main: string;
    description: string;
    icon: string;
  }[];
  base: string;
  main: {
    temp: number;
    feels_like: number;
    temp_min: number;
    temp_max: number;
    pressure: number;
    humidity: number;
    sea_level?: number;
    grnd_level?: number;
  };
  visibility: number;
  wind: {
    speed: number;
    deg: number;
  };
  clouds: {
    all: number;
  };
  dt: number;
  sys: {
    type: number;
    id: number;
    country: string;
    sunrise: number;
    sunset: number;
  };
  timezone: number;
  id: number;
  name: string;
  cod: number;
}

const Weather = ({ placeName }: { placeName: string | undefined }) => {
  // const { setPlanState } = usePlanContext();
  const [weatherData, setWeatherData] = useState<CurrentWeatherResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Update this URL to match your Express backend URL
  const API_BASE_URL = 'http://localhost:5000';
  
  const getWeather = async (placeName: string) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch(`${API_BASE_URL}/api/plan/weather?placeName=${placeName}`);
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to fetch weather data");
      }
      
      const data = await response.json();
      return data;
    } catch (error) {
      if (error instanceof Error) {
        throw new Error(error.message);
      }
      throw new Error("An unknown error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!placeName) {
      setWeatherData(null);
      setError(null);
      return;
    }
    
    getWeather(placeName)
      .then((data) => {
        setWeatherData(data);
        // setPlanState((state) => ({ ...state, weather: true }));
      })
      .catch((e) => {
        console.error(e);
        setError(`Error: ${e.message}`);
        setWeatherData(null);
      });
  }, [placeName]);

  return (
    <SectionWrapper id="weather">
      <h2 className="mb-2 text-lg font-semibold tracking-wide flex items-center">
        <Cloud className="mr-2" /> Weather
      </h2>
      
      {loading ? (
        <WeatherLoadingSkeleton />
      ) : error ? (
        <div className="p-4 rounded-lg bg-red-50 dark:bg-red-900/20">
          <p className="text-red-500 dark:text-red-400">Error loading weather information for {placeName}: {error}</p>
        </div>
      ) : !placeName ? (
        <p className="ml-8 text-muted-foreground">Please enter a location to see weather information</p>
      ) : weatherData ? (
        <div className="grid md:grid-cols-2 auto-rows-auto grid-cols-1 grid-flow-row justify-center items-center min-h-[100px] gap-5">
          <WeatherTile>
            <Temperature
              placeName={weatherData.name}
              iconName={weatherData.weather[0].icon}
              weatherDesc={weatherData.weather[0].description}
              temp={weatherData.main.temp}
            />
          </WeatherTile>
          <WeatherTile>
            <WindDeatils speed={weatherData.wind.speed} deg={weatherData.wind.deg} />
          </WeatherTile>
          <WeatherTile>
            <TempHumdityDetails weatherData={weatherData} />
          </WeatherTile>
          <WeatherTile>
            <VisibilityDetails visibility={weatherData.visibility} />
          </WeatherTile>
        </div>
      ) : (
        <p className="ml-8 text-muted-foreground">No weather data available</p>
      )}
    </SectionWrapper>
  );
};

// Weather tile component
const WeatherTile = ({ children }: { children: ReactNode }) => {
  return (
    <div
      className="min-h-[184px] rounded-xl flex-grow 
                    w-full h-full flex flex-col justify-center items-center
                    p-5 shadow-md dark:border dark:border-border"
    >
      {children}
    </div>
  );
};

// Temperature component
const Temperature = ({
  placeName,
  iconName,
  weatherDesc,
  temp,
}: {
  placeName: string;
  iconName: string;
  weatherDesc: string;
  temp: number;
}) => {
  // Convert from Kelvin to Celsius
  const tempCelsius = Math.round(temp - 273.15);
  
  return (
    <>
      <div className="flex justify-center items-center">
        <span>{placeName}</span>
      </div>
      <div className="flex justify-center items-center gap-1">
        <img
          alt="weather icon"
          width={100}
          height={100}
          className=""
          src={`https://openweathermap.org/img/wn/${iconName}@2x.png`}
        />
        <span className="text-4xl font-semibold">{tempCelsius}°C</span>
      </div>
      <span className="capitalize text-muted-foreground text-sm">{weatherDesc}</span>
    </>
  );
};

// Visibility component
const VisibilityDetails = ({ visibility }: { visibility: number }) => {
  return (
    <>
      <div className="flex justify-center items-center">
        <span>Visibility</span>
      </div>
      <Input
        type="range"
        max={10000}
        value={visibility}
        onChange={() => {}}
        className="p-0 text-background bg-background accent-foreground"
        readOnly
      />
      <div className="flex justify-between items-center w-full">
        <EyeOff />
        {visibility / 1000}km
        <Eye />
      </div>
    </>
  );
};

// Temperature and humidity details component
const TempHumdityDetails = ({ weatherData }: { weatherData: CurrentWeatherResponse }) => {
  // Convert from Kelvin to Celsius
  const tempMaxCelsius = Math.round(weatherData.main.temp_max - 273.15);
  const tempMinCelsius = Math.round(weatherData.main.temp_min - 273.15);
  const feelsLikeCelsius = Math.round(weatherData.main.feels_like - 273.15);
  
  return (
    <>
      <div className="flex gap-2 justify-between w-full">
        <div className="flex items-center gap-1">
          <Droplets className="h-4 w-4" />
          <span>Humidity</span>
        </div>
        <span>{Math.round(weatherData.main.humidity)}%</span>
      </div>
      <div className="flex gap-2 justify-between w-full">
        <div className="flex items-center gap-1">
          <ThermometerSun className="h-4 w-4" />
          <span>Max Temperature</span>
        </div>
        <span>{tempMaxCelsius}°C</span>
      </div>
      <div className="flex gap-2 justify-between w-full">
        <div className="flex items-center gap-1">
          <ThermometerSnowflake className="h-4 w-4" />
          <span>Min Temperature</span>
        </div>
        <span>{tempMinCelsius}°C</span>
      </div>
      <div className="flex gap-2 justify-between w-full">
        <div className="flex items-center gap-1">
          <Thermometer className="h-4 w-4" />
          <span>Feels like</span>
        </div>
        <span>{feelsLikeCelsius}°C</span>
      </div>
      {weatherData?.main?.sea_level && (
        <div className="flex gap-2 justify-between w-full">
          <div className="flex items-center gap-1">
            <Waves className="h-4 w-4" />
            <span>Sea Level</span>
          </div>
          <span>{Math.round(weatherData.main.sea_level)} hPa</span>
        </div>
      )}
    </>
  );
};

// Wind details component
const WindDeatils = ({speed, deg}: {speed: number; deg: number}) => {
  return (
    <div className="flex gap-5 justify-center items-center">
      <svg className="" height="100px" width="100px" version="1.1" viewBox="0 0 512 512">
        <path
          fill="#38A287"
          d="M256.001,451.314c-88.826,0-172.898,20.338-247.828,56.597h495.655
	C428.899,471.652,344.827,451.314,256.001,451.314z"
          opacity="1"
        ></path>
        <circle fill="#9CA9A4" cx="255.999" cy="130.308" r="16.34" opacity="1"></circle>
        <path
          className="fill-current text-black dark:text-white"
          d="M352.671,311.112c-3.908,2.256-5.246,7.253-2.99,11.16c1.513,2.621,4.259,4.086,7.083,4.086
	c1.387,0,2.792-0.353,4.077-1.096l53.116-30.666l53.116,30.666c1.288,0.743,2.692,1.096,4.077,1.096c2.824,0,5.57-1.465,7.083-4.086
	c2.256-3.908,0.917-8.904-2.99-11.16l-53.116-30.666v-61.333c0-4.512-3.657-8.17-8.17-8.17c-4.513,0-8.17,3.658-8.17,8.17v61.333
	L352.671,311.112z"
          opacity="1"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 415 285"
            to="360 415 285"
            dur="1.4836795252225519s"
            repeatCount="indefinite"
          ></animateTransform>
        </path>
        <path
          className="fill-current text-black dark:text-white"
          d="M40.852,326.359c1.386,0,2.792-0.353,4.077-1.096l53.116-30.666l53.116,30.666c1.288,0.743,2.692,1.096,4.077,1.096
	c2.824,0,5.57-1.465,7.083-4.086c2.256-3.908,0.917-8.904-2.99-11.16l-53.116-30.666v-61.333c0-4.512-3.657-8.17-8.17-8.17
	c-4.513,0-8.17,3.658-8.17,8.17v61.333l-53.116,30.666c-3.908,2.256-5.246,7.253-2.99,11.16
	C35.282,324.894,38.028,326.359,40.852,326.359z"
          opacity="1"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 98 289"
            to="360 98 289"
            dur="1.4836795252225519s"
            repeatCount="indefinite"
          ></animateTransform>
        </path>
        <path
          className="fill-current text-black dark:text-white"
          d="M151.884,196.691c1.386,0,2.792-0.353,4.077-1.096l84.129-48.571c4.284,3.668,9.841,5.89,15.911,5.89
	c6.069,0,11.627-2.222,15.911-5.89l84.129,48.571c1.288,0.743,2.692,1.096,4.077,1.096c2.824,0,5.57-1.465,7.083-4.086
	c2.256-3.908,0.917-8.904-2.99-11.16l-84.117-48.564c0.269-1.452,0.417-2.947,0.417-4.476c0-10.651-6.831-19.733-16.34-23.105V8.171
	c0-4.512-3.657-8.17-8.17-8.17c-4.513,0-8.17,3.658-8.17,8.17v97.128c-9.51,3.373-16.34,12.455-16.34,23.105
	c0,1.529,0.148,3.024,0.417,4.476l-84.117,48.564c-3.908,2.256-5.246,7.253-2.99,11.16
	C146.313,195.226,149.06,196.691,151.884,196.691z M256.001,120.234c4.506,0,8.17,3.666,8.17,8.17s-3.665,8.17-8.17,8.17
	c-4.506,0-8.17-3.666-8.17-8.17C247.831,123.899,251.495,120.234,256.001,120.234z"
          opacity="1"
        >
          <animateTransform
            attributeName="transform"
            attributeType="XML"
            type="rotate"
            from="0 256 129"
            to="360 256 129"
            dur="1.4836795252225519s"
            repeatCount="indefinite"
          ></animateTransform>
        </path>
        <path
          className="fill-current text-black dark:text-white"
          d="M507.387,496.472c-27.727-13.418-56.183-24.494-85.26-33.23V317.844c0-4.512-3.657-8.17-8.17-8.17s-8.17,3.658-8.17,8.17
	v140.757c-45.858-12.293-93.193-18.827-141.616-19.485V177.425c0-4.512-3.657-8.17-8.17-8.17s-8.17,3.658-8.17,8.17v261.691
	c-48.423,0.659-95.757,7.193-141.616,19.485V317.844c0-4.512-3.657-8.17-8.17-8.17s-8.17,3.658-8.17,8.17v145.399
	c-29.076,8.736-57.532,19.812-85.26,33.23c-4.061,1.965-5.762,6.851-3.795,10.913c1.966,4.062,6.851,5.762,10.913,3.795
	c28.438-13.761,57.665-24.995,87.558-33.685c0.711-0.109,1.393-0.304,2.032-0.584c49.888-14.296,101.627-21.513,154.679-21.513
	c53.051,0,104.79,7.217,154.678,21.513c0.639,0.28,1.322,0.476,2.034,0.585c29.894,8.69,59.12,19.923,87.557,33.684
	c1.147,0.554,2.358,0.818,3.552,0.818c3.035,0,5.95-1.698,7.361-4.613C513.148,503.323,511.449,498.437,507.387,496.472z"
          opacity="1"
        ></path>
      </svg>
      <div className="flex items-start justify-center gap-5 flex-col">
        <div className="flex justify-center items-center gap-1">
          <Wind className="h-5 w-5" />
          <span className="text-sm">Wind Speed: {speed} m/s</span>
        </div>
        <div className="flex justify-center items-center gap-1">
          <Compass className="h-5 w-5" />
          <span className="text-sm">Wind Direction: {deg}°</span>
        </div>
      </div>
    </div>
  );
};

// Loading skeleton component
const WeatherLoadingSkeleton = () => (
  <div className="grid md:grid-cols-2 grid-cols-1 gap-4">
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
    <Skeleton className="h-40 w-full" />
  </div>
);

export default Weather;