import { useEffect, useState } from "react";
import axios from "axios";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { toast } from "sonner";
import { api } from "../lib/api.js";
import LocationPicker from "./LocationPicker.jsx";

const categories = ["Waste", "Water", "Road", "Electricity", "Sanitation", "Other"];

const formSchema = z.object({
  descriptionText: z
    .string()
    .min(10, "Please add a bit more detail (at least 10 characters).")
    .max(1000, "Description is too long."),
  userCategory: z.enum([
    "Waste",
    "Water",
    "Road",
    "Electricity",
    "Sanitation",
    "Other",
  ]),
});

const STEPS = ["Details", "Photo", "Location"];

export default function ComplaintForm({ onSuccess }) {
  const [step, setStep] = useState(0);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [location, setLocation] = useState(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    trigger,
    reset,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(formSchema),
    defaultValues: {
      descriptionText: "",
      userCategory: "Waste",
    },
    mode: "onBlur",
  });

  useEffect(() => {
    return () => {
      if (imagePreview) URL.revokeObjectURL(imagePreview);
    };
  }, [imagePreview]);

  function clearImage() {
    if (imagePreview) URL.revokeObjectURL(imagePreview);
    setImageFile(null);
    setImagePreview(null);
  }

  function onPickImage(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please choose an image file.");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Image must be under 5 MB.");
      return;
    }
    setImageFile(file);
    setImagePreview((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
    e.target.value = "";
  }

  async function uploadToCloudinary(file) {
    const { data } = await api.get("/api/upload/signature", {
      params: { t: Date.now() },
    });
    const formData = new FormData();
    formData.append("file", file);
    formData.append("timestamp", data.timestamp);
    formData.append("signature", data.signature);
    formData.append("api_key", data.apiKey);
    formData.append("folder", data.folder);
    const res = await axios.post(
      `https://api.cloudinary.com/v1_1/${data.cloudName}/image/upload`,
      formData
    );
    return res.data.secure_url;
  }

  async function goNext() {
    if (step === 0) {
      const ok = await trigger(["descriptionText", "userCategory"]);
      if (ok) setStep(1);
      return;
    }
    if (step === 1) {
      if (!imageFile) {
        toast.error("Please attach a photo before continuing.");
        return;
      }
      setStep(2);
    }
  }

  const onFinalSubmit = handleSubmit(async (values) => {
    if (!imageFile) {
      toast.error("A photo is required.");
      return;
    }
    try {
      setUploading(true);
      const imageUrl = await uploadToCloudinary(imageFile);
      await api.post("/api/complaints", {
        ...values,
        imageUrl,
        location: location || undefined,
      });
      toast.success("Complaint filed successfully.");
      reset({ descriptionText: "", userCategory: "Waste" });
      clearImage();
      setLocation(null);
      setStep(0);
      onSuccess?.();
    } catch (error) {
      const msg =
        error?.response?.data?.message ||
        (error?.response?.status === 409
          ? error?.response?.data?.message
          : null) ||
        "Could not submit complaint. Please try again.";
      toast.error(msg);
    } finally {
      setUploading(false);
    }
  });

  return (
    <form
      noValidate
      onSubmit={(e) => {
        e.preventDefault();
        if (step === STEPS.length - 1) void onFinalSubmit(e);
      }}
    >
      <div className="mb-4 flex flex-wrap gap-2">
        {STEPS.map((label, i) => (
          <div
            key={label}
            className={`rounded-xl border px-3 py-2 text-xs font-semibold transition-colors ${
              i === step
                ? "border-indigo-400/40 bg-indigo-500/15 text-white"
                : "border-white/10 bg-white/[0.04] text-[var(--muted)]"
            }`}
          >
            {i + 1}. {label}
          </div>
        ))}
      </div>

      {step === 0 && (
        <>
          <div className="field !mt-0">
            <label className="label" htmlFor="descriptionText">
              Description *
            </label>
            <textarea
              id="descriptionText"
              className="control"
              placeholder="Describe the issue clearly — what, where, how severe…"
              {...register("descriptionText")}
            />
            {errors.descriptionText && (
              <p className="text-xs text-rose-300/90">{errors.descriptionText.message}</p>
            )}
          </div>
          <div className="field">
            <label className="label" htmlFor="userCategory">
              Category *
            </label>
            <select id="userCategory" className="control" {...register("userCategory")}>
              {categories.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
            {errors.userCategory && (
              <p className="text-xs text-rose-300/90">{errors.userCategory.message}</p>
            )}
          </div>
        </>
      )}

      {step === 1 && (
        <div className="field !mt-0">
          <span className="label">Photo *</span>
          <label
            htmlFor="image-upload"
            className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-[14px] border border-dashed border-white/20 bg-white/[0.04] px-4 py-5 transition-colors hover:border-indigo-400/35"
          >
            {imagePreview ? (
              <img
                src={imagePreview}
                alt="Preview"
                className="max-h-44 w-full max-w-full rounded-[10px] object-cover"
              />
            ) : (
              <span className="text-sm text-[var(--muted-2)]">
                Click to attach a photo (max 5 MB)
              </span>
            )}
          </label>
          <input
            id="image-upload"
            type="file"
            accept="image/*"
            className="hidden"
            onChange={onPickImage}
          />
          {imageFile ? (
            <p className="helper">
              {imageFile.name} — {(imageFile.size / 1024).toFixed(0)} KB
              <button type="button" className="ml-2 text-xs text-rose-300/90 underline" onClick={clearImage}>
                Remove
              </button>
            </p>
          ) : null}
        </div>
      )}

      {step === 2 && (
        <div className="field !mt-0">
          <span className="label">Location (optional)</span>
          <LocationPicker value={location} onChange={setLocation} />
        </div>
      )}

      <div className="actions mt-5 flex-wrap">
        {step > 0 ? (
          <button type="button" className="btn" onClick={() => setStep((s) => s - 1)} disabled={uploading}>
            Back
          </button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <button type="button" className="btn primary" onClick={goNext} disabled={uploading}>
            Continue
          </button>
        ) : (
          <button type="submit" className="btn primary" disabled={uploading}>
            {uploading ? "Uploading & submitting…" : "Submit complaint"}
          </button>
        )}
      </div>
      <p className="helper">Your complaint will be reviewed by a municipal officer.</p>
    </form>
  );
}
