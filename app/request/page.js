"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import toast from "react-hot-toast";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Container from "@/components/ui/Container";
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
} from "@/constants/request";

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
  parkingSpaces: "",
  householdSize: "",
  budgetMin: "",
  budgetMax: "",
  priceFrequency: "",
  moveInTimeframe: "",
  checkInDate: "",
  checkOutDate: "",
  numberOfGuests: "",
  leaseDurationPreference: "",
  presentlocation: "",
  preferredLocations: "",
  request: "",
};

// components/Input.jsx hardcodes the native `required` attribute, which is
// right for auth forms but would block submitting a request that
// intentionally leaves these blank (they aren't required by
// model/UserRequest.js). Mirrors the OptionalField helper in
// components/admin/ListingForm.jsx.
function OptionalField({ label, helperText, ...props }) {
  return (
    <div className="w-full">
      <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-1">
        {label}
      </label>
      <input
        className="w-full px-3 py-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-900 dark:text-white placeholder:text-ink-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400"
        {...props}
      />
      {helperText && (
        <p className="mt-1 text-caption text-ink-500 dark:text-slate-400">
          {helperText}
        </p>
      )}
    </div>
  );
}

function RequestForm() {
  const { data: session } = useSession();
  const router = useRouter();
  // RequestForm only mounts once RequestPageContent has confirmed
  // status === "authenticated", so session is already populated here --
  // a lazy initializer prefills without needing a setState-in-effect.
  const [form, setForm] = useState(() => ({
    ...emptyForm,
    fullname: session?.user?.name || session?.user?.username || "",
    email: session?.user?.email || "",
  }));
  const [amenities, setAmenities] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const update = (field, value) => setForm((f) => ({ ...f, [field]: value }));

  const toggleAmenity = (amenity) => {
    setAmenities((prev) =>
      prev.includes(amenity)
        ? prev.filter((item) => item !== amenity)
        : [...prev, amenity]
    );
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
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
        parkingSpaces:
          form.parkingSpaces === "" ? undefined : Number(form.parkingSpaces),
        amenities,
        householdSize:
          form.householdSize === "" ? undefined : Number(form.householdSize),
        budgetMin: form.budgetMin === "" ? undefined : Number(form.budgetMin),
        budgetMax: form.budgetMax === "" ? undefined : Number(form.budgetMax),
        priceFrequency: form.priceFrequency,
        moveInTimeframe: form.moveInTimeframe,
        presentlocation: form.presentlocation,
        preferredLocations: form.preferredLocations
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        request: form.request,
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
      router.push(`/my-requests/${data._id}`);
    } catch (error) {
      toast.error("Something went wrong, please try again");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-3xl mx-auto">
      <div>
        <h1 className="text-h1 text-ink-900 dark:text-white">Make a Request</h1>
        <p className="mt-2 text-body text-ink-500 dark:text-slate-400">
          Tell us what you&apos;re looking for and agents will send you offers
          you can compare and choose from.
        </p>
      </div>

      <Card className="p-4 sm:p-6 space-y-4">
        <h2 className="text-h2 text-ink-900 dark:text-white">Your details</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Full name"
            name="fullname"
            value={form.fullname}
            onChange={(e) => update("fullname", e.target.value)}
          />
          <Input
            label="Email"
            type="email"
            name="email"
            value={form.email}
            onChange={(e) => update("email", e.target.value)}
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Phone number"
            name="phonenumber"
            value={form.phonenumber}
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
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <h2 className="text-h2 text-ink-900 dark:text-white">
          What you&apos;re looking for
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Select
            label="Category"
            name="category"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
            options={categoryOptions}
            placeholder="Select category"
          />
          <Select
            label="Type of apartment"
            name="type"
            value={form.type}
            onChange={(e) => update("type", e.target.value)}
            options={typeOptions}
            placeholder="Select type"
          />
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
          <Select
            label="Bedrooms"
            name="bedrooms"
            value={form.bedrooms}
            onChange={(e) => update("bedrooms", e.target.value)}
            options={bedroomOptions}
            placeholder="Select"
          />
          <OptionalField
            label="Bathrooms"
            type="number"
            min="0"
            value={form.bathrooms}
            onChange={(e) => update("bathrooms", e.target.value)}
          />
          <Select
            label="Furnishing"
            name="furnishing"
            value={form.furnishing}
            onChange={(e) => update("furnishing", e.target.value)}
            options={furnishingOptions}
            placeholder="Select"
          />
          <OptionalField
            label="Parking spaces"
            type="number"
            min="0"
            value={form.parkingSpaces}
            onChange={(e) => update("parkingSpaces", e.target.value)}
          />
        </div>
        <OptionalField
          label="Household size"
          type="number"
          min="0"
          value={form.householdSize}
          onChange={(e) => update("householdSize", e.target.value)}
        />
        <div>
          <label className="block text-sm font-medium text-ink-700 dark:text-slate-200 mb-2">
            Amenities
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2">
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
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <h2 className="text-h2 text-ink-900 dark:text-white">
          Budget &amp; timing
        </h2>
        <div className="grid grid-cols-2 gap-3">
          <Input
            label="Budget min (NGN)"
            type="number"
            name="budgetMin"
            value={form.budgetMin}
            onChange={(e) => update("budgetMin", e.target.value)}
          />
          <Input
            label="Budget max (NGN)"
            type="number"
            name="budgetMax"
            value={form.budgetMax}
            onChange={(e) => update("budgetMax", e.target.value)}
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
          <Select
            label="Move-in timeframe"
            name="moveInTimeframe"
            value={form.moveInTimeframe}
            onChange={(e) => update("moveInTimeframe", e.target.value)}
            options={moveInOptions}
            placeholder="Select timeframe"
          />
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
          <OptionalField
            label="Lease duration preference"
            placeholder="e.g. 1 year"
            value={form.leaseDurationPreference}
            onChange={(e) => update("leaseDurationPreference", e.target.value)}
          />
        )}
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <h2 className="text-h2 text-ink-900 dark:text-white">Location</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Input
            label="Present location"
            name="presentlocation"
            value={form.presentlocation}
            onChange={(e) => update("presentlocation", e.target.value)}
          />
          <OptionalField
            label="Preferred locations"
            helperText="separate multiple areas with commas"
            value={form.preferredLocations}
            onChange={(e) => update("preferredLocations", e.target.value)}
          />
        </div>
      </Card>

      <Card className="p-4 sm:p-6 space-y-4">
        <h2 className="text-h2 text-ink-900 dark:text-white">Anything else</h2>
        <textarea
          className="w-full px-3 py-2 rounded-md border border-ink-300 dark:border-surface-700 bg-white dark:bg-surface-800 text-ink-900 dark:text-white placeholder:text-ink-500 dark:placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-brand-400 min-h-[120px]"
          value={form.request}
          onChange={(e) => update("request", e.target.value)}
          placeholder="Eg. I am looking for a mini-flat at Oluyole..."
        />
      </Card>

      <div className="flex justify-end gap-3">
        <Button type="submit" isLoading={isSubmitting}>
          Submit Request
        </Button>
      </div>
    </form>
  );
}

