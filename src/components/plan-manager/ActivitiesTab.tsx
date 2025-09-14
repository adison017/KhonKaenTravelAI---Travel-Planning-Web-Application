import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Calendar, Plus, MapPin, X, Clock, Edit } from "lucide-react";
import { loadCollectionFromLocalStorage } from "@/lib/storage";

interface Stop {
  name: string;
  timeStart: string;
  timeEnd: string;
  description?: string;
}

interface Activity {
  title: string;
  date: string;
  timeStart: string;
  timeEnd: string;
  description: string;
  cost: number;
  type: string;
  location?: string;
}

interface Plan {
  day: number;
  startLocation: string;
  endLocation: string;
  transportation: string;
  accommodation: string;
  stops: Stop[];
  activities: Activity[];
}

interface Collection {
  collectionId: string;
  name: string;
  category: string;
  startDate: string;
  endDate: string;
  budget: number;
  plans: Plan[];
}

interface ActivitiesTabProps {
  currentPlan?: Plan;
  onUpdateActivities?: (activities: Activity[]) => void;
  collectionId?: string;
  selectedDay?: number;
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

const ActivitiesTab = ({ currentPlan, onUpdateActivities, collectionId, selectedDay }: ActivitiesTabProps) => {
  const [selectedStop, setSelectedStop] = useState<Stop | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingActivity, setEditingActivity] = useState<{activity: Activity, index: number} | null>(null);
  const [newActivity, setNewActivity] = useState<Activity>({
    title: "",
    date: new Date().toISOString().split('T')[0],
    timeStart: "",
    timeEnd: "",
    description: "",
    cost: 0,
    type: "ธรรมชาติ",
    location: ""
  });

  const handleStopSelect = (stop: Stop) => {
    setSelectedStop(stop);
    setEditingActivity(null); // Clear editing state when selecting a stop
    setNewActivity(prev => ({
      ...prev,
      title: `กิจกรรมที่ ${stop.name}`,
      location: stop.name,
      timeStart: stop.timeStart,
      timeEnd: stop.timeEnd,
      description: stop.description || ""
    }));
    setShowAddForm(true);
  };

  const handleEditActivity = (activity: Activity, index: number) => {
    setEditingActivity({ activity, index });
    setSelectedStop(null); // Clear selected stop when editing
    setNewActivity({ ...activity });
    setShowAddForm(true);
  };

  const handleAddActivity = () => {
    if (!currentPlan || !onUpdateActivities) return;

    const activityToSave: Activity = {
      ...newActivity,
      date: new Date().toISOString().split('T')[0]
    };

    let newActivities: Activity[];

    if (editingActivity) {
      // Update existing activity
      newActivities = [...currentPlan.activities];
      newActivities[editingActivity.index] = activityToSave;
    } else {
      // Add new activity
      newActivities = [...currentPlan.activities, activityToSave];
    }

    onUpdateActivities(newActivities);

    // Reset form
    setNewActivity({
      title: "",
      date: new Date().toISOString().split('T')[0],
      timeStart: "",
      timeEnd: "",
      description: "",
      cost: 0,
      type: "ธรรมชาติ",
      location: ""
    });
    setSelectedStop(null);
    setEditingActivity(null);
    setShowAddForm(false);
  };

  const handleRemoveActivity = (index: number) => {
    if (!currentPlan || !onUpdateActivities) return;
    const newActivities = currentPlan.activities.filter((_, i) => i !== index);
    onUpdateActivities(newActivities);
  };

