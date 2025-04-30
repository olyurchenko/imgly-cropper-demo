import CreativeEditorSDK, {
  AssetResult,
  CreativeEngine,
  DesignUnit,
  SettingsBool,
} from '@cesdk/cesdk-js';
import { removeBackground } from '@imgly/background-removal';
import FORMAT_ASSETS from './CustomFormats.json';
import { registerPageCropPanel, setTempSizeInMetadata } from './PageCropPanel';
import loadAssetSourceFromContentJSON from './loadAssetSourceFromContentJSON';
import loadAssetSource from './loadAssetSource';
import { findCPAssets } from './findContentPoolAssets';
import { applyCPAppAsset } from './applyCPAsset';
import { stickersLibraryPayload } from '../core/constants';
import { addTemplatesAssetsSource } from './templates.config';

type Dimensions = { width: number; height: number, size: number }

export const caseAssetPath = (caseId: any) =>
  `https://sl-chat-image-development.s3.amazonaws.com/${caseId}`;

async function blobUrlToBlob(blobUrl: string): Promise<Blob> {
  const response = await fetch(blobUrl);
  if (!response.ok) {
    throw new Error(`Failed to fetch blob: ${response.statusText}`);
  }
  return await response.blob();
}


function isVideoBlob(blob: Blob): boolean {
  return blob.type.startsWith('video/');
}

function getVideoDimensionsFromBlob(blob: Blob): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const video = document.createElement('video');

    video.preload = 'metadata';
    video.src = url;
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      resolve({ width: video.videoWidth, height: video.videoHeight, size: blob.size});
    };

    video.onerror = (err) => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load video metadata'));
    };
  });
}

function getImageDimensionsFromBlob(blob: Blob): Promise<Dimensions> {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      URL.revokeObjectURL(url);
      resolve({ width: img.width, height: img.height, size: blob.size });
    };

    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Failed to load image'));
    };

    img.src = url;
  });
}


export async function getMediaSize(url: string): Promise<any> {
  const blob =  await blobUrlToBlob(url)
  if(isVideoBlob(blob)){
    return getVideoDimensionsFromBlob(blob)
  }
  return getImageDimensionsFromBlob(blob)
}

export async function initPhotoEditorUIConfig(
  instance: CreativeEditorSDK,
  photoUri: string
) {
  setupDock(instance);
  loadAssetSourceFromContentJSON(
    instance.engine,
    FORMAT_ASSETS,
    createApplyFormatAsset(instance)
  );
  instance.setTranslations({
    en: {
      'libraries.ly.img.formats.social.label': 'Social',
    },
  });
  // setup translation for apps
  instance.setTranslations({
    en: {
      'libraries.ly.img.apps.label': 'Apps',
    },
  });

  loadAssetSource(
    instance.engine,
    'ly.img.stickers',
    findCPAssets,
    createApplyFormatAsset(instance)
  );


  instance.setTranslations({
    en: {
      'libraries.ly.img.stickers.label': 'Stickers',
    },
  });
  const unsubscribeSceneSetup = await setupPhotoEditingScene(
    instance,
    photoUri
  );

  registerPageCropPanel(instance);
  instance.setTranslations({
    en: {
      'panel.ly.img.page-crop': 'Crop',
    },
  });
  instance.ui.openPanel('ly.img.page-crop');
  const blob = await blobUrlToBlob(photoUri)
  const isVideo = await isVideoBlob(blob)
  if(isVideo){
    await addTemplatesAssetsSource(instance, "video")
  }else{
    await addTemplatesAssetsSource(instance, "image")
  }

  return () => {
    unsubscribeSceneSetup();
  };
}

function setupDock(instance: CreativeEditorSDK) {
  instance.ui.registerComponent(
    'ly.img.crop.dock',
    ({ builder: { Button } }) => {
      const isFormatAssetLibraryOpen =
        instance.ui.isPanelOpen('ly.img.page-crop');
        console.log(isFormatAssetLibraryOpen, )
      Button('open-crop', {
        label: 'Crop',

        icon: ({ theme }) =>
          caseAssetPath(`fe69449b-669f-44c1-b379-fb2b570bdf75.png`),
        isSelected: isFormatAssetLibraryOpen,
        onClick: async () => {
          if (isFormatAssetLibraryOpen) {
            instance.ui.closePanel('ly.img.page-crop');
            instance.engine.editor.setEditMode('Transform');
            return;
          }
          closeAllPanels(instance);
          const page = instance.engine.scene.getCurrentPage();
          instance.engine.block.select(page!);
          await new Promise((resolve) => setTimeout(resolve, 100));
          instance.ui.openPanel('ly.img.page-crop');
          instance.engine.editor.setEditMode('Crop');
        },
      });
    }
  );

  instance.ui.setDockOrder([
    'ly.img.crop.dock',
  ]);
}

