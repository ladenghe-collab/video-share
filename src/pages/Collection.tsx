import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Play, Film } from "lucide-react";
import { supabase } from "@/lib/supabase";

interface Video {
  id: string;
  title: string;
  video_url: string;
  created_at: string;
}

export default function Collection() {
  const [videos, setVideos] = useState<Video[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-5xl mx-auto p-6 pt-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4 text-blue-600">
            <Film size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">精彩视频合集</h1>
          <p className="text-slate-500 text-lg">在这里探索和发现所有分享的视频</p>
        </header>

        {loading ? (
          <div className="flex justify-center items-center py-20">
            <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          </div>
        ) : videos.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl shadow-sm border border-slate-200">
            <div className="text-slate-400 mb-4 flex justify-center">
              <Film size={48} />
            </div>
            <h3 className="text-xl font-medium text-slate-900 mb-2">暂无视频</h3>
            <p className="text-slate-500">博主还没有上传任何视频哦，稍后再来看看吧~</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {videos.map((video) => (
              <Link 
                to={`/v/${video.id}`} 
                key={video.id}
                className="group bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden hover:shadow-md transition-all duration-300"
              >
                {/* Thumbnail Area - Using a video element with a specific timestamp or just an overlay */}
                <div className="aspect-video bg-slate-100 relative overflow-hidden flex items-center justify-center">
                  <video 
                    src={`${video.video_url}#t=0.1`} 
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 bg-slate-900/10 group-hover:bg-slate-900/20 transition-colors flex items-center justify-center">
                    <div className="w-12 h-12 bg-white/90 backdrop-blur-sm rounded-full flex items-center justify-center text-blue-600 shadow-lg transform scale-90 group-hover:scale-100 transition-transform">
                      <Play size={24} className="ml-1" />
                    </div>
                  </div>
                </div>
                
                {/* Info Area */}
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900 mb-2 line-clamp-2 group-hover:text-blue-600 transition-colors">
                    {video.title}
                  </h3>
                  <div className="flex items-center text-sm text-slate-400">
                    <span>
                      {new Date(video.created_at).toLocaleDateString('zh-CN', {
                        year: 'numeric', month: 'short', day: 'numeric'
                      })}
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
