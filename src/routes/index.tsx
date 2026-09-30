import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useRef, useState, type ChangeEvent, type DragEvent } from "react";
import { Button } from "@/components/ui/button";
import {
  ArrowDownToLine, ArrowLeft, AudioLines, Captions, Check, ChevronDown, Clapperboard,
  Clock3, CloudUpload, Crown, FileVideo, Film, FolderOpen, Home, Link2, Loader2,
  Menu, MoreHorizontal, Music2, Pause, Pencil, Play, Plus, Scissors, Settings2,
  Sparkles, Star, Trash2, Upload, Volume2, WandSparkles, X,
} from "lucide-react";
import yoga from "@/assets/sample-yoga.jpg";
import gym from "@/assets/sample-gym.jpg";
import portrait from "@/assets/sample-portrait.jpg";
import fitness from "@/assets/sample-fitness.jpg";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [
    { title: "Clips — Biến video dài thành video ngắn" },
    { name: "description", content: "Không gian tạo và chỉnh sửa video ngắn: tải video lên, khám phá mẫu, cắt ghép và xuất video." },
    { property: "og:title", content: "Clips — Biến video dài thành video ngắn" },
    { property: "og:description", content: "Tạo video ngắn từ video của bạn trong một không gian chỉnh sửa trực quan." },
    { property: "og:type", content: "website" },
    { name: "twitter:card", content: "summary_large_image" },
  ] }),
  component: Index,
});

type Media = { id: string; name: string; src: string; kind: "video" | "image"; duration?: number; sample?: boolean };
const samples: Media[] = [
  { id: "s1", name: "Video mẫu 1", src: yoga, kind: "image", sample: true, duration: 8 },
  { id: "s2", name: "Video mẫu 2", src: gym, kind: "image", sample: true, duration: 8 },
  { id: "s3", name: "Video mẫu 3", src: portrait, kind: "image", sample: true, duration: 8 },
  { id: "s4", name: "Video mẫu 4", src: fitness, kind: "image", sample: true, duration: 8 },
  { id: "s5", name: "Video mẫu 5", src: portrait, kind: "image", sample: true, duration: 8 },
  { id: "s6", name: "Video mẫu 6", src: gym, kind: "image", sample: true, duration: 8 },
];
const tools = [
  { label: "Slide Đồ Họa AI", icon: FileVideo }, { label: "Đồng Bộ Nhép Nhạc", icon: Music2 },
  { label: "Lọc Màu Điện Ảnh", icon: Settings2 }, { label: "AI Chấm Điểm Chất Lượng", icon: Sparkles },
  { label: "Video Dài → Short", icon: Clapperboard }, { label: "Nhập Từ YouTube/Drive", icon: ArrowDownToLine },
  { label: "Hook Mở Đầu", icon: Star }, { label: "Caption Đồng Bộ", icon: Captions },
  { label: "Cắt Khoảng Lặng Tự Động", icon: Scissors }, { label: "Slide Đồ Họa AI", icon: FileVideo },
  { label: "Đồng Bộ Nhép Nhạc", icon: Music2 }, { label: "Lọc Màu Điện Ảnh", icon: Settings2 },
];

