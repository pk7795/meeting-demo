'use client'

export default function Chat({ messages }: any) {
  return (
    <div className="flex flex-col flex-1 h-full p-4">
      <div className="flex-1 flex flex-col-reverse overflow-y-auto">
        <div className="flex flex-col">
          {messages.map((message: any) => (
            <div key={message.id} className="flex flex-col mb-2">
              <div className="flex items-center">
                <div className="flex items-center justify-center w-8 h-8 mr-2 rounded-full bg-[#F87171]">
                  <div className="text-xs font-bold text-white">A</div>
                </div>
                <div className="flex flex-col">
                  <div className="flex items-center">
                    <div className="text-xs font-bold text-[#F87171]">Aldo</div>
                    <div className="ml-2 text-xs text-[#9CA3AF]">10:00 AM</div>
                  </div>
                  <div className="text-sm text-[#9CA3AF]">{message.content}</div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
