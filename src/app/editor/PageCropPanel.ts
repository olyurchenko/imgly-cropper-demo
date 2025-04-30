import CreativeEditorSDK, { CreativeEngine, DesignUnit } from '@cesdk/cesdk-js';
import { getCropConstraintMetadata, getOriginalSize } from './editor.config';

const TEMP_SIZE_METADATA_WIDTH_KEY = 'tempWidth';
const TEMP_SIZE_METADATA_HEIGHT_KEY = 'tempHeight';
export function setTempSizeInMetadata(
  engine: CreativeEngine,
  pageId: number,
  newValue: { width: number; height: number } | null = null
) {
  if (!newValue) {
    if (getValuesFromMetadata(engine, pageId) !== null) {
      engine.block.removeMetadata(pageId, TEMP_SIZE_METADATA_WIDTH_KEY);
      engine.block.removeMetadata(pageId, TEMP_SIZE_METADATA_HEIGHT_KEY);
    }
    return;
  }
  const { width, height } = newValue;
  engine.block.setMetadata(
    pageId,
    TEMP_SIZE_METADATA_WIDTH_KEY,
    width.toString()
  );
  engine.block.setMetadata(
    pageId,
    TEMP_SIZE_METADATA_HEIGHT_KEY,
    height.toString()
  );
}
function getValuesFromMetadata(engine: CreativeEngine, pageId: number) {
  if (
    !engine.block.hasMetadata(pageId, TEMP_SIZE_METADATA_WIDTH_KEY) ||
    !engine.block.hasMetadata(pageId, TEMP_SIZE_METADATA_HEIGHT_KEY)
  ) {
    return null;
  }
  return {
    width: parseFloat(
      engine.block.getMetadata(pageId, TEMP_SIZE_METADATA_WIDTH_KEY)
    ),
    height: parseFloat(
      engine.block.getMetadata(pageId, TEMP_SIZE_METADATA_HEIGHT_KEY)
    ),
  };
}
export const registerPageCropPanel = (
  cesdk: CreativeEditorSDK,
  panelId = 'ly.img.page-crop'
) => {
  cesdk.ui.registerPanel(panelId, ({ builder, engine }) => {
    const { Section, Library, Button } = builder;

    let pageId = engine.scene.getCurrentPage()!;
    if (!pageId) return;


    Section('size-presets', {
      title: 'Size Presets',

      children: () => {
        Button('back', {
          label: 'Back',
          onClick: () => {
            cesdk.ui.closePanel(panelId);
          },
        });
        Library('preset-library', {
          entries: [
            {
              id: 'ly.img.formats',
              sourceIds: ['ly.img.formats'],
              previewLength: 3,
              gridColumns: 3,
              gridItemHeight: 'square',
              gridBackgroundType: 'cover',
              cardLabel: (assetResult: any) => assetResult.label,
              cardLabelPosition: () => 'below',
              showGroupOverview: false,
            },
          ],
        });
      },
    });
  });
};