function Index() {
  const [url, setUrl] = useState("");
  const [projects, setProjects] = useState<Media[]>([]);
  const [active, setActive] = useState<Media | null>(null);
  const [tab, setTab] = useState<"all" | "draft" | "upload">("all");
  const [dragging, setDragging] = useState(false);
  const [starred, setStarred] = useState<string[]>([]);
  const [notice, setNotice] = useState("");
  const [menuOpen, setMenuOpen] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const showNotice = (text: string) => { setNotice(text); window.setTimeout(() => setNotice(""), 4000); };

  useEffect(() => () => { projects.forEach(p => { if (p.src.startsWith("blob:")) URL.revokeObjectURL(p.src); }); }, [projects]);

  function addFiles(files: FileList | File[]) {
    const videos = Array.from(files).filter(f => f.type.startsWith("video/"));
    if (!videos.length) { showNotice("Vui lòng chọn tệp video để tải lên."); return; }
    const incoming = videos.map(f => ({ id: crypto.randomUUID(), name: f.name.replace(/\.[^/.]+$/, ""), src: URL.createObjectURL(f), kind: "video" as const }));
    setProjects(prev => [...incoming, ...prev]); setActive(incoming[0]);
  }
  function fromUrl() {
    const value = url.trim();
    if (!value) { showNotice("Hãy dán liên kết video trước."); return; }
    try {
      const parsed = new URL(value);
      if (!/^https?:$/.test(parsed.protocol)) throw Error();
      if (!/\.(mp4|webm|ogg|mov)(\?|#|$)/i.test(parsed.pathname + parsed.search)) {
        showNotice("Hãy dùng liên kết trực tiếp đến tệp MP4, WebM hoặc OGG. YouTube và Drive chưa được hỗ trợ."); return;
      }
      const item: Media = { id: crypto.randomUUID(), name: decodeURIComponent(parsed.pathname.split("/").pop() || "Video mới"), src: value, kind: "video" };
      setProjects(prev => [item, ...prev]); setActive(item); setUrl("");
    } catch { showNotice("Liên kết video không hợp lệ."); }
  }
  function handleDrop(e: DragEvent) { e.preventDefault(); setDragging(false); addFiles(e.dataTransfer.files); }
  function openSample(item: Media) { setActive(item); }
  function toggleStar(id: string) { setStarred(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]); }
  const visibleProjects = tab === "upload" ? projects : tab === "draft" ? projects.filter(p => starred.includes(p.id)) : projects;

  return <div className="min-h-screen bg-background text-foreground">
    <header className="header-glow relative z-10 flex min-h-14 items-center justify-between gap-4 border-b border-border px-4 sm:px-7">
      <div className="flex min-w-0 items-center gap-4 sm:gap-5">
        <a href="/" className="brand-script shrink-0 text-3xl sm:text-4xl">Clips</a>
        <span className="hidden truncate text-xs font-bold sm:block">Video dài → Nhiều Short</span>
      </div>
      <span className="hidden text-xs font-semibold text-foreground/80 lg:block">Thời Gian · Thu Nhập · Tự Do</span>
      <nav className="hidden shrink-0 items-center gap-2 sm:flex">
        <Button variant="nav" size="sm" onClick={() => showNotice("Gói của bạn: miễn phí.")}><Crown className="text-primary" /> Giá cả</Button>
        <Button variant="nav" size="sm" onClick={() => document.getElementById("projects")?.scrollIntoView({ behavior: "smooth" })}><FolderOpen className="text-primary" /> Dự án</Button>
        <Button variant="nav" size="sm" onClick={() => document.getElementById("features")?.scrollIntoView({ behavior: "smooth" })}><Sparkles className="text-primary" /> Âm thanh</Button>
        <Button variant="nav" size="sm" onClick={() => showNotice("Đăng nhập sẽ khả dụng khi kết nối tài khoản.")}>Đăng nhập</Button>
      </nav>
      <Button variant="nav" size="icon" className="sm:hidden" aria-label="Mở menu" onClick={() => setMenuOpen(!menuOpen)}><Menu /></Button>
      {menuOpen && <div className="absolute right-4 top-14 z-30 flex w-44 flex-col gap-1 rounded-md border border-border bg-card p-2 shadow-xl sm:hidden">
        <Button variant="subtle" onClick={() => { document.getElementById("projects")?.scrollIntoView(); setMenuOpen(false); }}>Dự án</Button>
        <Button variant="subtle" onClick={() => { document.getElementById("features")?.scrollIntoView(); setMenuOpen(false); }}>Công cụ AI</Button>
        <Button variant="subtle" onClick={() => { showNotice("Đăng nhập sẽ khả dụng khi kết nối tài khoản."); setMenuOpen(false); }}>Đăng nhập</Button>
      </div>}
    </header>

    <Button variant="nav" size="sm" className="ml-3 mt-3 min-w-32 justify-start border-gold-muted/50 text-gold-muted" onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}><Home /> Trang chủ</Button>

    <main className="mx-auto max-w-[1110px] px-4 pb-24">
      <section className="relative flex flex-col items-center pt-1 text-center sm:pt-0">
        <div className="hero-watermark absolute left-1/2 top-8 -translate-x-1/2">Clipsale</div>
        <div className="relative z-[1] mt-2 w-full max-w-[340px]">
          <h1 className="text-sm font-bold sm:text-base">Biến video thô thành content viral — tự động, bằng AI.</h1>
          <p className="mt-4 text-xs font-medium text-muted-foreground">Kéo thả video dài — AI quét và đề xuất đoạn hay nhất.</p>
          <div className="upload-panel mt-2 rounded-lg p-3 text-left shadow-xl">
            <div className="flex gap-2">
              <input className="min-w-0 flex-1 rounded-md border border-border bg-background px-3 text-xs text-foreground outline-none placeholder:text-muted-foreground focus:border-primary" value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === "Enter" && fromUrl()} placeholder="Dán link YouTube, Google Drive, hoặc link file video" aria-label="Liên kết video" />
              <Button variant="gold" size="sm" className="shrink-0" onClick={fromUrl}>Lấy video</Button>
            </div>
            <div className="my-2 flex items-center gap-3 text-[10px] font-semibold text-muted-foreground"><span className="h-px flex-1 bg-border" />HOẶC<span className="h-px flex-1 bg-border" /></div>
            <div className={`upload-drop rounded-md p-2 transition-colors ${dragging ? "dragging" : ""}`} onDragOver={e => { e.preventDefault(); setDragging(true); }} onDragLeave={() => setDragging(false)} onDrop={handleDrop}>
              <Button variant="subtle" className="h-auto w-full justify-start gap-3 px-1 py-1 text-left" onClick={() => fileRef.current?.click()}>
                <span className="grid size-9 shrink-0 place-items-center rounded-md bg-secondary text-primary"><CloudUpload /></span>
                <span className="flex min-w-0 flex-col"><strong className="text-xs text-foreground">Kéo thả file video vào đây</strong><small className="text-[10px] font-normal text-muted-foreground">hoặc bấm để chọn file từ máy</small></span>
              </Button>
              <input ref={fileRef} type="file" accept="video/*" multiple className="hidden" onChange={(e: ChangeEvent<HTMLInputElement>) => { if (e.target.files) addFiles(e.target.files); e.target.value = ""; }} />
            </div>
          </div>
          <div className="mt-5 flex flex-wrap items-center justify-center gap-2 text-[11px] text-muted-foreground">
            <span>Chế độ mặc:</span><Button variant="subtle" size="sm" className="h-6 px-1">Talking-head</Button><Button variant="subtle" size="sm" className="h-6 px-1">Nhiều clip + Nhạc</Button><span className="border-b border-primary pb-1 font-semibold text-gold-muted">Video dài → Short</span>
          </div>
        </div>
      </section>

      <section id="features" className="mt-9 sm:mt-8">
        <h2 className="text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Được hỗ trợ bởi AI</h2>
        <div className="mx-auto mt-4 flex max-w-[1050px] flex-wrap justify-center gap-x-5 gap-y-5 sm:gap-x-6">
          {tools.map((tool, i) => <div key={`${tool.label}-${i}`} className="group flex w-[72px] flex-col items-center gap-2 text-center sm:w-[77px]" title={tool.label}>
            <div className="tool-circle grid size-10 place-items-center rounded-full"><tool.icon size={17} strokeWidth={1.8} /></div>
            <span className="text-[9px] font-bold leading-tight text-foreground/80">{tool.label}</span>
          </div>)}
        </div>
      </section>

      <section className="mx-auto mt-11 max-w-[920px]">
        <h2 className="mb-4 text-center text-[11px] font-bold uppercase tracking-widest text-muted-foreground">Video mẫu</h2>
        <div className="grid grid-cols-3 gap-2.5 sm:grid-cols-6 sm:gap-3">
          {samples.map((sample, i) => <div key={sample.id} className="sample-card group relative min-w-0 overflow-hidden rounded-lg">
            <Button variant="subtle" size="icon" className="absolute right-1.5 top-1.5 z-10 size-6 rounded-full bg-card/80 text-foreground" aria-label={`Chọn ${sample.name}`} title={`Chọn ${sample.name}`} onClick={() => openSample(sample)}><Volume2 className="size-3" /></Button>
            <Button variant="subtle" className="relative block h-auto w-full overflow-hidden rounded-none p-0" onClick={() => openSample(sample)} aria-label={`Mở ${sample.name}`}>
              <img src={sample.src} alt={sample.name} width={768} height={1280} loading="lazy" className="aspect-[9/16] w-full object-cover" />
              {i === 4 && <span className="absolute bottom-8 left-1/2 w-full -translate-x-1/2 text-center text-sm font-bold overlay-caption">Follow us for</span>}
              <span className="absolute inset-0 grid place-items-center bg-background/0 opacity-0 transition-all group-hover:bg-background/20 group-hover:opacity-100"><Play className="size-8 fill-current text-primary" /></span>
            </Button>
            <div className="truncate px-2 py-2 text-[10px] font-semibold">{sample.name}</div>
          </div>)}
        </div>
      </section>

      <section id="projects" className="mx-auto mt-10 max-w-[760px]">
        <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-2 border-b border-border pb-2">
          <div className="flex min-w-0 items-center gap-1 overflow-x-auto">
            <Button variant="subtle" size="sm" className={`shrink-0 rounded-none px-2 text-[11px] ${tab === "all" ? "border-b border-primary text-foreground" : ""}`} onClick={() => setTab("all")}>Tất cả các dự án ({projects.length + 2})</Button>
            <Button variant="subtle" size="sm" className={`shrink-0 rounded-none px-2 text-[11px] ${tab === "draft" ? "border-b border-primary text-foreground" : ""}`} onClick={() => setTab("draft")}>Dự án đã lưu ({starred.length})</Button>
            <Button variant="subtle" size="sm" className={`shrink-0 rounded-none px-2 text-[11px] ${tab === "upload" ? "border-b border-primary text-foreground" : ""}`} onClick={() => setTab("upload")}>Nháp</Button>
          </div>
          <div className="hidden items-center gap-1 sm:flex"><Button variant="subtle" size="sm" className="text-[11px]" onClick={() => fileRef.current?.click()}>Chọn nhiều</Button><Button variant="subtle" size="sm" className="text-[11px]" onClick={() => setTab("all")}>Xem tất cả</Button></div>
        </div>
        <div className="mt-3 grid grid-cols-2 gap-2.5 sm:grid-cols-5">
          {(tab === "all" ? ["placeholder1", "placeholder2"] : []).map((id, i) => <div key={id} className="project-card overflow-hidden rounded-md">
            <Button variant="subtle" className="relative flex h-[92px] w-full flex-col items-center justify-center rounded-none border-b border-border bg-secondary/60 p-2" onClick={() => fileRef.current?.click()}>
              <span className="mb-1 grid size-7 place-items-center rounded-full bg-primary text-primary-foreground"><Play className="size-3 fill-current" /></span>
              <span className="text-center text-[9px] font-semibold leading-tight">{i === 0 ? "Bài giảng kinh doanh — bấm để xem & chỉnh" : "Bài giảng thiết kế — bấm để xem & chỉnh"}</span>
            </Button>
            <div className="px-2 py-2"><p className="truncate text-[10px] font-bold">{i === 0 ? "Bếp + nhạc nền" : "4 clip + nhạc nền"}</p><p className="mt-1 text-[9px] text-muted-foreground">Bản nháp · Chưa có media</p></div>
          </div>)}
          {visibleProjects.map((item) => <div key={item.id} className="project-card group relative min-w-0 overflow-hidden rounded-md">
            <div className="relative h-[92px] overflow-hidden bg-secondary"><video src={item.src} muted preload="metadata" className="h-full w-full object-cover" />
              <Button variant="subtle" size="icon" className="absolute inset-0 m-auto size-8 rounded-full bg-card/80 text-primary" aria-label={`Mở ${item.name}`} onClick={() => setActive(item)}><Play className="fill-current" /></Button>
              <Button variant="subtle" size="icon" className="absolute right-1 top-1 size-6 rounded-full bg-card/80" aria-label={starred.includes(item.id) ? "Bỏ lưu" : "Lưu dự án"} onClick={() => toggleStar(item.id)}><Star className={`size-3 ${starred.includes(item.id) ? "fill-current text-primary" : ""}`} /></Button>
            </div>
            <div className="flex items-start justify-between gap-1 px-2 py-2"><div className="min-w-0"><p className="truncate text-[10px] font-bold" title={item.name}>{item.name}</p><p className="mt-1 text-[9px] text-muted-foreground">Vừa tải lên · Bản nháp</p></div><Button variant="subtle" size="icon" className="size-5 shrink-0" aria-label={`Xóa ${item.name}`} onClick={() => { setProjects(prev => prev.filter(p => p.id !== item.id)); if (item.src.startsWith("blob:")) URL.revokeObjectURL(item.src); }}><Trash2 className="size-3" /></Button></div>
          </div>)}
          {tab !== "all" && !visibleProjects.length && <p className="col-span-full py-8 text-center text-xs text-muted-foreground">Chưa có dự án nào trong mục này.</p>}
        </div>
      </section>
    </main>
    <Button variant="tool" size="icon" className="fixed bottom-4 left-4 z-20 size-11 rounded-full border-gold-muted text-primary shadow-xl" aria-label="Góp ý" title="Góp ý" onClick={() => showNotice("Cảm ơn bạn đã sử dụng Clips!")}><Pencil /></Button>
    {notice && <div role="status" className="fixed bottom-5 left-1/2 z-50 w-max max-w-[90vw] -translate-x-1/2 rounded-md border border-border bg-card px-4 py-3 text-xs shadow-xl">{notice}</div>}
    {active && <Editor key={active.id} media={active} onClose={() => setActive(null)} onNotice={showNotice} />}
  </div>;
}

