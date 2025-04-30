import { AssetResult, AssetsQueryResult } from '@cesdk/cesdk-js';
import { CPResponse } from '../models/file.model';
import { FOLDER_PROPERTIES } from '../constants';

export function fileToBlob(file: File): Blob {
  return new Blob([file], { type: file.type });
}

export function blobToFile(
  blob: Blob,
  fileName: string,
  mimeType?: string
): File {
  return new File([blob], fileName, { type: mimeType || blob.type });
}

export const transformCPResponseToAssetsQueryResult = (
  response: CPResponse,
  page: number,
  perPage: number
): AssetsQueryResult => {
  const { files, count } = response;

  const transformedFiles: AssetResult[] = files
    .map((file) => {
      const uri = file.type === 'folder' ? FOLDER_PROPERTIES.URL : file.url;
      const thumbUri =
        file.type === 'folder' ? FOLDER_PROPERTIES.URL : file.thumbnail;
      const width =
        file.type === 'folder' ? FOLDER_PROPERTIES.WIDTH : file.width;
      const height =
        file.type === 'folder' ? FOLDER_PROPERTIES.HEIGHT : file.height;
      const size = file.type === 'folder' ? FOLDER_PROPERTIES.SIZE : file.size;

      return {
        id: file.id,
        meta: {
          uri,
          thumbUri,
          width,
          height,
          filename: getImageNameWithoutExtension(file.name),
          size: Number(size) || 0,
          kind: file.type,
        },
        groups: [file.type],
      };
    })
    .filter((file) => file.meta.thumbUri);

  return {
    assets: transformedFiles,
    currentPage: page,
    nextPage: page * perPage < count.total ? page + 1 : undefined,
    total: count.total,
  };
};

export function getImageNameWithoutExtension(name: string): string {
  return name.replace(/\.[^/.]+$/, '');
}
