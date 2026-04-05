import React from "react";
import { Formik, Form, Field } from "formik";

const CouponModal = ({
  show,
  onHide,
  initialValues,
  isEditing,
  onSubmit,
}) => {
  if (!show) return null;

  return (
    <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50">
      <div className="bg-white rounded-xl p-6 w-[400px]">
        <h3 className="text-lg font-semibold mb-4">
          {isEditing ? "Edit Coupon" : "Add Coupon"}
        </h3>

        <Formik
          enableReinitialize
          initialValues={initialValues}
          onSubmit={(values) => onSubmit(values)}
        >
          {() => (
            <Form className="space-y-3">
              <Field
                name="code"
                placeholder="Coupon Code"
                className="w-full border px-3 py-2 rounded"
              />
              <Field
                name="applicable"
                placeholder="Applicable For"
                className="w-full border px-3 py-2 rounded"
              />
              <Field
                name="type"
                placeholder="Type (flat / percent)"
                className="w-full border px-3 py-2 rounded"
              />
              <Field
                name="value"
                placeholder="Value"
                className="w-full border px-3 py-2 rounded"
              />
              <Field
                type="date"
                name="expiry"
                className="w-full border px-3 py-2 rounded"
              />

              <div className="flex justify-end gap-2 pt-4">
                <button
                  type="button"
                  onClick={onHide}
                  className="px-4 py-2 border rounded"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-[#0f6845] text-white rounded"
                >
                  {isEditing ? "Update" : "Create"}
                </button>
              </div>
            </Form>
          )}
        </Formik>
      </div>
    </div>
  );
};

export default CouponModal;
