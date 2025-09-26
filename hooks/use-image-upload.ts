import { apiCall } from '@/lib/api';
import { useState } from 'react';

export const useImageUpload = () => {
	const [selectedFile, setSelectedFile] = useState<File | null>(null);
	const [imagePreview, setImagePreview] = useState<string | null>(null);
	const [isUploading, setIsUploading] = useState(false);

	const uploadImage = async (file: File, folder?: string): Promise<string> => {
		setIsUploading(true);

		try {
			const formData = new FormData();
			formData.append('file', file);
			if (folder) {
				formData.append('folder', folder);
			}

			// const response = await api.post('/v1/upload/image', formData, {
			// 	headers: {
			// 		'Content-Type': 'multipart/form-data',
			// 	},
			// });

			// return response.data.data.url;
			const response = await apiCall('/api/upload', {
				method: 'POST',
				body: formData,
			});

			console.log('upload', response);

			return response.data;

		} catch (error) {
			console.error('Upload failed:', error);
			throw error;
		} finally {
			setIsUploading(false);
		}
	};

	const handleImageChange = (file: File | null, previewUrl: string | null) => {
		setSelectedFile(file);
		setImagePreview(previewUrl);
	};

	const deleteImage = async (imageUrl: string) => {
		try {
			const response = await apiCall(`/api/upload/delete`, {
				method: 'DELETE',
				body: JSON.stringify({
					url: imageUrl,
				}),
			});
			return response.data.data.url;
		} catch (error) {
			console.error('Delete failed:', error);
			throw error;
		}
	};

	return {
		selectedFile,
		imagePreview,
		isUploading,
		uploadImage,
		handleImageChange,
		deleteImage,
	};
};
