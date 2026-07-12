import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import {
  useTeamQuery,
  useCreateTeamMember,
  useUpdateTeamMember,
  useDeleteTeamMember,
} from "../hooks/index.js";
import { teamMemberSchema, TeamMemberInput } from "../schemas/validation.js";
import { Table } from "../components/ui/Table.js";
import { Modal } from "../components/ui/Modal.js";
import { Button } from "../components/ui/Button.js";
import { States } from "../components/ui/States.js";
import type { TeamMember } from "../services/team.service.js";

export const TeamPage = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5;

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingMember, setEditingMember] = useState<TeamMember | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const [selectedPhoto, setSelectedPhoto] = useState<File | null>(null);

  const { data: team, isLoading, isError, error, refetch } = useTeamQuery();
  const createMutation = useCreateTeamMember();
  const deleteMutation = useDeleteTeamMember();

  const {
    register,
    handleSubmit,
    setValue,
    reset,
    formState: { errors },
  } = useForm<TeamMemberInput>({
    resolver: zodResolver(teamMemberSchema),
  });

  // Handle Create or Edit trigger
  const handleOpenForm = (member?: TeamMember) => {
    setSelectedPhoto(null);
    if (member) {
      setEditingMember(member);
      setValue("name", member.name);
      setValue("role", member.role);
      setValue("department", member.department);
      setValue("email", member.email || "");
      setValue("linkedin", member.linkedin || "");
      setValue("description", member.description);
      setValue("expertise", member.expertise || []);
    } else {
      setEditingMember(null);
      reset({
        name: "",
        role: "",
        department: "",
        email: "",
        linkedin: "",
        description: "",
        expertise: [],
      });
    }
    setIsFormOpen(true);
  };

  // Specific custom wrapper to invoke update mutations dynamically
  const updateMutation = useUpdateTeamMember(editingMember?._id || "");

  const onFormSubmit = async (data: TeamMemberInput) => {
    try {
      const formData = new FormData();
      formData.append("name", data.name);
      formData.append("role", data.role);
      formData.append("department", data.department);
      formData.append("email", data.email || "");
      formData.append("linkedin", data.linkedin || "");
      formData.append("description", data.description);

      // Append expertise array keys correctly (expertise[0], expertise[1])
      data.expertise.forEach((item, index) => {
        formData.append(`expertise[${index}]`, item.trim());
      });

      if (selectedPhoto) {
        formData.append("photo", selectedPhoto);
      }

      if (editingMember) {
        await updateMutation.mutateAsync(formData);
        toast.success("Team member updated successfully.");
      } else {
        await createMutation.mutateAsync(formData);
        toast.success("Team member created successfully.");
      }
      setIsFormOpen(false);
      reset();
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || "Failed to save team member data.");
    }
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success("Team member deleted successfully.");
      setIsDeleteOpen(false);
      setDeletingId(null);
    } catch (err: unknown) {
      const errorObj = err as { message?: string };
      toast.error(errorObj.message || "Failed to delete team member.");
    }
  };

  // Search filter
  const filteredTeam = (team || []).filter((m) => {
    const s = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(s) ||
      m.role.toLowerCase().includes(s) ||
      m.department.toLowerCase().includes(s)
    );
  });

  // Pagination logic
  const totalPages = Math.ceil(filteredTeam.length / itemsPerPage);
  const displayedTeam = filteredTeam.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedPhoto(e.target.files[0]);
    }
  };

  if (isError) {
    return <States.ErrorState message={error?.message} onRetry={refetch} />;
  }

  const isDirectoryEmpty = !isLoading && filteredTeam.length === 0 && searchTerm === "";

  return (
    <div className="space-y-6 select-none font-body">
      {/* Header Info Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-navy uppercase tracking-wider">
            Team Management
          </h2>
          <p className="text-xs text-gray-500 font-body">
            Create, update, and manage company leadership profiles.
          </p>
        </div>
        <Button
          onClick={() => handleOpenForm()}
          className="text-xs font-semibold py-2 px-2 shadow uppercase"
        >
          Add Team Member
        </Button>
      </div>

      {/* Main Table view */}
      {isDirectoryEmpty ? (
        <States.EmptyState
          title="Empty Directory"
          description="There are currently no team members in the system database."
          actionLabel="Add Member Now"
          onActionClick={() => handleOpenForm()}
        />
      ) : (
        <Table
          headers={["Photo", "Name", "Role / Department", "Email Address", "Expertise", "Actions"]}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          searchTerm={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          searchPlaceholder="Search by name, role or department..."
          isLoading={isLoading}
          responsiveCards={
            displayedTeam.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No matching team members found.
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {displayedTeam.map((member) => (
                  <div
                    key={member._id}
                    className="bg-white border border-border p-4 rounded shadow-sm hover:border-gold transition-colors flex flex-col gap-3"
                  >
                    <div className="flex items-center gap-3">
                      {member.photo ? (
                        <img
                          src={member.photo}
                          alt={member.name}
                          className="w-12 h-12 rounded-full object-cover border border-border bg-white shadow-sm"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-full bg-burgundy/10 text-burgundy font-bold flex items-center justify-center text-xs border border-border shadow-sm flex-shrink-0">
                          {member.name.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                      <div className="min-w-0">
                        <h4 className="font-bold text-navy text-xs truncate">{member.name}</h4>
                        <div className="text-[11px] text-gray-500 font-medium truncate">{member.role}</div>
                        <div className="text-[9px] text-gray-400 uppercase tracking-widest font-semibold mt-0.5">
                          {member.department}
                        </div>
                      </div>
                    </div>

                    {member.email && (
                      <div className="text-[11px] flex items-center gap-1.5 text-gray-600 bg-sand/30 p-1.5 rounded border border-border/30">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          fill="none"
                          viewBox="0 0 24 24"
                          strokeWidth="2"
                          stroke="currentColor"
                          className="w-3.5 h-3.5 text-gray-400"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                          />
                        </svg>
                        <span className="font-mono text-[10px] truncate">{member.email}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {(member.expertise || []).map((exp, i) => (
                        <span
                          key={i}
                          className="bg-sand text-gold border border-border text-[8px] px-1.5 py-0.5 rounded uppercase font-semibold"
                        >
                          {exp}
                        </span>
                      ))}
                    </div>

                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                      <button
                        onClick={() => handleOpenForm(member)}
                        className="text-[10px] py-1 px-3 rounded font-semibold bg-sand text-navy hover:text-gold transition border border-border"
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleOpenDelete(member._id)}
                        className="text-[10px] py-1 px-3 rounded font-semibold bg-red-50 text-red-700 hover:bg-red-100 transition border border-red-100"
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        >
          {displayedTeam.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">
                No matching team members found.
              </td>
            </tr>
          ) : (
            displayedTeam.map((member) => (
              <tr key={member._id} className="hover:bg-sand/30 transition-colors">
                <td className="px-6 py-4.5">
                  {member.photo ? (
                    <img
                      src={member.photo}
                      alt={member.name}
                      className="w-10 h-10 rounded-full object-cover border border-border bg-white shadow-sm"
                    />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-burgundy/10 text-burgundy font-bold flex items-center justify-center text-xs border border-border shadow-sm">
                      {member.name.substring(0, 2).toUpperCase()}
                    </div>
                  )}
                </td>
                <td className="px-6 py-4.5 font-semibold text-navy">{member.name}</td>
                <td className="px-6 py-4.5">
                  <div className="font-semibold text-navy">{member.role}</div>
                  <div className="text-[10px] text-gray-400 font-body uppercase mt-0.5">
                    {member.department}
                  </div>
                </td>
                <td className="px-6 py-4.5 text-gray-600 font-mono">{member.email || "—"}</td>
                <td className="px-6 py-4.5">
                  <div className="flex flex-wrap gap-1 max-w-xs">
                    {(member.expertise || []).map((exp, i) => (
                      <span
                        key={i}
                        className="bg-sand text-gold border border-border text-[9px] px-1.5 py-0.5 rounded uppercase font-semibold font-body"
                      >
                        {exp}
                      </span>
                    ))}
                  </div>
                </td>
                <td className="px-6 py-4.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenForm(member)}
                      className="p-1 hover:bg-sand text-navy hover:text-gold transition rounded focus:outline-none focus:ring-1 focus:ring-burgundy"
                      title="Edit Member"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m16.862 4.487 1.687-1.688a1.875 1.875 0 1 1 2.652 2.652L6.83 20.013a4.5 4.5 0 0 1-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 0 1 1.13-1.897l8.932-8.931Zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0 1 15.75 21H5.25A2.25 2.25 0 0 1 3 18.75V8.25A2.25 2.25 0 0 1 5.25 6H10"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenDelete(member._id)}
                      className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 transition rounded focus:outline-none focus:ring-1 focus:ring-burgundy"
                      title="Delete Member"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth="2"
                        stroke="currentColor"
                        className="w-4 h-4"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0"
                        />
                      </svg>
                    </button>
                  </div>
                </td>
              </tr>
            ))
          )}
        </Table>
      )}

      {/* CREATE & EDIT FORM DIALOG MODAL */}
      <Modal
        isOpen={isFormOpen}
        onClose={() => setIsFormOpen(false)}
        title={editingMember ? "Edit Team Member" : "Add Team Member"}
        description={
          editingMember
            ? "Modify the selected member profile details below."
            : "Register a new member in the corporate directory."
        }
      >
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4 pt-2">
          {/* File Upload Row */}
          <div>
            <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
              Profile Picture
            </label>
            <div className="flex items-center gap-4 bg-sand/30 p-3 rounded border border-border">
              <div className="w-12 h-12 rounded-full bg-sand border border-border overflow-hidden flex items-center justify-center text-gold flex-shrink-0 shadow-inner">
                {selectedPhoto ? (
                  <img
                    src={URL.createObjectURL(selectedPhoto)}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                ) : editingMember?.photo ? (
                  <img
                    src={editingMember.photo}
                    alt={editingMember.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="1.5" stroke="currentColor" className="w-6 h-6 text-gray-400">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 1 1-7.5 0 3.75 3.75 0 0 1 7.5 0ZM4.501 20.118a7.5 7.5 0 0 1 14.998 0A17.933 17.933 0 0 1 12 21.75c-2.676 0-5.216-.584-7.499-1.632Z" />
                  </svg>
                )}
              </div>
              <input
                type="file"
                accept="image/*"
                onChange={handlePhotoSelect}
                className="w-full text-xs font-body text-gray-500 file:mr-4 file:py-1.5 file:px-3 file:rounded file:border file:border-gold file:bg-white file:text-gold file:text-[10px] file:uppercase file:font-bold hover:file:bg-gold hover:file:text-white file:transition cursor-pointer focus:outline-none"
              />
            </div>
            {editingMember?.photo && !selectedPhoto && (
              <p className="text-[10px] text-gray-400 mt-1 pl-1">
                Currently:{" "}
                <a
                  href={editingMember.photo}
                  target="_blank"
                  rel="noreferrer"
                  className="text-gold hover:underline"
                >
                  view photo URL
                </a>
              </p>
            )}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                Full Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Hamad Al-Thani"
                {...register("name")}
                className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
              />
              {errors.name && (
                <p className="text-[10px] text-red-600 font-medium mt-1">{errors.name.message}</p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                Role / Title <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Founder & CEO"
                {...register("role")}
                className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
              />
              {errors.role && (
                <p className="text-[10px] text-red-600 font-medium mt-1">{errors.role.message}</p>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                Department <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                placeholder="Executive Office"
                {...register("department")}
                className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
              />
              {errors.department && (
                <p className="text-[10px] text-red-600 font-medium mt-1">
                  {errors.department.message}
                </p>
              )}
            </div>

            <div>
              <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                placeholder="ceo@rimal.com"
                {...register("email")}
                className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
              />
              {errors.email && (
                <p className="text-[10px] text-red-600 font-medium mt-1">{errors.email.message}</p>
              )}
            </div>
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
              LinkedIn Profile URL
            </label>
            <input
              type="text"
              placeholder="https://linkedin.com/in/..."
              {...register("linkedin")}
              className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
            />
            {errors.linkedin && (
              <p className="text-[10px] text-red-600 font-medium mt-1">{errors.linkedin.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
              Expertise Tags (Comma-separated) <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              placeholder="Sovereign Investments, GCC Operations"
              defaultValue={editingMember?.expertise.join(", ") || ""}
              onChange={(e) => {
                const tags = e.target.value.split(",").map(t => t.trim()).filter((tag) => tag !== "");
                setValue("expertise", tags);
              }}
              className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy"
            />
            {errors.expertise && (
              <p className="text-[10px] text-red-600 font-medium mt-1">{errors.expertise.message}</p>
            )}
          </div>

          <div>
            <label className="block text-[11px] font-semibold text-navy uppercase tracking-wider mb-1.5">
              Biography Description <span className="text-red-500">*</span>
            </label>
            <textarea
              placeholder="Enter brief biographical details..."
              rows={3}
              {...register("description")}
              className="w-full bg-sand border border-border rounded py-2 px-3 text-xs font-body focus:outline-none focus:ring-1 focus:ring-burgundy focus:border-burgundy resize-none"
            />
            {errors.description && (
              <p className="text-[10px] text-red-600 font-medium mt-1">
                {errors.description.message}
              </p>
            )}
          </div>

          <div className="flex items-center justify-end gap-3 pt-2">
            <Button type="button" variant="ghost" onClick={() => setIsFormOpen(false)}>
              Cancel
            </Button>
            <Button
              type="submit"
              isLoading={createMutation.isPending || updateMutation.isPending}
            >
              {editingMember ? "Update Member" : "Add Member"}
            </Button>
          </div>
        </form>
      </Modal>

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Confirm Member Deletion"
        description="This action cannot be undone. The selected profile will be permanently deleted from the directory."
      >
        <div className="flex items-center justify-end gap-3 pt-4 select-none">
          <Button variant="ghost" onClick={() => setIsDeleteOpen(false)}>
            Cancel
          </Button>
          <Button
            variant="danger"
            onClick={onDeleteConfirm}
            isLoading={deleteMutation.isPending}
          >
            Confirm Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default TeamPage;
