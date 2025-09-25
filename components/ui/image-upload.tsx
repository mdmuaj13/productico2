'use client';

import { useState, useRef } from 'react';
import { Loader2, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ImageUploadProps {
	title?: string;
	imageUrl?: string | null;
	onImageChange: (file: File | null, previewUrl: string | null) => void;
	className?: string;
	accept?: string;
	maxSize?: number; // in MB
	previewClassName?: string;
	isUploading?: boolean;
}

export default function ImageUpload({
	title = 'Image',
	imageUrl,
	onImageChange,
	className = '',
	accept = 'image/*',
	maxSize = 2,
	previewClassName = 'h-48',
	isUploading = false,
}: ImageUploadProps) {
	const [imagePreview, setImagePreview] = useState<string | null>(
		imageUrl || null
	);
	const [isDragOver, setIsDragOver] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const fileInputRef = useRef<HTMLInputElement>(null);

	const handleFileSelect = (file: File) => {
		setError(null);

		// Validate file type
		if (!file.type.startsWith('image/')) {
			setError('Please select a valid image file');
			return;
		}

		// Validate file size
		if (file.size > maxSize * 1024 * 1024) {
			setError(`File size must be less than ${maxSize}MB`);
			return;
		}

		// Create preview URL
		const reader = new FileReader();
		reader.onload = (e) => {
			const previewUrl = e.target?.result as string;
			setImagePreview(previewUrl);
			onImageChange(file, previewUrl);
		};
		reader.readAsDataURL(file);
	};

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		const file = e.target.files?.[0];
		if (file) {
			handleFileSelect(file);
		}
	};

	const handleDragOver = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);
	};

	const handleDrop = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragOver(false);

		const files = e.dataTransfer.files;
		if (files.length > 0) {
			handleFileSelect(files[0]);
		}
	};

	const handleRemoveImage = () => {
		setImagePreview(null);
		setError(null);
		onImageChange(null, null);
		if (fileInputRef.current) {
			fileInputRef.current.value = '';
		}
	};

	const handleClick = () => {
		fileInputRef.current?.click();
	};

	return (
		<Card className={className}>
			<CardHeader>
				<CardTitle>{title}</CardTitle>
			</CardHeader>
			<CardContent>
				<div className="space-y-4">
					<div
						className={`flex items-center justify-center w-full border-2 border-dashed rounded-lg transition-colors relative ${
							isDragOver && !isUploading
								? 'border-primary bg-primary/5'
								: 'border-muted-foreground/25 hover:border-muted-foreground/50'
						} ${previewClassName} ${
							isUploading ? 'cursor-not-allowed opacity-60' : 'cursor-pointer'
						}`}
						onDragOver={!isUploading ? handleDragOver : undefined}
						onDragLeave={!isUploading ? handleDragLeave : undefined}
						onDrop={!isUploading ? handleDrop : undefined}
						onClick={!isUploading ? handleClick : undefined}>
						{/* Loading Overlay */}
						{isUploading && (
							<div className="absolute inset-0 bg-black/20 rounded-lg flex items-center justify-center z-10">
								<div className="flex flex-col items-center space-y-2">
									<Loader2 className="w-8 h-8 text-primary animate-spin" />
								</div>
							</div>
						)}

						{imagePreview ? (
							<div className="relative w-full h-full group">
								<img
									src={imagePreview}
									alt="Preview"
									className="w-full h-full object-cover rounded-lg"
								/>
								<div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity rounded-lg flex items-center justify-center">
									<Button
										type="button"
										variant="secondary"
										size="sm"
										onClick={(e) => {
											e.stopPropagation();
											handleRemoveImage();
										}}
										className="bg-white/90 text-black hover:bg-white">
										<X className="h-4 w-4 mr-2" />
										Remove Image
									</Button>
								</div>
							</div>
						) : (
							<div className="flex flex-col items-center justify-center pt-5 pb-6">
								<Upload className="w-8 h-8 mb-4 text-muted-foreground" />
								<p className="mb-2 text-sm text-muted-foreground">
									<span className="font-semibold">Click to upload</span> or drag
									and drop
								</p>
								<p className="text-xs text-muted-foreground">
									PNG, JPG or WEBP (MAX. {maxSize}MB)
								</p>
							</div>
						)}
					</div>

					{error && (
						<div className="text-sm text-red-600 bg-red-50 p-2 rounded border border-red-200">
							{error}
						</div>
					)}

					<input
						ref={fileInputRef}
						type="file"
						className="hidden"
						accept={accept}
						onChange={handleInputChange}
					/>
				</div>
			</CardContent>
		</Card>
	);
}
