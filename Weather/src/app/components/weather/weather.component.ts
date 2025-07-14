import { Component, OnInit } from '@angular/core';
import { WeatherService, WeatherData, WeatherLog } from '../../services/weather.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { FontAwesomeModule } from '@fortawesome/angular-fontawesome';
import { 
  faSearch, 
  faCloudSun, 
  faTemperatureHalf, 
  faClockRotateLeft, 
  faTrash, 
  faSpinner,
  faExclamationTriangle 
} from '@fortawesome/free-solid-svg-icons';
import { lastValueFrom } from 'rxjs';

@Component({
  selector: 'app-weather',
  standalone: true,
  imports: [CommonModule, FormsModule, FontAwesomeModule],
  templateUrl: './weather.component.html',
  styleUrls: ['./weather.component.css']
})
export class WeatherComponent implements OnInit {
  // Icons
  icons = {
    search: faSearch,
    weather: faCloudSun,
    temp: faTemperatureHalf,
    history: faClockRotateLeft,
    trash: faTrash,
    spinner: faSpinner,
    warning: faExclamationTriangle
  };

  // Data
  city: string = '';
  weather: WeatherData | null = null;
  logs: WeatherLog[] = [];
  
  // UI States
  isLoading: boolean = false;
  errorMessage: string = '';
  lastUpdated: Date | null = null;
  deletingIds: Set<number> = new Set();
  private errorTimeout: any;

  constructor(private weatherService: WeatherService) {}

  ngOnInit(): void {
    this.getLogs();
  }

  async getWeather() {
    // Clear any existing error messages and timeouts
    clearTimeout(this.errorTimeout);
    this.errorMessage = '';

    if (!this.city.trim()) {
      this.showError('Please enter a city/town name', 3000);
      return;
    }

    this.isLoading = true;
    this.weather = null;
    
    try {
      const weather$ = this.weatherService.getWeather(this.city);
      this.weather = await lastValueFrom(weather$);
      this.lastUpdated = new Date();
      await this.getLogs();
    } catch (err: unknown) {
      this.handleWeatherError(err);
    } finally {
      this.isLoading = false;
    }
  }

 private async getLogs() {
  try {
    const logs$ = this.weatherService.getLogs();
    const result = await lastValueFrom(logs$);
    // Sort logs by requestDate in descending order (newest first)
    this.logs = (result ?? []).sort((a, b) => {
      return new Date(b.requestDate).getTime() - new Date(a.requestDate).getTime();
    });
  } catch (err: unknown) {
    console.error('Error loading history:', err);
    this.logs = [];
  }
}

  async deleteLog(log: WeatherLog) {
    if (!log.id) return;
    
    if (!confirm('Are you sure you want to delete this weather record?')) {
      return;
    }

    this.deletingIds.add(log.id);
    
    try {
      const delete$ = this.weatherService.deleteLog(log.id);
      await lastValueFrom(delete$);
      this.logs = this.logs.filter(l => l.id !== log.id);
    } catch (err: unknown) {
      console.error('Error deleting log:', err);
      this.showError('Failed to delete weather record', 3000);
    } finally {
      this.deletingIds.delete(log.id);
    }
  }

  private handleWeatherError(err: unknown) {
  console.log('Raw error received:', err); // Debugging log
  
  if (err instanceof Error) {
    this.errorMessage = err.message;
  } 
  else if (typeof err === 'string') {
    // Handle case where error might come as plain string
    if (err.toLowerCase().includes('not found')) {
      this.errorMessage = err;
    } else {
      this.errorMessage = 'Failed to fetch weather data. Please try again later.';
    }
  }
  else if (typeof err === 'object' && err !== null) {
    // Handle case where error comes as an object
    const errObj = err as { message?: string };
    if (errObj.message?.toLowerCase().includes('not found')) {
      this.errorMessage = errObj.message;
    } else {
      this.errorMessage = 'Failed to fetch weather data. Please try again later.';
    }
  }
  else {
    this.errorMessage = 'Failed to fetch weather data. Please try again later.';
  }

  // Auto-clear after 5 seconds
  setTimeout(() => {
    this.errorMessage = '';
  }, 5000);
}

  private showError(message: string, duration: number) {
    this.errorMessage = message;
    clearTimeout(this.errorTimeout);
    this.errorTimeout = setTimeout(() => {
      this.errorMessage = '';
    }, duration);
  }
}