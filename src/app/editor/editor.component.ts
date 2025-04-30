import {
  AfterViewInit,
  Component,
  ElementRef,
  input,
  viewChild,
} from '@angular/core';
import CreativeEditorSDK from '@cesdk/cesdk-js';
import { CONFIG } from '../core/constants';
import { initPhotoEditorUIConfig } from './editor.config';
@Component({
  selector: 'app-editor',
  standalone: true,
  imports: [],
  templateUrl: './editor.component.html',
  styleUrl: './editor.component.scss',
})
export class EditorComponent implements AfterViewInit {
  url = input.required<string>();
  private containerRef =
    viewChild.required<ElementRef<HTMLDivElement>>('cesdk_container');

  ngAfterViewInit(): void {
    CreativeEditorSDK.create(this.containerRef().nativeElement, CONFIG).then(
      async (instance: CreativeEditorSDK) => {
        console.log(this.url())
        await instance.addDefaultAssetSources();
        const cleanup = await initPhotoEditorUIConfig(instance, this.url());
        console.log(instance.ui.getDockOrder())
        return cleanup;
      }
    );
  }
}
