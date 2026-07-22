"use client";

import { useState } from "react";
import useSWR from "swr";
import toast from "react-hot-toast";
import { CldImage } from "next-cloudinary";
import { FaArrowUp, FaArrowDown, FaTrash } from "react-icons/fa";
import { uploadOne } from "@/utils/cloudinaryUpload";
import Spinner from "@/components/ui/Spinner";
import ConfirmDialog from "@/components/ui/ConfirmDialog";
import Skeleton from "@/components/ui/Skeleton";

const fetcher = (...args) => fetch(...args).then((res) => res.json());

// A per-selection cap (you can still end up with more than this in the
// library over time, one batch at a time) -- keeps a single accidental
// "select all" from kicking off a huge sequential upload.
const MAX_BATCH_UPLOAD = 10;

function ProgressBar({ pct }) {
  return (
    <div className="w-full max-w-xs bg-ink-200 dark:bg-surface-700 rounded-full h-2 overflow-hidden">
      <div className="bg-brand-400 h-2 transition-all" style={{ width: `${pct}%` }} />
    </div>
  );
}

function ProgressBars({ entries }) {
  if (entries.length === 0) return null;
  return (
    <div className="space-y-2">
      {entries.map(([id, pct]) => (
        <ProgressBar key={id} pct={pct} />
      ))}
    </div>
  );
}

