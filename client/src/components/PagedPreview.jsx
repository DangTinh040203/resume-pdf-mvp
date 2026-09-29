import { useEffect, useRef, useState } from "react";

import ResumeContent from "./ResumeContent";

// Paged.js re-flows ResumeContent into real, separate A4 page boxes live in
// the browser (screen has no native pagination outside of print). The same
// @page CSS rule (see index.css) is what Chromium's native print engine
// uses server-side for the actual PDF export at /print — same content, same
// CSS, two different "renderers" (polyfill on screen, native at export).
const PagedPreview = ({ resume }) => {
  // ---- 2. REFS: con trỏ trực tiếp tới 2 thẻ <div> ở phần return() dưới cùng.
  // Paged.js không biết gì về React — nó chỉ làm việc với DOM node thật
  // Ref là cách React cho mình "thoát ra" khỏi virtual DOM, lấy node thật để
  // đưa cho 1 thư viện ngoài như thế này.

  // sourceRef: trỏ tới div ẩn (className='hidden') chứa <ResumeContent>.
  // Vai trò DUY NHẤT: cho Paged.js 1 chỗ để đọc .innerHTML ra (dòng 33).
  // Người dùng không bao giờ nhìn thấy div này.
  const sourceRef = useRef(null);

  // targetRef: trỏ tới div rỗng (dòng cuối JSX, không có children lúc đầu).
  // Vai trò: chỗ Paged.js sẽ TỰ nhét các .pagedjs_page (kết quả sau khi chia
  // trang) vào. React không quản lý nội dung bên trong div này sau khi
  // Paged.js chạy — coi như "vùng đất giao cho thư viện ngoài quản lý".
  const targetRef = useRef(null);

  // ---- 2 STATE: chỉ để hiển thị dòng chữ trạng thái phía trên preview,
  // KHÔNG ảnh hưởng gì tới việc Paged.js chạy hay không (Paged.js chạy độc
  // lập trong effect, không đọc lại 2 state này để quyết định làm gì).

  // status: 3 giá trị có thể có — 'loading' | 'done' | 'error'.
  // Bắt đầu là 'loading' vì ngay khi component mount, effect bên dưới lập
  // tức bắt đầu gọi preview() (là 1 async work, chưa xong ngay được).
  // Dùng để quyết định hiện câu nào trong <p> ở dòng 47-51.
  const [status, setStatus] = useState("loading");

  // pageCount: số trang Paged.js vừa tạo ra (con số thật, đọc từ
  // flow.total sau khi preview() resolve — xem dòng 27+30).
  // Bắt đầu là null vì chưa biết được (preview() chưa chạy xong).
  // Chỉ dùng để hiện "Rendered as 3 page(s)." — thuần thông tin cho người
  // xem, không phục vụ logic nào khác trong component.
  const [pageCount, setPageCount] = useState(null);

  useEffect(() => {
    // cancelled: biến cờ (KHÔNG phải state — cố tình dùng let thường, không
    // dùng useState) để tránh setState sau khi component đã unmount.
    // Vì sao không setState trực tiếp mà phải qua biến cờ này: preview() là
    // 1 promise async chạy khá lâu (phải load pagedjs, đo layout...). Nếu
    // giữa lúc nó đang chạy mà component bị unmount (user chuyển trang),
    // lúc promise resolve xong mà cứ gọi setStatus/setPageCount thì React
    // sẽ warning "Can't perform a React state update on an unmounted
    // component". cancelled = true (set ở dòng 41, trong cleanup function)
    // là cách báo "đừng set state nữa, component không còn đó".
    let cancelled = false;

    async function run() {
      // Guard: nếu vì lý do gì 2 ref chưa gắn vào DOM (về lý thuyết không
      // nên xảy ra vì effect chạy SAU khi render xong, nhưng vẫn check cho
      // chắc — tránh crash nếu refactor sau này lỡ đổi thứ tự).
      if (!sourceRef.current || !targetRef.current) return;

      // Dynamic import — CHỈ load thư viện pagedjs lúc này, không import
      // tĩnh ở đầu file. Lý do: pagedjs đụng vào `document`/DOM APIs, chỉ
      // chạy được trong browser thật; import động trong effect đảm bảo nó
      // chỉ chạy sau khi component đã thực sự mount trên client.
      const { Previewer } = await import("pagedjs");
      const previewer = new Previewer();

      // Lấy HTML thô (dạng string) của <ResumeContent> đã render sẵn trong
      // sourceRef. Paged.js nhận input là STRING, không nhận React element
      // — nó không biết React tồn tại, chỉ xử lý HTML/CSS thuần.
      const content = sourceRef.current.innerHTML;

      // Dọn sạch targetRef trước khi paginate — phòng trường hợp effect này
      // chạy lại (hiện tại deps là [] nên chỉ chạy 1 lần lúc mount, nhưng
      // giữ dòng này cho an toàn/rõ ý định).
      targetRef.current.innerHTML = "";

      // ĐÂY LÀ DÒNG LÀM VIỆC CHÍNH. 3 tham số:
      //   1. content        → HTML cần paginate (lấy ở trên).
      //   2. stylesheets     → để undefined, nghĩa là "tự đi lấy hết mọi CSS
      //                        đang load trên trang" (bao gồm cả file CSS
      //                        Tailwind đã compile) để áp dụng cho các trang
      //                        nó tạo ra — nếu không, class như
      //                        text-primary/border-neutral-900 sẽ mất tác
      //                        dụng bên trong .pagedjs_page.
      //   3. renderTo        → targetRef.current, chỗ nó sẽ nhét kết quả.
      // preview() là async, phải đo layout thật của từng dòng chữ/section
      // để quyết định chỗ cắt trang — đây là lý do có màn "Paginating…".
      const flow = await previewer.preview(content, undefined, targetRef.current);

      // Chỉ set state nếu component còn "sống" (chưa bị hủy giữa chừng).
      if (!cancelled) {
        setPageCount(flow.total); // flow.total = số trang thật vừa tạo ra
        setStatus("done");
      }
    }

    // run() có thể throw (vd: pagedjs load lỗi, hoặc lỗi lúc layout).
    // .catch() ở đây bắt lỗi đó — KHÔNG dùng try/catch trong run() vì muốn
    // gọi run() như 1 lời hứa (promise) rồi xử lý .catch() ngoài, tránh
    // phải lồng try/catch quá nhiều tầng.
    run().catch((error) => {
      // Log ra console để debug — đây là chỗ đã tìm ra 2 con bug thật lúc
      // build (StrictMode double-invoke, và lỗi resolve module của
      // pagedjs) — nếu không log thì chỉ thấy status chuyển sang 'error'
      // mà không biết lý do gì.
      console.error("[PagedPreview] preview() failed:", error);
      if (!cancelled) setStatus("error");
    });

    // Cleanup function — React tự gọi hàm này khi component unmount (hoặc
    // trước khi effect chạy lại, nhưng ở đây deps=[] nên chỉ có unmount).
    // Chỉ làm 1 việc: lật cờ cancelled lên true, để nếu run() vẫn đang chạy
    // dở thì nó biết đường dừng set state khi resolve xong.
    return () => {
      cancelled = true;
    };
  }, []); // deps rỗng = effect này chỉ chạy đúng 1 lần, ngay sau lần render đầu tiên.

  return (
    <div>
      {/* Dòng trạng thái — đổi theo state `status` (và `pageCount` khi done).
          Đây là NƠI DUY NHẤT 2 state ở trên được đọc lại để hiển thị. */}
      <p className="mb-4 text-center text-sm text-neutral-500">
        {status === "loading" && "Paginating with Paged.js…"}
        {status === "error" && "Failed to paginate — check the console."}
        {status === "done" && `Rendered as ${pageCount} page(s).`}
      </p>

      {/* sourceRef: ẩn hoàn toàn (display:none qua class `hidden`).
          <ResumeContent> render bình thường qua React ở đây — mục đích chỉ
          để có DOM thật, rồi effect ở trên đọc .innerHTML ra dùng.
          Không xoá div này đi được — nếu xoá thì sourceRef.current sẽ luôn
          null, effect sẽ return sớm ở dòng guard, không paginate gì cả. */}
      <div ref={sourceRef} className="hidden">
        <ResumeContent resume={resume} />
      </div>

      {/* targetRef: rỗng trong JSX (không có children ở đây), nhưng sau khi
          preview() chạy xong, Paged.js sẽ tự đắp DOM vào bên trong div này
          (các .pagedjs_page — style ở index.css). React không hề biết nội
          dung bên trong div này là gì sau đó — nếu React re-render lại
          PagedPreview vì lý do khác (vd prop `resume` đổi), JSX <div
          ref={targetRef} /> vẫn là "rỗng" theo React, nhưng DOM thật thì
          không rỗng — đây cũng là 1 phần lý do effect chỉ nên chạy 1 lần. */}
      <div ref={targetRef} />
    </div>
  );
};

export default PagedPreview;
