import CreativeEditorSDK, { AssetResult } from '@cesdk/cesdk-js';
import { stickersLibraryPayload } from '../core/constants';

export const applyCPAppAsset =
  (instance: CreativeEditorSDK) => async (asset: AssetResult) => {
    if (asset.meta?.kind === 'folder') {
      console.log(123);
      setTimeout(() => {
        instance.ui.openPanel('//ly.img.panel/assetLibrary', {
          payload: stickersLibraryPayload,
        });
      }, 2000);
      const result = await instance.engine.asset.findAssets('ly.img.stickers', {
        page: 0,
        perPage: 20,
      });
      //   const asset = result.assets.find((asset) => asset.meta?.uri);
      //   await instance.engine.asset.apply('ly.img.stickers', asset);
    }
    return undefined;
  };
