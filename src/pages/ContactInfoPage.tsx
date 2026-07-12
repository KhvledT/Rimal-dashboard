import React, { useEffect, useState } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import { useContactInfoQuery, useUpdateContactInfo } from "../hooks/index.js";
import { contactInfoSchema, ContactInfoInput } from "../schemas/validation.js";
import { Button } from "../components/ui/Button.js";
import { States } from "../components/ui/States.js";

export const ContactInfoPage = () => {
  const {
    data: contactInfo,
    isLoading,
    isError,
    error,
    refetch,
  } = useContactInfoQuery();
  const updateMutation = useUpdateContactInfo();

  const [mapLoading, setMapLoading] = useState(false);
  const [mapSrc, setMapSrc] = useState("");

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ContactInfoInput>({
    resolver: zodResolver(contactInfoSchema),
    defaultValues: {
      address: "",
      emails: [""],
      phones: [""],
      linkedIn: "",
      mapUrl: "",
    },
  });

  // Use react-hook-form field arrays to support dynamic fields
  const emailsArray = useFieldArray({
    control,
    name: "emails" as never,
  });

  const phonesArray = useFieldArray({
    control,
    name: "phones" as never,
  });

  // Populate data when loaded
  useEffect(() => {
    if (contactInfo) {
      setValue("address", contactInfo.address || "");
      setValue("linkedIn", contactInfo.linkedIn || "");
      setValue("mapUrl", contactInfo.mapUrl || "");
      setMapSrc(contactInfo.mapUrl || "");

      // Handle array formatting
      if (contactInfo.emails && contactInfo.emails.length > 0) {
        setValue("emails", contactInfo.emails);
      } else {
        setValue("emails", [""]);
      }

      if (contactInfo.phones && contactInfo.phones.length > 0) {
        setValue("phones", contactInfo.phones);
      } else {
        setValue("phones", [""]);
      }
    }
  }, [contactInfo, setValue]);

  // Watch the mapUrl input to dynamically update preview iframe
  const watchedMapUrl = watch("mapUrl");

  const handlePreviewMap = () => {
    if (watchedMapUrl && watchedMapUrl.startsWith("http")) {
      setMapLoading(true);
      setMapSrc(watchedMapUrl);
    } else {
      toast.error("Please enter a valid Google Maps HTTP link.");
    }
  };

  const onFormSubmit = async (data: ContactInfoInput) => {
    try {
      await updateMutation.mutateAsync(data);
      toast.success("Contact information updated successfully.");
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || "Failed to update contact info details.");
    }
  };

  // Convert watched arrays to strings for standard typing checks
  const currentEmails = watch("emails") as unknown as string[];
  const currentPhones = watch("phones") as unknown as string[];

  if (isLoading) {
    return <States.LoadingState message="Fetching company contact data..." />;
  }

  // Handle case where contact info is empty or not upserted yet (backend might return 404 or empty success)
  const isNoData =
    isError && (error as { status?: number } | null)?.status === 404;

  if (isError && !isNoData) {
    return <States.ErrorState message={error?.message} onRetry={refetch} />;
  }

  return (
    <div className="space-y-6 select-none font-body max-w-5xl">
      <div>
        <h2 className="text-base font-bold text-navy uppercase tracking-wider">
          Company Contact Info
        </h2>
        <p className="text-xs text-gray-500 font-body">
          Update the physical address, telephones, email addresses, LinkedIn
          profile link, and embedded office map location.
        </p>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)}>
        <fieldset disabled={updateMutation.isPending} className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Form Inputs Panel */}
          <div className="bg-white rounded border border-border p-6 shadow-sm space-y-5">
            <h3 className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2">
              Details Form
            </h3>

            {/* Physical Address */}
            <div>
              <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                Office Address <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Marina Twin Towers, Lusail, Doha, Qatar"
                {...register("address")}
                className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
              />
              {errors.address && (
                <p className="text-[10px] text-red-600 font-medium mt-1">
                  {errors.address.message}
                </p>
              )}
            </div>

            {/* Dynamic Email Fields */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider">
                  Corporate Emails <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => emailsArray.append("")}
                  className="text-[10px] text-gold hover:text-gold-light uppercase font-semibold flex items-center gap-0.5 focus:outline-none"
                >
                  + Add Email
                </button>
              </div>

              <div className="space-y-2">
                {emailsArray.fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input
                      type="email"
                      placeholder="info@rimal.com"
                      {...register(`emails.${idx}` as never)}
                      className="flex-1 bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                    />
                    {currentEmails && currentEmails.length > 1 && (
                      <button
                        type="button"
                        onClick={() => emailsArray.remove(idx)}
                        className="text-gray-400 hover:text-red-600 p-1 bg-sand hover:bg-red-50 rounded transition"
                        title="Remove field"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.emails && (
                <p className="text-[10px] text-red-600 font-medium mt-1">
                  {errors.emails.message}
                </p>
              )}
            </div>

            {/* Dynamic Telephone Fields */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider">
                  Telephone Numbers <span className="text-red-500">*</span>
                </label>
                <button
                  type="button"
                  onClick={() => phonesArray.append("")}
                  className="text-[10px] text-gold hover:text-gold-light uppercase font-semibold flex items-center gap-0.5 focus:outline-none"
                >
                  + Add Phone
                </button>
              </div>

              <div className="space-y-2">
                {phonesArray.fields.map((field, idx) => (
                  <div key={field.id} className="flex gap-2 items-center">
                    <input
                      type="text"
                      placeholder="+974 4400 1234"
                      {...register(`phones.${idx}` as never)}
                      className="flex-1 bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                    />
                    {currentPhones && currentPhones.length > 1 && (
                      <button
                        type="button"
                        onClick={() => phonesArray.remove(idx)}
                        className="text-gray-400 hover:text-red-600 p-1 bg-sand hover:bg-red-50 rounded transition"
                        title="Remove field"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2.5"
                          stroke="currentColor"
                          className="w-4 h-4"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M5 12h14"
                          />
                        </svg>
                      </button>
                    )}
                  </div>
                ))}
              </div>
              {errors.phones && (
                <p className="text-[10px] text-red-600 font-medium mt-1">
                  {errors.phones.message}
                </p>
              )}
            </div>

            {/* LinkedIn Profile */}
            <div>
              <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                LinkedIn Company URL
              </label>
              <input
                type="text"
                placeholder="https://linkedin.com/company/rimal-group"
                {...register("linkedIn")}
                className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
              />
              {errors.linkedIn && (
                <p className="text-[10px] text-red-600 font-medium mt-1">
                  {errors.linkedIn.message}
                </p>
              )}
            </div>

            {/* Google Maps Embed URL */}
            <div>
              <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                Google Maps Embed Link
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  placeholder="https://www.google.com/maps/embed?pb=..."
                  {...register("mapUrl")}
                  className="flex-1 bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
                />
                <button
                  type="button"
                  onClick={handlePreviewMap}
                  className="bg-navy hover:bg-navy-deep text-white px-3 py-2 rounded text-xs transition shadow-sm font-semibold uppercase tracking-wider focus:outline-none"
                >
                  Sync
                </button>
              </div>
              <p className="text-[10px] text-gray-400 font-body mt-1">
                Ensure you copy the <strong>src</strong> attribute of Google Maps
                share iframe tag.
              </p>
              {errors.mapUrl && (
                <p className="text-[10px] text-red-600 font-medium mt-1">
                  {errors.mapUrl.message}
                </p>
              )}
            </div>

            <div className="flex justify-end pt-3">
              <Button
                type="submit"
                isLoading={updateMutation.isPending}
                className="px-6 py-2.5 uppercase font-semibold text-xs shadow"
              >
                Update Settings
              </Button>
            </div>
          </div>

        {/* Map Preview Panel */}
        <div className="bg-white rounded border border-border p-6 shadow-sm flex flex-col min-h-[400px]">
          <h3 className="text-xs font-semibold text-navy uppercase tracking-wider border-b border-border pb-2 mb-4">
            Office Map Location Preview
          </h3>

          <div className="flex-1 bg-sand border border-border rounded relative overflow-hidden flex items-center justify-center min-h-[300px]">
            {mapLoading && (
              <div className="absolute inset-0 bg-white/70 flex flex-col items-center justify-center z-10">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-gold mb-3"></div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-wider">
                  Loading Map Frame...
                </p>
              </div>
            )}

            {mapSrc ? (
              <iframe
                title="Office Location Map Preview"
                src={mapSrc}
                width="100%"
                height="100%"
                style={{ border: 0 }}
                allowFullScreen
                loading="lazy"
                referrerPolicy="no-referrer-when-downgrade"
                onLoad={() => setMapLoading(false)}
                className="w-full h-full min-h-[300px]"
              ></iframe>
            ) : (
              <p className="text-xs text-gray-400 font-body">
                Input embed URL to render Google Maps frame.
              </p>
            )}
          </div>
        </div>
      </fieldset>
    </form>
    </div>
  );
};

export default ContactInfoPage;
