"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { motion, AnimatePresence } from "framer-motion";
import toast from "react-hot-toast";
import { FaTimes, FaCheck } from "react-icons/fa";
import Card from "@/components/ui/Card";
import Button from "@/components/ui/Button";
import Input from "@/components/Input";
import Select from "@/components/Select";
import {
  LISTING_CATEGORIES,
  LISTING_CATEGORY_LABELS,
  LISTING_PRICE_FREQUENCIES,
} from "@/constants/listing";
import {
  APARTMENT_TYPES,
  SUGGESTED_AMENITIES,
  MOVE_IN_TIMEFRAMES,
  MOVE_IN_TIMEFRAME_LABELS,
  CONTACT_METHODS,
  CONTACT_METHOD_LABELS,
  CONTACT_TIMES,
  CONTACT_TIME_LABELS,
  FURNISHING_OPTIONS,
  FURNISHING_LABELS,
  OCCUPANCY_STATUSES,
  OCCUPANCY_STATUS_LABELS,
  MANAGEMENT_SERVICE_TYPES,
  MANAGEMENT_SERVICE_TYPE_LABELS,
  LAND_TITLE_DOCUMENTS,
  LAND_TITLE_DOCUMENT_LABELS,
  LAND_PURPOSES,
  LAND_PURPOSE_LABELS,
  LEASE_DURATION_OPTIONS,
  LEASE_DURATION_LABELS,
} from "@/constants/request";
import { formatNumberWithCommas, unformatNumber } from "@/utils/formatNumber";
import Spinner from "@/components/ui/Spinner";
import LocationSelect from "@/components/LocationSelect";

const STEP_LABELS = [
  "Your details",
  "What you're looking for",
  "Budget & timing",
  "Location",
  "Anything else",
];

const categoryOptions = LISTING_CATEGORIES.map((value) => ({
  value,
  name: LISTING_CATEGORY_LABELS[value] || value,
}));
const typeOptions = APARTMENT_TYPES.map((value) => ({ value, name: value }));
const bedroomOptions = [
  { value: "1", name: "1" },
  { value: "2", name: "2" },
  { value: "3", name: "3" },
  { value: "4", name: "4" },
  { value: "5", name: "5+" },
];
const bathroomOptions = ["1", "2", "3", "4", "5"].map((value) => ({ value, name: value }));
const householdSizeOptions = Array.from({ length: 12 }, (_, i) => String(i + 1)).map(
  (value) => ({ value, name: value })
);
const parkingOptions = [
  { value: "yes", name: "Yes" },
  { value: "no", name: "No" },
];
const leaseDurationOptions = LEASE_DURATION_OPTIONS.map((value) => ({
  value,
  name: LEASE_DURATION_LABELS[value] || value,
}));
const furnishingOptions = FURNISHING_OPTIONS.map((value) => ({
  value,
  name: FURNISHING_LABELS[value] || value,
}));
const priceFrequencyOptions = LISTING_PRICE_FREQUENCIES.map((value) => ({
  value,
  name: value.replace("-", " "),
}));
const moveInOptions = MOVE_IN_TIMEFRAMES.map((value) => ({
  value,
  name: MOVE_IN_TIMEFRAME_LABELS[value] || value,
}));
const contactMethodOptions = CONTACT_METHODS.map((value) => ({
  value,
  name: CONTACT_METHOD_LABELS[value] || value,
}));
const contactTimeOptions = CONTACT_TIMES.map((value) => ({
  value,
  name: CONTACT_TIME_LABELS[value] || value,
}));
const sexOptions = [
  { value: "male", name: "Male" },
  { value: "female", name: "Female" },
];
const occupancyStatusOptions = OCCUPANCY_STATUSES.map((value) => ({
  value,
  name: OCCUPANCY_STATUS_LABELS[value] || value,
}));
const managementServiceTypeOptions = MANAGEMENT_SERVICE_TYPES.map((value) => ({
  value,
  name: MANAGEMENT_SERVICE_TYPE_LABELS[value] || value,
}));
const landTitleDocumentOptions = LAND_TITLE_DOCUMENTS.map((value) => ({
  value,
  name: LAND_TITLE_DOCUMENT_LABELS[value] || value,
}));
const landPurposeOptions = LAND_PURPOSES.map((value) => ({
  value,
  name: LAND_PURPOSE_LABELS[value] || value,
}));

