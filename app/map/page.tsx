import Nav from '@/components/Nav'

export default function MapPage() {
  return (
    <main className="min-h-screen bg-gray-50 dark:bg-[#080812] text-gray-900 dark:text-white antialiased flex flex-col">
      <Nav />
      <div className="flex-1">
        <iframe
          src="/maputil.html"
          className="w-full h-full border-0"
          style={{ height: 'calc(100vh - 57px)' }}
          title="坐标地图定位工具"
        />
      </div>
    </main>
  )
}
