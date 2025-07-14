import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, catchError, throwError } from 'rxjs';

export interface WeatherData {
  city: string;
  temperature: number;
  description: string;
}

export interface WeatherLog {
  id: number;
  city: string;
  requestDate: string;
  temperature: number;
  description: string;
}

@Injectable({
  providedIn: 'root'
})
export class WeatherService {
  private apiUrl = 'https://localhost:7024/api/Weather/';

  constructor(private http: HttpClient) { }

  getWeather(city: string): Observable<WeatherData> {
    if (!city || city.trim().length === 0) {
      return throwError(() => new Error('Please enter a city name'));
    }

    return this.http.get<WeatherData>(`${this.apiUrl}${encodeURIComponent(city)}`).pipe(
       catchError(error => {
        console.error('Full API Error:', error); // Detailed logging
        
        // First try to get message from error response body
        const bodyMessage = error.error?.message || error.error;
        
        if (typeof bodyMessage === 'string' && bodyMessage.toLowerCase().includes('not found')) {
          return throwError(() => new Error(`"${city}" not found. Please check the spelling.`));
        }
        
        // Then check HTTP status codes
        if (error.status === 404) {
          return throwError(() => new Error(`"${city}" not found. Please check the spelling.`));
        }
        
        if (error.status === 400) {
          return throwError(() => new Error('Invalid city name format. Please try again.'));
        }
        
        if (error.status === 0) {
          return throwError(() => new Error('Network error. Please check your internet connection.'));
        }
        
        // Fallback to generic message
        return throwError(() => new Error('Failed to fetch weather data. Please try again later.'));
      })
    );
  }

  getLogs(): Observable<WeatherLog[]> {
    return this.http.get<WeatherLog[]>(`${this.apiUrl}logs`).pipe(
      catchError(error => {
        console.error('Error fetching logs:', error);
        return throwError(() => new Error('Failed to load weather history.'));
      })
    );
  }

  deleteLog(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}logs/${id}`).pipe(
      catchError(error => {
        console.error('Error deleting log:', error);
        return throwError(() => new Error('Failed to delete weather record.'));
      })
    );
  }
}