import { useState, useEffect } from "react";
import { Upload, Link as LinkIcon, Check, Copy, Film, Trash2, ArrowRight, LogOut, Edit2, X, Save } from "lucide-react";
import { QRCodeSVG } from "qrcode.react";
import { supabase } from "@/lib/supabase";
import { Link, useNavigate } from "react-router-dom";

interface Video {
  id: string;
  title: string;
  video_url: string;
  created_at: string;
}

export default function AdminUpload() {
  const [file, setFile] = useState<File | null>(null);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [copiedCollection, setCopiedCollection] = useState(false);
  const [videos, setVideos] = useState<Video[]>([]);
  const [loadingVideos, setLoadingVideos] = useState(true);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  
  const navigate = useNavigate();

  useEffect(() => {
    fetchVideos();
  }, []);

  const fetchVideos = async () => {
    try {
      setLoadingVideos(true);
      const { data, error } = await supabase
        .from("videos")
        .select("*")
        .order("created_at", { ascending: false });

      if (error) throw error;
      setVideos(data || []);
    } catch (error) {
      console.error("Failed to fetch videos:", error);
    } finally {
      setLoadingVideos(false);
    }
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate("/login");
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      setFile(e.target.files[0]);
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

      if (uploadError) throw uploadError;
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

      if (dbError) throw dbError;

      setProgress(100);
      setVideos([dbData, ...videos]); // Add to top of list
      setFile(null); // Clear file selection
    } catch (error) {
      alert("上传失败: " + (error instanceof Error ? error.message : String(error)));
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const handleDelete = async (id: string, videoUrl: string) => {
    if (!window.confirm("确定要删除这个视频吗？该操作不可恢复。")) return;

    try {
      // 1. Delete from database
      const { error: dbError } = await supabase
        .from('videos')
        .delete()
        .eq('id', id);

      if (dbError) throw dbError;

      // 2. Extract file path from public URL and delete from storage
      const urlParts = videoUrl.split('/videos/');
      if (urlParts.length > 1) {
        const filePath = urlParts[1];
        await supabase.storage.from('videos').remove([filePath]);
      }

      // Update UI
      setVideos(videos.filter(v => v.id !== id));
    } catch (error) {
      alert("删除失败: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleStartEdit = (video: Video) => {
    setEditingId(video.id);
    setEditTitle(video.title);
  };

  const handleSaveEdit = async (id: string) => {
    if (!editTitle.trim()) return;

    try {
      const { error } = await supabase
        .from('videos')
        .update({ title: editTitle.trim() })
        .eq('id', id);

      if (error) throw error;

      setVideos(videos.map(v => v.id === id ? { ...v, title: editTitle.trim() } : v));
      setEditingId(null);
    } catch (error) {
      alert("重命名失败: " + (error instanceof Error ? error.message : String(error)));
    }
  };

  const handleCopyLink = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedCollection(true);
    setTimeout(() => setCopiedCollection(false), 2000);
  };

  const getCollectionUrl = () => {
    return `${window.location.origin}/`;
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans pb-20">
      {/* Top Nav Bar */}
      <nav className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2 font-bold text-lg text-slate-900">
            <Film size={24} className="text-blue-600" />
            后台管理中心
          </div>
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors"
          >
            <LogOut size={18} />
            退出登录
          </button>
        </div>
      </nav>

      <div className="max-w-5xl mx-auto px-6 pt-8">
        
        {/* Collection QR Code Section */}
        <div className="bg-blue-600 rounded-3xl shadow-md p-8 mb-8 text-white flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="flex-1 text-center md:text-left">
            <h2 className="text-2xl font-bold mb-3">我的视频合集页</h2>
            <p className="text-blue-100 mb-6">任何人扫描右侧二维码，即可查看您上传的所有视频合集。</p>
            
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex items-center gap-2 bg-blue-700/50 border border-blue-500/50 rounded-xl p-1 pl-4 w-full max-w-md">
                <span className="text-white text-sm truncate flex-1">
                  {getCollectionUrl()}
                </span>
                <button
                  onClick={() => handleCopyLink(getCollectionUrl())}
                  className="p-2.5 bg-blue-500 hover:bg-blue-400 rounded-lg transition-colors shrink-0"
                  title="复制链接"
                >
                  {copiedCollection ? <Check size={18} /> : <Copy size={18} />}
                </button>
              </div>
              <Link 
                to="/" 
                target="_blank"
                className="flex items-center gap-2 px-5 py-3 bg-white text-blue-600 font-medium rounded-xl hover:bg-blue-50 transition-colors w-full sm:w-auto justify-center shrink-0"
              >
                访问主页 <ArrowRight size={18} />
              </Link>
            </div>
          </div>
          <div className="bg-white p-4 rounded-2xl shrink-0 shadow-lg">
            <QRCodeSVG value={getCollectionUrl()} size={140} level="H" />
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 p-8 mb-8">
          <h3 className="text-xl font-bold text-slate-900 mb-6 flex items-center gap-2">
            <Upload size={20} className="text-blue-600" /> 
            上传新视频
          </h3>
          
          <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
            <div className="flex-1 w-full">
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
                className="cursor-pointer flex items-center justify-center w-full px-4 py-4 border-2 border-dashed border-slate-300 rounded-xl hover:bg-slate-50 transition-colors text-slate-600 font-medium"
              >
                {file ? file.name : "点击选择要上传的视频文件"}
              </label>
            </div>
            
            <button
              onClick={handleUpload}
              disabled={uploading || !file}
              className={`w-full sm:w-auto shrink-0 px-8 py-4 rounded-xl font-medium text-white transition-all flex justify-center items-center gap-2 ${
                uploading ? "bg-blue-400 cursor-not-allowed" : !file ? "bg-slate-300 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700 shadow-md"
              }`}
            >
              {uploading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-2 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  上传中 ({progress}%)
                </>
              ) : (
                "开始上传"
              )}
            </button>
          </div>
        </div>

        {/* Video Management List */}
        <div className="bg-white rounded-3xl shadow-sm border border-slate-200 overflow-hidden">
          <div className="p-6 border-b border-slate-200 bg-slate-50/50">
            <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
              <Film size={20} className="text-blue-600" />
              已上传视频管理 ({videos.length})
            </h3>
          </div>
          
          {loadingVideos ? (
             <div className="flex justify-center items-center py-20">
               <svg className="animate-spin h-8 w-8 text-blue-600" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                 <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                 <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
               </svg>
             </div>
          ) : videos.length === 0 ? (
            <div className="text-center py-16 text-slate-500">
              暂无视频，请在上方上传您的第一个视频
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {videos.map(video => (
                <li key={video.id} className="p-6 hover:bg-slate-50 transition-colors flex flex-col sm:flex-row items-start sm:items-center gap-4">
                  {/* Thumbnail Placeholder */}
                  <div className="w-24 h-16 bg-slate-200 rounded-lg overflow-hidden shrink-0">
                    <video src={`${video.video_url}#t=0.1`} className="w-full h-full object-cover" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    {editingId === video.id ? (
                      <div className="flex items-center gap-2 mb-2">
                        <input 
                          type="text" 
                          value={editTitle}
                          onChange={(e) => setEditTitle(e.target.value)}
                          className="flex-1 px-3 py-1.5 text-sm border border-slate-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                          autoFocus
                        />
                        <button onClick={() => handleSaveEdit(video.id)} className="p-1.5 text-green-600 hover:bg-green-50 rounded-md">
                          <Save size={16} />
                        </button>
                        <button onClick={() => setEditingId(null)} className="p-1.5 text-slate-400 hover:bg-slate-100 rounded-md">
                          <X size={16} />
                        </button>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 mb-1">
                        <p className="text-slate-900 font-semibold truncate" title={video.title}>
                          {video.title}
                        </p>
                        <button 
                          onClick={() => handleStartEdit(video)}
                          className="text-slate-400 hover:text-blue-600 transition-colors"
                          title="重命名"
                        >
                          <Edit2 size={14} />
                        </button>
                      </div>
                    )}
                    
                    <p className="text-slate-400 text-sm">
                      {new Date(video.created_at).toLocaleDateString('zh-CN', { 
                        year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit'
                      })}
                    </p>
                  </div>
                  
                  <div className="flex items-center gap-2 mt-4 sm:mt-0 w-full sm:w-auto justify-end">
                    <a 
                      href={`/v/${video.id}`} 
                      target="_blank" 
                      rel="noreferrer"
                      className="flex items-center gap-1 text-sm font-medium text-slate-600 bg-white border border-slate-200 px-3 py-2 rounded-lg hover:bg-slate-50 transition-colors shadow-sm"
                    >
                      <LinkIcon size={14} /> 预览
                    </a>
                    <button 
                      onClick={() => handleDelete(video.id, video.video_url)}
                      className="flex items-center gap-1 text-sm font-medium text-red-600 bg-red-50 border border-red-100 px-3 py-2 rounded-lg hover:bg-red-100 transition-colors shadow-sm"
                      title="永久删除视频"
                    >
                      <Trash2 size={14} /> 删除
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
