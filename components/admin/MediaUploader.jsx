"use client";

import { useState } from "react";
import Image from "next/image";
import toast from "react-hot-toast";

// Uploads directly to Cloudinary from the browser using a signed request from
// /api/cloudinary/sign (see route comment: bypasses our server so we don't hit
// request body-size / function-timeout limits). Uses XMLHttpRequest (not
// fetch) specifically so per-file upload progress can be reported.
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
        reject(new Error("Upload failed"));
      }
    };
    xhr.onerror = () => reject(new Error("Upload failed"));
    xhr.send(formData);
  });
}

// props: { value: media[], onChange(nextMedia), folder } -- lifts state to
// the parent form, matching how the rest of the form fields work. `folder`
// defaults to the original listing-media folder so existing call sites don't
// need to change; the offer form passes folder="richlux/offers".
function MediaUploader({ value = [], onChange, folder = "richlux/listings" }) {
  const [uploading, setUploading] = useState({}); // { [tempId]: progressPercent }

  const handleFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = ""; // allow re-selecting the same file again later
    if (files.length === 0) return;

    for (const file of files) {
      const tempId = `${file.name}-${Date.now()}-${Math.random()}`;
      setUploading((prev) => ({ ...prev, [tempId]: 0 }));
      try {
        const signRes = await fetch("/api/cloudinary/sign", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ folder }),
        });
        if (!signRes.ok) throw new Error("Could not sign upload");
        const { signature, timestamp, folder, apiKey, cloudName } = await signRes.json();

        const result = await uploadToCloudinary({
          file,
          signature,
          timestamp,
          folder,
          apiKey,
          cloudName,
          onProgress: (pct) => setUploading((prev) => ({ ...prev, [tempId]: pct })),
        });

        const type = result.resource_type === "video" ? "video" : "image";
        const hasCoverImage = value.some((item) => item.isCover);
        const newItem = {
          type,
          publicId: result.public_id,
          secureUrl: result.secure_url,
          width: result.width,
          height: result.height,
          duration: result.duration,
          isCover: type === "image" && !hasCoverImage,
        };
        onChange([...value, newItem]);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}`);
      } finally {
        setUploading((prev) => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
      }
    }
  };

  const handleRemove = (publicId) => {
    onChange(value.filter((item) => item.publicId !== publicId));
  };

  const handleSetCover = (publicId) => {
    onChange(value.map((item) => ({ ...item, isCover: item.publicId === publicId })));
  };

  const uploadingEntries = Object.entries(uploading);

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*,video/*"
        multiple
        onChange={handleFiles}
        className="block w-full text-sm text-ink-700 dark:text-surface-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-brand-400 file:text-white file:font-medium hover:file:bg-brand-500"
      />

      {uploadingEntries.length > 0 && (
        <div className="space-y-2">
          {uploadingEntries.map(([id, pct]) => (
            <div key={id} className="w-full bg-ink-200 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
              <div className="bg-brand-400 h-2 transition-all" style={{ width: `${pct}%` }} />
            </div>
          ))}
        </div>
      )}

      {value.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
          {value.map((item) => (
            <div
              key={item.publicId}
              className="relative aspect-square rounded-lg overflow-hidden bg-ink-200 dark:bg-surface-700 group"
            >
              {item.type === "video" ? (
                <video src={item.secureUrl} className="w-full h-full object-cover" muted />
              ) : (
                <Image
                  src={item.secureUrl}
                  alt=""
                  fill
                  sizes="200px"
                  className="object-cover"
                  unoptimized
                />
              )}
              <button
                type="button"
                onClick={() => handleRemove(item.publicId)}
                className="absolute top-1 right-1 bg-black/60 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs hover:bg-danger"
                aria-label="Remove media"
              >
                &times;
              </button>
              {item.type === "image" && (
                <button
                  type="button"
                  onClick={() => handleSetCover(item.publicId)}
                  className={`absolute bottom-1 left-1 text-caption px-2 py-0.5 rounded-full transition-opacity ${
                    item.isCover
                      ? "bg-brand-400 text-white"
                      : "bg-black/60 text-white opacity-0 group-hover:opacity-100"
                  }`}
                >
                  {item.isCover ? "Cover" : "Set cover"}
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MediaUploader;
