import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus } from "lucide-react";

interface Activity {
  title: string;
  timeStart: string;
  timeEnd: string;
  description: string;
  cost: number;
  type: string;
}

interface Plan {
  activities: Activity[];
}

interface ActivitiesTabProps {
  currentPlan: Plan | undefined;
}

const getActivityTypeIcon = (type: string) => {
  switch (type) {
    case "ธรรมชาติ": return "🌿";
    case "อาหารท้องถิ่น": return "🍜";
    case "วัฒนธรรม": return "🖼️";
    case "ช้อปปิ้ง": return "🛍️";
    case "ไนท์ไลฟ์": return "🌙";
    case "ศาสนา": return "🙏";
    default: return "📍";
  }
};

const ActivitiesTab = ({ currentPlan }: ActivitiesTabProps) => {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          📌 กิจกรรมวันนี้ ({currentPlan?.activities.length || 0} รายการ)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {currentPlan?.activities.map((activity, index) => (
          <div key={index} className="p-4 bg-secondary/30 rounded-lg border border-border/30">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">▶ {activity.title}</h4>
              <Button variant="destructive" size="sm">
                ➖ ลบ
              </Button>
            </div>
            <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
              <span>🕐 {activity.timeStart}–{activity.timeEnd}</span>
              <span>💰 {activity.cost} บาท</span>
              <Badge variant="secondary">
                {getActivityTypeIcon(activity.type)} {activity.type}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">
              ℹ️ {activity.description}
            </p>
          </div>
        ))}
        
        <Button variant="hero" className="w-full">
          <Plus className="w-4 h-4" />
          ➕ เพิ่มกิจกรรมใหม่
        </Button>
      </CardContent>
    </Card>
  );
};

export default ActivitiesTab;