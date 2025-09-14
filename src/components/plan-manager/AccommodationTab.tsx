import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Hotel } from "lucide-react";

interface Plan {
  accommodation: string;
}

interface AccommodationTabProps {
  currentPlan: Plan | undefined;
}

const AccommodationTab = ({ currentPlan }: AccommodationTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Hotel className="w-5 h-5" />
          🏨 ที่พักในวันนี้
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-medium">ชื่อที่พัก:</label>
            <p className="mt-1 p-2 bg-secondary/30 rounded">{currentPlan?.accommodation || "ยังไม่ได้ระบุ"}</p>
          </div>
          
          <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
            <p className="text-sm text-blue-800">
              💡 คำแนะนำ: จองที่พักในเขตตัวเมืองจะสะดวกต่อการเดินทาง
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default AccommodationTab;