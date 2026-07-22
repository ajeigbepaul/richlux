// Shared browser-side Cloudinary upload helper -- used by both
// components/admin/MediaUploader.jsx (listing/offer media) and
// components/admin/BannerUploader.jsx (Hero banners). Uploads directly to
// Cloudinary from the browser using a signed request from
// /api/cloudinary/sign (bypasses our server so we don't hit request
// body-size / function-timeout limits). Uses XMLHttpRequest (not fetch)
// specifically so per-file upload progress can be reported.
function uploadToCloudinary({ file, signature, timestamp, folder, apiKey, cloudName, onProgress }) {
  return new Promise((resolve, reject) => {
    const formData = new FormData();
    formData.append("file", file);
    formData.append("api_key", apiKey);
    formData.append("timestamp", timestamp);
    formData.append("signature", signature);
    formData.append("folder", folder);

    const xhr = new XMLHttpRequest();
    xhr.open("POST", `https://api.cloudinary.com/v1_1/${cloudName}/auto/upload`);
    xhr.upload.onprogress = (event) => {
      if (event.lengthComputable && onProgress) {
        onProgress(Math.round((event.loaded / event.total) * 100));
      }
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) {
        try {
          resolve(JSON.parse(xhr.responseText));
        } catch (parseError) {
          reject(parseError);
        }
      } else {
        // Cloudinary's error body (e.g. { error: { message: "File size too
        // large..." } }) is the only way to know *why* an upload failed --
        // surface it instead of a generic message that hides the real cause.
        let message = "Upload failed";
        try {
          message = JSON.parse(xhr.responseText)?.error?.message || message;
        } catch {
          // response wasn't JSON -- keep the generic message
        }
        reject(new Error(message));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed -- check your connection"));
    xhr.send(formData);
  });
}

// Signs and uploads a single file, returning it in the shape stored in a
// media[] array (no isCover/isActive/order -- callers decide those based on
// where the upload slot is used).
export async function uploadOne(file, folder, onProgress) {
  const signRes = await fetch("/api/cloudinary/sign", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ folder }),
  });
  if (!signRes.ok) throw new Error("Could not sign upload");
  const { signature, timestamp, apiKey, cloudName } = await signRes.json();

  const result = await uploadToCloudinary({
    file,
    signature,
    timestamp,
    folder,
    apiKey,
    cloudName,
    onProgress,
  });

  return {
    type: result.resource_type === "video" ? "video" : "image",
    publicId: result.public_id,
    secureUrl: result.secure_url,
    width: result.width,
    height: result.height,
    duration: result.duration,
  };
}
