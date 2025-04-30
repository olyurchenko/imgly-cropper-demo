import CreativeEditorSDK from "@cesdk/cesdk-js";
import { lastValueFrom, of } from "rxjs";
import MOCK_RES from './mock-templates.json';

export async function addTemplatesAssetsSource(cdk: CreativeEditorSDK, type: "image" | "video"): Promise<void> {
  await registerRemoteSource(CUSTOM_SOURCES.TEMPLATES.ID, CUSTOM_SOURCES.TEMPLATES.NAME, CUSTOM_SOURCES.TEMPLATES.ICON, cdk, getFindTemplates(), type,  getApplyAsset(cdk))
}

export function getFindTemplates() {
  return async (queryData: any) => {
    const templatesRes = await lastValueFrom(of(MOCK_RES))
    const templates = templatesRes.files.map(file => transformContentPoolItem(file, CUSTOM_SOURCES.TEMPLATES.ID))
    console.log(templates, 'templates')
    const nextPage  = templatesRes.count.total - (queryData.perPage * queryData.page) > 0 ? queryData.page + 1 : undefined
    return {
      total: templatesRes.count.total,
      currentPage: queryData.page,
      nextPage: nextPage,
      assets: templates
    }
  }
}

//WHAT DOES MEAN THIS ERROR = Uncaught Error: Target block has no Fill AFTER APPLYING cdk.engine.scene.applyTemplateFromURL(asset.meta.uri)


export  function getApplyAsset(cdk: CreativeEditorSDK) {
  return async (asset: any) => {
    //Scene reset
    //  const scene = cdk.engine.scene.create('Free');
    //  cdk.engine.scene.setDesignUnit('Pixel');
    //  const page = cdk.engine.block.create('page');
    //  cdk.engine.block.appendChild(scene, page);
    //CROPPER DOES NOT OPEN
     await cdk.engine.scene.applyTemplateFromURL(asset.meta.uri)
     return cdk.engine.scene.get();
  };
}


export function registerRemoteSource(id: string, name: string, icon: string, cdk: CreativeEditorSDK, findAssets: any, type: "image" | "video", applyAsset?: any): void {
  cdk.engine.asset.addSource({
    id,
    findAssets,
    applyAsset
  })

  console.log(cdk.ui.findAllAssetLibraryEntries())
  cdk.ui.addAssetLibraryEntry({
    id,
    sourceIds: [id],
    sceneMode: type === 'image'? "Design" : "Video",
    previewLength: 5,
    previewBackgroundType: 'cover',
    gridBackgroundType: 'cover',
    gridColumns: 3
  });

  cdk.ui.setDockOrder([{
    id: 'ly.img.assetLibrary.dock',
    key: id,
    label: name,
    icon,
    entries: [id]
  },
    ...cdk.ui.getDockOrder(),
  ]);
  console.log(cdk.ui.getAssetLibraryEntry(id))

  console.log(cdk.ui.getDockOrder() ,'')
}

export function transformContentPoolItem(
  item: any,
  sourceId: string
) {
  const thumbUri = item.type === "video" ? item.thumbnail: item.url
  return {
    id: item.id ?? item.name,
    meta: {
      // uri: item.scene? item.scene : item.url ?? '',
      uri: 'https://cdn.img.ly/assets/demo/v2/ly.img.template/templates/cesdk_collage_1.scene',
      thumbUri,
      blockType: '//ly.img.ubq/image',
      width: item.width,
      height: item.height,
    },
    context: {
      sourceId,
    },
  };
}

export const CUSTOM_SOURCES = {
  TEMPLATES: {
    ID: 'sl-templates',
    ICON: '@imgly/Template',
    NAME: 'Templates'
  },
  CROPPER: {
    ID: 'sl-cropper',
    ICON: 'https://sl-static-images.s3.eu-west-1.amazonaws.com/crop-tool-svgrepo-com.svg',
    NAME: 'Cropper'
  }
}
