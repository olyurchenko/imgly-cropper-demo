import { Configuration } from '@cesdk/cesdk-js';

export const CONFIG: Configuration = {
  license: 'PXr7cJIVw-7h-PaCm9GzmQTU7DvBzl1SboYxnRHiUQEMuQG7pzyN4Dz56KkIwIuU',
  baseURL: 'https://cdn.img.ly/packages/imgly/cesdk-js/1.47.0/assets',
  callbacks: { onUpload: 'local' },
};

export const stickersLibraryPayload = {
  entries: ['ly.img.stickers'],
  title: 'libraries.ly.img.stickers.label',
};

export const TOKEN =
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1c2VySWQiOiI2MjM5ZjY0YWE1ODkxMTFlZjE0OTBiMTkiLCJleHAiOjE3NDUyMjk5ODAsInNjb3BlIjoidXNlcjppbXBlcnNvbmF0aW9uIiwib25ib2FyZGluZ0lkIjpudWxsLCJ2MiI6ZmFsc2UsImlhdCI6MTc0MjU1MTU4MCwiaXNzIjoic2w6d2ViIn0.j6cYkQBKP6I3mJk9IQjZHUd3cg6V8cQGZRz6kBOg6eo';

export const baseURL = 'https://api-dev.socioconnect.io/api-web/v1/files/';
export const venueId = '63ef938b843fba3b58190c79';
export const EMPTY_RESULT = {
  assets: [],
  total: 0,
  currentPage: 0,
  nextPage: undefined,
};
export const FOLDER_PROPERTIES = {
  WIDTH: 295,
  HEIGHT: 245,
  URL: 'https://sl-chat-image-development.s3.amazonaws.com/7a652d50-72ab-4f6d-a5a7-98d5160c8cd3.jpg',
  SIZE: 4493,
};

export const IMAGE_EDITOR_STICKERS_FILE_TYPE = ['image', 'folder'];
