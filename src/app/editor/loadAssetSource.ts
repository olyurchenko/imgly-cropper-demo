import {
  AssetDefinition,
  AssetQueryData,
  AssetResult,
  AssetsQueryResult,
  CreativeEngine,
} from '@cesdk/cesdk-js';

async function loadAssetSource(
  engine: CreativeEngine,
  sourceId: string,
  findAssets: (
    queryData: AssetQueryData
  ) => Promise<AssetsQueryResult | undefined>,

  applyAsset?: ((asset: AssetResult) => Promise<number | undefined>) | undefined
) {
  engine.asset.addSource({
    id: sourceId,
    canManageAssets: false,
    findAssets,
    applyAsset,
  });
}
export type ContentJSON = {
  version: string;
  id: string;
  assets: AssetDefinition[];
};

export default loadAssetSource;
