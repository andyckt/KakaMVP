"use client";

export default function AnnouncementBanner() {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-80">
      <div className="bg-white p-8 rounded-lg shadow-xl max-w-md w-full text-center">
        <h2 className="text-2xl font-bold mb-4 text-gray-800">公告</h2>
        <p className="text-lg mb-8 text-gray-700">
          本网站正在推出新功能。敬请期待。
        </p>
      </div>
    </div>
  );
}
