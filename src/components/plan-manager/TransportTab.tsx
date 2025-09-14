import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Car } from "lucide-react";

interface Plan {
  startLocation: string;
  endLocation: string;
  transportation: string;
}

interface TransportTabProps {
  currentPlan: Plan | undefined;
}

const TransportTab = ({ currentPlan }: TransportTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Car className="w-5 h-5" />
          🚗 การเดินทางในวันนี้
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid gap-4">
          <div>
            <label className="text-sm font-medium">📍 จุดเริ่มต้น:</label>
            <p className="mt-1 p-2 bg-secondary/30 rounded">{currentPlan?.startLocation || "ยังไม่ได้ระบุ"}</p>
          </div>
          <div>
            <label className="text-sm font-medium">📍 จุดสิ้นสุด:</label>
            <p className="mt-1 p-2 bg-secondary/30 rounded">{currentPlan?.endLocation || "ยังไม่ได้ระบุ"}</p>
          </div>
          <div>
            <label className="text-sm font-medium">🚗 วิธีการเดินทาง:</label>
            <p className="mt-1 p-2 bg-secondary/30 rounded">{currentPlan?.transportation || "ยังไม่ได้เลือก"}</p>
          </div>
        </div>
        
        {currentPlan?.startLocation && currentPlan?.endLocation && (
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              ⏱️ เวลาประมาณ: 15 นาที | 📏 ระยะทาง: 3.2 กม.
            </p>
            <p className="text-sm text-blue-600 mt-1">
              💡 คำแนะนำจาก AI: คุณเลือก 'รถส่วนตัว' จาก 'บ้านพัก' ไป 'สวนสาธารณะศรีมหาโพธิ' — เส้นทางโดยเฉลี่ยใช้เวลา 15 นาที ผ่านถนนมิตรภาพ
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default TransportTab;