import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Film, AlertCircle, ArrowLeft, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase";

export default function PlayPage() {
  const { id } = useParams<{ id: string }>();
  const [videoUrl, setVideoUrl] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchVideo() {
      if (!id) {
        setError("无效的视频链接");
        setLoading(false);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("videos")
          .select("video_url, title")
          .eq("id", id)
          .single();

        if (error || !data) {
          throw new Error("视频不存在或已被删除");
        }

        setVideoUrl(data.video_url);
        setTitle(data.title);
      } catch (err) {
        setError(err instanceof Error ? err.message : "无法加载视频");
      } finally {
        setLoading(false);
      }
    }

    fetchVideo();
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <Loader2 className="animate-spin text-blue-600 mb-4" size={40} />
        <p className="text-slate-500 font-medium">正在加载视频...</p>
      </div>
    );
  }

  if (error || !videoUrl) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6">
        <div className="bg-white p-8 rounded-3xl shadow-sm border border-red-100 max-w-md w-full text-center">
          <div className="inline-flex p-4 bg-red-50 text-red-500 rounded-full mb-4">
            <AlertCircle size={40} />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">加载失败</h2>
          <p className="text-slate-500 mb-8">{error}</p>
          <Link 
            to="/" 
            className="inline-flex items-center justify-center w-full py-3 px-4 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
          >
            <ArrowLeft size={18} className="mr-2" /> 返回首页
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 font-sans flex flex-col">
      <header className="bg-white border-b border-slate-200 px-4 py-3 flex items-center sticky top-0 z-10">
        <Link to="/" className="p-2 -ml-2 text-slate-400 hover:text-slate-700 transition-colors rounded-lg hover:bg-slate-100 mr-2">
          <ArrowLeft size={20} />
        </Link>
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <Film size={20} className="text-blue-600 shrink-0" />
          <h1 className="text-slate-900 font-medium truncate">{title || "视频播放"}</h1>
        </div>
      </header>

      <main className="flex-1 flex flex-col max-w-5xl mx-auto w-full p-4 md:p-8">
        <div className="bg-black rounded-2xl md:rounded-3xl overflow-hidden shadow-lg border border-slate-200/50 aspect-video relative w-full flex items-center justify-center">
          <video
            src={videoUrl}
            controls
            autoPlay
            playsInline
            className="w-full h-full object-contain"
            style={{ maxHeight: '80vh' }}
          >
            您的浏览器不支持播放该视频。
          </video>
        </div>
        
        <div className="mt-6 md:mt-8 bg-white p-6 rounded-2xl md:rounded-3xl shadow-sm border border-slate-200">
          <h2 className="text-xl font-bold text-slate-900 mb-2">{title}</h2>
          <p className="text-slate-500 text-sm">扫描二维码或通过链接访问该视频</p>
        </div>
      </main>
    </div>
  );
}