import React, { useState } from "react";
import { toast } from "sonner";
import {
  useUsersQuery,
  useAdminsQuery,
  usePromoteUser,
  useDemoteAdmin,
} from "../hooks/index.js";
import { Table } from "../components/ui/Table.js";
import { Button } from "../components/ui/Button.js";
import { States } from "../components/ui/States.js";
import { Modal } from "../components/ui/Modal.js";

type TabType = "users" | "admins";

export const AdminPage = () => {
  const [activeTab, setActiveTab] = useState<TabType>("users");
  const [actionUserId, setActionUserId] = useState<string | null>(null);
  const [isConfirmOpen, setIsConfirmOpen] = useState(false);

  // Fetch lists with routing flags enabled
  const { data: users, isLoading: usersLoading, isError: usersError, error: userErr, refetch: refetchUsers } =
    useUsersQuery(true);
  const { data: admins, isLoading: adminsLoading, isError: adminsError, error: adminErr, refetch: refetchAdmins } =
    useAdminsQuery(true);

  const promoteMutation = usePromoteUser();
  const demoteMutation = useDemoteAdmin();

  const handleOpenConfirm = (id: string) => {
    setActionUserId(id);
    setIsConfirmOpen(true);
  };

  const handleActionConfirm = async () => {
    if (!actionUserId) return;
    try {
      if (activeTab === "users") {
        await promoteMutation.mutateAsync(actionUserId);
        toast.success("User successfully promoted to Admin.");
      } else {
        await demoteMutation.mutateAsync(actionUserId);
        toast.success("Admin successfully demoted to regular User.");
      }
      setIsConfirmOpen(false);
      setActionUserId(null);
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to modify user access level.");
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  const isLoading = usersLoading || adminsLoading;
  const isError = usersError || adminsError;
  const errMessage = userErr?.message || adminErr?.message;

  if (isError) {
    return (
      <States.ErrorState
        message={errMessage}
        onRetry={() => {
          refetchUsers();
          refetchAdmins();
        }}
      />
    );
  }

  const displayedList = activeTab === "users" ? users || [] : admins || [];

  return (
    <div className="space-y-6 select-none font-body">
      {/* Page Header */}
      <div>
        <h2 className="text-base font-bold text-navy uppercase tracking-wider">
          Admin Controls
        </h2>
        <p className="text-xs text-gray-500 font-body">
          Super Admin permissions: promote regular user accounts to Admin or demote panel managers.
        </p>
      </div>

      {/* Tabs Row */}
      <div className="flex border-b border-border text-xs uppercase tracking-wider font-semibold">
        <button
          onClick={() => setActiveTab("users")}
          className={`px-6 py-2.5 border-b-2 transition focus:outline-none ${
            activeTab === "users"
              ? "border-burgundy text-burgundy font-bold"
              : "border-transparent text-gray-400 hover:text-navy"
          }`}
        >
          Normal Users ({users?.length || 0})
        </button>
        <button
          onClick={() => setActiveTab("admins")}
          className={`px-6 py-2.5 border-b-2 transition focus:outline-none ${
            activeTab === "admins"
              ? "border-burgundy text-burgundy font-bold"
              : "border-transparent text-gray-400 hover:text-navy"
          }`}
        >
          Active Admins ({admins?.length || 0})
        </button>
      </div>

      {/* Main Table Content */}
      {!isLoading && displayedList.length === 0 ? (
        <States.EmptyState
          title={activeTab === "users" ? "No Normal Users" : "No Panel Admins"}
          description={
            activeTab === "users"
              ? "There are currently no regular user accounts registered in the database."
              : "There are currently no active administrators in the database."
          }
        />
      ) : (
        <Table
          headers={["ID Key", "Username", "Email Address", "Phone Number", "Registration Date", "Actions"]}
          isLoading={isLoading}
          responsiveCards={
            displayedList.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No users found.
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {displayedList.map((usr) => (
                  <div
                    key={usr.id}
                    className="bg-white border border-border p-4 rounded-lg flex flex-col gap-2.5 shadow-sm hover:border-gold transition-colors animate-fade-in"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-gray-400">
                        ID: {usr.id.substring(0, 8)}...
                      </span>
                      <span className="text-[9px] font-bold uppercase text-gold bg-sand px-1.5 py-0.5 rounded border border-border/30">
                        {activeTab === "users" ? "User" : "Admin"}
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-xs">{usr.userName}</h4>
                      <div className="text-[10px] text-gray-500 font-mono truncate">{usr.email}</div>
                      {usr.phone && (
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {usr.phone}
                        </div>
                      )}
                    </div>
                    <div className="text-[10px] text-gray-400 font-body">
                      Registered: {usr.createdAt ? formatDate(usr.createdAt) : "—"}
                    </div>
                    <div className="flex justify-end pt-2 border-t border-border/40">
                      <Button
                        onClick={() => handleOpenConfirm(usr.id)}
                        variant={activeTab === "users" ? "primary" : "danger"}
                        className="text-[10px] py-1 px-3 shadow"
                      >
                        {activeTab === "users" ? "Promote" : "Demote"}
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            )
          }
        >
          {displayedList.map((usr) => (
            <tr key={usr.id} className="hover:bg-sand/30 transition-colors">
              <td className="px-6 py-4.5 font-mono text-[10px] text-gray-400">{usr.id}</td>
              <td className="px-6 py-4.5 font-semibold text-navy">{usr.userName}</td>
              <td className="px-6 py-4.5 text-gray-600 font-mono">{usr.email}</td>
              <td className="px-6 py-4.5 text-gray-600 font-mono">{usr.phone || "—"}</td>
              <td className="px-6 py-4.5 text-gray-500">{usr.createdAt ? formatDate(usr.createdAt) : "—"}</td>
              <td className="px-6 py-4.5">
                <Button
                  onClick={() => handleOpenConfirm(usr.id)}
                  variant={activeTab === "users" ? "primary" : "danger"}
                  className="text-[10px] py-1.5 px-3.5 shadow"
                >
                  {activeTab === "users" ? "Promote" : "Demote"}
                </Button>
              </td>
            </tr>
          ))}
        </Table>
      )}

      {/* CONFIRMATION DIALOG MODAL */}
      <Modal
        isOpen={isConfirmOpen}
        onClose={() => setIsConfirmOpen(false)}
        title={activeTab === "users" ? "Confirm User Promotion" : "Confirm Admin Demotion"}
        description={
          activeTab === "users"
            ? "Are you sure you want to promote this user? They will receive full Admin access privileges to modify directory records, profile files, and contact settings."
            : "Are you sure you want to demote this Admin? They will immediately lose access to the Admin Dashboard."
        }
      >
        <div className="flex items-center justify-end gap-3 pt-4 select-none">
          <Button variant="ghost" onClick={() => setIsConfirmOpen(false)}>
            Cancel
          </Button>
          <Button
            variant={activeTab === "users" ? "primary" : "danger"}
            onClick={handleActionConfirm}
            isLoading={promoteMutation.isPending || demoteMutation.isPending}
          >
            Confirm Action
          </Button>
        </div>
      </Modal>
    </div>
  );
};

export default AdminPage;
