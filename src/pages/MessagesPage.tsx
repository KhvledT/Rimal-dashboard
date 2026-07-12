import React, { useState } from "react";
import { toast } from "sonner";
import { useContactMessagesQuery, useDeleteContactMessage } from "../hooks/index.js";
import { Table } from "../components/ui/Table.js";
import { Modal } from "../components/ui/Modal.js";
import { Button } from "../components/ui/Button.js";
import { States } from "../components/ui/States.js";
import type { ContactMessage } from "../services/contact.service.js";

export const MessagesPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const [searchTerm, setSearchTerm] = useState("");
  const itemsPerPage = 8;

  const [activeMessage, setActiveMessage] = useState<ContactMessage | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const { data: messagesResponse, isLoading, isError, error, refetch } =
    useContactMessagesQuery(currentPage, itemsPerPage);

  const deleteMutation = useDeleteContactMessage();

  const handleOpenDetail = (message: ContactMessage) => {
    setActiveMessage(message);
  };

  const handleOpenDelete = (id: string) => {
    setDeletingId(id);
    setIsDeleteOpen(true);
  };

  const onDeleteConfirm = async () => {
    if (!deletingId) return;
    try {
      await deleteMutation.mutateAsync(deletingId);
      toast.success("Visitor message inquiry deleted successfully.");
      setIsDeleteOpen(false);
      setDeletingId(null);
      // Adjust page index if list drops below current pagination boundaries
      if (
        messagesResponse &&
        messagesResponse.data.length === 1 &&
        currentPage > 1
      ) {
        setCurrentPage((prev) => prev - 1);
      }
    } catch (err: unknown) {
      const error = err as { message?: string };
      toast.error(error.message || "Failed to delete message record.");
    }
  };

  const formatDate = (dateStr: string): string => {
    if (!dateStr) return "—";
    return new Date(dateStr).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  };

  // Truncate message text helper
  const truncateText = (text: string, len = 60): string => {
    if (!text) return "";
    return text.length > len ? text.substring(0, len) + "..." : text;
  };

  if (isError) {
    return <States.ErrorState message={error?.message} onRetry={refetch} />;
  }

  const messages = messagesResponse?.data || [];
  const totalPages = messagesResponse?.totalPages || 1;
  const isInboxEmpty = !isLoading && messages.length === 0 && searchTerm === "";

  // Filter messages dynamically on client if search is applied
  const filteredMessages = messages.filter((m) => {
    const s = searchTerm.toLowerCase();
    return (
      m.name.toLowerCase().includes(s) ||
      m.email.toLowerCase().includes(s) ||
      m.message.toLowerCase().includes(s)
    );
  });

  return (
    <div className="space-y-6 select-none font-body">
      <div>
        <h2 className="text-base font-bold text-navy uppercase tracking-wider">
          Visitor Inquiries
        </h2>
        <p className="text-xs text-gray-500 font-body">
          Review and process contact messages submitted from the public site contact forms.
        </p>
      </div>

      {isInboxEmpty ? (
        <States.EmptyState
          title="Inbox Clear"
          description="There are currently no visitor messages in the queue database."
        />
      ) : (
        <Table
          headers={["Date Received", "Sender Name", "Email Address", "Phone Number", "Message Text", "Actions"]}
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          searchTerm={searchTerm}
          onSearchChange={(v) => {
            setSearchTerm(v);
            setCurrentPage(1);
          }}
          searchPlaceholder="Filter inbox by sender name, email or keyword..."
          isLoading={isLoading}
          responsiveCards={
            filteredMessages.length === 0 ? (
              <div className="text-center py-8 text-gray-400 text-xs">
                No matching messages found.
              </div>
            ) : (
              <div className="space-y-4 animate-fade-in">
                {filteredMessages.map((msg) => (
                  <div
                    key={msg._id}
                    className="bg-white border border-border p-4 rounded-lg flex flex-col gap-2.5 shadow-sm hover:border-gold transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-[9px] text-gray-400">
                        {formatDate(msg.createdAt)}
                      </span>
                      <span className="text-[9px] uppercase font-bold text-gold bg-sand px-1.5 py-0.5 rounded border border-border/30">
                        Inquiry
                      </span>
                    </div>
                    <div>
                      <h4 className="font-bold text-navy text-xs">{msg.name}</h4>
                      <div className="text-[10px] text-gray-500 font-mono truncate">{msg.email}</div>
                      {msg.phone && (
                        <div className="text-[10px] text-gray-400 font-mono mt-0.5">
                          {msg.phone}
                        </div>
                      )}
                    </div>
                    <p className="text-xs text-gray-600 bg-sand/20 p-2.5 rounded border border-border/40 font-body leading-relaxed line-clamp-3">
                      {msg.message}
                    </p>
                    <div className="flex justify-end gap-2 pt-2 border-t border-border/40">
                      <button
                        onClick={() => handleOpenDetail(msg)}
                        className="text-[10px] py-1 px-3 rounded font-semibold bg-sand text-navy hover:text-gold transition border border-border"
                      >
                        Read
                      </button>
                      <button
                        onClick={() => handleOpenDelete(msg._id)}
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
          {filteredMessages.length === 0 ? (
            <tr>
              <td colSpan={6} className="text-center py-8 text-gray-400">
                No matching messages found.
              </td>
            </tr>
          ) : (
            filteredMessages.map((msg) => (
              <tr key={msg._id} className="hover:bg-sand/30 transition-colors">
                <td className="px-6 py-4.5 font-mono text-[10px] text-gray-500">
                  {formatDate(msg.createdAt)}
                </td>
                <td className="px-6 py-4.5 font-semibold text-navy">{msg.name}</td>
                <td className="px-6 py-4.5 text-gray-600 font-mono">{msg.email}</td>
                <td className="px-6 py-4.5 text-gray-600 font-mono">{msg.phone || "—"}</td>
                <td className="px-6 py-4.5 max-w-xs text-gray-500 font-body">
                  {truncateText(msg.message)}
                </td>
                <td className="px-6 py-4.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleOpenDetail(msg)}
                      className="p-1 hover:bg-sand text-navy hover:text-gold transition rounded focus:outline-none focus:ring-1 focus:ring-burgundy"
                      title="Read Full Message"
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
                          d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z"
                        />
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                        />
                      </svg>
                    </button>
                    <button
                      onClick={() => handleOpenDelete(msg._id)}
                      className="p-1 hover:bg-red-50 text-gray-400 hover:text-red-600 transition rounded focus:outline-none focus:ring-1 focus:ring-burgundy"
                      title="Delete Message"
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

      {/* READ FULL MESSAGE DIALOG MODAL */}
      <Modal
        isOpen={activeMessage !== null}
        onClose={() => setActiveMessage(null)}
        title="Visitor Inquiry Details"
        description={activeMessage ? `From: ${activeMessage.name} (${activeMessage.email})` : ""}
      >
        {activeMessage && (
          <div className="space-y-4 pt-2 font-body select-none">
            <div className="grid grid-cols-2 gap-4 text-xs bg-sand p-3 rounded border border-border">
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Telephone</span>
                <span className="font-semibold text-navy font-mono">{activeMessage.phone || "—"}</span>
              </div>
              <div>
                <span className="text-[10px] text-gray-400 font-semibold block uppercase">Date Received</span>
                <span className="font-semibold text-navy font-mono">
                  {new Date(activeMessage.createdAt).toLocaleString("en-US")}
                </span>
              </div>
            </div>

            <div>
              <span className="text-[10px] text-gray-400 font-semibold block uppercase mb-1">Message Body</span>
              <div className="bg-sand border border-border p-4 rounded text-xs leading-relaxed text-gray-700 max-h-64 overflow-y-auto whitespace-pre-wrap">
                {activeMessage.message}
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <Button onClick={() => setActiveMessage(null)}>Close View</Button>
            </div>
          </div>
        )}
      </Modal>

      {/* DELETE CONFIRMATION DIALOG MODAL */}
      <Modal
        isOpen={isDeleteOpen}
        onClose={() => setIsDeleteOpen(false)}
        title="Delete Message Record"
        description="This action will permanently delete this visitor inquiry from the database log. It cannot be recovered."
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

export default MessagesPage;