function Editor({ media, onClose, onNotice }: { media: Media; onClose: () => void; onNotice: (text: string) => void }) {
  const [duration, setDuration] = useState(media.duration || 30);
  const [start, setStart] = useState(0);
  const [end, setEnd] = useState(media.duration || 30);
  const [current, setCurrent] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [caption, setCaption] = useState("");
  const [aspect, setAspect] = useState<"9:16" | "1:1" | "16:9">("9:16");
  const [speed, setSpeed] = useState(1);
  const [volume, setVolume] = useState(1);
  const [exporting, setExporting] = useState(false);
  const [tool, setTool] = useState<"trim" | "caption" | "audio">("trim");
  const videoRef = useRef<HTMLVideoElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  useEffect(() => { const onKey = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); }; window.addEventListener("keydown", onKey); return () => window.removeEventListener("keydown", onKey); }, [onClose]);
  useEffect(() => { if (videoRef.current) { videoRef.current.playbackRate = speed; videoRef.current.volume = volume; } }, [speed, volume]);
  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);
  function togglePlay() {
    if (media.kind === "image") {
      if (timerRef.current) { clearInterval(timerRef.current); timerRef.current = null; setPlaying(false); return; }
      setPlaying(true); timerRef.current = setInterval(() => setCurrent(prev => { if (prev + .1 * speed >= end) { if (timerRef.current) clearInterval(timerRef.current); timerRef.current = null; setPlaying(false); return start; } return prev + .1 * speed; }), 100); return;
    }
    const video = videoRef.current; if (!video) return;
    if (video.paused) { if (video.currentTime < start || video.currentTime >= end) video.currentTime = start; video.play().then(() => setPlaying(true)).catch(() => onNotice("Không thể phát video này. Hãy thử tải tệp từ máy.")); }
    else { video.pause(); setPlaying(false); }
  }
  function seek(value: number) { setCurrent(value); if (videoRef.current) videoRef.current.currentTime = value; }
  async function exportVideo() {
    if (!window.MediaRecorder || !HTMLCanvasElement.prototype.captureStream) { onNotice("Trình duyệt này chưa hỗ trợ xuất video. Hãy dùng Chrome hoặc Edge."); return; }
    const image = imageRef.current; const video = videoRef.current;
    if (media.kind === "image" && !image?.complete) { onNotice("Ảnh mẫu chưa tải xong."); return; }
    if (media.kind === "video" && !video?.videoWidth) { onNotice("Video chưa sẵn sàng hoặc nguồn không cho phép chỉnh sửa."); return; }
    setExporting(true); setPlaying(false);
    if (timerRef.current) clearInterval(timerRef.current);
    const canvas = document.createElement("canvas");
    const [w, h] = aspect === "9:16" ? [540, 960] : aspect === "1:1" ? [720, 720] : [960, 540];
    canvas.width = w; canvas.height = h;
    const ctx = canvas.getContext("2d"); if (!ctx) { setExporting(false); return; }
    const mime = MediaRecorder.isTypeSupported("video/webm;codecs=vp9") ? "video/webm;codecs=vp9" : "video/webm";
    const stream = canvas.captureStream(30);
    const recorder = new MediaRecorder(stream, { mimeType: mime, videoBitsPerSecond: 2500000 });
    const chunks: Blob[] = [];
    recorder.ondataavailable = e => { if (e.data.size) chunks.push(e.data); };
    recorder.onstop = () => { const blob = new Blob(chunks, { type: "video/webm" }); const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download = `${media.name.replace(/[^a-z0-9-_\u00C0-\u1EF9]/gi, "-")}-clips.webm`; a.click(); window.setTimeout(() => URL.revokeObjectURL(a.href), 60000); stream.getTracks().forEach(t => t.stop()); setExporting(false); onNotice("Đã xuất video WebM (chưa gồm âm thanh)."); };
    try {
      if (video) { video.pause(); video.currentTime = start; await new Promise<void>(resolve => { if (Math.abs(video.currentTime - start) < .1 && video.readyState >= 2) resolve(); else video.addEventListener("seeked", () => resolve(), { once: true }); }); video.muted = true; video.playbackRate = speed; await video.play(); }
      recorder.start();
      const exportStart = performance.now();
      const source = media.kind === "image" ? image : video;
      const sourceWidth = media.kind === "image" ? image?.naturalWidth : video?.videoWidth;
      const sourceHeight = media.kind === "image" ? image?.naturalHeight : video?.videoHeight;
      const draw = (now: number) => {
        if (recorder.state !== "recording") return;
        const elapsed = (now - exportStart) / 1000 * speed;
        if (elapsed >= end - start) { video?.pause(); recorder.stop(); return; }
        ctx.fillStyle = "#000"; ctx.fillRect(0, 0, w, h);
        if (source && sourceWidth && sourceHeight) {
          const scale = Math.max(w / sourceWidth, h / sourceHeight); const dw = sourceWidth * scale; const dh = sourceHeight * scale;
          try { ctx.drawImage(source, (w - dw) / 2, (h - dh) / 2, dw, dh); } catch { recorder.stop(); setExporting(false); onNotice("Nguồn video không cho phép xuất. Hãy tải tệp video từ máy."); return; }
        }
        if (caption.trim()) { ctx.font = `bold ${Math.round(w * .052)}px sans-serif`; ctx.textAlign = "center"; ctx.lineWidth = 5; ctx.strokeStyle = "#111"; ctx.fillStyle = "#fff"; const words = caption.trim().split(" "); let line = ""; const lines: string[] = []; words.forEach(word => { const next = line ? line + " " + word : word; if (ctx.measureText(next).width > w * .82 && line) { lines.push(line); line = word; } else line = next; }); if (line) lines.push(line); lines.slice(0, 3).forEach((text, i) => { const y = h * .78 + i * w * .065; ctx.strokeText(text, w / 2, y); ctx.fillText(text, w / 2, y); }); }
        requestAnimationFrame(draw);
      };
      requestAnimationFrame(draw);
    } catch { if (recorder.state === "recording") recorder.stop(); setExporting(false); onNotice("Không thể xuất nguồn này. Hãy tải video từ máy để thử lại."); }
  }
  return <div className="editor-backdrop fixed inset-0 z-40 flex items-center justify-center p-2 sm:p-5" role="dialog" aria-modal="true" aria-label="Trình chỉnh sửa video">
    <div className="editor-surface flex h-[min(860px,96vh)] w-full max-w-[1200px] flex-col overflow-hidden rounded-lg">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border px-4 py-3">
        <div className="flex min-w-0 items-center gap-3"><Button variant="subtle" size="icon" className="size-8 shrink-0" aria-label="Quay lại" onClick={onClose}><ArrowLeft /></Button><div className="min-w-0"><h2 className="truncate text-sm font-bold">{media.name}</h2><p className="text-[10px] text-muted-foreground">{media.sample ? "Ảnh xem trước · Thay bằng video của bạn sau" : "Dự án video"}</p></div></div>
        <div className="flex items-center gap-2"><Button variant="gold" size="sm" disabled={exporting} onClick={exportVideo}>{exporting ? <Loader2 className="animate-spin" /> : <ArrowDownToLine />}{exporting ? "Đang xuất" : "Xuất video"}</Button><Button variant="subtle" size="icon" className="size-8" aria-label="Đóng" onClick={onClose}><X /></Button></div>
      </div>
      <div className="flex min-h-0 flex-1 flex-col lg:flex-row">
        <div className="editor-preview flex min-h-0 flex-1 flex-col items-center justify-center gap-3 overflow-hidden p-3 sm:p-5">
          <div className={`relative max-h-full overflow-hidden bg-background shadow-xl ${aspect === "9:16" ? "aspect-[9/16] h-full max-w-full" : aspect === "1:1" ? "aspect-square h-full max-w-full" : "aspect-video w-full max-h-full"}`}>
            {media.kind === "image" ? <img ref={imageRef} src={media.src} alt={media.name} className="h-full w-full object-cover" /> : <video ref={videoRef} src={media.src} className="h-full w-full object-cover" playsInline onLoadedMetadata={e => { const d = Number.isFinite(e.currentTarget.duration) ? e.currentTarget.duration : 30; setDuration(d); setEnd(d); }} onTimeUpdate={e => { const time = e.currentTarget.currentTime; setCurrent(time); if (time >= end) { e.currentTarget.pause(); setPlaying(false); } }} onPause={() => setPlaying(false)} onError={() => onNotice("Không thể tải video này. Hãy thử tải tệp từ máy.")} />}
            {caption && <div className="overlay-caption pointer-events-none absolute bottom-[17%] left-2 right-2 text-center text-base font-extrabold leading-tight text-foreground sm:text-xl">{caption}</div>}
            <Button variant="subtle" size="icon" className="absolute left-1/2 top-1/2 size-12 -translate-x-1/2 -translate-y-1/2 rounded-full bg-card/75 text-primary hover:bg-card" aria-label={playing ? "Tạm dừng" : "Phát"} onClick={togglePlay}>{playing ? <Pause className="size-6 fill-current" /> : <Play className="size-6 fill-current" />}</Button>
          </div>
        </div>
        <aside className="flex w-full shrink-0 flex-col border-t border-border bg-card lg:w-[290px] lg:border-l lg:border-t-0">
          <div className="flex border-b border-border p-2">
            {([{ key: "trim", label: "Cắt", icon: Scissors }, { key: "caption", label: "Chữ", icon: Captions }, { key: "audio", label: "Âm thanh", icon: AudioLines }] as const).map(t => <Button key={t.key} variant="subtle" size="sm" className={`h-9 flex-1 text-xs ${tool === t.key ? "bg-secondary text-primary" : ""}`} onClick={() => setTool(t.key)}><t.icon />{t.label}</Button>)}
          </div>
          <div className="space-y-5 overflow-y-auto p-4 text-xs">
            {tool === "trim" && <><h3 className="text-sm font-bold">Cắt video</h3><label className="block space-y-2"><span className="flex justify-between"><span>Bắt đầu</span><span>{start.toFixed(1)}s</span></span><input type="range" min="0" max={Math.max(0, end - .1)} step="0.1" value={start} className="range-gold" onChange={e => { const n = Number(e.target.value); setStart(n); seek(n); }} /></label><label className="block space-y-2"><span className="flex justify-between"><span>Kết thúc</span><span>{end.toFixed(1)}s</span></span><input type="range" min={Math.min(duration, start + .1)} max={duration} step="0.1" value={end} className="range-gold" onChange={e => setEnd(Number(e.target.value))} /></label><p className="text-muted-foreground">Độ dài: {(end - start).toFixed(1)} giây</p></>}
            {tool === "caption" && <><h3 className="text-sm font-bold">Văn bản trên video</h3><label className="block space-y-2"><span>Nội dung</span><input value={caption} maxLength={100} onChange={e => setCaption(e.target.value)} placeholder="Nhập dòng chữ của bạn..." className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground outline-none focus:border-primary" /></label><p className="text-muted-foreground">Chữ sẽ hiển thị ở phần dưới của video.</p></>}
            {tool === "audio" && <><h3 className="text-sm font-bold">Âm thanh & tốc độ</h3><label className="block space-y-2"><span className="flex justify-between"><span>Âm lượng xem trước</span><span>{Math.round(volume * 100)}%</span></span><input type="range" min="0" max="1" step="0.05" value={volume} className="range-gold" onChange={e => setVolume(Number(e.target.value))} /></label><label className="block space-y-2"><span>Tốc độ phát</span><select value={speed} onChange={e => setSpeed(Number(e.target.value))} className="w-full rounded-md border border-border bg-background px-3 py-2 text-foreground"><option value="0.5">0.5×</option><option value="1">1×</option><option value="1.5">1.5×</option><option value="2">2×</option></select></label><p className="text-muted-foreground">Video xuất hiện chỉ gồm hình ảnh, chưa có âm thanh.</p></>}
            <div className="border-t border-border pt-4"><h3 className="mb-3 text-sm font-bold">Tỷ lệ khung hình</h3><div className="flex gap-2">{(["9:16", "1:1", "16:9"] as const).map(value => <Button key={value} variant={aspect === value ? "gold" : "tool"} size="sm" className="flex-1" onClick={() => setAspect(value)}>{value}</Button>)}</div></div>
          </div>
        </aside>
      </div>
      <div className="border-t border-border bg-card px-4 py-3"><div className="flex items-center gap-3"><Button variant="subtle" size="icon" className="size-8 shrink-0" aria-label={playing ? "Tạm dừng" : "Phát"} onClick={togglePlay}>{playing ? <Pause /> : <Play />}</Button><span className="w-10 shrink-0 text-[11px] tabular-nums text-muted-foreground">{current.toFixed(1)}s</span><input type="range" min={start} max={end} step="0.1" value={Math.max(start, Math.min(end, current))} className="range-gold min-w-0 flex-1" aria-label="Tua video" onChange={e => seek(Number(e.target.value))} /><span className="w-10 shrink-0 text-right text-[11px] tabular-nums text-muted-foreground">{end.toFixed(1)}s</span></div></div>
    </div>
  </div>;
}