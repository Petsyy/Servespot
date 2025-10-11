// src/utils/swalAlerts.js
import Swal from "sweetalert2";

export const confirmCompletion = async (title = "Mark as Completed") => {
  const result = await Swal.fire({
    title,
    text: "Are you sure you want to mark this opportunity as completed?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Mark as Completed",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    confirmButtonColor: "#16a34a", // green
    cancelButtonColor: "#6b7280", // gray
    background: "#fff",
  });
  return result.isConfirmed;
};

/* Confirmation popup before joining */
export const confirmJoin = async () => {
  const result = await Swal.fire({
    title: "Join This Opportunity?",
    text: "Are you sure you want to sign up for this volunteer activity?",
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "Yes, Join Now",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    confirmButtonColor: "#16a34a", // green
    cancelButtonColor: "#6b7280", // gray
    background: "#fff",
  });
  return result.isConfirmed;
};

export const confirmDelete = async (title = "Delete Opportunity?") => {
  const result = await Swal.fire({
    title,
    text: "This action cannot be undone. Are you sure you want to permanently delete this opportunity?",
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "Yes, Delete it",
    cancelButtonText: "Cancel",
    reverseButtons: true,
    confirmButtonColor: "#dc2626", // red
    cancelButtonColor: "#6b7280", // gray
    background: "#fff",
  });
  return result.isConfirmed;
};

/* Cancelled */
export const cancelledAlert = () =>
  Swal.fire({
    icon: "info",
    title: "Cancelled",
    text: "You have not joined this opportunity.",
    confirmButtonColor: "#3b82f6",
    timer: 1800,
    showConfirmButton: false,
  });

/* Error alert */
export const errorAlert = (title = "Error", text = "Something went wrong.") =>
  Swal.fire({
    icon: "error",
    title,
    text,
    confirmButtonColor: "#ef4444",
  });

/*  Success alert */
export const successAlert = (title = "Success!", text = "") =>
  Swal.fire({
    icon: "success",
    title,
    text,
    confirmButtonColor: "#16a34a",
  });

/* Warning alert (e.g., full or closed) */
export const warningAlert = (title = "Warning", text = "") =>
  Swal.fire({
    icon: "warning",
    title,
    text,
    confirmButtonColor: "#f59e0b",
  });