// The image swiper at the top of the homepage -- unbounded overall (at least
// 10 should be comfortable), but capped per-selection at MAX_BATCH_UPLOAD;
// reordered with up/down (no drag-and-drop dependency) and toggled
// active/inactive without losing the upload.
function ImageBanners({ images, mutate }) {
  const [uploading, setUploading] = useState({}); // { [tempId]: progressPercent }
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  // Thumbnails used to pop in one at a time as each one happened to finish
  // downloading -- holding every row behind a skeleton until the whole batch
  // is ready, then revealing them all in the same render, reads as one
  // deliberate load instead of a stagger.
  const [loadedIds, setLoadedIds] = useState(() => new Set());
  const allThumbnailsLoaded = images.every((image) => loadedIds.has(image._id));
  const markLoaded = (id) => {
    setLoadedIds((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  };

  const handleUpload = async (event) => {
    const files = Array.from(event.target.files || []);
    event.target.value = "";
    if (files.length === 0) return;

    if (files.length > MAX_BATCH_UPLOAD) {
      toast.error(
        `You can only select up to ${MAX_BATCH_UPLOAD} images at a time -- you picked ${files.length}.`
      );
      return;
    }

    // Sequential (awaited per file) rather than firing all uploads at once:
    // each POST /api/banners computes the next display order from the
    // current last one, so overlapping requests could race and land on the
    // same order. Sequencing also keeps each file's progress bar legible.
    let successCount = 0;
    for (const file of files) {
      const tempId = `${file.name}-${Date.now()}-${Math.random()}`;
      setUploading((prev) => ({ ...prev, [tempId]: 0 }));
      try {
        const media = await uploadOne(file, "richlux/banners", (pct) =>
          setUploading((prev) => ({ ...prev, [tempId]: pct }))
        );
        const res = await fetch("/api/banners", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...media, type: "image" }),
        });
        const body = await res.json().catch(() => ({}));
        if (!res.ok) throw new Error(body.message || "Failed to save image");
        successCount += 1;
        mutate();
      } catch (error) {
        toast.error(`Failed to upload ${file.name}: ${error.message || "Upload failed"}`);
      } finally {
        setUploading((prev) => {
          const next = { ...prev };
          delete next[tempId];
          return next;
        });
      }
    }
    if (successCount > 0) {
      toast.success(successCount === 1 ? "Image added" : `${successCount} images added`);
    }
  };

  const handleToggleActive = async (banner) => {
    try {
      const res = await fetch(`/api/banners/${banner._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !banner.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update image");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to update image");
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/banners/${deleteTarget._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete image");
      toast.success("Image removed");
      setDeleteTarget(null);
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to delete image");
    } finally {
      setIsDeleting(false);
    }
  };

  // Swaps this image's order with its neighbor -- `images` is already sorted
  // by order from the API, so `images[index ± 1]` is always the right one.
  const handleMove = async (index, direction) => {
    const neighborIndex = index + direction;
    if (neighborIndex < 0 || neighborIndex >= images.length) return;
    const current = images[index];
    const neighbor = images[neighborIndex];
    try {
      await Promise.all([
        fetch(`/api/banners/${current._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: neighbor.order }),
        }),
        fetch(`/api/banners/${neighbor._id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ order: current.order }),
        }),
      ]);
      mutate();
    } catch (error) {
      toast.error("Failed to reorder images");
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 space-y-3">
        <p className="text-sm font-medium text-ink-700 dark:text-surface-300">Add images</p>
        <p className="text-xs text-ink-500 dark:text-surface-400">
          JPEG, PNG, or WEBP. Select up to {MAX_BATCH_UPLOAD} at once -- swipes through in
          order at the top of the homepage.
        </p>
        <input
          type="file"
          accept="image/jpeg,image/png,image/webp"
          multiple
          onChange={handleUpload}
          className="block w-full text-sm text-ink-700 dark:text-surface-300 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:bg-brand-400 file:text-white file:font-medium hover:file:bg-brand-500 disabled:opacity-60"
        />
        <ProgressBars entries={Object.entries(uploading)} />
      </div>

      {images.length === 0 ? (
        <p className="text-ink-500 dark:text-surface-400">No images yet -- add one above.</p>
      ) : (
        <div className="space-y-3">
          {images.map((banner, index) => (
            <div
              key={banner._id}
              className="flex items-center gap-4 bg-white dark:bg-surface-800 rounded-2xl p-3 sm:p-4"
            >
              <div className="relative w-28 h-16 shrink-0 rounded-lg overflow-hidden bg-ink-200 dark:bg-surface-700">
                {!allThumbnailsLoaded && <Skeleton className="absolute inset-0 rounded-none" />}
                <CldImage
                  src={banner.publicId}
                  alt=""
                  fill
                  sizes="112px"
                  className={`object-cover transition-opacity duration-300 ${
                    allThumbnailsLoaded ? "opacity-100" : "opacity-0"
                  }`}
                  onLoad={() => markLoaded(banner._id)}
                />
              </div>

              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-ink-900 dark:text-white">Image</p>
                <p className="text-xs text-ink-500 dark:text-surface-400">
                  {banner.isActive ? "Live on homepage" : "Hidden"}
                </p>
              </div>

              <div className="flex items-center gap-1 shrink-0">
                <button
                  type="button"
                  onClick={() => handleMove(index, -1)}
                  disabled={index === 0}
                  aria-label="Move up"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-ink-500 dark:text-surface-300 hover:bg-ink-100 dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FaArrowUp size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleMove(index, 1)}
                  disabled={index === images.length - 1}
                  aria-label="Move down"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-ink-500 dark:text-surface-300 hover:bg-ink-100 dark:hover:bg-surface-700 disabled:opacity-30 disabled:cursor-not-allowed"
                >
                  <FaArrowDown size={13} />
                </button>
                <button
                  type="button"
                  onClick={() => handleToggleActive(banner)}
                  className={`ml-1 text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors ${
                    banner.isActive
                      ? "bg-success/10 text-success"
                      : "bg-ink-200 text-ink-700 dark:bg-surface-700 dark:text-slate-200"
                  }`}
                >
                  {banner.isActive ? "Active" : "Hidden"}
                </button>
                <button
                  type="button"
                  onClick={() => setDeleteTarget(banner)}
                  aria-label="Delete image"
                  className="w-8 h-8 rounded-md flex items-center justify-center text-danger hover:bg-danger/10"
                >
                  <FaTrash size={13} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <ConfirmDialog
        open={!!deleteTarget}
        title="Remove this image?"
        description="This can't be undone."
        confirmLabel="Remove"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteTarget(null)}
      />
    </div>
  );
}

// A single slot, not a list -- only one video ever plays on the homepage (a
// plain player under the image carousel, not another slide in it), so
// uploading here always replaces whatever's currently set rather than
// adding to it (see POST /api/banners).
function VideoBanner({ video, mutate }) {
  const [uploadPct, setUploadPct] = useState(null);
  // Holds the picked File while its replace confirmation is open -- a native
  // file input can't be "paused" mid-flow, but the File object it already
  // handed us works fine on its own once the input itself is done with it.
  const [pendingReplaceFile, setPendingReplaceFile] = useState(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const uploadFile = async (file) => {
    setUploadPct(0);
    try {
      const media = await uploadOne(file, "richlux/banners", setUploadPct);
      const res = await fetch("/api/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...media, type: "video" }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(body.message || "Failed to save video");
      toast.success(video ? "Video replaced" : "Video added");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to upload video");
    } finally {
      setUploadPct(null);
    }
  };

  const handleUpload = (event) => {
    const file = event.target.files?.[0];
    event.target.value = "";
    if (!file) return;
    if (video) {
      setPendingReplaceFile(file);
      return;
    }
    uploadFile(file);
  };

  const confirmReplace = async () => {
    const file = pendingReplaceFile;
    setPendingReplaceFile(null);
    if (file) await uploadFile(file);
  };

  const handleToggleActive = async () => {
    try {
      const res = await fetch(`/api/banners/${video._id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ isActive: !video.isActive }),
      });
      if (!res.ok) throw new Error("Failed to update video");
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to update video");
    }
  };

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      const res = await fetch(`/api/banners/${video._id}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete video");
      toast.success("Video removed");
      setDeleteConfirmOpen(false);
      mutate();
    } catch (error) {
      toast.error(error.message || "Failed to delete video");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="bg-white dark:bg-surface-800 rounded-2xl p-4 sm:p-6 space-y-3">
      <p className="text-sm font-medium text-ink-700 dark:text-surface-300">Homepage video</p>
      <p className="text-xs text-ink-500 dark:text-surface-400">
        MP4 only. Plays on its own section under the image carousel -- uploading a new
        one replaces this one, there&apos;s only ever a single video.
      </p>

      {video ? (
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <video
            src={video.secureUrl}
            className="w-full sm:w-40 h-24 object-cover rounded-lg bg-ink-900"
            muted
          />
          <div className="flex-1 min-w-0">
            <p className="text-xs text-ink-500 dark:text-surface-400 mb-2">
              {video.isActive ? "Live on homepage" : "Hidden"}
            </p>
            <div className="flex flex-wrap items-center gap-2">
              <label className="cursor-pointer text-xs font-medium px-3 py-1.5 rounded-full bg-brand-400 text-white hover:bg-brand-500">
                Replace
                <input
                  type="file"
                  accept="video/mp4"
                  className="hidden"
                  onChange={handleUpload}
                  disabled={uploadPct !== null}
                />
              </label>
              <button
                type="button"
                onClick={handleToggleActive}
                className={`text-xs font-medium px-2.5 py-1.5 rounded-full transition-colors ${
                  video.isActive
                    ? "bg-success/10 text-success"
                    : "bg-ink-200 text-ink-700 dark:bg-surface-700 dark:text-slate-200"
                }`}
              >
                {video.isActive ? "Active" : "Hidden"}
              </button>
              <button
                type="button"
                onClick={() => setDeleteConfirmOpen(true)}
                aria-label="Delete video"
                className="w-8 h-8 rounded-md flex items-center justify-center text-danger hover:bg-danger/10"
              >
                <FaTrash size={13} />
              </button>
            </div>
          </div>
        </div>
      ) : (
        <label className="flex flex-col items-center justify-center w-full max-w-xs aspect-video rounded-lg border-2 border-dashed border-ink-300 dark:border-surface-600 text-ink-500 dark:text-surface-400 text-sm cursor-pointer hover:border-brand-400 hover:text-brand-400 transition-colors">
          + Upload video
          <input
            type="file"
            accept="video/mp4"
            className="hidden"
            onChange={handleUpload}
            disabled={uploadPct !== null}
          />
        </label>
      )}

      {uploadPct !== null && <ProgressBar pct={uploadPct} />}

      <ConfirmDialog
        open={!!pendingReplaceFile}
        title="Replace the homepage video?"
        description="The current video will be removed and replaced with the one you just picked."
        confirmLabel="Replace"
        variant="primary"
        onConfirm={confirmReplace}
        onCancel={() => setPendingReplaceFile(null)}
      />
      <ConfirmDialog
        open={deleteConfirmOpen}
        title="Remove the homepage video?"
        description="This can't be undone."
        confirmLabel="Remove"
        isLoading={isDeleting}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  );
}

// Homepage Hero management -- an unbounded, reorderable image carousel plus a
// single-slot video player, kept as two independent sections rather than one
// mixed list. See components/Hero.jsx for how these render publicly.
function BannerManager() {
  const { data: banners, isLoading, mutate } = useSWR("/api/banners?all=true", fetcher);
  const rows = Array.isArray(banners) ? banners : [];
  const images = rows.filter((b) => b.type === "image");
  const video = rows.find((b) => b.type === "video") || null;

  if (isLoading) {
    return <Spinner className="text-brand-400 py-10" />;
  }

  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-base font-semibold text-ink-900 dark:text-white mb-3">
          Homepage Images
        </h2>
        <ImageBanners images={images} mutate={mutate} />
      </div>

      <div>
        <h2 className="text-base font-semibold text-ink-900 dark:text-white mb-3">
          Homepage Video
        </h2>
        <VideoBanner video={video} mutate={mutate} />
      </div>
    </div>
  );
}

export default BannerManager;
