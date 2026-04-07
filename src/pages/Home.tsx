import { useState, useEffect } from "react";
import { Upload, Link as LinkIcon, Check, Copy, Film, Trash2 } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";

interface UploadedVideo {
  id: string;
  title: string;
  video_url: string;
  created_at: string;
}

export default function Home() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [uploadedVideo, setUploadedVideo] = useState<UploadedVideo | null>(null);
  const [copied, setCopied] = useState(false);
  const [myVideos, setMyVideos] = useState<UploadedVideo[]>([]);

  // Load previously uploaded videos from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("my_videos");
    if (saved) {
      try {
        setMyVideos(JSON.parse(saved));
      } catch (e) {
        console.error(e);
      }
    }
  }, []);

  const saveToLocal = (video: UploadedVideo) => {
    const updated = [video, ...myVideos];
    setMyVideos(updated);
    localStorage.setItem("my_videos", JSON.stringify(updated));
  };

  const removeFromLocal = (id: string) => {
    const updated = myVideos.filter(v => v.id !== id);
    setMyVideos(updated);
    localStorage.setItem("my_videos", JSON.stringify(updated));
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
      setUploadedVideo(null); // Reset
    }
  };

  const handleUpload = async () => {
    if (!file) return;

    try {
      setUploading(true);
      setProgress(10); // Start progress

      const fileExt = file.name.split('.').pop();
      const fileName = `${Math.random().toString(36).substring(2, 15)}_${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('videos')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: false,
        });

      if (uploadError) {
        throw uploadError;
      }
      setProgress(60); // File uploaded

      // Get public URL
      const { data: publicUrlData } = supabase.storage
        .from('videos')
        .getPublicUrl(filePath);

      const publicUrl = publicUrlData.publicUrl;

      // Insert record into videos table
      const { data: dbData, error: dbError } = await supabase
        .from('videos')
        .insert([
          {
            title: file.name,
            video_url: publicUrl,
          }
        ])
        .select()
        .single();

      if (dbError) {
        throw dbError;
      }

      setProgress(100);
      setUploadedVideo(dbData);
      saveToLocal(dbData);
      setFile(null); // Clear file selection
    } catch (error) {
      alert("上传失败: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getShareUrl = (id: string) => {
    return `${window.location.origin}/v/${id}`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      <div className="max-w-3xl mx-auto p-6 pt-12">
        <header className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-blue-50 rounded-2xl mb-4 text-blue-600">
            <Film size={32} />
          </div>
          <h1 className="text-4xl font-bold text-slate-900 mb-3 tracking-tight">云端视频分享</h1>
          <p className="text-slate-500 text-lg">上传您的视频，生成专属二维码，随时随地扫码观看。</p>
        </header>

        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-12">
          <div className="space-y-6">
            {!uploadedVideo ? (
              <div className="border-2 border-dashed border-slate-300 rounded-2xl p-10 text-center hover:bg-slate-50 transition-colors">
                <input
                  type="file"
                  accept="video/*"
                  onChange={handleFileSelect}
                  className="hidden"
                  id="video-upload"
                  disabled={uploading}
                />
                <label
                  htmlFor="video-upload"
                  className="cursor-pointer flex flex-col items-center justify-center"
                >
                  <div className="p-4 bg-blue-50 text-blue-600 rounded-full mb-4">
                    <Upload size={28} />
                  </div>
                  <span className="text-lg font-medium text-slate-700 mb-1">
                    {file ? file.name : "点击选择视频文件"}
                  </span>
                  <span className="text-sm text-slate-400">
                    {file ? "重新选择" : "支持 MP4, MOV 等常见格式"}
                  </span>
                </label>
              </div>
            ) : (
              <div className="text-center py-6">
                <div className="inline-flex items-center justify-center p-3 bg-green-50 text-green-600 rounded-full mb-6">
                  <Check size={32} />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 mb-2">上传成功！</h2>
                <p className="text-slate-500 mb-8">您的视频已安全保存到云端</p>

                <div className="flex flex-col md:flex-row items-center justify-center gap-10">
                  <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm inline-block">
                    <QRCodeSVG value={getShareUrl(uploadedVideo.id)} size={200} level="H" />
                  </div>

                  <div className="text-left space-y-4 max-w-sm">
                    <div className="space-y-1">
                      <p className="text-sm font-medium text-slate-500">视频标题</p>
                      <p className="text-slate-900 font-medium truncate">{uploadedVideo.title}</p>
                    </div>
                    
                    <div className="space-y-2 pt-2">
                      <p className="text-sm font-medium text-slate-500">分享链接</p>
                      <div className="flex items-center gap-2 bg-slate-50 border border-slate-200 rounded-xl p-1 pl-4">
                        <span className="text-slate-600 text-sm truncate flex-1">
                          {getShareUrl(uploadedVideo.id)}
                        </span>
                        <button
                          onClick={() => handleCopyLink(getShareUrl(uploadedVideo.id))}
                          className="p-2.5 bg-white border border-slate-200 text-slate-700 hover:text-blue-600 hover:border-blue-200 rounded-lg transition-colors shrink-0"
                          title="复制链接"
                        >
                          {copied ? <Check size={18} className="text-green-500" /> : <Copy size={18} />}
                        </button>
                        <a 
                          href={getShareUrl(uploadedVideo.id)} 
                          target="_blank" 
                          rel="noreferrer"
                          className="p-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors shrink-0"
                        >
                          <LinkIcon size={18} />
                        </a>
                      </div>
                    </div>

                    <button 
                      onClick={() => {
                        setUploadedVideo(null);
                        setFile(null);
                      }}
                      className="w-full mt-4 py-3 bg-slate-100 text-slate-700 font-medium rounded-xl hover:bg-slate-200 transition-colors"
                    >
                      上传新视频
                    </button>
                  </div>
                </div>
              </div>
            )}

            {file && !uploadedVideo && (
              <button
                onClick={handleUpload}
                disabled={uploading}
                className={`w-full py-4 rounded-xl font-medium text-white transition-all flex justify-center items-center gap-2 ${
                  uploading ? "bg-blue-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 hover:shadow-md"
                }`}
              >
                {uploading ? (
                  <>
                    <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    正在上传 ({progress}%)
                  </>
                ) : (
                  <>开始上传视频</>
                )}
              </button>
            )}
          </div>
        </div>

        {/* Video History List */}
        {myVideos.length > 0 && (
          <div>
            <h3 className="text-xl font-bold text-slate-900 mb-4 px-2">我的视频记录</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {myVideos.map(video => (
                <div key={video.id} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm flex items-start gap-4 hover:shadow-md transition-shadow">
                  <div className="bg-slate-50 p-2 rounded-xl shrink-0">
                    <QRCodeSVG value={getShareUrl(video.id)} size={60} level="M" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-slate-900 font-medium truncate mb-1" title={video.title}>{video.title}</p>
                    <p className="text-slate-400 text-xs mb-3">
                      {new Date(video.created_at).toLocaleDateString('zh-CN', { 
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                    <div className="flex gap-2">
                      <a 
                        href={getShareUrl(video.id)} 
                        target="_blank" 
                        rel="noreferrer"
                        className="text-xs font-medium text-blue-600 bg-blue-50 px-2.5 py-1.5 rounded-lg hover:bg-blue-100 transition-colors"
                      >
                        预览
                      </a>
                      <button 
                        onClick={() => removeFromLocal(video.id)}
                        className="text-xs font-medium text-red-600 bg-red-50 px-2.5 py-1.5 rounded-lg hover:bg-red-100 transition-colors ml-auto"
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}