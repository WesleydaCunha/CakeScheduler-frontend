import React, { useState, useEffect } from 'react';
import { v4 as uuidv4 } from 'uuid';
import { FileUploader, FileInput, FileUploaderContent, FileUploaderItem } from "@/components/pages/models/file-uploader";
import { DropzoneOptions } from 'react-dropzone';
import { CopyIcon } from '@radix-ui/react-icons';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Progress } from '@/components/ui/progress';
import { uploadFile, deleteFile } from '@/lib/azureblob';

type FileWithUUID = {
    uuid: string;
    url: string;
    file: File;
};

interface FileUploadDropzoneProps {
    onUploadURLChange: (url: string | null) => void;
    uploadType: 'complement' | 'model';
}



export const FileUploadDropzone: React.FC<FileUploadDropzoneProps> = ({ onUploadURLChange, uploadType }) => {
    const [files, setFiles] = useState<FileWithUUID[]>([]);
    const [uploadProgress, setUploadProgress] = useState<number>(0);
    const [uploadURL, setUploadURL] = useState<string | null>(null);

    const dropzoneOptions: DropzoneOptions = {
        accept: {
            "image/*": [".jpg", ".jpeg", ".png"],
        },
        multiple: false,
        maxFiles: 1,
        maxSize: 40 * 1024 * 1024, // 40 MB
    };

    useEffect(() => {
        onUploadURLChange(uploadURL);
    }, [uploadURL, onUploadURLChange]);

    const handleUpload = async (file: File) => {
        setUploadProgress(0);
        setUploadURL(null);
    
        try {
            console.log('Starting upload...');
            const fileNameWithUUID = `${uuidv4()}`;
            console.log(`Uploading file: ${fileNameWithUUID}`);
            
            const url = await uploadFile(fileNameWithUUID, file, uploadType);
            if (url) {
                console.log(`File uploaded successfully: ${url}`);
                setUploadURL(url);
                setFiles((prevFiles) => [...prevFiles, { uuid: fileNameWithUUID, url, file }]);
            } else {
                throw new Error('Upload failed: Invalid URL');
            }
        } catch (err) {
            console.error('Upload failed:', err);
            setUploadURL(null);
        }
    };

    const handleRemove = async (index: number) => {
        const fileWithUUID = files[index];
        if (fileWithUUID) {
            const fileName = fileWithUUID.uuid;
            
            console.log(`Removing file: ${fileName}`);
            try {
                await deleteFile(fileName, uploadType);
                const newFiles = files.filter((_, i) => i !== index);
                setFiles(newFiles);
                setUploadURL(null);
            } catch (error) {
                console.error(`Failed to remove file: ${fileName}`, error);
            }
        }
    };

    const onDrop = (acceptedFiles: File[] | null) => {
        if (acceptedFiles?.[0]) {
            console.log('File accepted for upload:', acceptedFiles[0]);
            handleUpload(acceptedFiles[0]);
        } else {
            console.error('No file accepted for upload.');
        }
    };

    return (
        <FileUploader
            value={files.map(f => f.file)}
            onValueChange={onDrop}
            dropzoneOptions={dropzoneOptions}
        >
            {!files.length ? (
                <FileInput>
                    <div className="flex items-center justify-center h-48 w-full border-dashed border hover:border-blue-500 border-primary rounded-lg cursor-pointer">
                        <p className="text-gray-500 text-lg p-4">Arraste e solte a imagem aqui</p>
                    </div>
                </FileInput>
            ) : null}

            <FileUploaderContent className="flex flex-wrap gap-6 mt-4 justify-center">
                {files.map((fileWithUUID, i) => (
                    <FileUploaderItem
                        key={i}
                        index={i}
                        className="h-44 ms-auto mr-auto  overflow-hidden shadow-md relative"
                        aria-roledescription={`file ${i + 1} containing ${fileWithUUID.file.name}`}
                        onRemove={() => handleRemove(i)}
                    >
                        <img
                            src={fileWithUUID.url ?? ''}
                            alt={fileWithUUID.file.name}
                            className="object-cover w-full h-full rounded-lg"
                        />
                    </FileUploaderItem>
                ))}
                {uploadProgress > 0 && uploadProgress < 100 && (
                    <div className="w-full mt-4">
                        <Progress value={uploadProgress} />
                    </div>
                )}
                {uploadURL && (
                    <div className="flex mt-4 mb-1 items-center space-x-2">
                        <div className="grid flex-1 gap-2">
                            <Label htmlFor="link" className="sr-only">Link</Label>
                            <Input
                                id="link"
                                value={uploadURL}
                                readOnly
                                className="border-gray-300 rounded-md"
                            />
                        </div>
                        <Button
                            onClick={() => navigator.clipboard.writeText(uploadURL!)}
                            type="button"
                            size="sm"
                            className="px-3 bg-blue-500 hover:bg-blue-600 text-white"
                        >
                            <span className="sr-only">Copiar</span>
                            <CopyIcon className="h-4 w-4" />
                        </Button>
                    </div>  
                )}
            </FileUploaderContent>
        </FileUploader>
    );
};
