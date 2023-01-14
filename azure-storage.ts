// Used by index.js for storing images into Azure Storage blob containers
import { BlobServiceClient } from '@azure/storage-blob';
import * as dotenv from 'dotenv';
dotenv.config();

// Create the BlobServiceClient object with connection string from .env
const AZURE_STORAGE_CONSTRING = process.env.AZURE_STORAGE_CONSTRING;
if (!AZURE_STORAGE_CONSTRING) {
  throw Error('Azure Storage Connection string not found');
}
const blobServiceClient = BlobServiceClient.fromConnectionString(AZURE_STORAGE_CONSTRING);

// Create ContainerClient for container 'countdownimages'
const containerClient = blobServiceClient.getContainerClient('countdownimages');

export default async function uploadImageToAzureStorage(
  id: string,
  hiresImageUrl: string,
  originalImageUrl: string
) {
  // Use id as the filename
  const blobFilename = id + '.jpg';
  const blobClient = containerClient.getBlockBlobClient(blobFilename);

  // If image doesn't already exist on azure storage, copy over
  if (await blobClient.exists()) {
    //console.log('Image already exists: ' + blobFilename);
    return false;
  } else {
    // Atttempt to upload image to azure
    const uploadBlobResponse = await blobClient.syncCopyFromURL(hiresImageUrl);
    if (uploadBlobResponse.copyStatus === 'success') {
      //console.log('Image new upload: ' + blobFilename + ' uploaded successfully');
      return true;
    } else {
      // Image upload can fail if the url was invalid
      console.log('Image upload failed: ' + hiresImageUrl);
      return false;
    }
  }
}