function SignInPrompt() {
  return (
    <Card className="max-w-md mx-auto p-6 sm:p-8 text-center space-y-4">
      <h1 className="text-h1 text-ink-900 dark:text-white">
        Sign in to submit a request
      </h1>
      <p className="text-body text-ink-500 dark:text-slate-400">
        Signing in ties your request to your account so you can track offers
        from agents and compare them, all in one place.
      </p>
      <div className="flex flex-col sm:flex-row justify-center gap-3">
        <Link href="/login?callbackUrl=/request">
          <Button variant="primary" className="w-full sm:w-auto">
            Sign In
          </Button>
        </Link>
        <Link href="/register?callbackUrl=/request">
          <Button variant="secondary" className="w-full sm:w-auto">
            Create an account
          </Button>
        </Link>
      </div>
    </Card>
  );
}

function RequestPageContent() {
  const { status } = useSession();

  if (status === "loading") {
    return (
      <div className="flex items-center justify-center py-24">
        <p className="text-ink-500 dark:text-slate-400">Loading...</p>
      </div>
    );
  }

  if (status === "unauthenticated") {
    return (
      <div className="py-16">
        <SignInPrompt />
      </div>
    );
  }

  return (
    <div className="py-10">
      <RequestForm />
    </div>
  );
}

export default function RequestPage() {
  return (
    <main className="w-full bg-white dark:bg-surface-900">
      <Header />
      <Container>
        <RequestPageContent />
      </Container>
      <Footer />
    </main>
  );
}
