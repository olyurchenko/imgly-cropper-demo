import { AssetQueryData, AssetsQueryResult } from '@cesdk/cesdk-js';
import {
  baseURL,
  EMPTY_RESULT,
  IMAGE_EDITOR_STICKERS_FILE_TYPE,
  TOKEN,
  venueId,
} from '../core/constants';
import { transformCPResponseToAssetsQueryResult } from '../core/utils/file.utile';
import { CPResponse } from '../core/models/file.model';

export const findCPAssets = async (
  queryData: AssetQueryData
): Promise<AssetsQueryResult | undefined> => {
  const { page, perPage } = queryData;
  const url = new URL(`${baseURL}${venueId}`);
  url.searchParams.append('skip', (page * perPage).toString());
  url.searchParams.append('take', perPage.toString());
  IMAGE_EDITOR_STICKERS_FILE_TYPE.forEach((type) =>
    url.searchParams.append('types', type)
  );

  try {
    const response = await fetch(url.toString(), {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `${TOKEN}`,
      },
    });

    if (!response.ok) {
      throw new Error(`HTTP error! Status: ${response.status}`);
    }

    const result: CPResponse = await response.json();
    console.log(
      transformCPResponseToAssetsQueryResult(result, page, perPage),
      'result'
    );
    return transformCPResponseToAssetsQueryResult(result, page, perPage);
  } catch (error) {
    console.error('Error fetching assets:', error);
    return EMPTY_RESULT;
  }
};
