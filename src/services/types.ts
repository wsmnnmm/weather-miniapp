export interface WeatherData {
  city: string;
  reporttime: string;
  temperature: number;
  tempMax: number;
  humidity: number;
  weather: string;
  isAlert: boolean;
  alertMessage?: string;
}

export interface ForecastItem {
  date: string;
  week: string;
  dayTemp: number;
  nightTemp: number;
  dayWeather: string;
}