const emptyForm = {
  fullname: "",
  email: "",
  phonenumber: "",
  preferredContactMethod: "",
  preferredContactTime: "",
  sex: "",
  category: "",
  type: "",
  bedrooms: "",
  bathrooms: "",
  furnishing: "",
  parkingRequired: "",
  householdSize: "",
  budgetMin: "",
  budgetMax: "",
  priceFrequency: "",
  moveInTimeframe: "",
  checkInDate: "",
  checkOutDate: "",
  numberOfGuests: "",
  leaseDurationPreference: "",
  occupancyStatus: "",
  managementServiceType: "",
  landSize: "",
  titleDocumentType: "",
  landPurpose: "",
  presentState: "",
  presentLga: "",
  presentArea: "",
  preferredState: "",
  preferredLga: "",
  preferredArea: "",
  preferredLocations: [],
  request: "",
};

// components/Input.jsx hardcodes the native `required` attribute, which is
// right for auth forms but would block fields that are intentionally left
// blank (they aren't required by model/UserRequest.js). Mirrors the
// OptionalField helper already used in components/admin/ListingForm.jsx.
function OptionalField({ label, helperText, error, ...props }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
        {label}
      </label>
      <input
        className="w-full px-3 py-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-900 dark:text-white placeholder:text-ink-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        {...props}
      />
      {error && <p className="mt-1 text-caption text-danger">{error}</p>}
      {helperText && (
        <p className="mt-1 text-caption text-ink-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

function ProgressSteps({ current, completed }) {
  return (
    <div className="flex items-center px-5 sm:px-6 pt-5">
      {STEP_LABELS.map((label, index) => (
        <React.Fragment key={label}>
          <div className="flex flex-col items-center gap-1">
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center text-caption font-semibold transition-colors duration-300 ${
                completed.includes(index)
                  ? "bg-success text-white"
                  : index === current
                  ? "bg-brand-400 text-white"
                  : "bg-ink-200 dark:bg-surface-700 text-ink-500 dark:text-slate-400"
              }`}
            >
              <AnimatePresence mode="wait" initial={false}>
                {completed.includes(index) ? (
                  <motion.span
                    key="check"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 400, damping: 15 }}
                  >
                    <FaCheck size={12} />
                  </motion.span>
                ) : (
                  <motion.span key="num">{index + 1}</motion.span>
                )}
              </AnimatePresence>
            </div>
            <span className="hidden sm:block text-[10px] text-ink-500 dark:text-slate-400 text-center max-w-[64px] leading-tight">
              {label}
            </span>
          </div>
          {index < STEP_LABELS.length - 1 && (
            <div className="flex-1 h-0.5 mx-1 sm:mx-2 -mt-4 sm:-mt-5 relative">
              <div className="absolute inset-0 bg-ink-200 dark:bg-surface-700 rounded-full" />
              <motion.div
                className="absolute inset-y-0 left-0 bg-success rounded-full"
                initial={false}
                animate={{ width: completed.includes(index) ? "100%" : "0%" }}
                transition={{ duration: 0.3 }}
              />
            </div>
          )}
        </React.Fragment>
      ))}
    </div>
  );
}

const slideVariants = {
  enter: (direction) => ({ x: direction > 0 ? 40 : -40, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (direction) => ({ x: direction > 0 ? -40 : 40, opacity: 0 }),
};

// listingId/initialCategory are set when this is opened as a listing's
// "Make an Inquiry" button (components/ListingInquiryButton.jsx) rather than
// the general "Make a Request" CTA -- the category is already implied by the
// listing, so it's locked instead of asked for, and the listing gets linked
// on the request itself.
function RequestWizardModal({ onClose, listingId, initialCategory }) {
  const { data: session, status } = useSession();
  const router = useRouter();

  // A request can only ever be tied to a real account -- rather than
  // showing an in-modal "please sign in" card and waiting for a click,
  // send unauthenticated visitors straight to the login screen. /request
  // is the callback target regardless of where this modal was opened from
  // (homepage CTA or the dedicated page) since it already knows how to
  // reopen the wizard on its own once the session resolves.
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push(`/login?callbackUrl=${encodeURIComponent("/request")}`);
    }
  }, [status, router]);

  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const [completed, setCompleted] = useState([]);
  const [celebrating, setCelebrating] = useState(false);
  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Only mounted once status has resolved (parent gates), so a lazy
  // initializer prefills without a setState-in-effect.
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    fullname: session?.user?.name || session?.user?.username || "",
    email: session?.user?.email || "",
    category: initialCategory || emptyForm.category,
  }));
  const [amenities, setAmenities] = useState([]);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));
  const toggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const validateStep = (index) => {
    const stepErrors = {};
    if (index === 0) {
      if (!form.fullname) stepErrors.fullname = "Required";
      if (!form.email) stepErrors.email = "Required";
      if (!form.phonenumber) stepErrors.phonenumber = "Required";
    }
    if (index === 1) {
      if (!form.category) stepErrors.category = "Required";
      if (form.category === "land-sale") {
        if (!form.landSize) stepErrors.landSize = "Required";
      } else {
        if (!form.type) stepErrors.type = "Required";
        if (!form.bedrooms) stepErrors.bedrooms = "Required";
      }
    }
    if (index === 2) {
      if (!form.budgetMin) stepErrors.budgetMin = "Required";
      if (!form.budgetMax) stepErrors.budgetMax = "Required";
      if (
        form.budgetMin &&
        form.budgetMax &&
        unformatNumber(form.budgetMax) < unformatNumber(form.budgetMin)
      ) {
        stepErrors.budgetMax = "Must be more than budget min";
      }
    }
    if (index === 3) {
      if (!form.presentState || !form.presentLga || !form.presentArea) {
        stepErrors.presentlocation = "Select your present state, LGA, and area";
      }
    }
    return stepErrors;
  };

  const goNext = () => {
    const stepErrors = validateStep(step);
    if (Object.keys(stepErrors).length > 0) {
      setErrors(stepErrors);
      return;
    }
    setErrors({});
    setCompleted((prev) => (prev.includes(step) ? prev : [...prev, step]));
    setCelebrating(true);
    setTimeout(() => {
      setCelebrating(false);
      setDirection(1);
      setStep((s) => Math.min(s + 1, STEP_LABELS.length - 1));
    }, 550);
  };

  const goBack = () => {
    setErrors({});
    setDirection(-1);
    setStep((s) => Math.max(s - 1, 0));
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      // A preferred-location State+LGA+Area the user picked but never
      // clicked "+ Add" for (easy to miss -- unlike Present location, which
      // needs no extra click) must not be silently dropped just because it
      // was still sitting in the dropdowns when they hit Submit.
      let preferredLocations = form.preferredLocations;
      if (form.preferredState && form.preferredLga && form.preferredArea) {
        const stagedLocation = `${form.preferredArea}, ${form.preferredLga}, ${form.preferredState}`;
        if (!preferredLocations.includes(stagedLocation)) {
          preferredLocations = [...preferredLocations, stagedLocation];
        }
      }

      const payload = {
        fullname: form.fullname,
        email: form.email,
        phonenumber: form.phonenumber,
        preferredContactMethod: form.preferredContactMethod,
        preferredContactTime: form.preferredContactTime,
        sex: form.sex,
        category: form.category,
        type: form.type,
        bedrooms: form.bedrooms === "" ? undefined : Number(form.bedrooms),
        bathrooms: form.bathrooms === "" ? undefined : Number(form.bathrooms),
        furnishing: form.furnishing,
        parkingRequired:
          form.parkingRequired === "" ? undefined : form.parkingRequired === "yes",
        amenities,
        householdSize:
          form.householdSize === "" ? undefined : Number(form.householdSize),
        budgetMin: unformatNumber(form.budgetMin),
        budgetMax: unformatNumber(form.budgetMax),
        priceFrequency: form.priceFrequency,
        moveInTimeframe: form.moveInTimeframe,
        presentlocation: `${form.presentArea}, ${form.presentLga}, ${form.presentState}`,
        preferredLocations,
        request: form.request,
        listingId: listingId || undefined,
      };

      if (form.category === "shortlet") {
        payload.checkInDate = form.checkInDate || undefined;
        payload.checkOutDate = form.checkOutDate || undefined;
        payload.numberOfGuests =
          form.numberOfGuests === "" ? undefined : Number(form.numberOfGuests);
      }
      if (form.category === "rental") {
        payload.leaseDurationPreference = form.leaseDurationPreference;
      }
      if (form.category === "property-management") {
        payload.occupancyStatus = form.occupancyStatus;
        payload.managementServiceType = form.managementServiceType;
      }
      if (form.category === "land-sale") {
        payload.landSize = form.landSize;
        payload.titleDocumentType = form.titleDocumentType;
        payload.landPurpose = form.landPurpose;
      }

      const res = await fetch("/api/userrequest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();

      if (!res.ok) {
        toast.error(data.message || "Could not submit your request");
        return;
      }

      toast.success("Request submitted");
      onClose();
      router.push(`/my-requests/${data._id}`);
    } catch (error) {
      toast.error("Something went wrong, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  const renderStep = () => {
    if (step === 0) {
      return (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Full name"
              name="fullname"
              value={form.fullname}
              error={errors.fullname}
              onChange={(e) => update("fullname", e.target.value)}
            />
            <Input
              label="Email"
              type="email"
              name="email"
              value={form.email}
              error={errors.email}
              onChange={(e) => update("email", e.target.value)}
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone number"
              name="phonenumber"
              value={form.phonenumber}
              error={errors.phonenumber}
              onChange={(e) => update("phonenumber", e.target.value)}
            />
            <Select
              label="Sex"
              name="sex"
              value={form.sex}
              onChange={(e) => update("sex", e.target.value)}
              options={sexOptions}
              placeholder="Select"
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Preferred contact method"
              name="preferredContactMethod"
              value={form.preferredContactMethod}
              onChange={(e) => update("preferredContactMethod", e.target.value)}
              options={contactMethodOptions}
              placeholder="Select method"
            />
            <Select
              label="Preferred contact time"
              name="preferredContactTime"
              value={form.preferredContactTime}
              onChange={(e) => update("preferredContactTime", e.target.value)}
              options={contactTimeOptions}
              placeholder="Select time"
            />
          </div>
        </div>
      );
    }

    if (step === 1) {
      // Land Sale is a fundamentally different request (buying land, not a
      // house) -- none of the residential fields (type/bedrooms/furnishing/
      // amenities/household size) apply. Property Management is a property
      // owner asking Richlux to manage what they already own, so it keeps
      // the fields that describe the property but drops the ones about
      // moving into it (furnishing/parking/household size).
      const isLandSale = form.category === "land-sale";
      const isPropertyManagement = form.category === "property-management";
      const showResidentialFields = !isLandSale;
      const showTenancyFields = !isLandSale && !isPropertyManagement;

      return (
        <div className="space-y-4">
          {listingId ? (
            <p className="text-sm text-ink-700 dark:text-slate-200">
              Inquiring about a{" "}
              <span className="font-semibold">
                {LISTING_CATEGORY_LABELS[form.category] || form.category}
              </span>{" "}
              listing.
            </p>
          ) : (
            <Select
              label="Category"
              name="category"
              value={form.category}
              error={errors.category}
              onChange={(e) => update("category", e.target.value)}
              options={categoryOptions}
              placeholder="Select category"
            />
          )}

          {showResidentialFields && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Type of apartment"
                  name="type"
                  value={form.type}
                  error={errors.type}
                  onChange={(e) => update("type", e.target.value)}
                  options={typeOptions}
                  placeholder="Select type"
                />
                <Select
                  label="Bedrooms"
                  name="bedrooms"
                  value={form.bedrooms}
                  error={errors.bedrooms}
                  onChange={(e) => update("bedrooms", e.target.value)}
                  options={bedroomOptions}
                  placeholder="Select"
                />
              </div>
              <div
                className={`grid gap-4 ${
                  showTenancyFields ? "grid-cols-2 sm:grid-cols-3" : "grid-cols-1 sm:grid-cols-2"
                }`}
              >
                <Select
                  label="Bathrooms"
                  name="bathrooms"
                  value={form.bathrooms}
                  onChange={(e) => update("bathrooms", e.target.value)}
                  options={bathroomOptions}
                  placeholder="Select"
                />
                {showTenancyFields && (
                  <>
                    <Select
                      label="Furnishing"
                      name="furnishing"
                      value={form.furnishing}
                      onChange={(e) => update("furnishing", e.target.value)}
                      options={furnishingOptions}
                      placeholder="Select"
                    />
                    <Select
                      label="Parking needed"
                      name="parkingRequired"
                      value={form.parkingRequired}
                      onChange={(e) => update("parkingRequired", e.target.value)}
                      options={parkingOptions}
                      placeholder="Select"
                    />
                  </>
                )}
              </div>
            </>
          )}

          {showTenancyFields && (
            <Select
              label="Household size"
              name="householdSize"
              value={form.householdSize}
              onChange={(e) => update("householdSize", e.target.value)}
              options={householdSizeOptions}
              placeholder="Select"
            />
          )}

          {showResidentialFields && (
            <div>
              <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-2">
                Amenities
              </label>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {SUGGESTED_AMENITIES.map((amenity) => (
                  <label
                    key={amenity}
                    className="flex items-center gap-2 text-sm text-ink-700 dark:text-slate-300"
                  >
                    <input
                      type="checkbox"
                      checked={amenities.includes(amenity)}
                      onChange={() => toggleAmenity(amenity)}
                    />
                    {amenity}
                  </label>
                ))}
              </div>
            </div>
          )}

          {isPropertyManagement && (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Select
                label="Occupancy status"
                name="occupancyStatus"
                value={form.occupancyStatus}
                onChange={(e) => update("occupancyStatus", e.target.value)}
                options={occupancyStatusOptions}
                placeholder="Select status"
              />
              <Select
                label="Management service needed"
                name="managementServiceType"
                value={form.managementServiceType}
                onChange={(e) => update("managementServiceType", e.target.value)}
                options={managementServiceTypeOptions}
                placeholder="Select service"
              />
            </div>
          )}

          {isLandSale && (
            <div className="space-y-4">
              <OptionalField
                label="Land size"
                placeholder="e.g. 2 plots, 500 sqm"
                value={form.landSize}
                error={errors.landSize}
                onChange={(e) => update("landSize", e.target.value)}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Select
                  label="Title document"
                  name="titleDocumentType"
                  value={form.titleDocumentType}
                  onChange={(e) => update("titleDocumentType", e.target.value)}
                  options={landTitleDocumentOptions}
                  placeholder="Select document type"
                />
                <Select
                  label="Purpose"
                  name="landPurpose"
                  value={form.landPurpose}
                  onChange={(e) => update("landPurpose", e.target.value)}
                  options={landPurposeOptions}
                  placeholder="Select purpose"
                />
              </div>
            </div>
          )}
        </div>
      );
    }

    if (step === 2) {
      const isLandSale = form.category === "land-sale";
      const isPropertyManagement = form.category === "property-management";

      return (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Budget min (NGN)"
              type="text"
              name="budgetMin"
              value={form.budgetMin}
              error={errors.budgetMin}
              onChange={(e) =>
                update("budgetMin", formatNumberWithCommas(e.target.value))
              }
            />
            <Input
              label="Budget max (NGN)"
              type="text"
              name="budgetMax"
              value={form.budgetMax}
              error={errors.budgetMax}
              onChange={(e) =>
                update("budgetMax", formatNumberWithCommas(e.target.value))
              }
            />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Price frequency"
              name="priceFrequency"
              value={form.priceFrequency}
              onChange={(e) => update("priceFrequency", e.target.value)}
              options={priceFrequencyOptions}
              placeholder="Select frequency"
            />
            {!isLandSale && (
              <Select
                label={
                  isPropertyManagement
                    ? "When do you need management to start?"
                    : "Move-in timeframe"
                }
                name="moveInTimeframe"
                value={form.moveInTimeframe}
                onChange={(e) => update("moveInTimeframe", e.target.value)}
                options={moveInOptions}
                placeholder="Select timeframe"
              />
            )}
          </div>

          {form.category === "shortlet" && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <OptionalField
                label="Check-in date"
                type="date"
                value={form.checkInDate}
                onChange={(e) => update("checkInDate", e.target.value)}
              />
              <OptionalField
                label="Check-out date"
                type="date"
                value={form.checkOutDate}
                onChange={(e) => update("checkOutDate", e.target.value)}
              />
              <OptionalField
                label="Number of guests"
                type="number"
                min="0"
                value={form.numberOfGuests}
                onChange={(e) => update("numberOfGuests", e.target.value)}
              />
            </div>
          )}

          {form.category === "rental" && (
            <Select
              label="Lease duration preference"
              name="leaseDurationPreference"
              value={form.leaseDurationPreference}
              onChange={(e) => update("leaseDurationPreference", e.target.value)}
              options={leaseDurationOptions}
              placeholder="Select duration"
            />
          )}
        </div>
      );
    }

    if (step === 3) {
      const canAddPreferred = form.preferredState && form.preferredLga && form.preferredArea;
      const addPreferredLocation = () => {
        if (!canAddPreferred) return;
        const formatted = `${form.preferredArea}, ${form.preferredLga}, ${form.preferredState}`;
        if (!form.preferredLocations.includes(formatted)) {
          update("preferredLocations", [...form.preferredLocations, formatted]);
        }
        update("preferredState", "");
        update("preferredLga", "");
        update("preferredArea", "");
      };
      const removePreferredLocation = (location) => {
        update(
          "preferredLocations",
          form.preferredLocations.filter((item) => item !== location)
        );
      };

      return (
        <div className="space-y-6">
          <div>
            <p className="text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
              Present location
            </p>
            <LocationSelect
              state={form.presentState}
              lga={form.presentLga}
              area={form.presentArea}
              onStateChange={(value) => update("presentState", value)}
              onLgaChange={(value) => update("presentLga", value)}
              onAreaChange={(value) => update("presentArea", value)}
            />
            {errors.presentlocation && (
              <p className="mt-1 text-caption text-danger">{errors.presentlocation}</p>
            )}
          </div>

          <div>
            <p className="text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
              Preferred locations
            </p>
            <LocationSelect
              state={form.preferredState}
              lga={form.preferredLga}
              area={form.preferredArea}
              onStateChange={(value) => update("preferredState", value)}
              onLgaChange={(value) => update("preferredLga", value)}
              onAreaChange={(value) => update("preferredArea", value)}
              stateLabel="Preferred state"
              lgaLabel="Preferred LGA"
              areaLabel="Preferred area"
            />
            <button
              type="button"
              onClick={addPreferredLocation}
              disabled={!canAddPreferred}
              className="mt-3 text-caption font-medium text-brand-500 dark:text-brand-400 hover:text-brand-600 dark:hover:text-brand-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              + Add to preferred locations
            </button>

            {form.preferredLocations.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-2">
                {form.preferredLocations.map((location) => (
                  <span
                    key={location}
                    className="inline-flex items-center gap-2 rounded-full px-3 py-1 text-caption bg-ink-100 dark:bg-surface-700 text-ink-700 dark:text-slate-200"
                  >
                    {location}
                    <button
                      type="button"
                      onClick={() => removePreferredLocation(location)}
                      aria-label={`Remove ${location}`}
                      className="text-ink-500 dark:text-slate-400 hover:text-danger"
                    >
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>
      );
    }

    return (
      <div>
        <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
          Anything else agents should know?
        </label>
        <textarea
          className="w-full px-3 py-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-900 dark:text-white placeholder:text-ink-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[140px]"
          value={form.request}
          onChange={(e) => update("request", e.target.value)}
          placeholder="Eg. I am looking for a mini-flat at Oluyole..."
        />
      </div>
    );
  };

  const isLastStep = step === STEP_LABELS.length - 1;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-ink-900/60 dark:bg-black/70 backdrop-blur-sm"
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 10 }}
        transition={{ duration: 0.2 }}
        className="relative bg-white dark:bg-surface-900 rounded-2xl shadow-card w-full max-w-2xl max-h-[90vh] flex flex-col overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          type="button"
          onClick={onClose}
          aria-label="Close"
          className="absolute top-4 right-4 z-20 w-8 h-8 rounded-full bg-ink-100 dark:bg-surface-800 flex items-center justify-center text-ink-700 dark:text-slate-200 hover:bg-ink-200 dark:hover:bg-surface-700"
        >
          <FaTimes size={14} />
        </button>

        {status === "loading" || status === "unauthenticated" ? (
          <Spinner className="text-brand-400 p-16" />
        ) : (
          <>
            <div>
              <h1 className="text-lg font-semibold text-ink-900 dark:text-white px-5 sm:px-6 pt-5 pr-14">
                {listingId ? "Make an Inquiry" : "Make a Request"}
              </h1>
              <ProgressSteps current={step} completed={completed} />
            </div>

            <div className="relative flex-1 overflow-y-auto px-5 sm:px-6 py-6 text-sm">
              <AnimatePresence mode="wait" custom={direction}>
                <motion.div
                  key={step}
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.22, ease: "easeInOut" }}
                >
                  {renderStep()}
                </motion.div>
              </AnimatePresence>

              <AnimatePresence>
                {celebrating && (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-surface-900/90"
                  >
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      exit={{ scale: 0.6, opacity: 0 }}
                      transition={{ type: "spring", stiffness: 320, damping: 16 }}
                      className="w-16 h-16 rounded-full bg-success/10 flex items-center justify-center"
                    >
                      <FaCheck size={26} className="text-success" />
                    </motion.div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <div className="flex items-center justify-between px-5 sm:px-6 py-4 border-t border-ink-200 dark:border-surface-700">
              <Button
                type="button"
                variant="secondary"
                size="sm"
                onClick={goBack}
                disabled={step === 0}
                className={step === 0 ? "invisible" : ""}
              >
                Back
              </Button>
              {isLastStep ? (
                <Button type="button" size="sm" isLoading={isSubmitting} onClick={handleSubmit}>
                  Submit Request
                </Button>
              ) : (
                <Button type="button" size="sm" onClick={goNext}>
                  Next
                </Button>
              )}
            </div>
          </>
        )}
      </motion.div>
    </div>
  );
}

export default RequestWizardModal;
