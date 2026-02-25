import React, { useState, useRef } from "react";
import { toast } from 'react-toastify';
import { Cloudinary } from '@cloudinary/url-gen';
import { AdvancedImage } from '@cloudinary/react';
import { auto } from '@cloudinary/url-gen/actions/resize';
import { autoGravity } from '@cloudinary/url-gen/qualifiers/gravity';
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

export const ProfileImageUploader = () => {
    const { store, dispatch } = useGlobalReducer();
    const { token, user } = store;
    const currentImage = user?.image || null;

    const cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const backendUrl = import.meta.env.VITE_BACKEND_URL;
    const fileInputRef = useRef(null);
    const [uploading, setUploading] = useState(false);

    const cld = cloudName ? new Cloudinary({ cloud: { cloudName } }) : null;

    const handleFileSelect = (e) => {
        const file = e.target.files[0];
        if (file) uploadImage(file);
    };

    const uploadImage = async (file) => {
        if (!cloudName) {
            toast.error('Cloudinary no está configurado. Agrega VITE_CLOUDINARY_CLOUD_NAME en .env');
            return;
        }

        setUploading(true);
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('upload_preset', 'ml_default');
            formData.append('folder', 'user_profiles');

            const cloudRes = await fetch(
                `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
                { method: 'POST', body: formData }
            );

            if (!cloudRes.ok) {
                const err = await cloudRes.json().catch(() => ({}));
                throw new Error(err?.error?.message || 'Error al subir a Cloudinary');
            }

            const { secure_url: imageUrl } = await cloudRes.json();

            const backendRes = await fetch(`${backendUrl}/api/user/profile`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ image: imageUrl })
            });

            if (backendRes.ok) {
                dispatch({ type: "set_user", payload: { ...user, image: imageUrl } });
                toast.success('Imagen actualizada');
            } else {
                toast.error('Error al actualizar la imagen en el servidor');
            }
        } catch (error) {
            toast.error(error.message || 'Error al subir la imagen');
            console.error(error);
        } finally {
            setUploading(false);
        }
    };

    const getCloudinaryImage = (imageUrl) => {
        if (!imageUrl || !cld) return null;
        try {
            const urlParts = imageUrl.split('/');
            const uploadIndex = urlParts.indexOf('upload');
            if (uploadIndex === -1) return null;
            const publicId = urlParts.slice(uploadIndex + 1).join('/').split('.')[0];
            return cld
                .image(publicId)
                .format('auto')
                .quality('auto')
                .resize(auto().gravity(autoGravity()).width(100).height(100));
        } catch (e) {
            return null;
        }
    };

    const cloudinaryImg = currentImage ? getCloudinaryImage(currentImage) : null;

    return (
        <div className="text-center mb-3">
            <div className="mb-2">
                {cloudinaryImg ? (
                    <AdvancedImage
                        cldImg={cloudinaryImg}
                        className="rounded-circle"
                        style={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                ) : currentImage ? (
                    <img
                        src={currentImage}
                        alt="Profile"
                        className="rounded-circle"
                        style={{ width: 100, height: 100, objectFit: 'cover' }}
                    />
                ) : (
                    <div
                        className="rounded-circle bg-secondary d-flex align-items-center justify-content-center mx-auto"
                        style={{ width: 100, height: 100 }}
                    >
                        <i className="fas fa-user fa-3x text-white"></i>
                    </div>
                )}
            </div>
            <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileSelect}
                accept="image/jpeg,image/png,image/jpg,image/gif"
                style={{ display: 'none' }}
            />
            <button
                className="btn btn-outline-primary btn-sm rounded-pill px-3"
                onClick={() => fileInputRef.current?.click()}
                disabled={!token || uploading}
            >
                {uploading
                    ? <><span className="spinner-border spinner-border-sm me-1"></span>Subiendo...</>
                    : <><i className="fas fa-camera me-1"></i>{currentImage ? 'Cambiar foto' : 'Subir foto'}</>
                }
            </button>
        </div>
    );
};
