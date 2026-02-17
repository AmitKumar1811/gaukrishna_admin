import React from 'react'

const Contact = () => {
  return (
    <>
      <div className="flex flex-col gap-5 p-5 bg-[#FAF9F9]">
        <div className="text-[#298E9E] text-[32px] font-semibold">
          Contact Us
        </div>

        <div className="w-full md:w-[55%] bg-[#FFFFFF] p-5 rounded-[24px] border border-[#E5E5E5]">
          <form action="">
            <div className="flex flex-col gap-5">
              {/* Name */}
              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-semibold" htmlFor="">
                  Name
                </label>
                <input
                  placeholder="Name"
                  className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[50px] font-medium p-4 text-[16px] text-[#5F5F5F]"
                />
              </div>

              {/* Email */}
              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-semibold" htmlFor="">
                  Email
                </label>
                <input
                  placeholder="Email"
                  className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[50px] font-medium p-4 text-[16px] text-[#5F5F5F]"
                />
              </div>

              {/* Subject */}
              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-semibold" htmlFor="">
                  Subject
                </label>
                <input
                  placeholder="Subject"
                  className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[50px] font-medium p-4 text-[16px] text-[#5F5F5F]"
                />
              </div>

              {/* ✅ Description */}
              <div className="flex flex-col gap-3">
                <label className="text-[14px] font-semibold" htmlFor="">
                  Description
                </label>
                <textarea
                  placeholder="Write your message here..."
                  rows="5"
                  className="border bg-[#FAF9F9] border-[#E5E5E5] rounded-[24px] font-medium p-4 text-[16px] text-[#5F5F5F] resize-none"
                ></textarea>
              </div>

              {/* Submit Button */}
              <div>
                <button className="w-full bg-[#298E9E] text-[#FFFFFF] text-[14px] font-medium py-3 rounded-[100px]">
                  Submit
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

export default Contact;
