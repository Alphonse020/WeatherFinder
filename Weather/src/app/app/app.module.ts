import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';       // For browser rendering
import { HttpClientModule } from '@angular/common/http';       // For HTTP requests
import { FormsModule } from '@angular/forms';                  // For template-driven forms
import { WeatherComponent } from '../components/weather/weather.component'; // Weather feature component
import { AppComponent } from '../app.component';               // Main app component
import { CommonModule } from '@angular/common';                // Common directives (redundant here)
import { AppRoutingModule } from '../../app-routing/app-routing.module'; // Routing module

@NgModule({
  declarations: [       
  ],
  imports: [
    CommonModule,          
    BrowserModule,         
    AppRoutingModule,      
    HttpClientModule,      
    FormsModule ,
    WeatherComponent,
    AppComponent,           
  ],
  bootstrap: [],
})
export class AppModule { }