  const handleUpdateNewActivity = (field: keyof Activity, value: string | number) => {
    setNewActivity(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5" />
          📌 กิจกรรมวันนี้ - วันที่ {selectedDay}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Stops Section */}
        {currentPlan && currentPlan.stops.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium flex items-center gap-2">
              <MapPin className="w-4 h-4" />
              จุดแวะพัก ({currentPlan.stops.length} จุด)
            </h4>
            <div className="grid gap-2">
              {currentPlan.stops.map((stop, index) => (
                <div key={index} className="p-3 bg-secondary/30 rounded-lg border border-border/30">
                  <div className="flex items-center justify-between mb-2">
                    <h5 className="font-medium">{stop.name}</h5>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleStopSelect(stop)}
                    >
                      <Plus className="w-4 h-4" />
                      เพิ่มกิจกรรม
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      {stop.timeStart} - {stop.timeEnd}
                    </span>
                  </div>
                  {stop.description && (
                    <p className="text-sm text-muted-foreground mt-1">
                      {stop.description}
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Add Activity Form */}
        {showAddForm && (
          <div className="p-4 bg-secondary/30 rounded-lg border border-border/30 space-y-3">
            <h4 className="font-medium">
              {editingActivity ? "แก้ไขกิจกรรม" : "เพิ่มกิจกรรมใหม่"}
            </h4>

            {selectedStop && (
              <div className="p-2 bg-blue-50 border border-blue-200 rounded">
                <p className="text-sm text-blue-800">
                  📍 เลือกจากจุดแวะพัก: {selectedStop.name}
                </p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">ชื่อกิจกรรม</label>
                <Input
                  value={newActivity.title}
                  onChange={(e) => handleUpdateNewActivity('title', e.target.value)}
                  placeholder="ชื่อกิจกรรม"
                />
              </div>
              <div>
                <label className="text-sm">ประเภท</label>
                <select
                  className="w-full p-2 border rounded"
                  value={newActivity.type}
                  onChange={(e) => handleUpdateNewActivity('type', e.target.value)}
                >
                  <option value="ธรรมชาติ">ธรรมชาติ</option>
                  <option value="อาหารท้องถิ่น">อาหารท้องถิ่น</option>
                  <option value="วัฒนธรรม">วัฒนธรรม</option>
                  <option value="ช้อปปิ้ง">ช้อปปิ้ง</option>
                  <option value="ไนท์ไลฟ์">ไนท์ไลฟ์</option>
                  <option value="ศาสนา">ศาสนา</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-sm">เวลาเริ่ม</label>
                <Input
                  type="time"
                  value={newActivity.timeStart}
                  onChange={(e) => handleUpdateNewActivity('timeStart', e.target.value)}
                />
              </div>
              <div>
                <label className="text-sm">เวลาสิ้นสุด</label>
                <Input
                  type="time"
                  value={newActivity.timeEnd}
                  onChange={(e) => handleUpdateNewActivity('timeEnd', e.target.value)}
                />
              </div>
            </div>

            <div>
              <label className="text-sm">ค่าใช้จ่าย (บาท)</label>
              <Input
                type="number"
                value={newActivity.cost}
                onChange={(e) => handleUpdateNewActivity('cost', parseInt(e.target.value) || 0)}
              />
            </div>

            <div>
              <label className="text-sm">คำอธิบาย</label>
              <Input
                value={newActivity.description}
                onChange={(e) => handleUpdateNewActivity('description', e.target.value)}
                placeholder="คำอธิบายกิจกรรม"
              />
            </div>

            <div className="flex gap-2">
              <Button onClick={handleAddActivity} variant="khonkaen" size="sm">
                บันทึก
              </Button>
              <Button onClick={() => setShowAddForm(false)} variant="outline" size="sm">
                ยกเลิก
              </Button>
            </div>
          </div>
        )}

        {/* Current Activities */}
        {currentPlan && currentPlan.activities.length > 0 && (
          <div className="space-y-3">
            <h4 className="font-medium">กิจกรรมที่วางแผน ({currentPlan.activities.length} รายการ)</h4>
            {currentPlan.activities.map((activity, index) => (
              <div key={index} className="p-4 bg-secondary/30 rounded-lg border border-border/30">
                <div className="flex items-center justify-between mb-2">
                  <h5 className="font-medium">▶ {activity.title}</h5>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleEditActivity(activity, index)}
                    >
                      <Edit className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="destructive"
                      size="sm"
                      onClick={() => handleRemoveActivity(index)}
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <div className="flex items-center gap-4 text-sm text-muted-foreground mb-2">
                  <span>🕐 {activity.timeStart}–{activity.timeEnd}</span>
                  <span>💰 {activity.cost} บาท</span>
                  <Badge variant="secondary">
                    {getActivityTypeIcon(activity.type)} {activity.type}
                  </Badge>
                </div>
                {activity.location && (
                  <div className="flex items-center gap-1 text-sm text-muted-foreground mb-1">
                    <MapPin className="w-4 h-4" />
                    <span>{activity.location}</span>
                  </div>
                )}
                <p className="text-sm text-muted-foreground">
                  ℹ️ {activity.description}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* No stops message */}
        {currentPlan && currentPlan.stops.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
            <p>ยังไม่มีจุดแวะพักสำหรับวันที่ {selectedDay}</p>
            <p className="text-sm">กรุณาเพิ่มจุดแวะพักก่อนสร้างกิจกรรม</p>
          </div>
        )}

        {/* Save Button */}
        <div className="flex justify-end mt-4">
          <Button onClick={() => {
            if (onUpdateActivities && currentPlan) {
              onUpdateActivities([...currentPlan.activities]);

              const activitiesCount = currentPlan.activities.length;
              let message = `บันทึกข้อมูลกิจกรรมเรียบร้อยแล้ว!\n\n`;
              message += `📅 จำนวนกิจกรรม: ${activitiesCount} รายการ\n`;

              if (activitiesCount > 0) {
                message += `\n📋 รายการกิจกรรม:\n`;
                currentPlan.activities.forEach((activity, index) => {
                  message += `${index + 1}. ${activity.title}\n`;
                  message += `   🕐 ${activity.timeStart} - ${activity.timeEnd}\n`;
                  message += `   💰 ${activity.cost} บาท (${activity.type})\n`;
                  if (activity.location) {
                    message += `   📍 ${activity.location}\n`;
                  }
                  message += `\n`;
                });

                // Calculate total cost
                const totalCost = currentPlan.activities.reduce((sum, activity) => sum + activity.cost, 0);
                message += `💵 รวมค่าใช้จ่าย: ${totalCost} บาท`;
              } else {
                message += `\n⚠️ ยังไม่มีกิจกรรมในวันนี้`;
              }

              alert(message);
            }
          }} variant="khonkaen" size="lg">
            บันทึกข้อมูลกิจกรรม
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ActivitiesTab;
