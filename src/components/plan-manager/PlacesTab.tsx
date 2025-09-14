import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Plus } from "lucide-react";

interface Plan {
  stops: string[];
}

interface PlacesTabProps {
  currentPlan: Plan | undefined;
}

const PlacesTab = ({ currentPlan }: PlacesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MapPin className="w-5 h-5" />
          📍 สถานที่ที่จะเยี่ยมชมในวันนี้
        </CardTitle>
        <CardDescription>
          ระบุจุดที่คุณอยากไปเที่ยว — นอกเหนือจากจุดเริ่ม/สิ้นสุด
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPlan?.stops.map((stop, index) => (
          <div key={index} className="flex items-center justify-between p-3 bg-secondary/30 rounded-lg">
            <div>
              <p className="font-medium">▶ {stop}</p>
            </div>
            <Button variant="destructive" size="sm">
              ➖ ลบ
            </Button>
          </div>
        ))}
        
        <Button variant="khonkaen" className="w-full">
          <Plus className="w-4 h-4" />
          เพิ่มสถานที่ใหม่
        </Button>
      </CardContent>
    </Card>
  );
};

export default PlacesTab;