async function setupPhotoEditingScene(
  instance: CreativeEditorSDK,
  uri: string
) {
  const blob = await blobUrlToBlob(uri)
  const type = (await isVideoBlob(blob)) ? 'video': 'image'
  const engine = instance.engine;
  if(type === 'video'){
    await engine.scene.createFromVideo(uri)
    return () => {}
  }
  const size = await getMediaSize(uri);
  if (!size || !size.width || !size.height) {
    throw new Error('Could not get image size');
  }
  const { width, height } = size;
  // hide page title:
  engine.editor.setSettingBool('page/title/show', false);

  const scene = engine.scene.create('Free');
  engine.scene.setDesignUnit('Pixel');
  const page = engine.block.create('page');
  // Add page to scene:
  engine.block.appendChild(scene, page);
  // Set page size:
  engine.block.setWidth(page, width);
  engine.block.setHeight(page, height);
  // Create image fill"
  const fill = engine.block.createFill('image');
  // Set fill url:
  engine.block.setSourceSet(fill, 'fill/image/sourceSet', [
    { uri, width, height },
  ]);
  engine.block.setFill(page, fill);
  // Set content fill mode to cover:
  engine.block.setContentFillMode(page, 'Cover');
  // Disable changing fill of page, hides e.g also the "replace" button
  engine.block.setScopeEnabled(page, 'fill/change', false);
  engine.block.setScopeEnabled(page, 'fill/changeType', false);
  // Disable stroke of page, since it does not make sense with current wording and takes up to much space
  engine.block.setScopeEnabled(page, 'stroke/change', false);

  // only allow resizing and moving of page in crop mode
  const unsubscribeStateChange = engine.editor.onStateChanged(() => {
    const editMode = engine.editor.getEditMode();
    const cropConstraint = getCropConstraintMetadata(engine);
    if (editMode !== 'Crop') {
      // close size preset panel
      instance.ui.closePanel('ly.img.page-crop');
      engine.editor.setSettingBool(
        'ubq://page/allowResizeInteraction' as SettingsBool,
        false
      );
      return;
    }
    if (cropConstraint === 'none') {
      engine.editor.setSettingBool(
        'ubq://page/restrictResizeInteractionToFixedAspectRatio' as SettingsBool,
        false
      );
      engine.editor.setSettingBool(
        'ubq://page/allowResizeInteraction' as SettingsBool,
        true
      );
    } else if (cropConstraint === 'aspect-ratio') {
      engine.editor.setSettingBool(
        'ubq://page/restrictResizeInteractionToFixedAspectRatio' as SettingsBool,
        true
      );
      engine.editor.setSettingBool(
        'ubq://page/allowResizeInteraction' as SettingsBool,
        true
      );
    } else if (cropConstraint === 'resolution') {
      engine.editor.setSettingBool(
        'ubq://page/allowResizeInteraction' as SettingsBool,
        false
      );
      engine.editor.setSettingBool(
        'ubq://page/restrictResizeInteractionToFixedAspectRatio' as SettingsBool,
        false
      );
    }
  });

  // If nothing is selected: select page by listening to selection changes
  const unsubscribeSelectionChange = engine.block.onSelectionChanged(() => {
    const selection = engine.block.findAllSelected();
    if (selection.length === 0) {
      const page = engine.scene.getCurrentPage();
      engine.block.select(page!);
    }
  });

  // Initially select the page
  engine.block.select(page);
  return () => {
    unsubscribeSelectionChange();
    unsubscribeStateChange();
  };
}

