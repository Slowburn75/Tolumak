export async function uploadToCloudinary(file: File): Promise<string> {
    const formData = new FormData();
    formData.append("file", file);

    const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME || "dygfzwacb";
    const uploadPreset = process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET || "ml_default";

    formData.append("upload_preset", uploadPreset);

    const response = await fetch(
        `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
        {
            method: "POST",
            body: formData,
        }
    );

    if (!response.ok) {
        const errorData = await response.json();
        console.error("Cloudinary upload error:", errorData);
        throw new Error(errorData.error?.message || "Failed to upload image to Cloudinary");
    }

    const data = await response.json();
    return data.secure_url;
}
