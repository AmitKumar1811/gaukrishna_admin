import React, { useEffect, useState } from "react";
import { collection, addDoc, getDocs, doc, updateDoc, deleteDoc } from "firebase/firestore";
import { db } from "../Firebase"; // Your Firebase config
import { toast } from "react-toastify";
import { ThreeDots } from "react-loader-spinner";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

const Faq = () => {
  const [faqs, setFaqs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [form, setForm] = useState({ question: "", answer: "" });
  const [editId, setEditId] = useState(null);
  const faqsCollection = collection(db, "faq");
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteId, setDeleteId] = useState(null);

  const fetchFaqs = async () => {
    setLoading(true);
    const snapshot = await getDocs(faqsCollection);
    const data = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    data.sort((a, b) => (a.orderIndex || 0) - (b.orderIndex || 0));
    setFaqs(data);
    setLoading(false);
  };

  useEffect(() => {
    fetchFaqs();
  }, []);

  const handleSubmit = async (e) => {
    try {
      e.preventDefault();
      if (!form.question || !form.answer) return;

      if (editId) {
        // Update existing FAQ
        const docRef = doc(db, "faq", editId);
        await updateDoc(docRef, { ...form });
        setEditId(null);
        toast.success("Updated")
      } else {
        // Add new FAQ
        const newOrderIndex = faqs.length;
        await addDoc(faqsCollection, { ...form, orderIndex: newOrderIndex });
        toast.success("Faq Added")
      }

      setForm({ question: "", answer: "" });
      fetchFaqs();
    } catch (error) {
      console.error(error)
    }
  };

  const handleDelete = async () => {
    try {
      await deleteDoc(doc(db, "faq", deleteId));
      toast.success("FAQ deleted");
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchFaqs();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    }
  };


  const handleEdit = (faq) => {
    setForm({ question: faq.question, answer: faq.answer });
    setEditId(faq.id);
  };

  const handleOnDragEnd = async (result) => {
    if (!result.destination) return;

    const items = Array.from(faqs);
    const [reorderedItem] = items.splice(result.source.index, 1);
    items.splice(result.destination.index, 0, reorderedItem);

    setFaqs(items);

    try {
      const updates = items.map((faq, index) => {
        if (faq.orderIndex !== index) {
          return updateDoc(doc(db, "faq", faq.id), { orderIndex: index });
        }
        return Promise.resolve();
      });

      await Promise.all(updates);
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Failed to update order");
    }
  };

  return (
    <div className="bg-[#f8f9fa] min-h-screen p-6 font-sans text-gray-800">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4 max-w-7xl mx-auto">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 tracking-tight">
            FAQ Manager
          </h2>
          <p className="text-gray-500 text-sm mt-1">Manage frequently asked questions</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 sm:p-8">
          <h3 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
            {editId ? <i className="fa-regular fa-pen-to-square text-[#9900FF]"></i> : <i className="fa-solid fa-plus text-[#9900FF]"></i>}
            {editId ? "Edit FAQ" : "Add New FAQ"}
          </h3>

          <form onSubmit={handleSubmit} className="flex flex-col gap-5">
            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Question</label>
              <input
                type="text"
                placeholder="e.g. How do I reset my password?"
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#9900FF] focus:border-[#9900FF] block p-3 transition-colors outline-none hover:bg-white"
                value={form.question}
                onChange={(e) => setForm({ ...form, question: e.target.value })}
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-1.5 block">Answer</label>
              <textarea
                rows={4}
                placeholder="Enter the answer here..."
                className="w-full bg-gray-50 border border-gray-200 text-gray-900 text-sm rounded-xl focus:ring-[#9900FF] focus:border-[#9900FF] block p-3 transition-colors outline-none hover:bg-white resize-none"
                value={form.answer}
                onChange={(e) => setForm({ ...form, answer: e.target.value })}
              />
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="submit"
                className="flex cursor-pointer items-center gap-2 bg-[#9900FF] hover:bg-[#7f00d4] text-white px-6 py-2.5 rounded-xl text-sm font-medium transition-all shadow-sm active:scale-95 disabled:opacity-50"
                disabled={!form.question || !form.answer}
              >
                <i className="fa-regular  fa-paper-plane text-xs"></i>
                {editId ? "Update FAQ" : "Publish FAQ"}
              </button>
              {editId && (
                <button
                  type="button"
                  onClick={() => {
                    setEditId(null);
                    setForm({ question: "", answer: "" });
                  }}
                  className="flex cursor-pointer items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-600 px-6 py-2.5 rounded-xl text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
              )}
            </div>
          </form>
        </div>

        {/* List FAQs */}
        <div className="space-y-4">
          <h3 className="text-lg font-bold text-gray-900 px-1">FAQs List <span className="text-gray-400 font-normal text-sm ml-2">({faqs.length})</span></h3>

          {loading ? (
            <div className="bg-white rounded-2xl p-10 flex justify-center">
              <ThreeDots height="50" width="50" radius="9" visible={true} color="#9900FF" />
            </div>
          ) : faqs.length === 0 ? (
            <div className="bg-white rounded-2xl p-10 text-center border border-gray-100 border-dashed">
              <div className="text-gray-300 text-4xl mb-3"><i className="fa-regular fa-circle-question"></i></div>
              <p className="text-gray-500 font-medium">No FAQs found yet.</p>
              <p className="text-gray-400 text-sm">Add your first question using the form above.</p>
            </div>
          ) : (
            <DragDropContext onDragEnd={handleOnDragEnd}>
              <Droppable droppableId="faqs">
                {(provided) => (
                  <div {...provided.droppableProps} ref={provided.innerRef} className="space-y-4">
                    {faqs.map((faq, index) => (
                      <Draggable key={faq.id} draggableId={faq.id} index={index}>
                        {(provided) => (
                          <div
                            ref={provided.innerRef}
                            {...provided.draggableProps}
                            className="bg-white hover:shadow-md transition-shadow border border-gray-100 p-6 rounded-2xl group relative flex items-start gap-4"
                          >
                            <div
                              {...provided.dragHandleProps}
                              className="mt-1 cursor-grab active:cursor-grabbing text-gray-400 hover:text-gray-600 p-1"
                            >
                              <i className="fa-solid fa-grip-vertical"></i>
                            </div>
                            <div className="flex-1 pr-16 bg-white">
                              <h4 className="font-semibold text-gray-900 mb-2 text-lg">{faq.question}</h4>
                              <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap">{faq.answer}</p>
                            </div>

                            <div className="absolute top-6 right-6 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button
                                onClick={() => handleEdit(faq)}
                                className="w-8 h-8 rounded-lg cursor-pointer flex items-center justify-center bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors"
                                title="Edit"
                              >
                                <i className="fa-solid  fa-pen text-xs"></i>
                              </button>
                              <button
                                onClick={() => {
                                  setDeleteId(faq.id);
                                  setShowDeleteModal(true);
                                }}

                                className="w-8 h-8 rounded-lg  cursor-pointer flex items-center justify-center bg-red-50 text-red-600 hover:bg-red-100 transition-colors"
                                title="Delete"
                              >
                                <i className="fa-regular  fa-trash-can text-xs"></i>
                              </button>
                            </div>
                          </div>
                        )}
                      </Draggable>
                    ))}
                    {provided.placeholder}
                  </div>
                )}
              </Droppable>
            </DragDropContext>
          )}
        </div>
      </div>
      {/* Delete Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 animate-fadeIn">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 flex items-center justify-center rounded-full bg-red-100 text-red-600">
                <i className="fa-solid fa-triangle-exclamation"></i>
              </div>
              <h3 className="text-lg font-bold text-gray-900">
                Delete FAQ?
              </h3>
            </div>

            <p className="text-gray-600 text-sm mb-6">
              Are you sure you want to delete this FAQ?
              This action <span className="font-semibold text-red-600">cannot be undone</span>.
            </p>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteId(null);
                }}
                className="px-5 cursor-pointer py-2.5 rounded-xl text-sm font-medium bg-gray-100 hover:bg-gray-200 text-gray-700 transition"
              >
                Cancel
              </button>

              <button
                onClick={handleDelete}
                className="px-5 py-2.5 cursor-pointer rounded-xl text-sm font-medium bg-red-600 hover:bg-red-700 text-white transition shadow-sm active:scale-95"
              >
                Yes, Delete
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Faq;
