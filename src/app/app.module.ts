import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule  } from '@angular/material/form-field';
import { MatSelectModule  } from '@angular/material/select';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { DialogUser, DialogTask, PageHomeComponent } from './page-home/page-home.component';

const materialModules = [
  MatFormFieldModule,
  MatDialogModule,
  MatSelectModule
];

@NgModule({
  declarations: [
    AppComponent,
    PageHomeComponent,
    DialogUser,
    DialogTask
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    ReactiveFormsModule,
    BrowserAnimationsModule,
    materialModules,
    FormsModule
  ],
  exports: [
    materialModules,
    FormsModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
