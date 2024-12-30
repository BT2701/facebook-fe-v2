// ImagePreviewDialog.jsx
import React, { useEffect, useRef } from 'react';
import './imagePreviewDialog.css';
import { Button } from 'react-bootstrap';

const ImagePreviewDialog = ({ previewImage, onConfirm, onCancel, uploadProgress, isUploading }) => {
    const canvasRef = useRef(null);

    useEffect(() => {
        if (previewImage) {
            const canvas = canvasRef.current;
            const ctx = canvas.getContext('2d');
            const img = new Image();
            img.src = previewImage;
            img.onload = () => {
                const aspectRatio = img.width / img.height;
                const targetWidth = 300;
                const targetHeight = 500;
                let drawWidth, drawHeight;

                if (aspectRatio > targetWidth / targetHeight) {
                    drawHeight = targetHeight;
                    drawWidth = targetHeight * aspectRatio;
                } else {
                    drawWidth = targetWidth;
                    drawHeight = targetWidth / aspectRatio;
                }

                const offsetX = (drawWidth - targetWidth) / 2;
                const offsetY = (drawHeight - targetHeight) / 2;

                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, -offsetX, -offsetY, drawWidth, drawHeight);
            };
        }
    }, [previewImage]);

    if (!previewImage) return null;

    return (
        <div className="preview-dialog">
            <div className="preview-content">
                <canvas ref={canvasRef} width={300} height={500} className="preview-image" />
                {/* Thanh tiến trình */}
                {isUploading && (
                    <div className="upload-progress" style={{ marginBottom: '0.3em' }}>
                        <div className="progress-bar" style={{ width: `${uploadProgress}%` }} />
                    </div>
                )}
                <div className="preview-buttons">
                    <Button className='btn-success' onClick={onConfirm}>Xác nhận</Button>
                    <Button className='btn-secondary' onClick={onCancel}>Hủy</Button>
                </div>
            </div>
        </div>
    );
};

export default ImagePreviewDialog;