function createApplyFormatAsset(
  instance: CreativeEditorSDK
): (asset: AssetResult) => Promise<number | undefined> {
  return async (asset) => {
    console.log(asset, 'asset');

    const engine = instance.engine;
    const page = engine.scene.getCurrentPage()!;
    // Set fill mode to cover:
    engine.block.setContentFillMode(page, 'Cover');
    // Select it:
    let newDesignUnit: DesignUnit | null = null;
    let newWidth: number | null = null;
    let newHeight: number | null = null;
    // reset temp size in metadata
    setTempSizeInMetadata(engine, page, null);
    if (asset.id === 'page-sizes-custom') {
      // Reset Page Size to original:
      setCropConstraintMetadata(engine, 'none');
      const originalSize = getOriginalSize(engine);
      newWidth = originalSize.width;
      newHeight = originalSize.height;
      newDesignUnit = originalSize.designUnit;
    } else if (asset.meta?.['fixedResolution'] === 'true') {
      if (!asset.meta?.['formatWidth'] || !asset.meta?.['formatHeight']) {
        console.error(
          'Asset is missing properties meta.formatWidth or meta.formatHeight'
        );
        return;
      }
      newWidth = parseInt(asset.meta?.['formatWidth'] as string, 10);
      newHeight = parseInt(asset.meta?.['formatHeight'] as string, 10);
      newDesignUnit = asset.meta['designUnit'] as DesignUnit;
      setCropConstraintMetadata(engine, 'resolution');
    } else if (asset.meta?.['aspectRatio']) {
      const aspectRatio = asset.meta?.['aspectRatio'] as string;
      const [width, height] = aspectRatio.split(':').map(Number);
      // adjust size to match aspect ratio
      const { width: originalWidth, height: originalHeight } =
        getOriginalSize(engine);
      const originalAspectRatio = originalWidth / originalHeight;
      const newAspectRatio = width / height;
      if (originalAspectRatio > newAspectRatio) {
        newWidth = originalHeight * newAspectRatio;
        newHeight = originalHeight;
      } else {
        newWidth = originalWidth;
        newHeight = originalWidth / newAspectRatio;
      }
      setCropConstraintMetadata(engine, 'aspect-ratio');
    }
    if (newDesignUnit) {
      engine.scene.setDesignUnit(newDesignUnit);
    }
    if (newWidth && newHeight) {
      engine.block.resizeContentAware([page], newWidth, newHeight);
    }
    // enter crop:
    engine.editor.setEditMode('Crop');
    return page;
  };
}

function createApplyAppAsset(
  instance: CreativeEditorSDK
): (asset: AssetResult) => Promise<number | undefined> {
  return async (asset) => {
    return undefined;
  };
}


function closeAllPanels(instance: CreativeEditorSDK) {
  // close crop:
  instance.ui.closePanel('ly.img.page-crop');
  // exit crop mode:
  if (instance.engine.editor.getEditMode() === 'Crop') {
    instance.engine.editor.setEditMode('Transform');
  }
  // close asset library panels:
  instance.ui.closePanel('//ly.img.panel/assetLibrary');
  // close inspector panels:
  instance.ui.closePanel('//ly.img.panel/inspector/adjustments');
  instance.ui.closePanel('//ly.img.panel/inspector/filters');
}

const ALL_CROP_CONSTRAINTS = ['none', 'aspect-ratio', 'resolution'] as const;
type CropConstraint = (typeof ALL_CROP_CONSTRAINTS)[number];
// We use custom metadata to store the currently active crop constraints
export function setCropConstraintMetadata(
  engine: CreativeEngine,
  constraint: CropConstraint = 'none'
) {
  const page = engine.scene.getCurrentPage()!;
  if (constraint === 'none') {
    engine.block.setMetadata(page, 'cropConstraint', 'none');
  } else if (constraint === 'aspect-ratio') {
    engine.block.setMetadata(page, 'cropConstraint', 'aspect-ratio');
  } else if (constraint === 'resolution') {
    engine.block.setMetadata(page, 'cropConstraint', 'resolution');
  }
}
export function getCropConstraintMetadata(
  engine: CreativeEngine
): CropConstraint {
  const page = engine.scene.getCurrentPage();
  if (!page || !engine.block.findAllMetadata(page).includes('cropConstraint')) {
    return 'none';
  }
  return engine.block.getMetadata(page, 'cropConstraint') as CropConstraint;
}
export function getOriginalSize(engine: CreativeEngine): {
  width: number;
  height: number;
  designUnit: DesignUnit;
} {
  const page = engine.scene.getCurrentPage()!;
  const fill = engine.block.getFill(page);
  const sourceSet = engine.block.getSourceSet(fill, 'fill/image/sourceSet');
  const imageSource = sourceSet[0];
  return {
    width: imageSource.width,
    height: imageSource.height,
    designUnit: 'Pixel',
  };
}
