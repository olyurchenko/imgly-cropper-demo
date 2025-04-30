import { Component, inject } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { filter, map } from 'rxjs';
import { fileToBlob } from './core/utils/file.utile';
import { EditorComponent } from './editor/editor.component';
import { AsyncPipe } from '@angular/common';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [
    ReactiveFormsModule,
    MatIconModule,
    MatButtonModule,
    EditorComponent,
    AsyncPipe,
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'imgly-cropper-demo';
  fb = inject(FormBuilder);
  form = this.fb.group({
    selectedFile: this.fb.control<File | null>(null),
  });

  selectedFile$ = this.selectedFile.valueChanges.pipe(
    filter((file) => !!file),
    map((file) => URL.createObjectURL(fileToBlob(file)))
  );

  get selectedFile(): FormControl<File | null> {
    return this.form.controls.selectedFile;
  }

  handleFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const files = input.files;

    if (files && files.length > 0) {
      const selectedFile = files[0];
      this.selectedFile.setValue(selectedFile);
    }
  }

  handleSubmit(): void {
    const file = this.selectedFile.value;
    if (file) {
      const url = URL.createObjectURL(fileToBlob(file));
      console.log(url, 'File URL');
    }
  }
}
