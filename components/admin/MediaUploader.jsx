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

// Signs and uploads a single file, returning it in the shape stored in
// media[] (no isCover -- callers decide that based on which slot the file
// came through).
async function uploadOne(file, folder, onProgress) {
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

function ProgressBars({ entries }) {
  if (entries.length === 0) return null;
  return (
    <div className="space-y-2">
      {entries.map(([id, pct]) => (
        <div key={id} className="w-full bg-ink-200 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
          <div className="bg-brand-400 h-2 transition-all" style={{ width: `${pct}%` }} />
        </div>
      ))}
    </div>
  );
}

// props: { value: media[], onChange(nextMedia), folder } -- lifts state to
// the parent form, matching how the rest of the form fields work. `folder`
// defaults to the original listing-media folder so existing call sites don't
// need to change; the offer form passes folder="richlux/offers".
//
// Split into two upload slots so the intent is explicit rather than relying
// on a hover-to-promote action after the fact: a single dedicated Cover
// Photo (what shows on the listing/offer card), and a gallery for everything
// else -- other rooms, angles, exterior shots, a walkthrough video.
function MediaUploader({ value = [], onChange, folder = "richlux/listings" }) {
  const [uploading, setUploading] = useState({}); // { [tempId]: progressPercent }

  const withProgress = async (tempId, fn) => {
    setUploading((prev) => ({ ...prev, [tempId]: 0 }));
    try {
      await fn((pct) => setUploading((prev) => ({ ...prev, [tempId]: pct })));
    } finally {
      setUploading((prev) => {
        const next = { ...prev };
        delete next[tempId];
        return next;
      });
    }
  };

  const coverItem = value.find((item) => item.isCover) || null;
  const galleryItems = value.filter((item) => item !== coverItem);

  const handleCoverFile = async (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;

    const tempId = `cover-${Date.now()}`;
    await withProgress(tempId, async (onProgress) => {
      try {
        const media = await uploadOne(file, folder, onProgress);
        // Previous cover (if any) is kept, just demoted into the gallery
        // rather than deleted.
        const rest = value.map((item) => ({ ...item, isCover: false }));
        onChange([...rest, { ...media, isCover: true }]);
      } catch (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message || "Upload failed"}`);
      }
    });
  };

  const handleGalleryFiles = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    // `value` is a snapshot captured when this handler was created and never
    // changes for the rest of this call, even though each onChange() re-renders
    // the parent -- so each file's result is accumulated locally and appended
    // on top of that same snapshot. Basing new items off the live `value`
    // instead would silently drop every file but the last one in a batch,
    // since each onChange call would overwrite the previous file's addition.
    const uploadedSoFar = [];
    const hadCoverAlready = !!coverItem;

    for (const file of files) {
      const tempId = `${file.name}-${Date.now()}-${Math.random()}`;
      // Uploads are intentionally sequential (awaited per-file) so per-file progress stays legible.
      await withProgress(tempId, async (onProgress) => {
        try {
          const media = await uploadOne(file, folder, onProgress);
          const isFirstImageWithNoCover =
            media.type === "image" &&
            !hadCoverAlready &&
            !uploadedSoFar.some((item) => item.isCover);
          uploadedSoFar.push({ ...media, isCover: isFirstImageWithNoCover });
          onChange([...value, ...uploadedSoFar]);
        } catch (error) {
          toast.error(`Failed to upload ${file.name}: ${error.message || "Upload failed"}`);
        }
      });
    }
  };

  const handleRemove = (publicId) => {
    const removingCover = coverItem?.publicId === publicId;
    const next = value.filter((item) => item.publicId !== publicId);
    // Keep a cover assigned if any image is left, rather than leaving the
    // listing/offer with no featured photo.
    if (removingCover && !next.some((item) => item.isCover)) {
      const promotedIndex = next.findIndex((item) => item.type === "image");
      if (promotedIndex !== -1) {
        next[promotedIndex] = { ...next[promotedIndex], isCover: true };
      }
    }
    onChange(next);
  };

  const handleSetCover = (publicId) => {
    onChange(value.map((item) => ({ ...item, isCover: item.publicId === publicId })));
  };

  const uploadingEntries = Object.entries(uploading);
  const coverUploading = uploadingEntries.filter(([id]) => id.startsWith("cover-"));
  const galleryUploading = uploadingEntries.filter(([id]) => !id.startsWith("cover-"));

  return (
    <div className="space-y-6">
      <div>
        <p className="text-sm font-medium text-ink-700 dark:text-surface-300 mb-1">Cover Photo</p>
        <p className="text-xs text-ink-500 dark:text-surface-400 mb-2">
          The main image shown on the listing/offer card.
        </p>

        {coverItem ? (
          <div className="relative w-full max-w-xs aspect-video rounded-lg overflow-hidden bg-ink-200 dark:bg-surface-700 group">
            <Image
              src={coverItem.secureUrl}
              alt=""
              fill
              sizes="320px"
              className="object-cover"
              unoptimized
            />
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/40 transition-colors flex items-center justify-center gap-3 opacity-0 group-hover:opacity-100">
              <label className="cursor-pointer bg-white/90 text-ink-900 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white">
                Change
                <input
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  className="hidden"
                  onChange={handleCoverFile}
                />
              </label>
              <button
                type="button"
                onClick={() => handleRemove(coverItem.publicId)}
                className="bg-white/90 text-danger text-xs font-medium px-3 py-1.5 rounded-full hover:bg-white"
              >
                Remove
              </button>
            </div>
          </div>
        ) : (
          <label className="flex flex-col items-center justify-center w-full max-w-xs aspect-video rounded-lg border-2 border-dashed border-ink-300 dark:border-surface-600 text-ink-500 dark:text-surface-400 text-sm cursor-pointer hover:border-brand-400 hover:text-brand-400 transition-colors">
            + Upload cover photo
            <input
              type="file"
              accept="image/jpeg,image/png,image/webp"
              className="hidden"
              onChange={handleCoverFile}
            />
          </label>
        )}

        <div className="mt-2 max-w-xs">
          <ProgressBars entries={coverUploading} />
        </div>
      </div>

      <div>
        <p className="text-sm font-medium text-ink-700 dark:text-surface-300 mb-1">
          More Photos &amp; Video
        </p>
        <p className="text-xs text-ink-500 dark:text-surface-400 mb-2">
          Other rooms, angles, the exterior, or a walkthrough video.
        </p>

        <input
          type="file"
          accept="image/jpeg,image/png,image/webp,video/mp4"
          multiple
          onChange={handleGalleryFiles}
          className="block w-full text-sm text-ink-700 dark:text-surface-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-brand-400 file:text-white file:font-medium hover:file:bg-brand-500"
        />

        <div className="mt-2">
          <ProgressBars entries={galleryUploading} />
        </div>

        {galleryItems.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 mt-3">
            {galleryItems.map((item) => (
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
                    className="absolute bottom-1 left-1 text-caption px-2 py-0.5 rounded-full bg-black/60 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    Set as cover
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default MediaUploader;
