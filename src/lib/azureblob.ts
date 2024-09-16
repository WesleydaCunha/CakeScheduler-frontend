import { BlobServiceClient } from '@azure/storage-blob';

const sasTokenComplement = import.meta.env.VITE_AZURE_STORAGE_SAS_TOKEN_COMPLEMENT as string;
const sasTokenModel = import.meta.env.VITE_AZURE_STORAGE_SAS_TOKEN_MODEL as string;
const storageAccountName = import.meta.env.VITE_ACCOUNT_NAME as string;

const getBlobServiceClient = (uploadType: 'complement' | 'model') => {
    const sasToken = uploadType === 'complement' ? sasTokenComplement : sasTokenModel;
    return new BlobServiceClient(
        `https://${storageAccountName}.blob.core.windows.net?${sasToken}`
    );
};





export const uploadFile = async (fileName: string, file: File, uploadType: 'complement' | 'model'): Promise<string> => {
    const containerName = uploadType === 'complement' ? 'complement' : 'model'
    const blobServiceClient = getBlobServiceClient(uploadType);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    try {
        await blockBlobClient.uploadBrowserData(file);
        console.log(`File ${fileName} uploaded successfully`);
        return blockBlobClient.url; 
    } catch (error) {
        console.error('Upload failed:', error);
        throw error;
    }
};



export const deleteFile = async (fileName: string, uploadType: 'complement' | 'model'): Promise<void> => {
    const containerName = uploadType === 'complement' ? 'complement' : 'model'
    const blobServiceClient = getBlobServiceClient(uploadType);
    const containerClient = blobServiceClient.getContainerClient(containerName);
    const blockBlobClient = containerClient.getBlockBlobClient(fileName);

    try {
        await blockBlobClient.delete();
        console.log(`File ${fileName} deleted successfully`);
    } catch (error) {
        console.error('Delete failed:', error);
    }
};
