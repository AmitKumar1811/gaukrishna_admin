import React from "react";
import ReactPaginate from "react-paginate";
import { ChevronLeft, ChevronRight } from "lucide-react"; // Assuming lucide-react is available, or use font-awesome if preferred

export default function Pagination({ pageCount, pageValue, setPage }) {
  if (pageCount <= 1) return null;

  return (
    <div className="w-full flex justify-end py-2">
      <ReactPaginate
        pageCount={pageCount}
        forcePage={pageValue}
        previousLabel={
          <span className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
            <ChevronLeft className="w-5 h-5" />
          </span>
        }
        nextLabel={
          <span className="flex items-center justify-center w-8 h-8 rounded-full text-gray-400 hover:bg-gray-100 transition-colors">
            <ChevronRight className="w-5 h-5" />
          </span>
        }
        breakLabel={<span className="text-gray-400">...</span>}
        marginPagesDisplayed={1}
        pageRangeDisplayed={3}
        onPageChange={(selected) => setPage(selected.selected)}

        containerClassName="flex items-center gap-1 select-none"

        pageClassName="group"
        pageLinkClassName="flex items-center justify-center w-8 h-8 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-100 transition-colors"

        activeClassName="!text-white"
        activeLinkClassName="bg-brand-600 !text-white hover:!bg-brand-600 shadow-sm shadow-purple-200"

        previousClassName="mr-2"
        nextClassName="ml-2"

        disabledClassName="opacity-50 pointer-events-none"
        breakClassName="flex items-center justify-center w-8 h-8"
      />
    </div>
  );
}
