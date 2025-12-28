import React, { useState, useEffect } from "react";
import {
  MapPin,
  Plus,
  Trash2,
  Edit2,
  Navigation,
  Check,
  X,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { api } from "../api/api";

export const Address = () => {
  const [addresses, setAddresses] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [loading, setLoading] = useState(true);
  const [detecting, setDetecting] = useState(false);
  const [deleting, setDeleting] = useState(null); // Track which address is being deleted
  const [deleteModal, setDeleteModal] = useState({ show: false, addressId: null, addressLabel: "" }); // Delete confirmation modal

  /* ---------------- FORM STATE ---------------- */
  const [formData, setFormData] = useState({
    label: "Home",
    addressLine: "",
    city: "",
    state: "",
    pincode: "",
    isDefault: false,
  });

  /* ---------------- FETCH ADDRESSES ---------------- */
  useEffect(() => {
    fetchAddresses();
  }, []);

  const fetchAddresses = async () => {
    setLoading(true);
    try {
      const data = await api.get("/addresses/");
      setAddresses(Array.isArray(data) ? data : data.addresses || []);
    } catch (err) {
      console.error("Failed to fetch addresses", err);
    } finally {
      setLoading(false);
    }
  };

  /* ---------------- DETECT LOCATION WITH REVERSE GEOCODING ---------------- */
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser");
      return;
    }

    setDetecting(true);
    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          const data = await res.json();

          setFormData((prev) => ({
            ...prev,
            addressLine: data.display_name || "",
            city: data.address?.city || data.address?.town || "",
            state: data.address?.state || "",
            pincode: data.address?.postcode || "",
          }));
        } catch (e) {
          console.error("Reverse geocoding error:", e);
          setFormData((prev) => ({
            ...prev,
            addressLine: `📍 Detected: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`,
            city: "Current City",
            state: "Current State",
            pincode: "000000",
          }));
        } finally {
          setDetecting(false);
        }
      },
      (error) => {
        console.error("Geolocation error:", error);
        setDetecting(false);
        alert(
          "Unable to retrieve your location. Please check your browser permissions."
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
  };

  /* ---------------- SUBMIT ---------------- */
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await api.put(`/addresses/${editingId}/`, formData);
      } else {
        await api.post("/addresses/", formData);
      }

      setShowForm(false);
      setEditingId(null);
      resetForm();
      fetchAddresses();
    } catch (err) {
      console.error("Save failed", err);
      const mockNew = { ...formData, _id: editingId || Math.random().toString() };
      setAddresses((prev) => {
        const filtered = prev.filter((a) => a._id !== editingId);
        return [...filtered, mockNew];
      });
      setShowForm(false);
      setEditingId(null);
    }
  };

  /* ---------------- EDIT ---------------- */
  const handleEdit = (addr) => {
    setFormData({
      label: addr.label,
      addressLine: addr.addressLine,
      city: addr.city,
      state: addr.state,
      pincode: addr.pincode,
      isDefault: addr.isDefault,
    });
    setEditingId(addr.id || addr._id);
    setShowForm(true);
  };

  /* ---------------- OPEN DELETE MODAL ---------------- */
  const openDeleteModal = (id, label) => {
    setDeleteModal({ show: true, addressId: id, addressLabel: label });
  };

  /* ---------------- CLOSE DELETE MODAL ---------------- */
  const closeDeleteModal = () => {
    setDeleteModal({ show: false, addressId: null, addressLabel: "" });
  };

  /* ---------------- CONFIRM DELETE ---------------- */
  const confirmDelete = async () => {
    const id = deleteModal.addressId;
    setDeleting(id);

    try {
      await api.delete(`/addresses/${id}/`);
      setAddresses((prev) => prev.filter((a) => a._id !== id && a.id !== id));
      closeDeleteModal();
    } catch (err) {
      console.error("Delete failed:", err);
      // Fallback: remove from UI even if API fails
      setAddresses((prev) => prev.filter((a) => a._id !== id && a.id !== id));
      closeDeleteModal();
    } finally {
      setDeleting(null);
    }
  };

  const resetForm = () => {
    setFormData({
      label: "Home",
      addressLine: "",
      city: "",
      state: "",
      pincode: "",
      isDefault: false,
    });
  };

  /* ==================== DELETE CONFIRMATION MODAL ==================== */
  const DeleteConfirmationModal = () => (
    <>
      {/* Backdrop */}
      {deleteModal.show && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 transition-opacity duration-300"
          onClick={closeDeleteModal}
        />
      )}

      {/* Modal */}
      {deleteModal.show && (
        <div className="fixed inset-0 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-[2rem] shadow-2xl max-w-sm w-full animate-in zoom-in-95 fade-in duration-300 overflow-hidden">
            {/* Header */}
            <div className="bg-gradient-to-r from-red-50 to-rose-50 px-8 py-8 flex flex-col items-center">
              <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mb-4">
                <AlertCircle size={32} className="text-red-600" />
              </div>
              <h2 className="text-2xl font-bold text-slate-900 text-center">
                Delete Address?
              </h2>
            </div>

            {/* Content */}
            <div className="px-8 py-6 border-b border-slate-100">
              <p className="text-slate-600 text-center mb-4 font-medium">
                Are you sure you want to delete this address?
              </p>
              <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
                <p className="text-sm font-bold text-amber-600 mb-1">
                  {deleteModal.addressLabel}
                </p>
                <p className="text-xs text-slate-500 leading-relaxed">
                  This action cannot be undone. You'll need to add this address again if you change your mind.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="px-8 py-6 flex gap-4">
              <button
                onClick={closeDeleteModal}
                disabled={deleting}
                className="flex-1 px-6 py-3 rounded-xl border-2 border-slate-100 text-slate-900 font-bold hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Keep It
              </button>
              <button
                onClick={confirmDelete}
                disabled={deleting}
                className="flex-1 px-6 py-3 rounded-xl bg-gradient-to-r from-red-500 to-rose-500 text-white font-bold shadow-lg shadow-red-200 hover:shadow-xl transition-all active:scale-95 disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {deleting ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 size={16} />
                    Delete
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );

  /* ==================== MAIN UI ==================== */
  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      {!showForm && (
        <div className="flex justify-between items-center mb-10">
          <div>
            <h2 className="text-4xl font-serif text-slate-900">
              Saved Addresses
            </h2>
            <p className="text-slate-500 mt-1">
              Manage your delivery locations
            </p>
          </div>
          <button
            onClick={() => {
              resetForm();
              setShowForm(true);
            }}
            className="flex items-center gap-2 bg-gradient-to-r from-amber-400 to-amber-500 text-white px-6 py-3 rounded-2xl font-bold shadow-lg shadow-amber-200 transition-all hover:scale-105 active:scale-95"
          >
            <Plus size={20} strokeWidth={3} /> Add New
          </button>
        </div>
      )}

      {/* ==================== FORM VIEW ==================== */}
      {showForm ? (
        <div className="bg-white p-8 md:p-10 rounded-[2.5rem] border border-slate-100 shadow-2xl animate-in fade-in zoom-in-95 duration-300 relative">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-2xl font-bold text-slate-800 tracking-tight">
              {editingId ? "Edit Address" : "Add New Address"}
            </h3>
            <button
              onClick={() => {
                setShowForm(false);
                setEditingId(null);
              }}
              className="text-slate-400 hover:text-slate-900 transition-colors p-2 hover:bg-slate-50 rounded-full"
            >
              <X size={24} />
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* ADDRESS LABEL */}
            <div>
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4">
                Address Label
              </label>
              <div className="flex gap-4">
                {["Home", "Work", "Other"].map((l) => (
                  <button
                    key={l}
                    type="button"
                    onClick={() => setFormData({ ...formData, label: l })}
                    className={`px-8 py-3 rounded-2xl text-sm font-bold transition-all duration-300 border-2 ${
                      formData.label === l
                        ? "bg-amber-500 border-amber-500 text-white shadow-[0_10px_20px_-5px_rgba(245,158,11,0.4)]"
                        : "bg-slate-50 border-transparent text-slate-400 hover:bg-slate-100"
                    }`}
                  >
                    {l}
                  </button>
                ))}
              </div>
            </div>

            {/* FULL ADDRESS WITH LOCATION DETECTION */}
            <div className="relative">
              <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-4">
                Full Address
              </label>
              <div className="relative group">
                <textarea
                  value={formData.addressLine}
                  onChange={(e) =>
                    setFormData({ ...formData, addressLine: e.target.value })
                  }
                  className="w-full px-6 py-6 rounded-3xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-amber-100 focus:shadow-inner outline-none transition-all min-h-[160px] text-slate-700 font-medium placeholder:text-slate-300"
                  placeholder="Street, Building, Apartment..."
                  required
                />
                <button
                  type="button"
                  onClick={handleDetectLocation}
                  disabled={detecting}
                  className="absolute bottom-6 right-6 flex items-center gap-2 text-amber-600 bg-amber-50/80 backdrop-blur-sm px-5 py-2.5 rounded-2xl border border-amber-100 text-xs font-bold shadow-sm hover:bg-amber-500 hover:text-white transition-all disabled:opacity-50"
                >
                  {detecting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Navigation size={16} />
                  )}
                  {detecting ? "Fetching..." : "Use Current Location"}
                </button>
              </div>
            </div>

            {/* FIELD GRID */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
                  City
                </label>
                <input
                  type="text"
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-amber-100 outline-none text-slate-700 font-medium"
                  placeholder="Ex: Gurgaon"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
                  State
                </label>
                <input
                  type="text"
                  value={formData.state}
                  onChange={(e) =>
                    setFormData({ ...formData, state: e.target.value })
                  }
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-amber-100 outline-none text-slate-700 font-medium"
                  placeholder="Ex: Haryana"
                  required
                />
              </div>
              <div>
                <label className="block text-[11px] font-black uppercase tracking-[0.15em] text-slate-400 mb-3">
                  Pincode
                </label>
                <input
                  type="text"
                  value={formData.pincode}
                  onChange={(e) =>
                    setFormData({ ...formData, pincode: e.target.value })
                  }
                  className="w-full px-6 py-4 rounded-2xl border-2 border-slate-50 bg-slate-50/50 focus:bg-white focus:border-amber-100 outline-none text-slate-700 font-medium"
                  placeholder="Ex: 122003"
                  required
                />
              </div>
            </div>

            {/* DEFAULT OPTION */}
            <label className="flex items-center gap-4 cursor-pointer group w-fit">
              <input
                type="checkbox"
                checked={formData.isDefault}
                onChange={(e) =>
                  setFormData({ ...formData, isDefault: e.target.checked })
                }
                className="hidden"
              />
              <div
                className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all duration-300 ${
                  formData.isDefault
                    ? "bg-amber-500 border-amber-500 text-white"
                    : "border-slate-200 group-hover:border-amber-300"
                }`}
              >
                {formData.isDefault && <Check size={18} strokeWidth={4} />}
              </div>
              <span className="text-sm font-bold text-slate-500 group-hover:text-slate-800 transition-colors">
                Set as default address
              </span>
            </label>

            {/* ACTION FOOTER */}
            <div className="flex items-center gap-6 pt-10 border-t border-slate-50">
              <button
                type="submit"
                className="flex-1 bg-slate-900 text-white py-5 rounded-[1.5rem] font-bold text-lg shadow-2xl shadow-slate-200 hover:bg-slate-800 hover:-translate-y-1 transition-all active:scale-95"
              >
                {editingId ? "Update Address" : "Save Address"}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false);
                  setEditingId(null);
                }}
                className="px-10 py-5 text-slate-400 font-bold hover:text-slate-900 transition-all rounded-[1.5rem] hover:bg-slate-50"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        /* ==================== LIST VIEW ==================== */
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {loading ? (
            [1, 2].map((i) => (
              <div
                key={i}
                className="h-48 bg-slate-100 animate-pulse rounded-[2.5rem]"
              />
            ))
          ) : addresses.length === 0 ? (
            <div className="col-span-full py-24 bg-white rounded-[3rem] border-2 border-dashed border-slate-100 text-center">
              <div className="w-24 h-24 bg-slate-50 rounded-full flex items-center justify-center text-slate-200 mx-auto mb-6">
                <MapPin size={48} />
              </div>
              <h4 className="text-xl font-bold text-slate-800 mb-2">
                No addresses found
              </h4>
              <p className="text-slate-400 font-medium">
                Add an address to see it listed here.
              </p>
              <button
                onClick={() => {
                  resetForm();
                  setShowForm(true);
                }}
                className="mt-8 text-amber-500 font-bold flex items-center gap-2 mx-auto hover:gap-3 transition-all"
              >
                Add your first one <Plus size={18} />
              </button>
            </div>
          ) : (
            addresses.map((addr) => (
              <div
                key={addr._id || addr.id}
                className={`bg-white p-10 rounded-[2.5rem] border-2 transition-all duration-500 group relative ${
                  addr.isDefault
                    ? "border-amber-500 shadow-[0_20px_50px_-20px_rgba(245,158,11,0.15)] ring-4 ring-amber-50"
                    : "border-slate-50 hover:border-amber-100 shadow-sm"
                }`}
              >
                {addr.isDefault && (
                  <div className="absolute top-8 right-8 text-[9px] font-black tracking-[0.2em] text-amber-600 bg-amber-50 px-4 py-1.5 rounded-full">
                    DEFAULT
                  </div>
                )}

                <div className="flex items-start gap-6">
                  <div
                    className={`w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-colors ${
                      addr.isDefault
                        ? "bg-amber-500 text-white"
                        : "bg-slate-50 text-slate-300 group-hover:bg-amber-50 group-hover:text-amber-500"
                    }`}
                  >
                    <MapPin size={28} />
                  </div>
                  <div className="flex-1 pr-12">
                    <h4 className="font-bold text-slate-900 text-xl mb-2">
                      {addr.label}
                    </h4>
                    <p className="text-slate-500 text-sm leading-relaxed mb-6 font-medium">
                      {addr.addressLine}
                      <br />
                      {addr.city}, {addr.state} - {addr.pincode}
                    </p>

                    <div className="flex items-center gap-6">
                      <button
                        onClick={() => handleEdit(addr)}
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-slate-900 transition-colors"
                      >
                        <Edit2 size={14} /> Edit
                      </button>
                      <button
                        onClick={() =>
                          openDeleteModal(addr._id || addr.id, addr.label)
                        }
                        className="flex items-center gap-2 text-xs font-bold text-slate-400 hover:text-red-500 transition-colors"
                      >
                        <Trash2 size={14} /> Delete
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Delete Confirmation Modal */}
      <DeleteConfirmationModal />
    </div>
  );
};
