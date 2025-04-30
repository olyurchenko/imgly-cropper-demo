import { AssetDefinition, AssetResult, CreativeEngine } from '@cesdk/cesdk-js';

async function loadAssetSourceFromContentJSON(
  engine: CreativeEngine,
  content: ContentJSON,
  applyAsset?: ((asset: AssetResult) => Promise<number | undefined>) | undefined
) {
  const { assets, id: sourceId } = content;

  engine.asset.addLocalSource(sourceId, undefined, applyAsset);
  assets.forEach((asset) => {
    engine.asset.addAssetToSource(sourceId, asset);
  });
}
export type ContentJSON = {
  version: string;
  id: string;
  assets: AssetDefinition[];
};

export default loadAssetSourceFromContentJSON;
